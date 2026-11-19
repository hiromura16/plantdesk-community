/* 設定値の正規化と画像の入力制約。DOM・通信・画面状態から独立した共通モデルです。 */
import FactoryAppearance from '../../../shared/appearance.js';
const appearance = FactoryAppearance;
const DEFAULTS = {
  theme: 'system',
  accent: '#167566',
  density: 'comfortable',
  left: false,
  right: false,
  focus: false,
  plan: 'free',
  icons: [],
  categoryIcons: {},
};
const PLANS = {
  free: {
    name: 'Community',
    drawings: 3,
    assets: 100,
  },
};
const validImage = (v) =>
  typeof v === 'string' && v.length <= 90000 && /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(v);
/** @param {import('../../../shared/model').PreferenceInput|null} raw */
function normalize(raw = {}) {
  const o = raw && typeof raw === 'object' ? raw : {};
  return {
    ...DEFAULTS,
    brandName: '',
    theme: 'system',
    accent: DEFAULTS.accent,
    density: o.density === 'compact' ? 'compact' : 'comfortable',
    left: o.left === true,
    right: o.right === true,
    focus: o.focus === true,
    plan: Object.hasOwn(PLANS, o.plan || '') ? o.plan || 'free' : 'free',
    icons: [],
    categoryIcons: {},
    appearance: appearance.normalize(o.appearance),
    hiddenLayerIds: Array.isArray(o.hiddenLayerIds)
      ? o.hiddenLayerIds.filter((x) => typeof x === 'string').slice(0, 200)
      : [],
    mapTypes:
      o.mapTypes && typeof o.mapTypes === 'object'
        ? Object.fromEntries(['works', 'assets', 'notes'].map((k) => [k, o.mapTypes?.[k] === true]))
        : null,
    teamBoard: o.teamBoard && typeof o.teamBoard === 'object' ? o.teamBoard : {},
    tableViews: o.tableViews && typeof o.tableViews === 'object' ? o.tableViews : {},
    displayPresets: (Array.isArray(o.displayPresets) ? o.displayPresets : [])
      .slice(0, 10)
      .map((p) => ({
        id: String(p.id || ''),
        name: String(p.name || 'プリセット').slice(0, 50),
        appearance: appearance.normalize(p.appearance),
      })),
  };
}
export { normalize, validImage, PLANS };
