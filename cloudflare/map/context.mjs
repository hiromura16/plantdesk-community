import { initializeWorkspace, readWorkspace } from './records-store.mjs';
/** Accessの署名検証、利用者ごとの所属・デモアカウントの解決、操作権限の確認。 */
import { ApiError } from '../core.mjs';
import { LIMITS } from '../map-validation.mjs';
import { authenticate } from '../auth.mjs';
import { ensureTeam } from '../team.mjs';
import { now, readCookie, sha } from './http.mjs';
import seed from '../../shared/demo/seed.json' with { type: 'json' };
async function actor(request, env) {
  const access = request.headers.get('cf-access-jwt-assertion');
  let identity;
  if (env.LOCAL_AUTH) {
    // Nodeサーバーが認証済みの要求にだけ渡す内部情報。HTTPヘッダーは信頼しません。
    identity = env.LOCAL_AUTH;
  } else if (access && env.ACCESS_AUD) {
    const r = new Request(request.url, {
      headers: {
        authorization: 'Bearer ' + access,
      },
    });
    identity = await authenticate(r, {
      AUTH_ISSUER: env.ACCESS_TEAM,
      AUTH_AUDIENCE: env.ACCESS_AUD,
      AUTH_JWKS_URL: env.ACCESS_TEAM + '/cdn-cgi/access/certs',
    });
  } else {
    throw new ApiError(401, 'Cloudflare Accessでログインしてください。');
  }
  const id = await sha(JSON.stringify([identity.issuer, identity.subject]));
  return {
    id,
    identity,
  };
}
function seedState(profile) {
  const s = {
    ...structuredClone(seed),
    layers: [],
    drawingLinks: [],
    layerSets: [],
  };
  if (profile === 'free') {
    s.assets = s.assets.slice(0, 12);
    const ids = new Set(s.assets.map((a) => a.id));
    s.works.forEach((w) => (w.assetIds = (w.assetIds || []).filter((id) => ids.has(id))));
  }
  function clean(x) {
    if (Array.isArray(x)) {
      return x.map(clean);
    }
    if (!x || typeof x !== 'object') {
      return x;
    }
    return Object.fromEntries(
      Object.entries(x).map(([k, v]) => [k, k === 'attachments' ? [] : clean(v)]),
    );
  }
  return clean(s);
}
async function bootstrap(env, user) {
  const uid = user.id;
  const when = now();
  await env.DB.prepare('INSERT OR IGNORE INTO users(id,issuer,subject,created_at) VALUES(?,?,?,?)')
    .bind(uid, user.identity.issuer, user.identity.subject, when)
    .run();
  for (const profile of ['free']) {
    const id = 'demo-' + profile + '-' + uid.slice(0, 32);
    await env.DB.batch([
      env.DB.prepare(
        'INSERT OR IGNORE INTO organizations(id,name,plan,state_json,updated_at) VALUES(?,?,?,?,?)',
      ).bind(id, 'Community ワークスペース', profile, JSON.stringify(seedState(profile)), when),
      env.DB.prepare(
        'INSERT OR IGNORE INTO memberships(organization_id,user_id,role) VALUES(?,?,?)',
      ).bind(id, uid, 'editor'),
      env.DB.prepare(
        'INSERT OR IGNORE INTO demo_profiles(user_id,profile,organization_id) VALUES(?,?,?)',
      ).bind(uid, profile, id),
      env.DB.prepare(
        "INSERT OR IGNORE INTO map_work_events(id,organization_id,work_id,action,actor_id,reason,revision,after_json,created_at) SELECT 'baseline:'||o.id||':'||json_extract(w.value,'$.id'),o.id,json_extract(w.value,'$.id'),'baseline',?,'デモ台帳の初期記録',o.revision,w.value,? FROM organizations o,json_each(o.state_json,'$.works') w WHERE o.id=?",
      ).bind(uid, when, id),
      ...initializeWorkspace(env.DB, id),
    ]);
  }
}
/**
 * Accessの検証結果から利用者を確定し、選択中のデモアカウントの所属と台帳を読み込みます。
 * クライアントから送られた組織IDを、そのままアクセス権として扱いません。
 */
async function context(request, env) {
  if (!env.DB) {
    throw new ApiError(503, 'データベースが未設定です。');
  }
  const user = await actor(request, env);
  // 初回作成は再実行しても同じ所属を使い、SSOの利用者ごとにデモ用データを分離します。
  const found = await env.DB.prepare('SELECT count(*) AS n FROM demo_profiles WHERE user_id=?')
    .bind(user.id)
    .first();
  if (found.n !== 1) {
    await bootstrap(env, user);
  }
  // プランやCookieを書き換えてもFree以外のワークスペースには切り替えません。
  const profile = 'free';
  const org = await env.DB.prepare(
    'SELECT o.*,m.role FROM organizations o JOIN demo_profiles p ON p.organization_id=o.id JOIN memberships m ON m.organization_id=o.id AND m.user_id=p.user_id WHERE p.user_id=? AND p.profile=? AND m.active=1',
  )
    .bind(user.id, profile)
    .first();
  if (!org) {
    throw new ApiError(403, 'このデモにアクセスできません。');
  }
  const state = await readWorkspace(env, org);
  state.layers ??= [];
  state.drawingLinks ??= [];
  state.layerSets ??= [];
  ensureTeam(state);
  return {
    user,
    org,
    state,
    profile,
    editor:
      readCookie(request, 'factory_mode') !== 'viewer' && ['owner', 'editor'].includes(org.role),
    limits: LIMITS[org.plan],
  };
}
function editable(c) {
  if (!c.editor || !['owner', 'editor'].includes(c.org.role)) {
    throw new ApiError(403, '施設担当モードに切り替えてください。');
  }
}
export { actor, seedState, bootstrap, context, editable };
