/** 台帳と集計の参照・全体更新。閲覧モードには公開情報だけを返します。 */
import { commit, stats } from '../repository.mjs';
import { editable } from '../context.mjs';
import { json, readJSON } from '../http.mjs';
import { visibleState } from '../../map-validation.mjs';
export async function handleState({ request, env, c, state, path, method }) {
  if (path === '/api/state') {
    if (method === 'GET') {
      return json({
        state: visibleState(state, c.editor),
        revision: c.org.revision,
      });
    }
    editable(c);
    const input = await readJSON(request);
    const revision = await commit(env, c, input.state, 'state.update', input.revision);
    return json({
      revision,
    });
  }
  if (path === '/api/stats') {
    return json(stats(visibleState(state, c.editor)));
  }
  if (path === '/api/dashboard') {
    editable(c);
    const usage = await env.DB.prepare(
      'SELECT COALESCE(SUM(size),0) AS storage,count(*) AS files FROM map_files WHERE organization_id=?',
    )
      .bind(c.org.id)
      .first();
    return json({
      ...stats(visibleState(state, c.editor)),
      usage: {
        ...usage,
        drawings: state.drawings.length,
        assets: state.assets.length,
      },
      limits: c.limits,
      plan: c.org.plan,
    });
  }
}
