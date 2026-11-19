/** CommunityのHTTP入口。認証・保存・閲覧投影は共通マップAPIで検証します。 */
import { ApiError } from './core.mjs';
import { handleMap, commit } from './map-app.mjs';
import { runNotionJobs } from './notion/engine.mjs';
import { secureResponse } from './security/responses.mjs';

async function fetchApplication(request, env) {
  try {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return await handleMap(request, env);
    }
    if (/^\/(?:scim|health)(?:\/|$)/.test(url.pathname)) {
      throw new ApiError(404, 'このAPIはありません。');
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      throw new ApiError(405, 'このHTTPメソッドは使えません。');
    }
    if (!env.ASSETS) {
      throw new ApiError(503, '静的ファイルが未設定です。');
    }
    if (url.pathname === '/') {
      url.pathname = '/index.html';
    } else if (url.pathname === '/api-docs') {
      url.pathname = '/api-docs.html';
    } else if (url.pathname === '/saas.html') {
      url.pathname = '/console.html';
    }
    return await env.ASSETS.fetch(new Request(url, request));
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error(JSON.stringify({ event: 'request_failed', type: error?.name || 'Error' }));
    }
    return Response.json(
      { error: error instanceof ApiError ? error.message : 'Internal server error' },
      { status: error instanceof ApiError ? error.status : 500 },
    );
  }
}
export default {
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runNotionJobs(env, { commit }));
  },
  /** @param {Request} request @param {import('./types').Env} env */
  async fetch(request, env) {
    return secureResponse(await fetchApplication(request, env), request);
  },
};
