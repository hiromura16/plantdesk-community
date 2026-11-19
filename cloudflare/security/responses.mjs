/** ブラウザー向け制約は、正常・エラー・添付応答のどれにも一貫して付けます。 */
export function secureResponse(response, request) {
  const headers = new Headers(response.headers);
  headers.set('x-content-type-options', 'nosniff');
  headers.set('referrer-policy', 'same-origin');
  headers.set('x-frame-options', 'SAMEORIGIN');
  headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('cross-origin-resource-policy', 'same-origin');
  headers.set('cross-origin-opener-policy', 'same-origin');
  if (new URL(request.url).protocol === 'https:') {
    headers.set('strict-transport-security', 'max-age=31536000');
  }
  // 複数のCSPはすべて適用されます。添付固有のsandboxを共通ポリシーで上書きしません。
  headers.append(
    'content-security-policy',
    "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'",
  );
  // Access通過後の個人データやHTMLを共有キャッシュへ残しません。
  if (
    new URL(request.url).pathname.startsWith('/api/') ||
    headers.get('content-type')?.includes('text/html')
  ) {
    headers.set('cache-control', 'private, no-store');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
/** 外部応答もストリーム段階で制限し、巨大な公開鍵をメモリーへ全量展開しないようにします。 */
export async function boundedText(response, limit) {
  if (Number(response.headers.get('content-length') || 0) > limit) {
    await response.body?.cancel();
    throw new Error('応答が大きすぎます。');
  }
  const reader = response.body?.getReader();
  if (!reader) {
    return '';
  }
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      length += value.byteLength;
      if (length > limit) {
        throw new Error('応答が大きすぎます。');
      }
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel();
    throw error;
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}
