/** 個人の表示設定の取得・保存。追加画像の所有権も確認します。 */
import { ApiError } from '../../core.mjs';
import { json, readJSON } from '../http.mjs';
import { preferences } from '../../map-validation.mjs';
import { settings } from '../repository.mjs';
export async function handlePreferences({ request, env, c, path, method }) {
  if (path === '/api/preferences') {
    if (method === 'GET') {
      return json({
        preferences: await settings(env, c),
      });
    }
    const p = preferences(await readJSON(request), c.org.plan);
    for (const icon of p.icons) {
      const f = await env.DB.prepare(
        "SELECT id FROM map_files WHERE id=? AND organization_id=? AND mime='image/png'",
      )
        .bind(icon.fileId, c.org.id)
        .first();
      if (!f) {
        throw new ApiError(422, 'アイコン画像を先に登録してください。');
      }
    }
    await env.DB.prepare(
      'INSERT INTO map_preferences(user_id,organization_id,value_json) VALUES(?,?,?) ON CONFLICT(user_id,organization_id) DO UPDATE SET value_json=excluded.value_json',
    )
      .bind(c.user.id, c.org.id, JSON.stringify(p))
      .run();
    return json({
      preferences: p,
    });
  }
}
