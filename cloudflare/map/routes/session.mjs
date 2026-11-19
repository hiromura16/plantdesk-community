/** セッション・デモアカウント・認証状態と利用可能機能のAPI。 */
import { ApiError } from '../../core.mjs';
import { cookie, json } from '../http.mjs';
import { settings } from '../repository.mjs';
export async function handleSession({ env, c, path, method }) {
  if (path === '/api/session') {
    return json({
      saas: true,
      sso: env.LOCAL_AUTH ? 'Self-hosted' : 'Cloudflare Access',
      profile: c.profile,
      editor: c.editor,
      role: c.org.role,
      organization: {
        id: c.org.id,
        name: c.org.name,
      },
      plan: c.org.plan,
      limits: c.limits,
      mockBilling: false,
      profiles: [{ id: 'free', name: 'Community', plan: 'free', role: 'editor' }],
      preferences: await settings(env, c),
    });
  }
  if (path === '/api/health') {
    return json({
      ok: true,
      database: env.LOCAL_AUTH ? 'SQLite' : 'Cloudflare D1',
      version: '2.4.0',
      billing: 'community-no-billing',
    });
  }
  if (path === '/api/capabilities') {
    return json({
      version: '2.4.0',
      authentication: env.LOCAL_AUTH ? 'Self-hosted HTTP authentication' : 'Cloudflare Access SSO',
      billing: 'community-no-billing',
      webmcp: true,
      tools: 87,
      profile: c.profile,
      plan: c.org.plan,
      limits: c.limits,
      fileLimitBytes: 5 * 1024 * 1024,
      snapshotLimitBytes: 750000,
      features: [
        'works',
        'assets',
        'drawings',
        'properties',
        'notes',
        'inspection-history',
        'photo-thumbnails',
        'pdf-preview',
        'shared-preferences',
        'csv-history-import',
        'json-import-export',
        'display-presets',
        'custom-layers',
        'drawing-hierarchy',
        'work-history',
        'configurable-registers',
        'layer-sets',
        'equipment-json-import',
        'team-workboard',
        'inspection-plans',
        'task-history',
        'handover-reports',
        'notion-polling-sync',
        'notion-connector',
        'team-projects',
        'task-dependencies',
        'task-subtasks',
        'acceptance-criteria',
      ],
    });
  }
  if (path === '/api/auth/status') {
    return json({
      editor: c.editor,
      role: c.org.role,
      sso: true,
    });
  }
  if (path === '/api/auth/login' && method === 'POST') {
    if (!['owner', 'editor'].includes(c.org.role)) {
      throw new ApiError(403, '施設担当者の権限が必要です。');
    }
    return json(
      {
        editor: true,
        sso: true,
      },
      200,
      {
        'set-cookie': cookie('factory_mode', 'facility'),
      },
    );
  }
  if (path === '/api/auth/logout' && method === 'POST') {
    return json(
      {
        editor: false,
      },
      200,
      {
        'set-cookie': cookie('factory_mode', 'viewer'),
      },
    );
  }
  if (path === '/api/auth/password') {
    throw new ApiError(409, 'SSOを使用しています。パスワードの管理は不要です。');
  }
}
