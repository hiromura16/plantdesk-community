/** 担当者・タスク・案件・点検計画のAPI。完了処理は共通の業務ルールを通します。 */
import { ApiError } from '../../core.mjs';
import {
  addDemoTeam,
  completeTask,
  generatePlan,
  makeTask,
  planPreview,
  teamReport,
  teamToday,
  validDate,
} from '../../team.mjs';
import { addWorkflowDemo } from '../../workflow-demo.mjs';
import { commit } from '../repository.mjs';
import { editable } from '../context.mjs';
import { json, readJSON, requireRevision } from '../http.mjs';
import { mutate } from '../entities.mjs';
import { projectStats, taskBlockers } from '../../workflow.mjs';
export async function handleTeam({ request, env, c, state, url, path, method }) {
  if (path === '/api/team/report' && method === 'GET') {
    editable(c);
    const day = url.searchParams.get('date') || teamToday();
    if (!validDate(day)) {
      throw new ApiError(422, '日付が不正です。');
    }
    const report = teamReport(state, day);
    const comments = await env.DB.prepare(
      "SELECT task_id,comment,created_at FROM map_task_events WHERE organization_id=? AND action='comment' ORDER BY created_at DESC LIMIT 20",
    )
      .bind(c.org.id)
      .all();
    report.comments = comments.results.map((e) => ({
      ...e,
      title: state.tasks.find((t) => t.id === e.task_id)?.title || '削除済みの作業',
    }));
    report.markdown +=
      '\n\n## 最近の引き継ぎコメント（最新20件）\n' +
      (report.comments
        .map((e) => '- ' + e.title + '\n  ' + e.comment.replace(/\n/g, '\n  '))
        .join('\n') || '- なし');
    return json({
      ...report,
      revision: c.org.revision,
    });
  }
  if (path === '/api/team/projects' && method === 'GET') {
    editable(c);
    return json({
      items: state.projects.map((p) => ({
        ...p,
        stats: projectStats(state, p.id),
      })),
      blocked: state.tasks
        .filter(
          (t) =>
            !['done', 'cancelled'].includes(t.status) && taskBlockers(state, t).dependencies.length,
        )
        .map((t) => t.id),
      revision: c.org.revision,
    });
  }
  if (path === '/api/team/workflow-demo' && method === 'POST') {
    editable(c);
    const input = await readJSON(request);
    const next = structuredClone(state);
    const result = addWorkflowDemo(next);
    return json(
      {
        ...result,
        revision: await commit(env, c, next, 'team.workflow-demo', requireRevision(input)),
      },
      201,
    );
  }
  if (path === '/api/team/demo' && method === 'POST') {
    editable(c);
    const input = await readJSON(request);
    const next = structuredClone(state);
    const result = addDemoTeam(next);
    return json(
      {
        ...result,
        revision: await commit(env, c, next, 'team.demo', requireRevision(input)),
      },
      201,
    );
  }
  const taskAction = path.match(/^\/api\/tasks\/([^/]+)\/(complete|history|comments)$/);
  if (taskAction) {
    editable(c);
    const [, id, action] = taskAction;
    const t = state.tasks.find((t) => t.id === id);
    if (action === 'history' && method === 'GET') {
      const before = Math.max(
        1,
        Math.floor(Number(url.searchParams.get('before')) || Number.MAX_SAFE_INTEGER),
      );
      const rows = await env.DB.prepare(
        'SELECT id,action,actor_id,reason,revision,before_json,after_json,comment,created_at FROM map_task_events WHERE organization_id=? AND task_id=? AND revision<? ORDER BY revision DESC,created_at DESC LIMIT 31',
      )
        .bind(c.org.id, id, before)
        .all();
      if (!t && !rows.results.length) {
        throw new ApiError(404, '作業がありません。');
      }
      return json({
        items: rows.results.slice(0, 30).map((e) => ({
          ...e,
          actor: e.actor_id === c.user.id ? 'あなた' : '施設担当者',
          before: e.before_json ? JSON.parse(e.before_json) : null,
          after: e.after_json ? JSON.parse(e.after_json) : null,
          before_json: undefined,
          after_json: undefined,
        })),
        nextCursor: rows.results.length > 30 ? rows.results[29].revision : null,
      });
    }
    if (!t) {
      throw new ApiError(404, '作業がありません。');
    }
    if (method !== 'POST') {
      throw new ApiError(405, 'POSTで操作してください。');
    }
    const input = await readJSON(request);
    const expected = requireRevision(input);
    if (action === 'complete') {
      const next = structuredClone(state);
      if (input.record) {
        const i = next.tasks.findIndex((t) => t.id === id);
        next.tasks[i] = makeTask(input.record, next.tasks[i]);
      }
      const record = completeTask(next, id, input, '施設担当者');
      return json({
        record,
        revision: await commit(env, c, next, 'task.complete', expected),
      });
    }
    if (action === 'comments') {
      if (typeof input.text !== 'string' || !input.text.trim() || input.text.length > 3000) {
        throw new ApiError(422, '引き継ぎコメントは1〜3,000文字です。');
      }
      const event = {
        id: crypto.randomUUID(),
        taskId: id,
        action: 'comment',
        comment: input.text.trim(),
        files: [],
      };
      return json(
        {
          revision: await commit(env, c, state, 'task.comment', expected, [event]),
        },
        201,
      );
    }
  }
  const planAction = path.match(/^\/api\/inspectionPlans\/([^/]+)\/(preview|generate)$/);
  if (planAction) {
    editable(c);
    const plan = state.inspectionPlans.find((p) => p.id === planAction[1]);
    if (!plan) {
      throw new ApiError(404, '点検計画がありません。');
    }
    if (planAction[2] === 'preview' && method === 'GET') {
      return json({
        ...planPreview(state, plan),
        revision: c.org.revision,
      });
    }
    if (planAction[2] === 'generate' && method === 'POST') {
      const input = await readJSON(request);
      const next = structuredClone(state);
      const preview = generatePlan(
        next,
        next.inspectionPlans.find((p) => p.id === plan.id),
        input.cycleDate,
      );
      return json(
        {
          ...preview,
          revision: await commit(env, c, next, 'inspection-plan.generate', requireRevision(input)),
        },
        201,
      );
    }
    throw new ApiError(405, '対応していない操作です。');
  }
  const teamEntity = path.match(
    /^\/api\/(tasks|teamMembers|inspectionPlans|projects)(?:\/([^/]+))?$/,
  );
  if (teamEntity) {
    editable(c);
    const [, kind, id] = teamEntity;
    const list = state[kind];
    if (method === 'GET') {
      if (id) {
        const record = list.find((x) => x.id === id);
        if (!record) {
          throw new ApiError(404, '対象がありません。');
        }
        return json({
          record,
          revision: c.org.revision,
        });
      }
      const q = (url.searchParams.get('q') || '').toLocaleLowerCase();
      return json({
        items: list.filter((r) => !q || JSON.stringify(r).toLocaleLowerCase().includes(q)),
        revision: c.org.revision,
      });
    }
    const input = await readJSON(request);
    const next = structuredClone(state);
    const record = mutate(next, kind, id, method, input.record || {});
    return json(
      {
        record,
        revision: await commit(
          env,
          c,
          next,
          kind + '.' + method.toLowerCase(),
          requireRevision(input),
        ),
      },
      method === 'POST' ? 201 : 200,
    );
  }
}
