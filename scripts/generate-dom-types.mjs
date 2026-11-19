import { writeGenerated } from './lib/generated.mjs';
/** HTMLと自作テンプレートのIDから、DOM取得の型と実行時のタグ照合表を生成します。 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const ids = new Map();
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walk(file);
    } else if (/\.(?:html|js|jsx)$/.test(e.name)) {
      const text = await readFile(file, 'utf8');
      for (const m of text.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*?\bid=["']([\w-]+)["']/g)) {
        const [, tag, id] = m;
        if (ids.has(id) && ids.get(id) !== tag) {
          throw Error('IDのタグが一致しません: ' + id);
        }
        ids.set(id, tag);
      }
    }
  }
}
await walk('frontend/pages');
await walk('frontend/src');
const output = Object.fromEntries([...ids].sort(([a], [b]) => a.localeCompare(b)));
await writeGenerated(
  'frontend/src/runtime/dom-ids.ts',
  '/** 自動生成。HTMLとテンプレートのID・タグの対応です。npm run generate で更新します。 */\nexport const domIds = ' +
    JSON.stringify(output, null, 2) +
    ' as const;\n',
);
console.log('DOM IDs:', ids.size);
