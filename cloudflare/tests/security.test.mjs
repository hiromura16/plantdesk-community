/** 外部応答の受信制限、ブラウザーのAPI境界、アカウント切替時の送信先を検証します。 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { boundedText, secureResponse } from '../security/responses.mjs';
test('external response limit cancels a streaming body before allocating the remainder', async () => {
  let cancelled = false;
  const body = new ReadableStream({
    pull(controller) {
      controller.enqueue(new Uint8Array(64));
    },
    cancel() {
      cancelled = true;
    },
  });
  await assert.rejects(boundedText(new Response(body), 100), /大きすぎ/);
  assert.equal(cancelled, true);
  assert.equal(await boundedText(new Response('small'), 100), 'small');
  await assert.rejects(
    boundedText(new Response('x', { headers: { 'content-length': '101' } }), 100),
    /大きすぎ/,
  );
});
test('security policy covers error responses as well as HTML', () => {
  for (const status of [200, 401, 403, 500]) {
    const r = secureResponse(
      new Response('content', { status, headers: { 'content-type': 'text/html' } }),
      new Request('https://example.test/'),
    );
    assert.equal(r.status, status);
    assert.match(r.headers.get('content-security-policy'), /object-src 'none'/);
    assert.match(r.headers.get('cache-control'), /no-store/);
    assert.equal(r.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(r.headers.get('strict-transport-security'), 'max-age=31536000');
    assert.equal(r.headers.get('cross-origin-resource-policy'), 'same-origin');
    assert.equal(r.headers.get('cross-origin-opener-policy'), 'same-origin');
  }
});
test('attachment sandbox survives the common policy and HTTP development does not force HSTS', () => {
  const response = secureResponse(
    new Response('document', {
      headers: {
        'content-type': 'application/pdf',
        'content-security-policy': "default-src 'none'; sandbox",
      },
    }),
    new Request('https://example.test/api/files/test?inline=1'),
  );
  const policies = response.headers.get('content-security-policy');
  assert.match(policies, /default-src 'none'; sandbox/);
  assert.match(policies, /object-src 'none'/);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal(
    secureResponse(new Response('local'), new Request('http://127.0.0.1/')).headers.has(
      'strict-transport-security',
    ),
    false,
  );
});
test('API client pins requests to the selected profile and rejects external URLs', async () => {
  const saved = {
    fetch: globalThis.fetch,
    location: globalThis.location,
    window: globalThis.window,
  };
  try {
    globalThis.location = { origin: 'https://plantdesk.test' };
    globalThis.window = new EventTarget();
    const calls = [];
    globalThis.fetch = async (target, options) => {
      calls.push({ target, options });
      return Response.json(
        new URL(target).pathname === '/api/session'
          ? { saas: true, profile: 'free' }
          : { revision: 1, state: { version: 2 } },
      );
    };
    const { default: client } = await import('../../frontend/src/shared/api-client.js');
    await client.load();
    const options = { method: 'PUT', body: { brandName: 'test' } };
    await client.request('/api/preferences', options);
    assert.equal(calls.at(-1).options.headers.get('x-factory-profile'), 'free');
    assert.equal(calls.at(-1).options.redirect, 'error');
    assert.equal(calls.at(-1).options.mode, 'same-origin');
    assert.deepEqual(options, { method: 'PUT', body: { brandName: 'test' } });
    await client.request('/api/preferences', { headers: { 'x-factory-profile': 'free' } });
    assert.equal(calls.at(-1).options.headers.get('x-factory-profile'), 'free');
    const count = calls.length;
    await assert.rejects(client.request('https://external.test/api/state'), /同じホスト/);
    await assert.rejects(
      client.request('https://' + 'name:password@plantdesk.test/api/state'),
      /同じホスト/,
    );
    assert.equal(calls.length, count);
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) {
        delete globalThis[key];
      } else {
        globalThis[key] = value;
      }
    }
  }
});
