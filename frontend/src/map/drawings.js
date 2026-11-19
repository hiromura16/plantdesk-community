import { inputElement, queryAll as domAll, byId as $ } from '../runtime/dom.ts';
/**
 * 敷地マップの状態、図面切り替え、工事描画、一覧・詳細の更新をまとめる入口。
 * 各機能は Factory... の公開APIで接続し、保存・権限・同時更新の判定は接続先APIに委ねます。
 */

import FactoryCAD from './cad.js';
import { L } from '../runtime/libraries.js';
import FactoryOrganization from './map-organization.js';
import FactoryDisplay from './map-display.js';
export /** 図面の選択と表示範囲、CADの取り込み・描画を担当します。
 * @param {ReturnType<typeof import('./runtime.js').createMapRuntime>} runtime
 * @param {import('./actions').MapActions} actions
 */
function createDrawings(runtime, actions) {
  function fitMap() {
    const compact = window.matchMedia('(max-width:680px)').matches;
    if (actions.current()) {
      runtime.map.fitBounds(actions.current().bounds, {
        padding: compact ? [15, 45] : [45, 65],
        animate: false,
      });
    }
  }
  function setDrawing(id) {
    actions.clearPending();
    runtime.currentDrawing = id;
    runtime.selectedId = null;
    runtime.baseGroup.clearLayers();
    Object.keys(runtime.cadGroups).forEach((x) => delete runtime.cadGroups[x]);
    $('drawing-select').value = id;
    const drawing = actions.current();
    FactoryDisplay.setDrawing(drawing);
    if (drawing.type === 'sample') {
      L.imageOverlay(drawing.asset, drawing.bounds, {
        interactive: false,
        pmIgnore: true,
        pane: 'baseDrawingPane',
      }).addTo(runtime.baseGroup);
      $('cad-layers').innerHTML = '';
      $('map-source').textContent =
        id === 'site' ? 'サンプル配置図 · 約2km × 1km' : 'A棟1F · サンプル平面図';
    } else {
      for (const layer of drawing.cad.layers) {
        runtime.cadGroups[layer] = L.layerGroup().addTo(runtime.baseGroup);
      }
      for (const feature of drawing.cad.features) {
        const points = feature.points.map(runtime.ll);
        let layer;
        if (feature.kind === 'text') {
          layer = L.marker(points[0], {
            icon: L.divIcon({
              className: 'cad-text',
              html: runtime.escapeHTML(feature.text),
              iconSize: undefined,
            }),
            interactive: false,
            pmIgnore: true,
            pane: 'baseDrawingPane',
          });
        } else if (feature.kind === 'point') {
          layer = L.circleMarker(points[0], {
            radius: 2,
            color: '#7c9270',
            weight: 1,
            pmIgnore: true,
            pane: 'baseDrawingPane',
          });
        } else if (feature.kind === 'polygon') {
          layer = L.polygon(points, {
            color: '#9aad8b',
            fillColor: '#dce6d1',
            fillOpacity: 0.2,
            weight: 1.2,
            interactive: false,
            pmIgnore: true,
            pane: 'baseDrawingPane',
          });
        } else {
          layer = L.polyline(points, {
            color: '#9aad8b',
            weight: 1.15,
            interactive: false,
            pmIgnore: true,
            pane: 'baseDrawingPane',
          });
        }
        layer.addTo(runtime.cadGroups[feature.layer]);
      }
      $('cad-layers').innerHTML =
        '<h4>CADレイヤー</h4>' +
        drawing.cad.layers
          .map(
            (name, i) =>
              `<label class="cad-layer"><input type="checkbox" checked data-layer-index="${i}">${runtime.escapeHTML(name)}</label>`,
          )
          .join('');
      domAll('[data-layer-index]', $('cad-layers')).forEach(
        (el) =>
          (el.onchange = () => {
            const group = runtime.cadGroups[drawing.cad.layers[Number(el.dataset.layerIndex)]];
            if (inputElement(el).checked) {
              runtime.baseGroup.addLayer(group);
            } else {
              runtime.baseGroup.removeLayer(group);
            }
          }),
      );
      $('map-source').textContent =
        `DXF · ${drawing.cad.features.length.toLocaleString()}要素 · ${drawing.cad.layers.length}レイヤー${drawing.cad.metres ? ' · m換算' : ' · 単位指定なし'}`;
    }
    if (runtime.scaleControl) {
      runtime.scaleControl.remove();
      runtime.scaleControl = null;
    }
    if (drawing.metres) {
      runtime.scaleControl = L.control
        .scale({
          position: 'bottomleft',
          imperial: false,
          maxWidth: 90,
        })
        .addTo(runtime.map);
    }
    actions.updateDrawingSelect();
    FactoryOrganization.drawingChanged();
    actions.render();
    actions.fitMap();
  }
  function updateDrawingSelect() {
    $('drawing-select').innerHTML = runtime.state.drawings
      .map(
        (d) => `<option value="${runtime.escapeHTML(d.id)}">${runtime.escapeHTML(d.name)}</option>`,
      )
      .join('');
    $('drawing-select').value = runtime.currentDrawing;
  }
  async function importDXF(file) {
    if (!file) {
      return;
    }
    if (!/\.dxf$/i.test(file.name)) {
      throw new Error(
        'この試作ではDXF形式に対応しています。DWGはDXFに変換して読み込んでください。',
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('DXFは10MBまでです。図面を分割してください。');
    }
    $('import-message').textContent = '図面を解析しています…';
    $('sample-import').disabled = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 40));
      const raw = await file.text();
      const cad = FactoryCAD.parse(raw);
      const drawing = {
        id: runtime.uid(),
        name: file.name.replace(/\.dxf$/i, ''),
        type: 'dxf',
        bounds: cad.bounds,
        metres: cad.metres,
        cad,
        rawSource: raw,
        filename: file.name,
      };
      await actions.changeState(() => runtime.state.drawings.push(drawing));
      $('import-dialog').close();
      $('import-message').textContent = '';
      actions.setDrawing(drawing.id);
      actions.switchTab('works');
      $('search').value = '';
      const skipped = Object.entries(cad.skipped)
        .map(([type, count]) => `${type}: ${count}件`)
        .join('、');
      actions.toast(
        `${cad.features.length}要素を読み込みました。${skipped ? '未対応・省略：' + skipped : 'この図面に工事を登録できます。'}`,
        !!skipped,
      );
    } finally {
      $('sample-import').disabled = false;
      $('cad-file').value = '';
    }
  }
  return {
    fitMap,
    setDrawing,
    updateDrawingSelect,
    importDXF,
  };
}
