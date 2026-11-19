import { recordChanges } from './records-store.mjs';
/** 台帳の読み書きと変更履歴の確定。リビジョン・プラン・資料の所有権を保存時に再検証します。 */
import { ApiError } from '../core.mjs';
import { fileIds, preferences, validateMap } from '../map-validation.mjs';
import { now } from './http.mjs';
/**
 * 参照する資料が同じ組織に属するかを確認します。
 * 画面にファイルが見えていても、別アカウントのIDをAPIに直接渡す操作は許可しません。
 */
async function validateFiles(env, c, state) {
  const ids = [...new Set(fileIds(state))];
  if (!ids.length) {
    return;
  }
  // 資料の数に比例して問い合わせを増やさず、同じ組織にある全IDを一度で確認します。
  const found = await env.DB.prepare(
    'SELECT count(*) AS n FROM map_files WHERE organization_id=? AND id IN (SELECT value FROM json_each(?))',
  )
    .bind(c.org.id, JSON.stringify(ids))
    .first();
  if (found.n !== ids.length) {
    throw new ApiError(422, '添付ファイルが存在しないか、別アカウントに属しています。');
  }
}

const canonical = (value) =>
  JSON.stringify(value, (_, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, v[k]]),
        )
      : v,
  );
function taskChanges(previous, next) {
  const before = new Map((previous.tasks || []).map((t) => [t.id, t]));
  const after = new Map((next.tasks || []).map((t) => [t.id, t]));
  return [...new Set([...before.keys(), ...after.keys()])].flatMap((id) => {
    const a = before.get(id);
    const b = after.get(id);
    if (canonical(a) === canonical(b)) {
      return [];
    }
    return [
      {
        id: crypto.randomUUID(),
        taskId: id,
        action: !a ? 'created' : !b ? 'deleted' : 'updated',
        before: a || null,
        after: b || null,
        files: [...new Set([...fileIds(a), ...fileIds(b)])],
      },
    ];
  });
}
function workChanges(previous, next) {
  const before = new Map(previous.works.map((w) => [w.id, w]));
  const after = new Map(next.works.map((w) => [w.id, w]));
  return [...new Set([...before.keys(), ...after.keys()])].flatMap((id) => {
    const a = before.get(id);
    const b = after.get(id);
    if (canonical(a) === canonical(b)) {
      return [];
    }
    return [
      {
        id: crypto.randomUUID(),
        workId: id,
        action: !a ? 'created' : !b ? 'deleted' : 'updated',
        before: a || null,
        after: b || null,
        files: [...new Set([...fileIds(a), ...fileIds(b)])],
      },
    ];
  });
}
async function historyFileIds(env, c) {
  const r = await env.DB.prepare(
    "SELECT DISTINCT j.value AS id FROM (SELECT organization_id,file_ids FROM map_work_events UNION ALL SELECT organization_id,file_ids FROM map_task_events) e,json_each(e.file_ids) j WHERE e.organization_id=? AND j.type='text'",
  )
    .bind(c.org.id)
    .all();
  return r.results.map((x) => x.id);
}
async function commit(env, c, next, action, expected = c.org.revision, extraTaskEvents = []) {
  if (expected !== c.org.revision) {
    throw new ApiError(409, 'ほかの更新があります。画面を更新してから保存してください。');
  }
  const state = validateMap(next, c.org.plan, c.state);
  await validateFiles(env, c, state);
  const when = now();
  const events = workChanges(c.state, state);
  const taskEvents = [...taskChanges(c.state, state), ...extraTaskEvents];
  const r = await env.DB.batch([
    ...recordChanges(env.DB, c, state, expected),
    env.DB.prepare(
      "INSERT INTO map_work_events(id,organization_id,work_id,action,actor_id,reason,revision,before_json,after_json,file_ids,created_at) SELECT json_extract(e.value,'$.id'),?,json_extract(e.value,'$.workId'),json_extract(e.value,'$.action'),?,?,?,json_extract(e.value,'$.before'),json_extract(e.value,'$.after'),json_extract(e.value,'$.files'),? FROM json_each(?) e WHERE EXISTS(SELECT 1 FROM organizations WHERE id=? AND revision=? AND plan=?)",
    ).bind(
      c.org.id,
      c.user.id,
      action,
      expected + 1,
      when,
      JSON.stringify(events),
      c.org.id,
      expected,
      c.org.plan,
    ),
    env.DB.prepare(
      "INSERT INTO map_task_events(id,organization_id,task_id,action,actor_id,reason,revision,before_json,after_json,comment,file_ids,created_at) SELECT json_extract(e.value,'$.id'),?,json_extract(e.value,'$.taskId'),json_extract(e.value,'$.action'),?,?,?,json_extract(e.value,'$.before'),json_extract(e.value,'$.after'),json_extract(e.value,'$.comment'),COALESCE(json_extract(e.value,'$.files'),'[]'),? FROM json_each(?) e WHERE EXISTS(SELECT 1 FROM organizations WHERE id=? AND revision=? AND plan=?)",
    ).bind(
      c.org.id,
      c.user.id,
      action,
      expected + 1,
      when,
      JSON.stringify(taskEvents),
      c.org.id,
      expected,
      c.org.plan,
    ),
    env.DB.prepare(
      'UPDATE organizations SET revision=revision+1,updated_at=? WHERE id=? AND revision=? AND plan=?',
    ).bind(when, c.org.id, expected, c.org.plan),
  ]);
  if (r[r.length - 1].meta.changes !== 1) {
    throw new ApiError(409, '同時更新を検出しました。再読み込みしてください。');
  }
  return expected + 1;
}
function stats(state) {
  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const latest = (a) => [...a.history].sort((a, b) => b.date.localeCompare(a.date))[0];
  const dueDate = (a) => a.properties?.nextInspection || latest(a)?.nextDate;
  const due = state.assets.filter((a) => dueDate(a) && dueDate(a) <= today);
  return {
    drawings: state.drawings.length,
    works: state.works.length,
    assets: state.assets.length,
    notes: state.notes.length,
    properties: state.propertyDefinitions.length,
    inspections: state.assets.reduce((n, a) => n + a.history.length, 0),
    attention: state.assets.filter((a) => latest(a)?.result === 'attention').length,
    due: due.map((a) => ({
      id: a.id,
      name: a.name,
      code: a.code,
      date: dueDate(a),
    })),
    activeWorks: state.works.filter((w) => w.status === 'active').length,
  };
}
async function settings(env, c) {
  const p = await env.DB.prepare(
    'SELECT value_json FROM map_preferences WHERE user_id=? AND organization_id=?',
  )
    .bind(c.user.id, c.org.id)
    .first();
  return p ? JSON.parse(p.value_json) : preferences({}, c.org.plan);
}
export {
  validateFiles,
  canonical,
  taskChanges,
  workChanges,
  historyFileIds,
  commit,
  stats,
  settings,
};
