/** 添付・写真・サムネイルの保存と配信。組織と閲覧モードに応じて参照可否を判定します。 */
import { ApiError } from '../core.mjs';
import { b64, json, now, readBytes, un64 } from './http.mjs';
import { editable } from './context.mjs';
import { fileIds, visibleState } from '../map-validation.mjs';
import { settings } from './repository.mjs';
function visibleFile(c, id, _prefs) {
  return c.editor || fileIds(visibleState(c.state, false)).includes(id);
}
async function upload(request, env, c) {
  editable(c);
  const bytes = await readBytes(request, 6 * 1024 * 1024);
  const form = await new Request(request.url, {
    method: 'POST',
    headers: {
      'content-type': request.headers.get('content-type') || '',
    },
    body: bytes,
  }).formData();
  const files = form.getAll('file');
  if (!files.length || files.length > 5) {
    throw new ApiError(422, '一度に1〜5ファイルを選んでください。');
  }
  const output = [];
  if (files.reduce((n, f) => n + (typeof f === 'string' ? 0 : f.size), 0) > 5 * 1024 * 1024) {
    throw new ApiError(413, '一度のアップロードは合計5MBまでです。分けて添付してください。');
  }
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (typeof f === 'string' || !f.size || f.size > 5 * 1024 * 1024) {
      throw new ApiError(413, '各ファイルは5MB以下にしてください。');
    }
    const data = new Uint8Array(await f.arrayBuffer());
    let mime = 'application/octet-stream';
    const declared = f.type;
    if (data[0] === 137 && data[1] === 80 && data[2] === 78 && data[3] === 71) {
      mime = 'image/png';
    } else if (data[0] === 255 && data[1] === 216 && data[2] === 255) {
      mime = 'image/jpeg';
    } else if (String.fromCharCode(...data.slice(0, 4)) === 'GIF8') {
      mime = 'image/gif';
    } else if (
      String.fromCharCode(...data.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...data.slice(8, 12)) === 'WEBP'
    ) {
      mime = 'image/webp';
    } else if (String.fromCharCode(...data.slice(0, 5)) === '%PDF-') {
      mime = 'application/pdf';
    } else if (declared === 'text/plain' || /\.(csv|dxf|txt|json)$/i.test(f.name)) {
      mime = 'text/plain';
    }
    const thumbnail = form.get('thumbnail-' + i);
    let thumb = null;
    if (thumbnail && typeof thumbnail !== 'string' && thumbnail.size <= 150000) {
      const a = new Uint8Array(await thumbnail.arrayBuffer());
      if (a[0] === 137 && a[1] === 80 && a[2] === 78 && a[3] === 71) {
        thumb = b64(a);
      }
    }
    const id = crypto.randomUUID();
    // eslint-disable-next-line no-control-regex -- 添付名から制御文字を除くため、対象文字を正規表現で明示します。
    const name = f.name.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 180) || 'file';
    const queries = [
      env.DB.prepare(
        'INSERT INTO map_files(id,organization_id,name,mime,size,thumbnail,created_at) SELECT ?,?,?,?,?,?,? WHERE (SELECT COALESCE(SUM(size),0) FROM map_files WHERE organization_id=?) + ? <= ?',
      ).bind(id, c.org.id, name, mime, f.size, thumb, now(), c.org.id, f.size, c.limits.storage),
    ];
    for (let offset = 0, ordinal = 0; offset < data.length; offset += 196608, ordinal++) {
      queries.push(
        env.DB.prepare(
          'INSERT INTO map_file_chunks(file_id,ordinal,data) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM map_files WHERE id=?)',
        ).bind(id, ordinal, b64(data.slice(offset, offset + 196608)), id),
      );
    }
    const r = await env.DB.batch(queries);
    if (r[0].meta.changes !== 1) {
      throw new ApiError(409, '保存容量の上限です。不要なファイルを削除してください。');
    }
    output.push({
      id,
      fileId: id,
      name,
      mime,
      size: f.size,
    });
  }
  return json(
    {
      files: output,
    },
    201,
  );
}
async function fileResponse(request, env, c, id, thumbnail) {
  const f = await env.DB.prepare('SELECT * FROM map_files WHERE id=? AND organization_id=?')
    .bind(id, c.org.id)
    .first();
  if (!f || !visibleFile(c, id, await settings(env, c))) {
    throw new ApiError(404, 'ファイルがありません。');
  }
  let data;
  let mime = f.mime;
  if (thumbnail && f.thumbnail) {
    data = un64(f.thumbnail);
    mime = 'image/png';
  } else {
    const chunks = await env.DB.prepare(
      'SELECT data FROM map_file_chunks WHERE file_id=? ORDER BY ordinal',
    )
      .bind(id)
      .all();
    data = new Uint8Array(f.size);
    let offset = 0;
    for (const row of chunks.results) {
      const part = un64(row.data);
      data.set(part, offset);
      offset += part.length;
    }
    if (offset !== f.size) {
      throw new ApiError(500, 'ファイルが不完全です。');
    }
  }
  const inline =
    ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(mime) &&
    (thumbnail || new URL(request.url).searchParams.has('inline'));
  return new Response(data, {
    headers: {
      'content-type': mime,
      'content-length': String(data.length),
      'content-disposition':
        (inline ? 'inline' : 'attachment') + "; filename*=UTF-8''" + encodeURIComponent(f.name),
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; sandbox",
    },
  });
}
export { visibleFile, upload, fileResponse };
