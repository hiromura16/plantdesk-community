/**
 * セルフホストのHTTP境界。全ページを認証し、検証済みIDだけをAPIへ渡します。
 * クライアントが送ったCloudflare認証ヘッダーは本人確認に利用しません。
 */
import http from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import worker from '../cloudflare/worker.mjs';
import { commit } from '../cloudflare/map/repository.mjs';
import { runNotionJobs } from '../cloudflare/notion/engine.mjs';
import { openDatabase } from './database.mjs';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
};
const digest = (value) => createHash('sha256').update(value).digest();

export async function createApplication({
  password,
  publicDirectory,
  databasePath,
  origin,
  notionKey,
  sync = false,
}) {
  if (typeof password !== 'string' || password.length < 16 || /[\r\n]/.test(password)) {
    throw new Error('16文字以上の管理用パスワードを設定してください。');
  }
  if (sync && !notionKey) {
    throw new Error('Notion同期を有効にするには暗号化キーが必要です。');
  }
  const staticRoot = await realpath(publicDirectory);
  const expectedAuth = digest('Basic ' + Buffer.from('plantdesk:' + password).toString('base64'));
  const database = openDatabase(databasePath);
  const env = {
    DB: database.DB,
    LOCAL_AUTH: { issuer: 'urn:plantdesk:community', subject: 'self-hosted-owner' },
    APP_ORIGIN: origin || '',
    ...(sync ? { NOTION_TOKEN_KEY: notionKey } : {}),
    ASSETS: {
      async fetch(request) {
        try {
          const pathname = decodeURIComponent(new URL(request.url).pathname);
          const filename = await realpath(path.resolve(staticRoot, '.' + pathname));
          if (!filename.startsWith(staticRoot + path.sep)) {
            return new Response('Not found', { status: 404 });
          }
          const bytes = await readFile(filename);
          return new Response(request.method === 'HEAD' ? null : bytes, {
            headers: { 'content-type': mime[path.extname(filename)] || 'application/octet-stream' },
          });
        } catch {
          return new Response('Not found', { status: 404 });
        }
      },
    },
  };
  const server = http.createServer(async (req, res) => {
    if (!timingSafeEqual(digest(req.headers.authorization || ''), expectedAuth)) {
      res.writeHead(401, {
        'www-authenticate': 'Basic realm="PlantDesk Community", charset="UTF-8"',
        'cache-control': 'no-store',
      });
      res.end('Authentication required');
      return;
    }
    try {
      const base = origin || 'http://' + req.headers.host;
      if (origin && req.headers.host !== new URL(origin).host) {
        res.writeHead(421);
        res.end('Unexpected host');
        return;
      }
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 6 * 1024 * 1024) {
          res.writeHead(413);
          res.end('Payload too large');
          return;
        }
        chunks.push(chunk);
      }
      const headers = new Headers(req.headers);
      headers.delete('authorization');
      headers.delete('cf-access-jwt-assertion');
      const request = new Request(new URL(req.url, base), {
        method: req.method,
        headers,
        ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}),
      });
      const response = await worker.fetch(request, env);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(req.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      console.error(
        JSON.stringify({ event: 'self_host_request_failed', type: error?.name || 'Error' }),
      );
      if (!res.headersSent) {
        res.writeHead(500);
      }
      res.end('Internal server error');
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 10000;
  let pending = null;
  const poll = () => {
    if (pending) {
      return;
    }
    pending = runNotionJobs(env, { commit })
      .catch((error) =>
        console.error(
          JSON.stringify({ event: 'notion_poll_failed', type: error?.name || 'Error' }),
        ),
      )
      .finally(() => {
        pending = null;
      });
  };
  // 明示的に有効化しなければ定期通信を起動しません。
  const timer = sync ? setInterval(poll, 60000) : null;
  timer?.unref();
  return {
    server,
    async close() {
      if (timer) {
        clearInterval(timer);
      }
      if (server.listening) {
        await new Promise((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
      }
      if (pending) {
        await pending;
      }
      database.close();
    },
  };
}
