/** 資料の登録・一覧・配信・削除。履歴が保持する資料の参照も保護します。 */
import { ApiError } from '../../core.mjs';
import { editable } from '../context.mjs';
import { fileIds } from '../../map-validation.mjs';
import { fileResponse, upload } from '../files.mjs';
import { historyFileIds, settings } from '../repository.mjs';
import { json } from '../http.mjs';
export async function handleFiles({ request, env, c, state, path, method }) {
  if (path === '/api/files' && method === 'POST') {
    return upload(request, env, c);
  }
  const file = path.match(/^\/api\/files\/([a-zA-Z0-9-]+)(\/thumbnail)?$/);
  if (file && method === 'GET') {
    return fileResponse(request, env, c, file[1], !!file[2]);
  }
  if (path === '/api/files' && method === 'GET') {
    editable(c);
    const r = await env.DB.prepare(
      'SELECT id,name,mime,size,created_at FROM map_files WHERE organization_id=? ORDER BY created_at DESC LIMIT 500',
    )
      .bind(c.org.id)
      .all();
    const retained = new Set(await historyFileIds(env, c));
    const used = new Set([
      ...fileIds(state),
      ...retained,
      ...(await settings(env, c)).icons.map((x) => x.fileId),
    ]);
    return json({
      items: r.results.map((x) => ({
        ...x,
        referenced: used.has(x.id),
        historyReferenced: retained.has(x.id),
      })),
    });
  }
  if (file && method === 'DELETE') {
    editable(c);
    const retained = new Set(await historyFileIds(env, c));
    if (retained.has(file[1])) {
      throw new ApiError(409, '工事・作業の変更履歴に保存された資料は削除できません。');
    }
    const ids = new Set([
      ...fileIds(state),
      ...(await settings(env, c)).icons.map((x) => x.fileId),
    ]);
    if (ids.has(file[1])) {
      throw new ApiError(409, '使用中の資料・アイコンは先に参照を外してください。');
    }
    await env.DB.batch([
      env.DB.prepare(
        'DELETE FROM map_file_chunks WHERE file_id IN (SELECT id FROM map_files WHERE id=? AND organization_id=?)',
      ).bind(file[1], c.org.id),
      env.DB.prepare('DELETE FROM map_files WHERE id=? AND organization_id=?').bind(
        file[1],
        c.org.id,
      ),
    ]);
    return json({
      deleted: true,
    });
  }
}
