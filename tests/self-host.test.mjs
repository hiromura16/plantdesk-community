/** 永続運用のHTTP認証・SQLite・Free上限・再起動・静的配信の境界を実際のサーバーで検証します。 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { once } from 'node:events';
import { createApplication } from '../server/application.mjs';
import { openDatabase } from '../server/database.mjs';

test('SQLite batches roll back together and migrations are idempotent', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'community-sqlite-test-'));
  const filename = path.join(directory, 'test.sqlite');
  let db = openDatabase(filename);
  try {
    await assert.rejects(
      db.DB.batch([
        db.DB.prepare('INSERT INTO users(id,issuer,subject,created_at) VALUES(?,?,?,?)').bind(
          'one',
          'test',
          'one',
          'now',
        ),
        db.DB.prepare('INSERT INTO users(id,issuer,subject,created_at) VALUES(?,?,?,?)').bind(
          'one',
          'test',
          'one',
          'now',
        ),
      ]),
    );
    assert.equal((await db.DB.prepare('SELECT count(*) AS n FROM users').first()).n, 0);
    db.close();
    db = openDatabase(filename);
    const tables = (
      await db.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    ).results.map((r) => r.name);
    for (const table of ['map_snapshots', 'audit_events', 'scim_users']) {
      assert.ok(!tables.includes(table));
    }
  } finally {
    db.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('self-host auth, Free-only API, persistent edits and static path isolation', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'community-http-test-'));
  const publicDirectory = path.join(directory, 'public');
  await mkdir(publicDirectory);
  await writeFile(path.join(publicDirectory, 'index.html'), '<h1>Community test</h1>');
  await writeFile(path.join(directory, 'private.txt'), 'private');
  await symlink(path.join(directory, 'private.txt'), path.join(publicDirectory, 'escape.txt'));
  const options = {
    password: 'test-only-community-password',
    publicDirectory,
    databasePath: path.join(directory, 'data', 'community.sqlite'),
  };
  await assert.rejects(createApplication({ ...options, password: '' }), /パスワード/);
  await assert.rejects(createApplication({ ...options, sync: true }), /暗号化キー/);
  let app = await createApplication(options);
  const listen = async () => {
    app.server.listen(0, '127.0.0.1');
    await once(app.server, 'listening');
    return 'http://127.0.0.1:' + app.server.address().port;
  };
  let origin = await listen();
  const auth = 'Basic ' + Buffer.from('plantdesk:' + options.password).toString('base64');
  const request = (p, method = 'GET', body, extra = {}) =>
    fetch(origin + p, {
      method,
      headers: {
        authorization: auth,
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...extra,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  try {
    for (const p of ['/', '/api/state', '/openapi.json']) {
      const response = await fetch(origin + p, {
        headers: { 'cf-access-jwt-assertion': 'untrusted' },
      });
      assert.equal(response.status, 401);
      assert.match(response.headers.get('www-authenticate'), /^Basic/);
    }
    assert.equal(await (await request('/')).text(), '<h1>Community test</h1>');
    assert.equal((await request('/', 'HEAD')).status, 200);
    assert.equal((await request('/escape.txt')).status, 404);
    assert.equal((await request('/..%2Fprivate.txt')).status, 404);
    const session = await (
      await request('/api/session', 'GET', null, { 'x-factory-profile': 'pro' })
    ).json();
    assert.equal(session.plan, 'free');
    assert.equal(session.profile, 'free');
    assert.equal(session.profiles.length, 1);
    assert.equal(session.sso, 'Self-hosted');
    assert.equal(session.limits.assets, 100);
    const current = await (await request('/api/state')).json();
    assert.equal(current.state.assets.length, 12);
    const originalRevision = current.revision;
    current.state.assets[0].name = '再起動後も残る設備';
    const saved = await request('/api/state', 'PUT', current);
    assert.equal(saved.status, 200, await saved.text());
    assert.equal((await request('/api/state', 'PUT', current)).status, 409);
    assert.equal((await request('/api/preferences', 'PUT', { theme: 'dark' })).status, 403);
    assert.equal(
      (
        await request('/api/preferences', 'PUT', {
          icons: [{ id: 'icon-one', fileId: 'test', name: 'test' }],
        })
      ).status,
      403,
    );
    assert.equal(
      (await request('/api/state', 'PUT', current, { origin: 'https://external.test' })).status,
      403,
    );
    for (const p of [
      '/api/demo/profile',
      '/api/snapshots',
      '/api/audit',
      '/api/v1/organizations',
      '/scim/v2/Users',
    ]) {
      assert.equal((await request(p, 'POST', { profile: 'pro' })).status, 404);
    }
    const ready = await (await request('/api/notion/status')).json();
    assert.equal(ready.serverReady, false);
    const quota = await (await request('/api/state')).json();
    quota.state.drawings.push(
      { ...quota.state.drawings[0], id: 'third' },
      { ...quota.state.drawings[0], id: 'fourth' },
    );
    assert.equal((await request('/api/state', 'PUT', quota)).status, 409);
    await app.close();
    app = await createApplication(options);
    origin = await listen();
    const restored = await (await request('/api/state')).json();
    assert.equal(restored.state.assets[0].name, '再起動後も残る設備');
    assert.equal(restored.revision, originalRevision + 1);
  } finally {
    await app.close();
    await rm(directory, { recursive: true, force: true });
  }
});
