/** 稼働済みのJSON台帳を持つDBへ新マイグレーションを適用し、旧版も含めたデータ保持を検証します。 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { migrations } from '../scripts/lib/migrations.mjs';
const seed = JSON.parse(readFileSync(new URL('../shared/demo/seed.json', import.meta.url), 'utf8'));
const previous = migrations.filter((m) => m.name < '0007');
const migration = migrations.find((m) => m.name.startsWith('0007'));
const python = `import json,sqlite3,sys
x=json.load(sys.stdin);db=sqlite3.connect(':memory:');db.row_factory=sqlite3.Row
for m in x['previous']:db.executescript(m['sql'])
db.execute('INSERT INTO organizations(id,name,state_json,updated_at) VALUES(?,?,?,?)',('old-map','existing',json.dumps(x['seed']),'2026-01-01'))
db.execute('INSERT INTO organizations(id,name,updated_at) VALUES(?,?,?)',('v1','legacy','2026-01-01'));db.commit()
db.executescript(x['migration']['sql'])
print(json.dumps({'records':[dict(r) for r in db.execute('SELECT * FROM map_records')],'organizations':[dict(r) for r in db.execute('SELECT id,state_json FROM organizations')]}))`;
const result = spawnSync('python3', ['-c', python], {
  input: JSON.stringify({ previous, migration, seed }),
  encoding: 'utf8',
  maxBuffer: 8 * 1024 * 1024,
});
assert.equal(result.status, 0, result.stderr);
const actual = JSON.parse(result.stdout);
assert.equal(actual.organizations.find((o) => o.id === 'old-map').state_json, '{}');
assert.equal(JSON.parse(actual.organizations.find((o) => o.id === 'v1').state_json).version, 1);
for (const [key, items] of Object.entries(seed)) {
  if (!Array.isArray(items)) {
    continue;
  }
  const rows = actual.records
    .filter((r) => r.collection === key)
    .sort((a, b) => a.ordinal - b.ordinal);
  assert.equal(rows.length, items.length, key);
  for (const [index, row] of rows.entries()) {
    const record = JSON.parse(row.record_json),
      original = items[index];
    if (key === 'assets') {
      const { history, ...asset } = original;
      assert.deepEqual(record, asset);
      const histories = actual.records
        .filter((r) => r.collection === 'maintenance' && r.parent_id === record.id)
        .sort((a, b) => a.ordinal - b.ordinal)
        .map((r) => JSON.parse(r.record_json));
      assert.deepEqual(histories, history);
    } else {
      assert.deepEqual(record, original);
    }
  }
}
console.log('既存DBのマイグレーション: 全台帳・点検履歴・配列順序・v1互換を保持');
