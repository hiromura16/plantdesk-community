import {
  inputElement,
  valueControl,
  disableControl,
  queryAll as domAll,
  query as domQuery,
  byId as $,
} from '../runtime/dom.ts';
/**
 * 敷地マップの状態、図面切り替え、工事描画、一覧・詳細の更新をまとめる入口。
 * 各機能は Factory... の公開APIで接続し、保存・権限・同時更新の判定は接続先APIに委ねます。
 */

import FactoryNotes from './notes.js';
import { L } from '../runtime/libraries.js';
import FactoryFeatures from './features.js';
import FactoryOrganization from './map-organization.js';
export /** 工事範囲の作図・サイズ変更・フォーム・保存を担当します。
 * @param {ReturnType<typeof import('./runtime.js').createMapRuntime>} runtime
 * @param {import('./actions').MapActions} actions
 */
function createWorkEditor(runtime, actions) {
  function workPanes(active) {
    for (const name of ['workEditingPane', 'workEditVerticesPane']) {
      const pane = runtime.map?.getPane(name);
      if (pane) {
        pane.hidden = !active;
      }
    }
  }
  function clearPending() {
    const wasEditing = runtime.editingWorkId !== null;
    runtime.editingWorkId = null;
    document.body.classList.remove('work-form-open');
    $('drawing-select').disabled = false;
    if ($('work-dialog').open) {
      $('work-dialog').close();
    }
    $('work-dialog').classList.remove('work-edit-panel');
    FactoryFeatures?.cancelPlacement();
    FactoryNotes?.cancel();
    FactoryOrganization?.cancel();
    if (runtime.map?.pm) {
      runtime.map.pm.disableDraw();
    }
    if (runtime.pendingLayer) {
      const layer = runtime.pendingLayer;
      runtime.pendingLayer = null;
      layer.pm?.disable();
      runtime.map.removeLayer(layer);
    }
    runtime.pendingPoints = null;
    runtime.drawingActive = false;
    actions.workPanes(false);
    runtime.map?._container.classList.remove('drawing-now');
    $('draw-instruction').hidden = true;
    if (wasEditing && runtime.map && runtime.state) {
      actions.renderMapRecords();
    }
  }
  function startDraw(existingId = null) {
    if (!runtime.editor) {
      return;
    }
    actions.clearPending();
    runtime.redrawId = existingId;
    runtime.drawingActive = true;
    actions.workPanes(true);
    $('draw-instruction').hidden = false;
    $('layers-panel').hidden = true;
    $('layers-toggle').setAttribute('aria-expanded', 'false');
    runtime.map.pm.enableDraw('Polygon', {
      allowSelfIntersection: false,
      snappable: true,
      templineStyle: {
        color: '#238873',
      },
      hintlineStyle: {
        color: '#238873',
        dashArray: '5 5',
      },
      pathOptions: {
        color: '#238873',
        fillOpacity: 0.14,
      },
    });
  }
  /** @param {import('../../../shared/model').Work|null} record */
  function openWorkForm(record = null) {
    if ($('work-dialog').open) {
      actions.closeDialog('work-dialog');
    }
    $('work-form').reset();
    $('form-error').textContent = '';
    $('work-id').value = record?.id || '';
    $('form-title').textContent = record ? '工事情報を編集' : '工事を登録';
    $('field-title').value = record?.title || '';
    $('field-location').value = record?.location || '';
    $('field-start').value = record?.start || runtime.today();
    $('field-end').value = record?.end || runtime.today();
    $('field-status').value = record?.status || 'planned';
    $('field-notes').value = record?.notes || '';
    $('field-contact').value = record?.contact || '施設グループ';
    $('field-phone').value = record?.phone || '';
    domAll('[name=impact]').forEach(
      (el) =>
        (inputElement(el).checked = record?.impacts?.includes(valueControl(el).value) || false),
    );
    $('geometry-message').textContent = runtime.pendingPoints
      ? '地図上に指定した範囲を、この工事に保存します。'
      : '登録済みの工事範囲を保持して、情報を更新します。';
    FactoryFeatures.workPrepare(record);
    const points = runtime.pendingPoints || record?.points;
    if (points) {
      actions.workPanes(true);
      runtime.editingWorkId = record?.id || '__new__';
      runtime.pendingPoints = structuredClone(points);
      if (!runtime.pendingLayer) {
        runtime.pendingLayer = L.polygon(points.map(runtime.ll), {
          pane: 'workEditingPane',
          color: '#238873',
          weight: 3,
          fillOpacity: 0.18,
          pmIgnore: false,
        }).addTo(runtime.map);
      }
      const capture = () => {
        if (runtime.pendingLayer) {
          runtime.pendingPoints = runtime.pendingLayer
            .getLatLngs()[0]
            .map((point) => [point.lng, point.lat]);
        }
      };
      runtime.pendingLayer.on('pm:edit pm:change pm:update', capture);
      runtime.pendingLayer.pm.enable({
        allowSelfIntersection: false,
        snappable: true,
        allowRemoval: false,
      });
      $('geometry-message').textContent =
        '地図上の頂点をドラッグして範囲を変更できます。工事情報と範囲は「保存する」でまとめて確定します。';
      $('work-dialog').classList.add('work-edit-panel');
      document.body.classList.add('work-form-open');
      $('drawing-select').disabled = true;
      actions.renderMapRecords();
      $('work-dialog').show();
    } else {
      actions.openDialog('work-dialog');
    }
  }
  async function saveWork(event) {
    event.preventDefault();
    if (!runtime.editor) {
      return;
    }
    const start = $('field-start').value;
    const end = $('field-end').value;
    const title = $('field-title').value.trim();
    if (!title) {
      $('form-error').textContent = '工事名を入力してください。';
      return;
    }
    if (end < start) {
      $('form-error').textContent = '終了日は開始日以降にしてください。';
      return;
    }
    const existing = runtime.state.works.find((w) => w.id === $('work-id').value);
    if (runtime.pendingLayer) {
      runtime.pendingPoints = runtime.pendingLayer
        .getLatLngs()[0]
        .map((point) => [point.lng, point.lat]);
    }
    if (!runtime.pendingPoints && !existing) {
      $('form-error').textContent = '地図上で工事範囲を指定してください。';
      return;
    }
    const submit = domQuery('[type=submit]', $('work-form'));
    disableControl(submit).disabled = true;
    try {
      const media = await FactoryFeatures.workFiles();
      const attachments = media.attachments;
      const record = {
        id: existing?.id || runtime.uid(),
        code: existing?.code || `WK-${String(runtime.state.works.length + 1).padStart(3, '0')}`,
        drawingId: runtime.currentDrawing,
        title,
        location: $('field-location').value.trim(),
        start,
        end,
        status: $('field-status').value,
        notes: $('field-notes').value.trim(),
        contact: $('field-contact').value.trim(),
        phone: $('field-phone').value.trim(),
        impacts: [...domAll('[name=impact]:checked')].map((x) => valueControl(x).value),
        points: runtime.pendingPoints || existing.points,
        updatedAt: new Date().toISOString(),
        attachments,
        coverPhotoId: media.coverPhotoId,
        layerId: valueControl($('work-layer')).value || undefined,
        assetIds: FactoryFeatures.workAssetIds(),
      };
      await actions.changeState(() => {
        if (existing) {
          runtime.state.works[runtime.state.works.findIndex((w) => w.id === existing.id)] = record;
        } else {
          runtime.state.works.push(record);
        }
      });
      $('work-dialog').close();
      actions.clearPending();
      actions.switchTab('works', false);
      $('status-filter').value = 'all';
      $('search').value = '';
      $('date-toggle').setAttribute('aria-pressed', 'false');
      $('date-filter-wrap').hidden = true;
      runtime.impactOnly = false;
      domAll('[data-summary]').forEach((x) =>
        x.classList.toggle('active', x.dataset.summary === 'all'),
      );
      runtime.selectedId = record.id;
      actions.render();
      actions.toast(existing ? '工事情報を更新しました。' : '工事を登録しました。');
    } catch (error) {
      $('form-error').textContent =
        `保存できませんでした。${error.message || 'サーバーとの接続を確認してください。'}`;
    } finally {
      disableControl(submit).disabled = false;
    }
  }
  return {
    workPanes,
    clearPending,
    startDraw,
    openWorkForm,
    saveWork,
  };
}
