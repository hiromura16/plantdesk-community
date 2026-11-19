/** 公開前検査が値をエラーへ含めず、実設定と設定例を区別することを検証します。 */
import assert from 'node:assert/strict';
import { publicSourceIssues } from '../scripts/check-public-source.mjs';

for (const file of [
  'cloudflare/wrangler.jsonc',
  'cloudflare/wrangler.production.toml',
  '.env',
  '.env.production',
  'cloudflare/.dev.vars.staging',
  '.runtime/backups/state.json',
  'private-key.pem',
  'backup.sqlite',
  'infra/terraform.tfstate.backup',
]) {
  assert.ok(publicSourceIssues(file, '').length, file);
}
for (const file of ['cloudflare/wrangler.example.jsonc', '.env.example', 'cloudflare/worker.mjs']) {
  assert.deepEqual(publicSourceIssues(file, ''), [], file);
}
for (const value of [
  'gh' + 'p_' + 'x'.repeat(36),
  'ntn_' + 'a'.repeat(40),
  'https://' + 'tenant.cloudflareaccess.com',
  'https://' + 'project.account.workers.dev',
  'https://' + 'name:password@api.example.com',
  '"database_id": "' + 'a'.repeat(32) + '"',
  '"ACCESS_AUD": "' + 'b'.repeat(64) + '"',
  'CLOUDFLARE_API_TOKEN=' + 'x'.repeat(40),
  '"NOTION_TOKEN_KEY": "' + 'y'.repeat(43) + '="',
]) {
  const issues = publicSourceIssues('fixture.txt', '\n' + value);
  assert.ok(issues.length);
  assert.equal(issues[0].line, 2);
  assert.ok(!JSON.stringify(issues).includes(value));
}
assert.deepEqual(
  publicSourceIssues(
    'cloudflare/wrangler.example.jsonc',
    '"database_id": "00000000-0000-4000-8000-000000000000"',
  ),
  [],
);
assert.deepEqual(
  publicSourceIssues('.env.example', 'CLOUDFLARE_API_TOKEN=REPLACE_WITH_CLOUDFLARE_API_TOKEN'),
  [],
);
console.log('PASS: 公開前検査の実設定・秘密値・サンプル・出力の境界');
