/** 起動設定は環境変数と秘密ファイルから読み、値をログへ出しません。 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createApplication } from './application.mjs';

process.umask(0o077);
const root = fileURLToPath(new URL('../', import.meta.url));
const readSecret = async (file, value) => (file ? (await readFile(file, 'utf8')).trim() : value);
const password = await readSecret(
  process.env.PLANTDESK_PASSWORD_FILE,
  process.env.PLANTDESK_PASSWORD,
);
const notionKey = await readSecret(process.env.NOTION_TOKEN_KEY_FILE, process.env.NOTION_TOKEN_KEY);
const port = Number(process.env.PORT || 18018);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORTが不正です。');
}
const application = await createApplication({
  password,
  publicDirectory: path.join(root, 'public'),
  databasePath: path.resolve(
    process.env.PLANTDESK_DATA_DIR || path.join(root, '.runtime/data'),
    'community.sqlite',
  ),
  origin: process.env.PLANTDESK_ORIGIN,
  notionKey,
  sync: process.env.PLANTDESK_NOTION_SYNC === 'true',
});
const host = process.env.HOST || '127.0.0.1';
application.server.listen(port, host, () =>
  console.log(`PlantDesk Community: ${host}:${application.server.address().port}`),
);
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await application.close();
  });
}
