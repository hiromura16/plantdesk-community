/** 台帳の持ち出し・取り込み・監査と、バックアップの保存・復元。 */
import { ApiError, importPreview } from '../../core.mjs';
import { commit, stats } from '../repository.mjs';
import { editable } from '../context.mjs';
import { json, now, readJSON } from '../http.mjs';
import { validateMap, visibleState } from '../../map-validation.mjs';
export async function handleTransfer({ request, env, c, state, path, method }) {
  if (path === '/api/export' && method === 'GET') {
    return json({
      state: visibleState(state, c.editor),
      revision: c.org.revision,
      exportedAt: now(),
      format: 'factory-map-json-v2',
    });
  }
  if (path === '/api/import-preview' && method === 'POST') {
    editable(c);
    const input = await readJSON(request);
    const imported = validateMap(input.state || input, c.org.plan);
    const p = importPreview(imported, {}, c.org.plan);
    return json({
      ...p,
      canApply: p.attachmentIds.length === 0,
      mode: 'replace-after-confirmation',
      existing: stats(state),
    });
  }
  if (path === '/api/import' && method === 'POST') {
    editable(c);
    const input = await readJSON(request);
    if (input.confirm !== 'REPLACE') {
      throw new ApiError(422, '置き換えの確認が必要です。');
    }
    return json({
      revision: await commit(env, c, input.state, 'data.import', input.revision),
    });
  }
}
