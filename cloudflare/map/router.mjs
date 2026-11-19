import { apiRoutes } from '../generated/api-routes.mjs';
import { json, readJSON, routePath } from './http.mjs';
/** 現行マップAPIの受付。共通の認証とCSRF検証を通してから、機能別の経路へ渡します。 */
import { ApiError } from '../core.mjs';
import { commit } from './repository.mjs';
import { context, editable } from './context.mjs';
import { handleFiles } from './routes/files.mjs';
import { handleManagement } from './routes/management.mjs';
import { handlePreferences } from './routes/preferences.mjs';
import { handleRecords } from './routes/records.mjs';
import { handleSession } from './routes/session.mjs';
import { handleState } from './routes/state.mjs';
import { handleTeam } from './routes/team.mjs';
import { handleTransfer } from './routes/transfer.mjs';
import { mutate } from './entities.mjs';
import { notionRoutes } from '../notion/routes.mjs';
const handlers = [
  handleSession,
  handlePreferences,
  handleState,
  handleFiles,
  handleTransfer,
  handleTeam,
  handleManagement,
  handleRecords,
];
export async function handleMap(request, env) {
  const url = new URL(request.url);
  const path = routePath(url);
  const method = request.method;
  const origin = request.headers.get('origin');
  if (
    !['GET', 'HEAD'].includes(method) &&
    ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site')
  ) {
    throw new ApiError(403, '別サイトからの変更は許可されていません。');
  }
  const knownRoute = apiRoutes.find(([template]) =>
    new RegExp(
      '^' +
        template
          .split('/')
          .map((part) => (part.startsWith('{') ? '[^/]+' : part))
          .join('/') +
        '$',
    ).test(path),
  );
  if (knownRoute && !knownRoute[1].includes(method)) {
    return json(
      {
        error: 'このHTTPメソッドは使えません。',
      },
      405,
      {
        allow: knownRoute[1].join(', '),
      },
    );
  }
  const c = await context(request, env);
  const state = c.state;
  if (path.startsWith('/api/notion/')) {
    editable(c);
    return notionRoutes(request, env, c, {
      readJSON,
      commit,
      mutate,
    });
  }
  const route = {
    request,
    env,
    c,
    state,
    url,
    path,
    method,
  };
  for (const handler of handlers) {
    const response = await handler(route);
    if (response) {
      return response;
    }
  }
  throw new ApiError(404, 'このAPIはありません。');
}
