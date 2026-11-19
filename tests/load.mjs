/** ローカルSQLiteを通すHTTP負荷回帰。3秒/要求を上限に、エラーや遅延の大幅な悪化を検出します。 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { mkdir, writeFile } from 'node:fs/promises';
const server = spawn(process.execPath, ['tests/map-local-server.mjs'], {
  stdio: ['ignore', 'pipe', 'inherit'],
});
const lines = createInterface({ input: server.stdout });
try {
  const [url] = await Promise.race([
    new Promise((resolve) => lines.once('line', (line) => resolve([line]))),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('サーバーの起動がタイムアウトしました。')), 15000).unref(),
    ),
  ]);
  await fetch(url + '/api/state').then((r) => {
    assert.equal(r.status, 200);
    return r.json();
  });
  const samples = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < 80) {
        const index = next++;
        const start = performance.now();
        const response = await fetch(
          url + ['/api/state', '/api/stats', '/api/team/report', '/api/preferences'][index % 4],
        );
        assert.equal(response.status, 200);
        await response.json();
        samples.push(performance.now() - start);
      }
    }),
  );
  samples.sort((a, b) => a - b);
  const report = {
    requests: samples.length,
    concurrency: 4,
    p50Ms: Math.round(samples[39]),
    p95Ms: Math.round(samples[75]),
    maxMs: Math.round(samples.at(-1)),
    environment: 'local SQLite / signed test identity',
  };
  await mkdir('.runtime/qa', { recursive: true });
  await writeFile('.runtime/qa/load.json', JSON.stringify(report, null, 2));
  console.log(report);
  assert.ok(report.p95Ms < 3000, 'p95が3秒の回帰基準を超えました。');
} finally {
  lines.close();
  server.kill('SIGTERM');
}
