import {
  htmlElement,
  inputElement,
  query as domQuery,
  findById as domFindById,
  queryAll as domAll,
  query as $,
} from '../runtime/dom.ts';
/**
 * マップの表示設定、追加アイコン、パネル状態と設定ダイアログ。
 * ローカルの表示キャッシュとAPIに保存する個人設定を扱い、プラン制限はAPIでも検証します。
 */
import { getMapApp, registerPreferences } from '../runtime/context.js';
import FactoryDisplay from '../map/map-display.js';
import FactoryAPI from './api-client.js';
import FactoryAppearance from '../../../shared/appearance.js';
import { normalize, validImage, PLANS } from './preferences-model.js';
const FactoryPreferences = (() => {
  const KEY = 'factory-map.preferences.v1';
  const appearance = FactoryAppearance;
  const api = {
    normalize,
    validImage,
    PLANS,
  };
  if (typeof document === 'undefined') {
    return api;
  }
  let prefs = normalize();
  let dialog;
  try {
    prefs = normalize(JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch {}
  const el = (tag, text, cls) => {
    const n = document.createElement(tag);
    if (text !== undefined) {
      n.textContent = text;
    }
    if (cls) {
      n.className = cls;
    }
    return n;
  };
  const toast = (message) => getMapApp()?.toast(message);
  let saveChain = Promise.resolve();
  let server = false;
  function persist() {
    if (server) {
      const { plan: _plan, ...value } = structuredClone(prefs);
      saveChain = saveChain
        .catch(() => {})
        .then(async () => {
          try {
            await FactoryAPI.request('/api/preferences', {
              method: 'PUT',
              body: value,
            });
            document.dispatchEvent(new CustomEvent('factory-preferences-saved'));
          } catch (error) {
            toast(error.message);
            const current = await FactoryAPI.request('/api/preferences');
            prefs = normalize({
              ...current.preferences,
              plan: FactoryAPI.session?.plan,
            });
            apply();
            getMapApp()?.render();
            throw error;
          }
        });
      saveChain.catch(() => {});
      return saveChain;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
      return Promise.resolve();
    } catch {
      toast('ブラウザーに保存できません。');
      return Promise.reject(new Error('保存できません。'));
    }
  }
  function apply() {
    const dark =
      prefs.theme === 'dark' ||
      (prefs.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.dataset.factoryTheme = dark ? 'dark' : 'light';
    document.body.dataset.factoryDensity = prefs.density;
    document.body.style.setProperty('--factory-accent', prefs.accent);
    domQuery('.brand>span:last-child').textContent = prefs.brandName || 'PlantDesk';
    document.body.classList.toggle('factory-hide-left', prefs.left);
    document.body.classList.toggle('factory-hide-right', prefs.right);
    document.body.classList.toggle('factory-focus', prefs.focus);
    for (const [id, key, label] of [
      ['factory-left-toggle', 'left', '一覧'],
      ['factory-right-toggle', 'right', '詳細'],
      ['factory-focus-toggle', 'focus', '集中表示'],
    ]) {
      const button = domFindById(id);
      if (!button) {
        continue;
      }
      button.setAttribute('aria-pressed', String(prefs[key]));
      if (key !== 'focus') {
        button.setAttribute('aria-expanded', String(!prefs[key]));
      }
      button.textContent =
        key === 'focus'
          ? prefs.focus
            ? '通常表示'
            : '集中表示'
          : prefs[key]
            ? label + 'を開く'
            : label + 'を畳む';
    }
    if (prefs.mapTypes) {
      for (const k of ['works', 'assets', 'notes']) {
        const c = domFindById('show-' + k);
        if (c) {
          inputElement(c).checked = prefs.mapTypes[k] && (k !== 'assets' || getMapApp()?.editor);
        }
      }
    }
    FactoryDisplay?.configure(prefs.appearance);
    requestAnimationFrame(() =>
      getMapApp()?.map.invalidateSize({
        pan: false,
      }),
    );
  }
  function set(key, value) {
    prefs = normalize({
      ...prefs,
      [key]: value,
    });
    persist();
    apply();
  }
  function select(label, value, choices, onchange) {
    const row = el('label', label);
    const control = el('select');
    control.setAttribute('aria-label', label);
    for (const [v, t] of Object.entries(choices)) {
      const option = el('option', t);
      option.value = v;
      control.append(option);
    }
    control.value = value;
    control.addEventListener('change', () => onchange(control.value));
    row.append(control);
    return row;
  }
  function fieldset(title) {
    const f = el('fieldset');
    f.append(el('legend', title));
    return f;
  }
  let syncDisplaySettings = (_reset = false) => {};
  function buildDisplaySettings(root) {
    const sections = {
      general: '全般',
      map: '地図',
      equipment: '設備',
      works: '工事',
      notes: '付箋',
      layout: '画面',
      operation: '操作',
      presets: 'プリセット',
    };
    const nav = el('div', undefined, 'factory-settings-tabs');
    nav.setAttribute('aria-label', '設定カテゴリ');
    const search = el('input');
    search.type = 'search';
    search.placeholder = '設定を検索（例：サイズ、ズーム、色）';
    search.setAttribute('aria-label', '表示設定を検索');
    search.className = 'factory-settings-search';
    let active = 'general';
    const controls = [];
    const switchSection = () => {
      const q = search.value.trim().toLocaleLowerCase();
      domAll('[data-settings-section]', root).forEach((panel) => {
        htmlElement(panel).hidden = q
          ? !panel.textContent.toLocaleLowerCase().includes(q)
          : panel.dataset.settingsSection !== active;
        domAll('[data-setting-label]', panel).forEach(
          (row) =>
            (htmlElement(row).hidden =
              !!q && !(row.dataset.settingLabel || '').toLocaleLowerCase().includes(q)),
        );
      });
      domAll('button', nav).forEach((b) =>
        b.setAttribute('aria-pressed', String(!q && b.dataset.section === active)),
      );
    };
    for (const [key, name] of Object.entries(sections)) {
      const b = el('button', name);
      b.type = 'button';
      b.dataset.section = key;
      b.onclick = () => {
        active = key;
        search.value = '';
        switchSection();
      };
      nav.append(b);
    }
    const look = domQuery('[data-settings-section=general]', root);
    look.before(search, nav);
    const update = (key, value, commit = true) => {
      prefs = normalize({
        ...prefs,
        appearance: {
          ...prefs.appearance,
          [key]: value,
        },
      });
      FactoryDisplay.configure(prefs.appearance);
      if (commit) {
        persist();
      }
    };
    for (const key of ['map', 'equipment', 'works', 'notes', 'layout', 'operation']) {
      const panel = fieldset(sections[key] + 'の設定');
      panel.dataset.settingsSection = key;
      for (const field of appearance.fields.filter(
        (f) => f.section === key && f.type !== 'color',
      )) {
        const row = el('label', undefined, 'factory-setting-row');
        row.dataset.settingLabel = field.label;
        const title = el('span', field.label);
        row.append(title);
        let control;
        if (field.type === 'number') {
          const group = el('div', undefined, 'factory-number-control');
          const range = el('input');
          range.type = 'range';
          range.min = field.min;
          range.max = field.max;
          range.step = 1;
          range.setAttribute('aria-label', field.label + 'スライダー');
          control = el('input');
          control.type = 'number';
          control.required = true;
          control.min = field.min;
          control.max = field.max;
          control.step = 1;
          control.setAttribute('aria-label', field.label);
          range.oninput = () => {
            control.value = range.value;
            update(field.key, Number(range.value), false);
          };
          range.onchange = () => persist();
          control.oninput = () => {
            if (control.validity.valid) {
              range.value = control.value;
              update(field.key, Number(control.value), false);
            }
          };
          control.onchange = () => {
            if (control.validity.valid) {
              persist();
            }
          };
          group.append(range, control, el('small', field.unit));
          row.append(group);
          controls.push(() => {
            control.value = range.value = prefs.appearance[field.key];
          });
        } else {
          control = el(field.type === 'select' ? 'select' : 'input');
          control.setAttribute('aria-label', field.label);
          if (field.type === 'select') {
            for (const [v, label] of Object.entries(field.choices)) {
              const option = el('option', label);
              option.value = v;
              control.append(option);
            }
            control.onchange = () => update(field.key, control.value);
          } else if (field.type === 'boolean') {
            control.type = 'checkbox';
            row.classList.add('factory-toggle-row');
            control.onchange = () => update(field.key, control.checked);
          } else {
            control.type = 'color';
            if (server && !FactoryAPI.session?.limits.customization) {
              control.disabled = true;
              control.title = '配色の変更はProの機能です。';
            }
            control.oninput = () => update(field.key, control.value, false);
            control.onchange = () => persist();
          }
          controls.push(() => {
            if (field.type === 'boolean') {
              control.checked = prefs.appearance[field.key];
            } else {
              control.value = prefs.appearance[field.key];
            }
          });
          row.append(control);
        }
        panel.append(row);
      }
      root.insertBefore(panel, root.lastChild);
    }
    const panel = fieldset('表示プリセットと設定の持ち出し');
    panel.dataset.settingsSection = 'presets';
    panel.append(
      el('p', '用途に合わせた表示をワンクリックで適用。個人用の組み合わせも保存できます。'),
    );
    const builtins = el('div', undefined, 'factory-preset-grid');
    for (const p of Object.values(appearance.presets)) {
      const b = el('button', p.label);
      b.type = 'button';
      b.onclick = () => {
        prefs.appearance = appearance.normalize(p.values);
        persist();
        apply();
        controls.forEach((sync) => sync());
        toast(p.label + 'の表示を適用しました。');
      };
      builtins.append(b);
    }
    panel.append(builtins);
    const saveRow = el('div', undefined, 'factory-preset-save');
    const name = el('input');
    name.placeholder = '例：朝の巡回用';
    name.maxLength = 50;
    name.setAttribute('aria-label', '表示プリセット名');
    const save = el('button', '現在の表示を保存');
    save.type = 'button';
    const saved = el('div');
    const drawSaved = () => {
      saved.replaceChildren();
      for (const p of prefs.displayPresets) {
        const row = el('div', undefined, 'factory-preset-row');
        const use = el('button', p.name);
        const remove = el('button', '削除');
        use.type = remove.type = 'button';
        use.onclick = () => {
          prefs.appearance = appearance.normalize(p.appearance);
          persist();
          apply();
          controls.forEach((sync) => sync());
        };
        remove.onclick = () => {
          prefs.displayPresets = prefs.displayPresets.filter((x) => x.id !== p.id);
          persist();
          drawSaved();
        };
        row.append(use, remove);
        saved.append(row);
      }
    };
    save.onclick = () => {
      if (!name.value.trim()) {
        toast('プリセット名を入力してください。');
        return;
      }
      if (prefs.displayPresets.length >= 10) {
        toast('プリセットは10個まで保存できます。');
        return;
      }
      prefs.displayPresets.push({
        id: crypto.randomUUID(),
        name: name.value.trim(),
        appearance: structuredClone(prefs.appearance),
      });
      persist();
      name.value = '';
      drawSaved();
    };
    saveRow.append(name, save);
    panel.append(saveRow, saved);
    const exportButton = el('button', '表示設定をJSONで書き出す');
    exportButton.type = 'button';
    exportButton.onclick = () => {
      const a = el('a');
      const blob = new Blob(
        [
          JSON.stringify(
            {
              format: 'plantdesk-display-v1',
              appearance: prefs.appearance,
              theme: prefs.theme,
              density: prefs.density,
              accent: prefs.accent,
            },
            null,
            2,
          ),
        ],
        {
          type: 'application/json',
        },
      );
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = 'plantdesk-display.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    const importLabel = el('label', '表示設定JSONを読み込む');
    const file = el('input');
    file.type = 'file';
    file.accept = '.json,application/json';
    file.onchange = async () => {
      try {
        const f = file.files[0];
        if (!f) {
          return;
        }
        if (f.size > 100000) {
          throw new Error('表示設定は100KB以下のJSONにしてください。');
        }
        const v = JSON.parse(await f.text());
        if (v.format !== 'plantdesk-display-v1') {
          throw new Error('PlantDeskの表示設定ファイルを選んでください。');
        }
        const next = appearance.normalize(v.appearance, true);
        prefs = normalize({
          ...prefs,
          appearance: next,
          theme: v.theme,
          accent: v.accent,
          density: v.density,
        });
        await persist();
        apply();
        controls.forEach((sync) => sync());
        toast('表示設定を読み込みました。');
      } catch (e) {
        toast(e.message);
      } finally {
        file.value = '';
      }
    };
    importLabel.append(file);
    panel.append(exportButton, importLabel);
    root.insertBefore(panel, root.lastChild);
    search.oninput = switchSection;
    syncDisplaySettings = (reset = false) => {
      if (reset) {
        active = 'general';
        search.value = '';
      }
      controls.forEach((sync) => sync());
      drawSaved();
      switchSection();
    };
    syncDisplaySettings();
  }
  async function init() {
    server = !!FactoryAPI?.saas;
    if (server) {
      prefs = normalize({
        ...FactoryAPI.session?.preferences,
        plan: FactoryAPI.session?.plan,
      });
    }
    const tools = el('div', undefined, 'factory-workspace-controls');
    tools.setAttribute('aria-label', '表示設定');
    for (const [id, key, controls] of [
      ['factory-left-toggle', 'left', 'record-list'],
      ['factory-right-toggle', 'right', 'detail-pane'],
      ['factory-focus-toggle', 'focus', ''],
    ]) {
      const button = el('button');
      button.id = id;
      button.type = 'button';
      if (controls) {
        button.setAttribute('aria-controls', controls);
      }
      button.onclick = () => set(key, !prefs[key]);
      tools.append(button);
    }
    const customize = el('button', '表示をカスタマイズ');
    customize.type = 'button';
    customize.id = 'factory-customize';
    tools.append(customize);
    $('.workspace').before(tools);
    dialog = el('dialog', undefined, 'form-dialog factory-custom-dialog');
    dialog.id = 'factory-custom-dialog';
    dialog.onkeydown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        dialog.close();
      }
    };
    dialog.setAttribute('aria-labelledby', 'factory-custom-title');
    const heading = el('div', undefined, 'dialog-heading');
    const title = el('h2', '自分に合った構内マップ');
    title.id = 'factory-custom-title';
    const close = el('button', '×', 'icon-close');
    close.type = 'button';
    close.setAttribute('aria-label', '閉じる');
    close.onclick = () => dialog.close();
    heading.append(title, close);
    dialog.append(
      heading,
      el(
        'p',
        server
          ? '表示設定は、このワークスペースのデータベースに保存します。'
          : '表示設定はこのブラウザーに保存されます。',
        'factory-help',
      ),
    );
    const look = fieldset('見やすさ');
    look.dataset.settingsSection = 'general';
    look.append(
      select('情報の密度', prefs.density, { comfortable: 'ゆったり', compact: 'コンパクト' }, (v) =>
        set('density', v),
      ),
    );
    dialog.append(look);
    const reset = el('button', '表示設定を初期化', 'button secondary');
    reset.type = 'button';
    reset.onclick = () => {
      prefs = normalize({
        ...prefs,
        theme: 'system',
        accent: '#167566',
        brandName: '',
        density: 'comfortable',
        left: false,
        right: false,
        focus: false,
        appearance: {},
      });
      persist();
      apply();
      getMapApp()?.render();
      dialog.close();
      toast('表示設定を初期化しました。');
    };
    dialog.append(reset);
    buildDisplaySettings(dialog);
    document.body.append(dialog);
    customize.onclick = () => {
      domAll('select', dialog).forEach((s) => {
        if (s.parentElement?.firstChild?.textContent === 'テーマ') {
          s.value = prefs.theme;
        }
        if (s.parentElement?.firstChild?.textContent === '情報の密度') {
          s.value = prefs.density;
        }
      });
      syncDisplaySettings(true);
      dialog.showModal();
    };
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply);
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) {
        try {
          prefs = normalize(JSON.parse(e.newValue || '{}'));
          apply();
          getMapApp()?.render();
        } catch {}
      }
    });
    apply();
    getMapApp()?.render();
    api.getPreferences = () => structuredClone(prefs);
    api.flush = () => saveChain;
    api.update = async (values) => {
      prefs = normalize({
        ...prefs,
        ...values,
      });
      await persist();
      apply();
      getMapApp()?.render();
    };
    window.dispatchEvent(new Event('factory-preferences-ready'));
  }
  api.init = init;
  return api;
})();
registerPreferences(FactoryPreferences);
export default FactoryPreferences;
