/** 同一ホストのAPIで共用する応答、受信量制限、Cookie、識別子とリビジョンの検証。 */
import { ApiError } from '../core.mjs';
const now = () => new Date().toISOString();
const enc = new TextEncoder();
const json = (x, status = 200, extra = {}) =>
  new Response(JSON.stringify(x), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...extra,
    },
  });
const cookie = (name, value) =>
  name + '=' + value + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800';
const readCookie = (r, name) =>
  r.headers
    .get('cookie')
    ?.split(';')
    .map((x) => x.trim())
    .find((x) => x.startsWith(name + '='))
    ?.slice(name.length + 1);
const sha = async (s) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
const b64 = (a) => {
  let s = '';
  for (let i = 0; i < a.length; i += 8192) {
    s += String.fromCharCode(...a.slice(i, i + 8192));
  }
  return btoa(s);
};
const un64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function readJSON(request, max = 900000) {
  if (!/^application\/json(?:;|$)/i.test(request.headers.get('content-type') || '')) {
    throw new ApiError(415, 'JSON形式で送信してください。');
  }
  const bytes = await readBytes(request, max);
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ApiError(400, 'JSON形式を確認してください。');
  }
}
async function readBytes(request, max) {
  if (Number(request.headers.get('content-length') || 0) > max) {
    throw new ApiError(413, 'ファイルまたはデータが大きすぎます。');
  }
  const reader = request.body?.getReader();
  if (!reader) {
    throw new ApiError(400, 'データがありません。');
  }
  const parts = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    length += value.byteLength;
    if (length > max) {
      await reader.cancel();
      throw new ApiError(413, 'ファイルまたはデータが大きすぎます。');
    }
    parts.push(value);
  }
  const all = new Uint8Array(length);
  let offset = 0;
  for (const p of parts) {
    all.set(p, offset);
    offset += p.length;
  }
  return all;
}
function routePath(url) {
  return url.pathname.replace(/\/$/, '') || '/';
}
const requireRevision = (input) => {
  if (!Number.isSafeInteger(input.revision)) {
    throw new ApiError(422, '最新のrevisionが必要です。');
  }
  return input.revision;
};
export {
  now,
  enc,
  json,
  cookie,
  readCookie,
  sha,
  b64,
  un64,
  readJSON,
  readBytes,
  routePath,
  requireRevision,
};
