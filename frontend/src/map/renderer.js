import { requiredElement, queryAll as domAll, byId as $ } from '../runtime/dom.ts';
/**
 * 敷地マップの状態、図面切り替え、工事描画、一覧・詳細の更新をまとめる入口。
 * 各機能は Factory... の公開APIで接続し、保存・権限・同時更新の判定は接続先APIに委ねます。
 */

import FactoryNotes from './notes.js';
import FactoryEquipment from './equipment.js';
import { L } from '../runtime/libraries.js';
import FactoryMedia from '../shared/media.js';
import FactoryFeatures from './features.js';
import FactoryOrganization from './map-organization.js';
import FactoryDisplay from './map-display.js';
export /** 工事・設備の絞り込み、一覧・詳細・地図の再描画を担当します。
 * @param {ReturnType<typeof import('./runtime.js').createMapRuntime>} runtime
 * @param {import('./actions').MapActions} actions
 */
function createRenderer(runtime, actions) {
  function workMatches(record) {
    if (
      record.drawingId !== runtime.currentDrawing ||
      !FactoryDisplay.allowWork(record) ||
      !FactoryOrganization.visible(record)
    ) {
      return false;
    }
    const query = $('search').value.trim().toLocaleLowerCase();
    if (
      query &&
      ![record.title, record.location, record.contact, record.notes, record.code]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query)
    ) {
      return false;
    }
    const status = $('status-filter').value;
    if (status !== 'all' && record.status !== status) {
      return false;
    }
    if (
      runtime.impactOnly &&
      (record.status === 'done' ||
        (!record.impacts.includes('通行止め') && !record.impacts.includes('車両通行')))
    ) {
      return false;
    }
    if ($('date-toggle').getAttribute('aria-pressed') === 'true') {
      const date = $('date-filter').value;
      if (!date || record.start > date || record.end < date) {
        return false;
      }
    }
    return true;
  }
  function records() {
    if (runtime.tab === 'works') {
      const order = {
        active: 0,
        planned: 1,
        done: 2,
      };
      return runtime.state.works
        .filter(actions.workMatches)
        .sort((a, b) => order[a.status] - order[b.status] || a.start.localeCompare(b.start));
    }
    const q = $('search').value.trim().toLocaleLowerCase();
    return runtime.state.assets.filter(
      (a) =>
        a.drawingId === runtime.currentDrawing &&
        FactoryOrganization.visible(a) &&
        (!$('asset-category').value || a.properties?.category === $('asset-category').value) &&
        (!q ||
          [
            a.name,
            a.code,
            a.location,
            ...runtime.state.propertyDefinitions.map((d) =>
              FactoryFeatures.displayValue(d, a.properties?.[d.id]),
            ),
          ]
            .join(' ')
            .toLocaleLowerCase()
            .includes(q)),
    );
  }
  function updateSummary() {
    const works = runtime.state.works.filter((x) => x.drawingId === runtime.currentDrawing);
    $('total-count').textContent = works.length;
    $('active-count').textContent = works.filter((x) => x.status === 'active').length;
    $('planned-count').textContent = works.filter((x) => x.status === 'planned').length;
    $('impact-count').textContent = works.filter(
      (x) =>
        x.status !== 'done' && (x.impacts.includes('通行止め') || x.impacts.includes('車両通行')),
    ).length;
  }
  function renderList() {
    const items = actions.records();
    $('list-count').textContent = runtime.state.works.filter(
      (x) => x.drawingId === runtime.currentDrawing,
    ).length;
    $('list-caption').textContent =
      runtime.tab === 'works' ? `${items.length}件の工事` : `${items.length}件の設備`;
    $('record-list').innerHTML = items.length
      ? items
          .map((r) =>
            runtime.tab === 'works'
              ? `<button class="record-card ${r.id === runtime.selectedId ? 'selected' : ''}" data-id="${runtime.escapeHTML(r.id)}" aria-pressed="${r.id === runtime.selectedId}"><div class="record-top"><span class="status status-${r.status}">${runtime.statusNames[r.status]}</span><span class="record-number">${runtime.escapeHTML(r.code)}</span></div><h2>${runtime.escapeHTML(r.title)}</h2><p>場所 ${runtime.escapeHTML(r.location || '場所未入力')}</p><p>◷ ${runtime.fmt(r.start)} — ${runtime.fmt(r.end)}</p><div>${r.impacts.map((x) => `<span class="impact-tag ${x === '騒音' ? 'quiet' : ''}">${runtime.escapeHTML(x)}</span>`).join('')}</div></button>`
              : `<button class="record-card ${r.id === runtime.selectedId ? 'selected' : ''}" data-id="${runtime.escapeHTML(r.id)}"><div class="record-top"><span class="status status-planned">設備</span><span class="record-number">${runtime.escapeHTML(r.code)}</span></div><h2>${runtime.escapeHTML(r.name)}</h2><p>場所 ${runtime.escapeHTML(r.location)}</p><p>最終点検 ${runtime.escapeHTML(r.history[0]?.date || '未登録')}</p></button>`,
          )
          .join('')
      : `<div class="empty-state"><strong>${runtime.tab === 'works' ? '該当する工事がありません' : '設備がありません'}</strong>${runtime.tab === 'works' ? '条件を変更するか、この図面に工事を登録してください。' : 'この図面の設備台帳はまだ登録されていません。'}</div>`;
    domAll('[data-id]', $('record-list')).forEach((el) =>
      el.addEventListener('click', () => actions.selectRecord(el.dataset.id, true)),
    );
  }
  function renderDetail() {
    const record = actions.getRecord();
    const pane = $('detail-pane');
    if (!record) {
      pane.classList.add('collapsed');
      pane.innerHTML =
        '<div class="detail-titlebar">詳細情報</div><div class="detail-placeholder"><span>⌖</span>図面上の範囲やマーク、<br>一覧の項目を選んでください。</div>';
      return;
    }
    if (pane.dataset.recordId !== record.id) {
      pane.scrollTop = 0;
      pane.dataset.recordId = record.id;
    }
    pane.classList.remove('collapsed');
    const titlebar = `<div class="detail-titlebar">${runtime.tab === 'works' ? '工事の詳細' : '設備の詳細'}<button id="detail-close" aria-label="詳細を閉じる">×</button></div>`;
    if (runtime.tab === 'works') {
      pane.innerHTML =
        titlebar +
        `<div><span class="status status-${record.status}">${runtime.statusNames[record.status]}</span></div><h2>${runtime.escapeHTML(record.title)}</h2><p class="detail-location">場所 ${runtime.escapeHTML(record.location || '場所未入力')}</p><div class="detail-period"><small>◷ 工事期間</small><strong>${runtime.fmt(record.start)}<br>— ${runtime.fmt(record.end)}</strong></div><h3>周囲への影響</h3><div class="detail-impact">${record.impacts.length ? record.impacts.map((x) => `<span class="impact-tag">${runtime.escapeHTML(x)}</span>`).join('') : '<span class="detail-description">登録なし</span>'}</div>${record.impacts.includes('通行止め') ? '<div class="notice-box">⚑ 通行止めの範囲をご確認ください。<br>迂回については工事内容をご覧ください。</div>' : ''}<h3>工事内容・注意事項</h3><p class="detail-description">${runtime.escapeHTML(record.notes || '詳細は担当者へお問い合わせください。')}</p><h3>担当・お問い合わせ</h3><div class="detail-contact">${runtime.escapeHTML(record.contact || '未登録')}<br><b>${record.phone ? '内線 ' + runtime.escapeHTML(record.phone) : ''}</b></div>${FactoryMedia.gallery(record)}<h3>関連資料</h3>${actions.attachmentsHTML(
          {
            attachments: (record.attachments || []).filter((file) => !FactoryMedia.isPhoto(file)),
          },
        )}<div class="detail-actions editor-only"><button class="button secondary" id="work-edit">情報を編集</button><button class="button secondary" id="geometry-edit">範囲を描き直す</button></div><div class="detail-meta">${runtime.escapeHTML(record.code)}<br>更新 ${runtime.escapeHTML(
          new Date(record.updatedAt).toLocaleString('ja-JP', {
            timeZone: 'Asia/Tokyo',
          }),
        )} JST</div>`;
      pane.insertAdjacentHTML('beforeend', FactoryFeatures.workRelations(record));
      FactoryFeatures.bindWork(record);
      if (runtime.editor) {
        $('work-edit').onclick = () => actions.openWorkForm(record);
        $('geometry-edit').onclick = () => actions.startDraw(record.id);
      }
    } else {
      pane.innerHTML = titlebar + FactoryFeatures.assetHTML(record);
      FactoryFeatures.bindAsset(record);
    }
    $('detail-close').onclick = () => {
      runtime.selectedId = null;
      actions.render();
    };
  }
  function renderMapRecords() {
    runtime.workGroup.clearLayers();
    runtime.assetGroup.clearLayers();
    FactoryDisplay.clear();
    const visibleWorks =
      runtime.tab === 'works'
        ? actions.records()
        : runtime.state.works.filter(
            (x) =>
              x.drawingId === runtime.currentDrawing &&
              FactoryDisplay.allowWork(x) &&
              FactoryOrganization.visible(x),
          );
    for (const work of visibleWorks) {
      if (work.id === runtime.editingWorkId) {
        continue;
      }
      const selected = work.id === runtime.selectedId && runtime.tab === 'works';
      const polygon = L.polygon(work.points.map(runtime.ll), {
        ...FactoryDisplay.workStyle(work, selected),
        workId: work.id,
        pmIgnore: true,
      });
      FactoryDisplay.bindWork(polygon, work);
      polygon.on('click', () => {
        if (runtime.drawingActive) {
          return;
        }
        actions.switchTab('works', false);
        actions.selectRecord(work.id, false);
      });
      runtime.workGroup.addLayer(polygon);
      if (selected) {
        polygon.bringToFront();
      }
    }
    const visibleAssets = runtime.editor
      ? runtime.tab === 'assets'
        ? actions.records()
        : runtime.state.assets.filter(
            (x) => x.drawingId === runtime.currentDrawing && FactoryOrganization.visible(x),
          )
      : [];
    for (const asset of visibleAssets) {
      const marker = L.marker(runtime.ll(asset.point), {
        draggable:
          runtime.editor && !asset.locks?.position && FactoryDisplay.settings().equipmentDrag,
        autoPan: true,
        title: asset.name + (asset.locks?.position ? '：位置はロック中' : '：ドラッグで位置を変更'),
        icon: L.divIcon({
          className: 'asset-marker ' + (asset.locks?.position ? 'position-locked' : ''),
          html: FactoryEquipment.markerHTML(asset),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
        pmIgnore: true,
      });
      marker.on('add', () => {
        requiredElement(marker.getElement()).dataset.assetId = asset.id;
        requiredElement(marker.getElement()).setAttribute(
          'aria-label',
          asset.name + '：ドラッグで移動',
        );
      });
      FactoryDisplay.bindAsset(marker, asset);
      marker.on('click', () => {
        if (runtime.drawingActive) {
          return;
        }
        actions.switchTab('assets', false);
        actions.selectRecord(asset.id, false);
      });
      marker.on('dragend', async () => {
        const point = marker.getLatLng();
        try {
          await actions.changeState(() => {
            if (!runtime.editor) {
              throw new Error('施設グループのパスワードでログインしてください。');
            }
            const current = runtime.state.assets.find((item) => item.id === asset.id);
            if (!current) {
              throw new Error('設備が見つかりません。最新の情報を読み込んでください。');
            }
            if (current.locks?.position) {
              throw new Error('位置のロックを解除してから移動してください。');
            }
            current.point = [Number(point.lng.toFixed(6)), Number(point.lat.toFixed(6))];
            current.updatedAt = new Date().toISOString();
          });
          actions.render();
          actions.toast('設備の位置を保存しました。');
        } catch (error) {
          actions.render();
          actions.fail(error);
        }
      });
      runtime.assetGroup.addLayer(marker);
    }
    if ($('show-works').checked) {
      if (!runtime.map.hasLayer(runtime.workGroup)) {
        runtime.workGroup.addTo(runtime.map);
      }
    } else {
      runtime.map.removeLayer(runtime.workGroup);
    }
    if (runtime.editor && $('show-assets').checked) {
      if (!runtime.map.hasLayer(runtime.assetGroup)) {
        runtime.assetGroup.addTo(runtime.map);
      }
    } else {
      runtime.map.removeLayer(runtime.assetGroup);
    }
  }
  function render() {
    FactoryEquipment.refresh();
    FactoryFeatures.filters();
    actions.updateSummary();
    actions.renderList();
    actions.renderDetail();
    actions.renderMapRecords();
    FactoryNotes.render();
    FactoryOrganization.refreshPanel();
    FactoryOrganization.renderLinks();
    $('asset-category').hidden = runtime.tab !== 'assets';
  }
  function selectRecord(id, zoom) {
    runtime.selectedId = id;
    actions.render();
    const record = actions.getRecord();
    if (zoom && record) {
      if (runtime.tab === 'works') {
        runtime.map.fitBounds(L.latLngBounds(record.points.map(runtime.ll)).pad(1.8), {
          maxZoom: 2,
          animate: true,
        });
      } else {
        runtime.map.panTo(runtime.ll(record.point));
      }
    }
  }
  function switchTab(next, doRender = true) {
    if (next === 'assets' && !runtime.editor) {
      next = 'works';
    }
    runtime.tab = next;
    $('show-assets').checked = next === 'assets';
    runtime.selectedId = null;
    $('works-tab').classList.toggle('selected', next === 'works');
    $('assets-tab').classList.toggle('selected', next === 'assets');
    $('works-tab').setAttribute('aria-selected', String(next === 'works'));
    $('assets-tab').setAttribute('aria-selected', String(next === 'assets'));
    $('search').placeholder = next === 'works' ? '工事名・場所で検索' : '設備名・設備IDで検索';
    $('search').setAttribute('aria-label', $('search').placeholder);
    $('status-filter').disabled = next !== 'works';
    $('date-toggle').disabled = next !== 'works';
    if (doRender) {
      actions.render();
    }
  }
  return {
    workMatches,
    records,
    updateSummary,
    renderList,
    renderDetail,
    renderMapRecords,
    render,
    selectRecord,
    switchTab,
  };
}
