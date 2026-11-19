/**
 * ソースの配置と配信URLの対応表。キーがブラウザーへ公開する既存のパスです。
 * ソースを移動したときは値を更新し、HTMLの読み込み順と配信URLの互換性を保ちます。
 */
export const publicEntries = {
  'index.html': 'frontend/pages/index.html',
  'console.html': 'frontend/pages/console.html',
  'api-docs.html': 'frontend/pages/api-docs.html',
  'styles.css': 'frontend/src/styles/styles.css',
  'product.css': 'frontend/src/styles/product.css',
  'preferences.css': 'frontend/src/styles/preferences.css',
  'task-workspace.css': 'frontend/src/styles/task-workspace.css',
  'openapi.json': 'api/openapi.json',
};
