/** APIテストと網羅率の品質ゲート。前回の契約観測を消し、今回の結果だけをCI成果物へ残します。 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const output = new URL('.runtime/qa/', root);
const directory = new URL('cloudflare/', root);
await mkdir(output, { recursive: true });
await rm(new URL('contracts/', output), { recursive: true, force: true });
const files = (await readdir(directory)).includes('tests')
  ? (await readdir(new URL('tests/', directory)))
      .filter((file) => file.endsWith('.test.mjs'))
      .map((file) => 'tests/' + file)
  : [];
const args = [
  '--test',
  '--experimental-test-coverage',
  '--test-coverage-include=**/cloudflare/**/*.mjs',
  '--test-coverage-include=**/connectors/notion/*.mjs',
  '--test-coverage-exclude=**/tests/**',
  '--test-coverage-exclude=**/generated/**',
  '--test-coverage-lines=85',
  '--test-coverage-functions=90',
  '--test-coverage-branches=80',
  ...files,
];
const child = spawn(process.execPath, args, {
  cwd: fileURLToPath(directory),
  stdio: ['inherit', 'pipe', 'inherit'],
});
let log = '';
child.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  log += chunk;
});
const code = await new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('exit', resolve);
});
await writeFile(new URL('coverage.txt', output), log);
if (code !== 0) {
  process.exit(code || 1);
}
