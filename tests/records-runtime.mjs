/** D1の実行環境でも移行SQL・行保存・履歴・リビジョン競合が同時に成立することを検証します。 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { migrations } from '../scripts/lib/migrations.mjs';
import { seedState } from '../cloudflare/map/context.mjs';
const cfRequire = createRequire(new URL('../cloudflare/package.json', import.meta.url));
const uiRequire = createRequire(new URL('../frontend/package.json', import.meta.url));
const { Miniflare } = cfRequire('miniflare');
const { build } = uiRequire('esbuild');
const built = await build({
  stdin: {
    contents: `import {readWorkspace} from './cloudflare/map/records-store.mjs';import {commit} from './cloudflare/map/repository.mjs';export default {async fetch(request,env){try{const org=await env.DB.prepare('SELECT * FROM organizations WHERE id=?').bind('runtime-org').first();const state=await readWorkspace(env,org);if(request.method==='GET')return Response.json({state,revision:org.revision});const input=await request.json();const next=structuredClone(state);next.works[0].title=input.title;if(input.race)await env.DB.prepare('UPDATE organizations SET revision=revision+1 WHERE id=?').bind(org.id).run();const revision=await commit(env,{org,state,user:{id:'runtime-user'}},next,'runtime-test',input.revision);return Response.json({revision});}catch(error){return Response.json({error:error.message},{status:error.status||500});}}};`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  format: 'esm',
  write: false,
  platform: 'browser',
  target: 'es2022',
});
const runtime = new Miniflare({
  workers: [
    {
      config: {
        name: 'records-test',
        compatibilityDate: '2026-11-13',
        manifest: {
          mainModule: 'records.mjs',
          modules: { 'records.mjs': { type: 'esm', contents: built.outputFiles[0].text } },
        },
        env: { DB: { type: 'd1', id: 'runtime-db' } },
      },
    },
  ],
});
try {
  const db = await runtime.getD1Database('DB');
  for (const migration of migrations) {
    if (migration.name.startsWith('0007')) {
      await db
        .prepare('INSERT INTO users(id,issuer,subject,created_at) VALUES(?,?,?,?)')
        .bind('runtime-user', 'https://test', 'runtime-user', '2026-11-14')
        .run();
      await db
        .prepare('INSERT INTO organizations(id,name,plan,state_json,updated_at) VALUES(?,?,?,?,?)')
        .bind('runtime-org', 'test', 'free', JSON.stringify(seedState('free')), '2026-11-14')
        .run();
    }
    // D1.exec expects one statement per line. Split these controlled SQL migrations at statement delimiters.
    const statements = migration.sql
      .replace(/--[^\n]*/g, '')
      .split(';')
      .map((value) => value.trim())
      .filter(Boolean);
    await db.batch(statements.map((sql) => db.prepare(sql)));
  }
  const initial = await (await runtime.dispatchFetch('http://test/')).json();
  assert.equal(initial.state.assets.length, 12);
  assert.equal(initial.revision, 0);
  let response = await runtime.dispatchFetch('http://test/', {
    method: 'POST',
    body: JSON.stringify({ title: 'D1の行保存', revision: 0 }),
  });
  assert.equal(response.status, 200, await response.text());
  const current = await (await runtime.dispatchFetch('http://test/')).json();
  assert.equal(current.state.works[0].title, 'D1の行保存');
  assert.equal(current.revision, 1);
  response = await runtime.dispatchFetch('http://test/', {
    method: 'POST',
    body: JSON.stringify({ title: '競合で保存しない', revision: 1, race: true }),
  });
  assert.equal(response.status, 409);
  const after = await (await runtime.dispatchFetch('http://test/')).json();
  assert.equal(after.state.works[0].title, 'D1の行保存');
  assert.equal(after.revision, 2);
  const events = await db.prepare('SELECT count(*) AS n FROM map_work_events').first();
  assert.equal(events.n, 1);
  console.log(
    'PASS: workerd/D1 migration, record persistence, event history and conditional atomic writes',
  );
} finally {
  await runtime.dispose();
}
