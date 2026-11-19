import {
  valueControl,
  htmlElement,
  inputElement,
  query as domQuery,
  findQuery as domFind,
  queryAll as domAll,
  byId as $,
  findById,
} from '../runtime/dom.ts';
/**
 * 複数レイヤーを重複して含められるレイヤーセットと、保存した表示状態の操作。
 * 表示条件の合成と公開範囲は別です。非公開データの除外はAPI側が担当します。
 */
import { getMapApp } from '../runtime/context.js';
import FactoryAPI from '../shared/api-client.js';
import FactoryPreferences from '../shared/preferences.js';
const FactoryLayerSets = (() => {
  const app = () => getMapApp();
  const esc = (s) =>
    String(s ?? '').replace(
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
  const selected = new Set();
  let operations = Promise.resolve();
  const sets = () => app().state.layerSets || [];
  const layers = () => app().state.layers || [];
  const prefs = () => FactoryPreferences.getPreferences?.() || FactoryAPI.session?.preferences;
  function modal(title, body) {
    let el = findById('layer-set-dialog');
    if (!el) {
      el = document.createElement('dialog');
      el.id = 'layer-set-dialog';
      el.className = 'form-dialog organization-dialog';
      document.body.append(el);
    }
    el.innerHTML = `<div class="dialog-heading"><h2>${esc(title)}</h2><button type="button" class="icon-close" aria-label="セット編集を閉じる">×</button></div>${body}<p class="form-error" role="alert"></p>`;
    domQuery('.icon-close', el).onclick = () => el.close();
    el.showModal();
    return el;
  }
  function apply(ids, operation = 'saved') {
    const task = async () => {
      await FactoryPreferences.flush();
      const r = await FactoryAPI.request('/api/layer-sets/apply', {
        method: 'POST',
        body: {
          ids,
          operation,
        },
      });
      await FactoryPreferences.update(r.preferences);
      app().render();
      app().toast('レイヤーの表示を切り替えました。');
      return r;
    };
    operations = operations.catch(() => {}).then(task);
    return operations;
  }
  async function action(fn) {
    try {
      await fn();
    } catch (e) {
      app().fail(e);
    }
  }
  function render() {
    let root = findById('layer-sets-panel');
    if (!root) {
      root = document.createElement('section');
      root.id = 'layer-sets-panel';
      $('custom-map-layers').before(root);
    }
    const hidden = new Set(prefs()?.hiddenLayerIds || []);
    for (const id of selected) {
      if (!sets().some((s) => s.id === id)) {
        selected.delete(id);
      }
    }
    root.innerHTML =
      `<div class="layer-set-heading"><h4>レイヤーセット</h4>${app().editor ? '<button type="button" data-new-set>＋ 作成</button>' : ''}</div><p class="layer-empty">同じレイヤーを複数のセットに登録できます。</p>` +
      sets()
        .map((s) => {
          const n = s.rules.filter((r) => !hidden.has(r.layerId)).length;
          return `<article class="layer-set-card"><div><input type="checkbox" data-select-set="${esc(s.id)}" aria-label="${esc(s.name)}を組み合わせる" ${selected.has(s.id) ? 'checked' : ''}><b style="border-color:${esc(s.color)}">${esc(s.name)}</b><small>${n}/${s.rules.length}表示</small></div><div class="layer-set-actions"><button data-set="${esc(s.id)}" data-action="saved" title="保存した表示・非表示の組み合わせを復元">切替</button><button data-set="${esc(s.id)}" data-action="show">表示</button><button data-set="${esc(s.id)}" data-action="hide">非表示</button><button data-set="${esc(s.id)}" data-action="isolate">このセットだけ</button>${app().editor ? `<button data-edit-set="${esc(s.id)}">編集</button>` : ''}</div></article>`;
        })
        .join('') +
      (!sets().length
        ? '<p class="layer-empty">空調巡回・工事周知など、目的別にまとめられます。</p>'
        : '') +
      (selected.size
        ? `<div class="layer-set-combine"><small>${selected.size}セットを組み合わせる</small><button data-combine="show">すべて表示</button><button data-combine="hide">まとめて非表示</button><button data-combine="isolate">和集合だけ表示</button><button data-combine="intersection">共通部分だけ表示</button></div>`
        : '');
    domFind('[data-new-set]', root)?.addEventListener('click', () => edit());
    domAll('[data-edit-set]', root).forEach(
      (b) => (b.onclick = () => edit(sets().find((s) => s.id === b.dataset.editSet))),
    );
    domAll('[data-select-set]', root).forEach(
      (c) =>
        (c.onchange = () => {
          if (inputElement(c).checked) {
            selected.add(c.dataset.selectSet);
          } else {
            selected.delete(c.dataset.selectSet);
          }
          render();
        }),
    );
    domAll('[data-action]', root).forEach(
      (b) => (b.onclick = () => action(() => apply([b.dataset.set], b.dataset.action))),
    );
    domAll('[data-combine]', root).forEach(
      (b) => (b.onclick = () => action(() => apply([...selected], b.dataset.combine))),
    );
  }
  /** @param {import('../../../shared/model').Schemas['LayerSetRecord']|null} existing */
  function edit(existing = null) {
    if (!app().editor) {
      return;
    }
    const rules = new Map(
      (
        existing?.rules ||
        layers().map((l) => ({
          layerId: l.id,
          visible: !prefs().hiddenLayerIds.includes(l.id),
        }))
      ).map((r) => [r.layerId, r.visible]),
    );
    const el = modal(
      existing ? 'レイヤーセットを編集' : 'レイヤーセットを作成',
      `<form id="layer-set-form"><div class="form-columns"><label>セット名<input name="name" required maxlength="80" value="${esc(existing?.name || '')}" placeholder="例：空調巡回"></label><label>セットの色<input name="color" type="color" value="${esc(existing?.color || '#167566')}"></label></div><label>説明<textarea name="description" maxlength="500">${esc(existing?.description || '')}</textarea></label><label>切替時の動き<select name="mode"><option value="merge">このセットのレイヤーだけ変更</option><option value="replace" ${existing?.mode === 'replace' ? 'selected' : ''}>このセット以外の追加レイヤーを非表示</option></select></label><label class="checkbox-property"><input name="public" type="checkbox" ${existing?.audience === 'public' ? 'checked' : ''}>閲覧モードにもこのセットを表示</label><p class="form-context">施設担当専用レイヤーは、公開セットに含めても閲覧モードには公開されません。「表示」「非表示」は全メンバーに適用し、「切替」は保存したルールを復元します。複数セットに重なるレイヤーは最後の操作が反映されます。標準（未分類）とCAD背景はセット操作の対象外です。</p><label>メンバーを検索<input type="search" id="layer-set-search" placeholder="レイヤー名で検索"></label><div class="layer-set-edit-actions"><button type="button" data-members="show">全部を表示に</button><button type="button" data-members="none">全部を対象外に</button><button type="button" data-members="capture">現在の表示状態を取り込む</button></div><div class="layer-set-members">${
        layers()
          .map(
            (l) =>
              `<label data-member-name="${esc(l.name)}"><span>${esc(l.name)}<small>${l.audience === 'public' ? '公開レイヤー' : '施設担当のみ'}</small></span><select data-member="${esc(l.id)}" aria-label="${esc(l.name)}のセット内設定"><option value="none" ${!rules.has(l.id) ? 'selected' : ''}>対象外</option><option value="show" ${rules.get(l.id) === true ? 'selected' : ''}>表示</option><option value="hide" ${rules.get(l.id) === false ? 'selected' : ''}>非表示</option></select></label>`,
          )
          .join('') || '<p>先にレイヤーを追加してください。</p>'
      }</div><div class="dialog-actions"><button class="button primary" type="submit">セットを保存</button>${existing ? '<button type="button" data-duplicate>複製</button><button type="button" data-delete>削除</button>' : ''}</div></form>`,
    );
    domQuery('#layer-set-search', el).oninput = (e) =>
      domAll('[data-member-name]', el).forEach(
        (r) =>
          (htmlElement(r).hidden = !(r.dataset.memberName || '')
            .toLocaleLowerCase()
            .includes(valueControl(e.target).value.toLocaleLowerCase())),
      );
    domAll('[data-members]', el).forEach(
      (b) =>
        (b.onclick = () =>
          domAll('[data-member]', el).forEach((c) => {
            valueControl(c).value =
              b.dataset.members === 'none'
                ? 'none'
                : b.dataset.members === 'show'
                  ? 'show'
                  : prefs().hiddenLayerIds.includes(c.dataset.member)
                    ? 'hide'
                    : 'show';
          })),
    );
    const save = async (duplicate) => {
      const f = new FormData(domQuery('form', el));
      const record = {
        id: duplicate || !existing ? crypto.randomUUID() : existing.id,
        name: String(f.get('name')).trim() + (duplicate ? ' のコピー' : ''),
        description: String(f.get('description')),
        color: f.get('color'),
        audience: f.has('public') ? 'public' : 'facility',
        mode: f.get('mode'),
        rules: [...domAll('[data-member]', el)]
          .filter((c) => valueControl(c).value !== 'none')
          .map((c) => ({
            layerId: c.dataset.member,
            visible: valueControl(c).value === 'show',
          })),
      };
      await app().changeState(() => {
        app().state.layerSets ??= [];
        const i = app().state.layerSets.findIndex((s) => s.id === record.id);
        if (i < 0) {
          app().state.layerSets.push(record);
        } else {
          app().state.layerSets[i] = record;
        }
      });
      el.close();
      render();
    };
    const run = async (fn) => {
      try {
        await fn();
      } catch (e) {
        domQuery('.form-error', el).textContent = e.message;
      }
    };
    domQuery('form', el).onsubmit = (e) => {
      e.preventDefault();
      run(() => save(false));
    };
    domFind('[data-duplicate]', el)?.addEventListener('click', () => run(() => save(true)));
    domFind('[data-delete]', el)?.addEventListener('click', () =>
      run(async () => {
        if (!confirm('このレイヤーセットを削除しますか？レイヤーと設備は残ります。')) {
          return;
        }
        await app().changeState(() => {
          app().state.layerSets = sets().filter((s) => s.id !== existing?.id);
        });
        el.close();
        render();
      }),
    );
  }
  return {
    render,
    edit,
    apply,
  };
})();
export default FactoryLayerSets;
