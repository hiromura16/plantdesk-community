/** レイヤーセット、設備の一括取り込み、工事台帳と変更履歴のAPI。 */
import { ApiError } from '../../core.mjs';
import { commit, settings, validateFiles } from '../repository.mjs';
import { editable } from '../context.mjs';
import { json, readJSON } from '../http.mjs';
import layerSets from '../../../shared/layer-set-state.js';
import { preferences, visibleState } from '../../map-validation.mjs';
import { previewAssets } from '../../asset-import.mjs';
export async function handleManagement({ request, env, c, state, url, path, method }) {
  if (path === '/api/layer-sets/apply' && method === 'POST') {
    const input = await readJSON(request);
    const p = await settings(env, c);
    let patch;
    try {
      patch = layerSets.apply(visibleState(state, c.editor), p, input);
    } catch (e) {
      throw new ApiError(422, e.message);
    }
    const result = preferences(
      {
        ...p,
        ...patch,
      },
      c.org.plan,
    );
    await env.DB.prepare(
      'INSERT INTO map_preferences(user_id,organization_id,value_json) VALUES(?,?,?) ON CONFLICT(user_id,organization_id) DO UPDATE SET value_json=excluded.value_json',
    )
      .bind(c.user.id, c.org.id, JSON.stringify(result))
      .run();
    return json({
      preferences: result,
    });
  }
  if (['/api/assets/import-preview', '/api/assets/import'].includes(path) && method === 'POST') {
    editable(c);
    const input = await readJSON(request);
    const preview = previewAssets(input, state, c.org.plan);
    if (preview.canApply) {
      try {
        await validateFiles(env, c, preview.next);
      } catch (e) {
        preview.errors.push({
          row: null,
          code: '',
          message: e.message,
        });
        preview.canApply = false;
      }
    }
    const { next, ...result } = preview;
    if (path.endsWith('import-preview')) {
      return json({
        ...result,
        revision: c.org.revision,
      });
    }
    if (!Number.isSafeInteger(input.revision)) {
      throw new ApiError(422, 'プレビューで取得したrevisionが必要です。');
    }
    if (input.confirm !== 'IMPORT_ASSETS') {
      throw new ApiError(422, '設備取り込みの確認が必要です。');
    }
    if (!preview.canApply) {
      throw new ApiError(
        422,
        preview.errors.map((e) => (e.row ? '行' + e.row + ': ' : '') + e.message).join(' / '),
      );
    }
    return json({
      ...result,
      revision: await commit(env, c, next, 'assets.import', input.revision),
    });
  }
  if (path === '/api/work-register' && method === 'GET') {
    editable(c);
    const offset = Math.min(
      10000000,
      Math.max(0, Math.floor(Number(url.searchParams.get('offset')) || 0)),
    );
    const limit = Math.min(
      200,
      Math.max(1, Math.floor(Number(url.searchParams.get('limit')) || 100)),
    );
    const deleted = await env.DB.prepare(
      "SELECT e.work_id,e.before_json,e.created_at,e.revision FROM map_work_events e WHERE e.organization_id=? AND e.action='deleted' AND e.revision=(SELECT MAX(newer.revision) FROM map_work_events newer WHERE newer.organization_id=e.organization_id AND newer.work_id=e.work_id) ORDER BY e.created_at DESC LIMIT ? OFFSET ?",
    )
      .bind(c.org.id, limit + 1, offset)
      .all();
    return json({
      items: state.works,
      deleted: deleted.results.slice(0, limit).map((e) => ({
        ...JSON.parse(e.before_json),
        deleted: true,
        deletedAt: e.created_at,
      })),
      nextOffset: deleted.results.length > limit ? offset + limit : null,
      revision: c.org.revision,
    });
  }
  const workHistory = path.match(/^\/api\/works\/([^/]+)\/history$/);
  if (workHistory && method === 'GET') {
    editable(c);
    const requestedCursor = Number(url.searchParams.get('before'));
    const cursor =
      Number.isSafeInteger(requestedCursor) && requestedCursor > 0
        ? requestedCursor
        : Number.MAX_SAFE_INTEGER;
    const limit = Math.min(
      100,
      Math.max(1, Math.floor(Number(url.searchParams.get('limit')) || 30)),
    );
    const r = await env.DB.prepare(
      'SELECT id,action,actor_id,reason,revision,before_json,after_json,created_at FROM map_work_events WHERE organization_id=? AND work_id=? AND revision<? ORDER BY revision DESC LIMIT ?',
    )
      .bind(c.org.id, workHistory[1], cursor, limit + 1)
      .all();
    if (!r.results.length && !state.works.some((w) => w.id === workHistory[1])) {
      const exists = await env.DB.prepare(
        'SELECT id FROM map_work_events WHERE organization_id=? AND work_id=? LIMIT 1',
      )
        .bind(c.org.id, workHistory[1])
        .first();
      if (!exists) {
        throw new ApiError(404, 'この工事の履歴はありません。');
      }
    }
    return json({
      items: r.results.slice(0, limit).map((e) => ({
        id: e.id,
        action: e.action,
        actorId: e.actor_id,
        actor:
          e.actor_id === 'migration'
            ? '導入時の記録'
            : e.actor_id === c.user.id
              ? 'あなた'
              : '施設担当者 ' + e.actor_id.slice(0, 8),
        reason: e.reason,
        revision: e.revision,
        before: e.before_json ? JSON.parse(e.before_json) : null,
        after: e.after_json ? JSON.parse(e.after_json) : null,
        createdAt: e.created_at,
      })),
      nextCursor: r.results.length > limit ? r.results[limit - 1].revision : null,
    });
  }
}
