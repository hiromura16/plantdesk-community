import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.mjs';
test('static serving excludes API and SCIM namespaces', async () => {
  assert.equal((await worker.fetch(new Request('https://app.example/saas.html'), {})).status, 503);
  const ASSETS = {
    fetch: async () => new Response('static'),
  };
  let r = await worker.fetch(new Request('https://app.example/'), {
    ASSETS,
  });
  assert.equal(r.status, 200);
  assert.equal(await r.text(), 'static');
  r = await worker.fetch(new Request('https://app.example/saas.html'), {
    ASSETS,
  });
  assert.equal(await r.text(), 'static');
  assert.notEqual(
    await (
      await worker.fetch(new Request('https://app.example/api/nope'), {
        ASSETS,
      })
    ).text(),
    'static',
  );
  assert.notEqual(
    await (
      await worker.fetch(new Request('https://app.example/scim/nope'), {
        ASSETS,
      })
    ).text(),
    'static',
  );
});
