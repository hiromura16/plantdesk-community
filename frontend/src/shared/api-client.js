import { imageContext, pngBlob } from '../runtime/images.js';
/** 画像変換が利用できない環境ではアップロード元のファイルを使います。 */

/**
 * 同じホストのAPI呼び出し、台帳のリビジョン、添付アップロードを共用します。
 * 権限とデータの正否はサーバーが判定し、認証切れは共通イベントで画面へ通知します。
 */
class APIError extends Error {
  /** @param {number} status @param {string} message */
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const FactoryAPI = (() => {
  let revision = 0;
  /** @type {import('../../../shared/model').Session | null | false} */
  let session = null;
  /**
   * 同じホストのAPIだけへ送信します。JSONとFormDataの扱いをこの窓口でそろえます。
   * @param {string} path APIのパス。
   * @param {Omit<RequestInit, 'body'> & {body?: unknown}} options 要求の内容。
   */
  async function request(path, options = {}) {
    const target = new URL(path, location.origin);
    if (
      target.origin !== location.origin ||
      !target.pathname.startsWith('/api/') ||
      target.username ||
      target.password
    ) {
      throw new Error('同じホストのAPIを指定してください。');
    }
    const { body, ...init } = options;
    const headers = new Headers(options.headers);
    if (session && target.pathname !== '/api/session' && !headers.has('x-factory-profile')) {
      headers.set('x-factory-profile', session.profile);
    }
    if (body !== undefined && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(target, {
      ...init,
      headers,
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      mode: 'same-origin',
      redirect: 'error',
    });
    const value = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) {
        window.dispatchEvent(new Event('factory-session-expired'));
      }
      throw new APIError(response.status, value.error || `HTTP ${response.status}`);
    }
    return value;
  }
  /** @returns {Promise<import('../../../shared/model').WorkspaceState>} */
  async function load() {
    if (session === null) {
      try {
        const current = /** @type {import('../../../shared/model').Session} */ (
          await request('/api/session')
        );
        session = current;
        if (!current.saas) {
          session = false;
        }
      } catch (error) {
        if (error.status === 404) {
          session = false;
        } else {
          throw error;
        }
      }
    }
    const result = await request('/api/state');
    revision = result.revision;
    return result.state;
  }
  async function save(state) {
    const r = await request('/api/state', {
      method: 'PUT',
      body: {
        revision,
        state,
      },
    });
    revision = r.revision;
  }
  async function upload(files) {
    if (!files.length) {
      return [];
    }
    const limit = session ? 5 : 30;
    const bytes = session ? 5 : 20;
    if (files.length > limit) {
      throw new Error('一度に' + limit + 'ファイルまでです。');
    }
    for (const file of files) {
      if (!file.size || file.size > bytes * 1024 * 1024) {
        throw new Error('各ファイルは空でない' + bytes + 'MB以下にしてください。');
      }
    }
    if (session && files.reduce((n, f) => n + f.size, 0) > 5 * 1024 * 1024) {
      throw new Error('一度の添付は合計5MBまでです。分けて追加してください。');
    }
    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      form.append('file', file);
      if (session && ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        try {
          const bitmap = await createImageBitmap(file);
          if (bitmap.width > 12000 || bitmap.height > 12000) {
            bitmap.close();
            throw new Error('画像は12000px以内にしてください。');
          }
          const scale = Math.min(1, 320 / bitmap.width, 240 / bitmap.height);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(bitmap.width * scale));
          canvas.height = Math.max(1, Math.round(bitmap.height * scale));
          imageContext(canvas).drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          bitmap.close();
          const thumbnail = await pngBlob(canvas);
          if (thumbnail) {
            form.append('thumbnail-' + i, thumbnail, 'thumbnail.png');
          }
        } catch (error) {
          // サムネイル生成だけの失敗なら原本を送ります。寸法の上限超過はそのまま拒否します。
          if (error.message.includes('12000')) {
            throw error;
          }
        }
      }
    }
    return (
      await request('/api/files', {
        method: 'POST',
        body: form,
      })
    ).files;
  }
  return {
    request,
    load,
    save,
    upload,
    get revision() {
      return revision;
    },
    get session() {
      return session || null;
    },
    get saas() {
      return !!(session && session.saas);
    },
    /** @returns {Promise<import('../../../shared/model').Session>} */
    async refreshSession() {
      const current = /** @type {import('../../../shared/model').Session} */ (
        await request('/api/session')
      );
      session = current;
      return current;
    },
  };
})();
export default FactoryAPI;
