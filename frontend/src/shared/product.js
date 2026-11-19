import { findById as domFindById, byId as domById, query as domQuery } from '../runtime/dom.ts';
/**
 * セッションを取得し、マップまたは管理画面のReact UIを起動する橋渡し。
 * 画面操作で利用するアカウント情報はサーバーから取得し、認証切れを共通処理します。
 */
import { getMapApp } from '../runtime/context.js';
import FactoryAPI from './api-client.js';
import FactoryProduct from '../console/product.jsx';
export default async function startProduct() {
  async function start() {
    if (domFindById('console-root')) {
      FactoryProduct.mountConsole(domById('console-root'));
      return;
    }
    if (!getMapApp() || !FactoryAPI.saas) {
      return;
    }
    const root = document.createElement('div');
    root.id = 'product-map-root';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'アカウントとプラン');
    domQuery('.app-header').after(root);
    FactoryProduct.mountMap(root);
    domById('password-open').hidden = true;
    domById('password-open').classList.remove('editor-only');
    domQuery('.demo-indicator').textContent = 'Community';
    const workId = new URL(location.href).searchParams.get('work');
    if (workId) {
      getMapApp().openRecord('works', workId);
    }
    const id = new URL(location.href).searchParams.get('asset');
    if (id) {
      if (!getMapApp().editor) {
        await FactoryAPI.request('/api/auth/login', {
          method: 'POST',
          body: {},
        });
        await getMapApp().refresh();
        getMapApp().setEditor(true);
      }
      try {
        getMapApp().openRecord('assets', id);
      } catch (error) {
        getMapApp().fail(error);
      }
    }
  }
  return start();
}
