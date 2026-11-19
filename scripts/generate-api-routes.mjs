import { writeGenerated } from './lib/generated.mjs';
/** OpenAPIの経路から許容HTTPメソッドを生成します。認証・業務ルーターの手書き仕様と二重管理しません。 */
import { readFile } from 'node:fs/promises';
const spec = JSON.parse(await readFile(new URL('../api/openapi.json', import.meta.url), 'utf8'));
const routes = Object.entries(spec.paths)
  .map(([path, methods]) => [
    path,
    Object.keys(methods)
      .filter((method) =>
        ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method),
      )
      .map((method) => method.toUpperCase()),
  ])
  .sort(([a], [b]) => a.includes('{') - b.includes('{') || b.length - a.length);
const source =
  '/** OpenAPIから生成。直接編集せずnpm run generateを使ってください。 */\n/** @type {Array<[string,string[]]>} */\nexport const apiRoutes = ' +
  JSON.stringify(routes, null, 2) +
  ';\n';
await writeGenerated('cloudflare/generated/api-routes.mjs', source);
