import {
  valueControl,
  dialogElement,
  findQuery as domFind,
  query as domQuery,
  findById,
} from '../runtime/dom.ts';
/**
 * PDF.jsでマニュアル・点検用紙を描画する共通プレビュー。
 * 表示先やページを切り替えるときは古い描画処理を中断し、別資料の結果が混ざるのを防ぎます。
 */
const FactoryPDF = (() => {
  let library;
  let active = null;
  const escape = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );
  async function pdfLibrary() {
    if (!library) {
      library = import('pdfjs-dist/build/pdf.mjs').then((module) => {
        module.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.mjs';
        return module;
      });
    }
    return library;
  }
  /**
   * 閉じた資料の描画・読み込みと、一時URLを解放します。
   * 前の資料の非同期処理が、新しく開いたプレビューを書き換えないようにします。
   */
  function dispose(state) {
    if (!state || state.disposed) {
      return;
    }
    state.disposed = true;
    state.observer?.disconnect();
    clearTimeout(state.resizeTimer);
    state.render?.cancel();
    void state.loading?.destroy().catch(() => {});
    domFind('.pdf-page-stage', state.dialog)?.replaceChildren();
    if (active === state) {
      active = null;
    }
  }
  async function render(state) {
    if (active !== state || !state.document || state.disposed) {
      return;
    }
    const sequence = ++state.sequence;
    const status = domQuery('.pdf-status', state.dialog);
    status.textContent = 'ページを表示しています…';
    state.dialog.dataset.pdfReady = 'false';
    state.render?.cancel();
    try {
      const page = await state.document.getPage(state.page);
      if (active !== state || sequence !== state.sequence) {
        return;
      }
      const natural = page.getViewport({
        scale: 1,
      });
      const width = Math.max(160, domQuery('.pdf-page-stage', state.dialog).clientWidth - 40);
      const viewport = page.getViewport({
        scale: (Math.min(width, 1000) / natural.width) * state.zoom,
      });
      const outputScale = Math.min(
        window.devicePixelRatio || 1,
        2,
        Math.sqrt(12000000 / (viewport.width * viewport.height)),
      );
      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-label', `${state.name} ${state.page}ページ`);
      canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
      canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      domQuery('.pdf-page-stage', state.dialog).replaceChildren(canvas);
      state.render = page.render({
        canvasContext: canvas.getContext('2d'),
        viewport,
        transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0],
      });
      await state.render.promise;
      if (active !== state || sequence !== state.sequence) {
        return;
      }
      domQuery('#pdf-page', state.dialog).value = state.page;
      domQuery('#pdf-page', state.dialog).max = state.document.numPages;
      domQuery('#pdf-page-total', state.dialog).textContent = `/ ${state.document.numPages}`;
      domQuery('#pdf-prev', state.dialog).disabled = state.page <= 1;
      domQuery('#pdf-next', state.dialog).disabled = state.page >= state.document.numPages;
      domQuery('#pdf-zoom-label', state.dialog).textContent = `${Math.round(state.zoom * 100)}%`;
      status.textContent = '';
      state.dialog.dataset.pdfReady = 'true';
    } catch (error) {
      if (
        error.name === 'RenderingCancelledException' ||
        active !== state ||
        sequence !== state.sequence
      ) {
        return;
      }
      status.textContent =
        'このページを表示できませんでした。「ブラウザーで開く」かダウンロードをご利用ください。';
    }
  }
  async function open(fileId, name) {
    if (active) {
      active.dialog.close();
      dispose(active);
    }
    let dialog = findById('file-preview');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'file-preview';
      document.body.append(dialog);
    }
    dialog.className = 'form-dialog preview-dialog pdf-preview-dialog';
    dialog.dataset.pdfReady = 'false';
    const source = '/api/files/' + encodeURIComponent(fileId);
    dialog.innerHTML = `<div class="dialog-heading"><h2>${escape(name)}</h2><button class="icon-close" type="button" aria-label="閉じる">×</button></div><div class="pdf-toolbar"><div class="pdf-paging"><button id="pdf-prev" type="button" disabled aria-label="前のページ">←</button><input id="pdf-page" type="number" min="1" value="1" aria-label="表示するページ"><span id="pdf-page-total">/ —</span><button id="pdf-next" type="button" disabled aria-label="次のページ">→</button></div><div class="pdf-zoom"><button id="pdf-zoom-out" type="button" aria-label="縮小">−</button><span id="pdf-zoom-label">100%</span><button id="pdf-zoom-in" type="button" aria-label="拡大">＋</button><button id="pdf-fit" type="button">幅に合わせる</button></div><div class="pdf-links"><a href="${source}?inline=1" target="_blank" rel="noopener">ブラウザーで開く ↗</a><a href="${source}" download>ダウンロード ↓</a></div></div><p class="pdf-status" role="status">PDFを読み込んでいます…</p><div class="pdf-page-stage"></div>`;
    const state = {
      dialog,
      name,
      page: 1,
      zoom: 1,
      sequence: 0,
      disposed: false,
    };
    active = state;
    domQuery('.icon-close', dialog).onclick = () => dialogElement(dialog).close();
    dialog.addEventListener('close', () => dispose(state), {
      once: true,
    });
    dialogElement(dialog).showModal();
    domQuery('#pdf-prev', dialog).onclick = () => {
      if (state.page > 1) {
        state.page--;
        void render(state);
      }
    };
    domQuery('#pdf-next', dialog).onclick = () => {
      if (state.page < state.document?.numPages) {
        state.page++;
        void render(state);
      }
    };
    domQuery('#pdf-page', dialog).onchange = (event) => {
      const value = Number(valueControl(event.target).value);
      if (Number.isInteger(value) && value >= 1 && value <= state.document?.numPages) {
        state.page = value;
        void render(state);
      } else {
        valueControl(event.target).value = String(state.page);
      }
    };
    domQuery('#pdf-zoom-out', dialog).onclick = () => {
      state.zoom = Math.max(0.25, state.zoom - 0.25);
      void render(state);
    };
    domQuery('#pdf-zoom-in', dialog).onclick = () => {
      state.zoom = Math.min(3, state.zoom + 0.25);
      void render(state);
    };
    domQuery('#pdf-fit', dialog).onclick = () => {
      state.zoom = 1;
      void render(state);
    };
    try {
      const pdf = await pdfLibrary();
      if (active !== state || state.disposed) {
        return;
      }
      state.loading = pdf.getDocument({
        url: source + '?inline=1',
        withCredentials: true,
        isEvalSupported: false,
        cMapUrl: '/vendor/pdfjs/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/vendor/pdfjs/standard_fonts/',
        wasmUrl: '/vendor/pdfjs/wasm/',
      });
      state.document = await state.loading.promise;
      if (active !== state || state.disposed) {
        return;
      }
      await render(state);
      let width = domQuery('.pdf-page-stage', dialog).clientWidth;
      state.observer = new ResizeObserver((entries) => {
        const next = entries[0].contentRect.width;
        if (Math.abs(next - width) < 1) {
          return;
        }
        width = next;
        clearTimeout(state.resizeTimer);
        state.resizeTimer = setTimeout(() => void render(state), 100);
      });
      state.observer.observe(domQuery('.pdf-page-stage', dialog));
    } catch (error) {
      if (active !== state || state.disposed) {
        return;
      }
      domQuery('.pdf-status', dialog).textContent =
        error.name === 'PasswordException'
          ? 'このPDFはパスワードで保護されています。「ブラウザーで開く」から確認してください。'
          : 'PDFを読み込めませんでした。「ブラウザーで開く」かダウンロードをご利用ください。';
    }
  }
  function close() {
    if (active) {
      const state = active;
      state.dialog.close();
      dispose(state);
    }
  }
  window.addEventListener('factory-session-expired', close);
  window.addEventListener('factory-mode-changed', (event) => {
    if (!(event instanceof CustomEvent && event.detail?.editor)) {
      close();
    }
  });
  return {
    open,
  };
})();
export default FactoryPDF;
