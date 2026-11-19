/** ローカル検証も開発サーバーも、番号順の全マイグレーションを同じ入口から読みます。 */
import { readdirSync, readFileSync } from 'node:fs';
const directory = new URL('../../cloudflare/migrations/', import.meta.url);
export const migrations = readdirSync(directory)
  .filter((file) => /^\d{4}_[a-z0-9_]+\.sql$/.test(file))
  .sort()
  .map((file) => ({ name: file, sql: readFileSync(new URL(file, directory), 'utf8') }));
