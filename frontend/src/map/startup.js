import {
  inputElement,
  valueControl,
  queryAll as domAll,
  findQuery as domFind,
  byId as $,
} from '../runtime/dom.ts';
/**
 * 敷地マップの状態、図面切り替え、工事描画、一覧・詳細の更新をまとめる入口。
 * 各機能は Factory... の公開APIで接続し、保存・権限・同時更新の判定は接続先APIに委ねます。
 */

import { getMapApp, setMapApp } from '../runtime/context.js';
import FactoryWebMCP from '../shared/webmcp.js';
import FactoryPreferences from '../shared/preferences.js';
import FactoryNotes from './notes.js';
import FactoryEquipment from './equipment.js';
import { L } from '../runtime/libraries.js';
import FactoryFeatures from './features.js';
import FactoryOrganization from './map-organization.js';
import FactoryDisplay from './map-display.js';
import FactoryAPI from '../shared/api-client.js';
export /** イベントの接続、閲覧権限の反映と地図の初期化を担当します。
 * @param {ReturnType<typeof import('./runtime.js').createMapRuntime>} runtime
 * @param {import('./actions').MapActions} actions
 */
function createStartup(runtime, actions) {
  function openDialog(id) {
    $(id).showModal();
  }
  function closeDialog(id) {
    $(id).close();
    if (id === 'work-dialog') {
      actions.clearPending();
    }
  }
  function download(name, blob) {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function setEditor(value) {
    runtime.editor = value;
    document.body.classList.toggle('read-only', !value);
    $('view-mode').setAttribute('aria-pressed', String(value));
    $('view-mode').textContent = value ? '施設担当モード' : '閲覧モード';
    $('page-heading').textContent = value ? '工事・設備マップ' : '工事のお知らせ';
    actions.clearPending();
    if (!value) {
      runtime.state.assets = [];
      runtime.state.propertyDefinitions = [];
      for (const work of runtime.state.works) {
        work.assetIds = [];
      }
      const ids = new Set([
        'site',
        ...runtime.state.works.map((w) => w.drawingId),
        ...(runtime.state.notes || []).map((n) => n.drawingId),
      ]);
      runtime.state.drawings = runtime.state.drawings.filter((d) => ids.has(d.id));
      actions.switchTab('works', false);
      $('show-assets').checked = false;
      actions.setDrawing(
        runtime.state.drawings.find((d) => d.id === 'site')?.id || runtime.state.drawings[0].id,
      );
    } else {
      actions.render();
    }
    window.dispatchEvent(
      new CustomEvent('factory-mode-changed', {
        detail: {
          editor: value,
        },
      }),
    );
    actions.toast(value ? '施設担当モードに切り替えました。' : '閲覧モードに切り替えました。');
  }
  function bindEvents() {
    domAll('[data-close]').forEach(
      (el) => (el.onclick = () => actions.closeDialog(el.dataset.close)),
    );
    domAll('dialog').forEach((dialog) =>
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          const r = dialog.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          ) {
            actions.closeDialog(dialog.id);
          }
        }
      }),
    );
    $('work-dialog').addEventListener('cancel', () => {
      actions.clearPending();
      actions.renderMapRecords();
    });
    $('work-dialog').addEventListener('close', () => {
      if (!$('work-dialog').open && (runtime.editingWorkId || runtime.pendingLayer)) {
        actions.clearPending();
        actions.renderMapRecords();
      }
    });
    $('map-nav').onclick = actions.fitMap;
    $('import-open').onclick = () => {
      $('import-message').textContent = '';
      actions.openDialog('import-dialog');
    };
    $('work-add').onclick = () => actions.startDraw();
    $('draw-cancel').onclick = actions.clearPending;
    $('work-form').onsubmit = actions.saveWork;
    $('view-mode').onclick = () => actions.setEditor(!runtime.editor);
    $('drawing-select').onchange = (e) => actions.setDrawing(valueControl(e.target).value);
    $('fit-map').onclick = actions.fitMap;
    $('search').oninput = () => {
      clearTimeout(runtime.searchTimer);
      runtime.searchTimer = setTimeout(() => {
        runtime.selectedId = null;
        actions.render();
      }, 120);
    };
    $('status-filter').onchange = () => {
      runtime.impactOnly = false;
      runtime.selectedId = null;
      domAll('[data-summary]').forEach((x) => x.classList.remove('active'));
      actions.render();
    };
    $('date-toggle').onclick = () => {
      const value = $('date-toggle').getAttribute('aria-pressed') !== 'true';
      $('date-toggle').setAttribute('aria-pressed', String(value));
      $('date-filter-wrap').hidden = !value;
      runtime.selectedId = null;
      actions.render();
    };
    $('date-filter').onchange = () => {
      runtime.selectedId = null;
      actions.render();
    };
    $('works-tab').onclick = () => actions.switchTab('works');
    $('assets-tab').onclick = () => actions.switchTab('assets');
    domAll('[data-summary]').forEach(
      (el) =>
        (el.onclick = () => {
          actions.switchTab('works', false);
          runtime.impactOnly = el.dataset.summary === 'impact';
          $('status-filter').value = ['active', 'planned'].includes(el.dataset.summary || '')
            ? el.dataset.summary || 'all'
            : 'all';
          domAll('[data-summary]').forEach((x) => x.classList.toggle('active', x === el));
          actions.render();
        }),
    );
    $('layers-toggle').onclick = () => {
      const value = $('layers-panel').hidden;
      $('layers-panel').hidden = !value;
      $('layers-toggle').setAttribute('aria-expanded', String(value));
    };
    $('show-works').onchange = actions.renderMapRecords;
    $('show-assets').onchange = actions.renderMapRecords;
    for (const k of ['works', 'assets', 'notes']) {
      $('show-' + k).addEventListener('change', () => {
        if (FactoryPreferences?.update) {
          FactoryPreferences.update({
            mapTypes: Object.fromEntries(
              ['works', 'assets', 'notes'].map((t) => [t, inputElement($('show-' + t)).checked]),
            ),
          }).catch(actions.fail);
        }
      });
    }
    $('cad-file').onchange = async (e) => {
      try {
        await actions.importDXF(inputElement(e.target).files?.[0]);
      } catch (error) {
        $('import-message').textContent = error.message;
      }
    };
    $('sample-import').onclick = async () => {
      try {
        const response = await fetch('samples/factory-layout.dxf');
        if (!response.ok) {
          throw new Error('サンプル図面を取得できませんでした。');
        }
        await actions.importDXF(
          new File([await response.text()], 'factory-layout.dxf', {
            type: 'application/dxf',
          }),
        );
      } catch (error) {
        $('import-message').textContent = error.message;
      }
    };
    for (const type of ['dragenter', 'dragover']) {
      $('upload-zone').addEventListener(type, (e) => {
        e.preventDefault();
        $('upload-zone').classList.add('drag-over');
      });
    }
    $('upload-zone').addEventListener('dragleave', () =>
      $('upload-zone').classList.remove('drag-over'),
    );
    $('upload-zone').addEventListener('drop', async (e) => {
      e.preventDefault();
      $('upload-zone').classList.remove('drag-over');
      try {
        await actions.importDXF(e.dataTransfer?.files[0]);
      } catch (error) {
        $('import-message').textContent = error.message;
      }
    });
    $('backup-export').onclick = () => {
      actions.download(
        `factory-map-${runtime.today()}.json`,
        new Blob([JSON.stringify(runtime.state, null, 2)], {
          type: 'application/json',
        }),
      );
      actions.toast('図面と登録データを書き出しました。');
    };
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $('work-dialog').open) {
        e.preventDefault();
        actions.closeDialog('work-dialog');
        actions.renderMapRecords();
      } else if (e.key === 'Escape' && runtime.drawingActive) {
        actions.clearPending();
      }
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '') &&
        !domFind('dialog[open]')
      ) {
        e.preventDefault();
        $('search').focus();
      }
    });
    runtime.map.on('pm:create', (e) => {
      if (!runtime.editor) {
        runtime.map.removeLayer(e.layer);
        return;
      }
      runtime.pendingLayer = e.layer;
      runtime.pendingPoints = e.layer.getLatLngs()[0].map((p) => [p.lng, p.lat]);
      runtime.drawingActive = false;
      $('draw-instruction').hidden = true;
      runtime.map.pm.disableDraw();
      const existing = runtime.redrawId
        ? runtime.state.works.find((x) => x.id === runtime.redrawId)
        : null;
      actions.openWorkForm(existing);
    });
  }
  async function init() {
    try {
      runtime.state = await FactoryAPI.load();
      const auth = await FactoryAPI.request('/api/auth/status');
      runtime.editor = auth.editor;
      document.body.classList.toggle('read-only', !runtime.editor);
      $('view-mode').textContent = runtime.editor ? '施設担当モード' : '閲覧モード';
      $('view-mode').setAttribute('aria-pressed', String(runtime.editor));
      $('page-heading').textContent = runtime.editor ? '工事・設備マップ' : '工事のお知らせ';
      runtime.map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -12,
        maxZoom: 8,
        zoomSnap: 0.25,
        attributionControl: true,
        preferCanvas: true,
      });
      runtime.map.createPane('workEditingPane').style.zIndex = '685';
      runtime.map.createPane('workEditVerticesPane').style.zIndex = '695';
      actions.workPanes(false);
      runtime.map.pm.setGlobalOptions({
        panes: {
          vertexPane: 'workEditVerticesPane',
          layerPane: 'workEditingPane',
          markerPane: 'workEditVerticesPane',
        },
      });
      runtime.map.attributionControl.setPrefix(
        '<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>',
      );
      runtime.baseGroup = L.layerGroup().addTo(runtime.map);
      runtime.workGroup = L.layerGroup().addTo(runtime.map);
      runtime.assetGroup = L.layerGroup().addTo(runtime.map);
      setMapApp({
        get state() {
          return runtime.state;
        },
        get map() {
          return runtime.map;
        },
        get editor() {
          return runtime.editor;
        },
        get currentDrawing() {
          return runtime.currentDrawing;
        },
        importDXF: actions.importDXF,
        changeState: actions.changeState,
        render: actions.render,
        setEditor: actions.setEditor,
        toast: actions.toast,
        fail: actions.fail,
        today: runtime.today,
        clearPending: actions.clearPending,
        async refresh() {
          runtime.state = await FactoryAPI.load();
          if (!runtime.state.drawings.some((d) => d.id === runtime.currentDrawing)) {
            runtime.currentDrawing = runtime.state.drawings[0].id;
          }
          actions.updateDrawingSelect();
          actions.render();
        },
        openRecord(kind, id) {
          if (kind === 'assets' && !runtime.editor) {
            throw new Error('施設グループのパスワードでログインしてください。');
          }
          const r = runtime.state[kind]?.find((r) => r.id === id);
          if (!r) {
            throw new Error('対象が見つかりません。');
          }
          if (r.drawingId !== runtime.currentDrawing) {
            actions.setDrawing(r.drawingId);
          }
          if (kind === 'notes') {
            $('show-notes').checked = true;
            FactoryNotes.render();
            runtime.map.panTo(runtime.ll(r.point));
            return;
          }
          actions.switchTab(kind, false);
          actions.selectRecord(id, true);
        },
        setDrawing(id) {
          if (!runtime.state.drawings.some((d) => d.id === id)) {
            throw new Error('図面が見つかりません。');
          }
          actions.setDrawing(id);
        },
      });
      FactoryDisplay.setup(getMapApp());
      actions.bindEvents();
      FactoryFeatures.setup();
      FactoryEquipment.setup();
      FactoryNotes.setup();
      FactoryOrganization.setup();
      actions.setDrawing(
        runtime.state.drawings.some((d) => d.id === 'site') ? 'site' : runtime.state.drawings[0].id,
      );
      runtime.selectedId = window.matchMedia('(max-width:950px)').matches
        ? null
        : runtime.state.works.find((w) => w.drawingId === 'site' && w.status === 'active')?.id ||
          null;
      actions.render();
      let resizeTimer;
      new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          runtime.map.invalidateSize({
            pan: false,
          });
          if (!runtime.drawingActive && !runtime.editingWorkId) {
            actions.fitMap();
          }
        }, 80);
      }).observe($('map'));
      if (FactoryWebMCP) {
        await FactoryWebMCP.register();
      }
    } catch (error) {
      $('record-list').innerHTML =
        '<div class="empty-state"><strong>初期化できませんでした</strong>サーバーとデータベースの接続を確認して再読み込みしてください。</div>';
      actions.fail(error);
    }
  }
  return {
    openDialog,
    closeDialog,
    download,
    setEditor,
    bindEvents,
    init,
  };
}
