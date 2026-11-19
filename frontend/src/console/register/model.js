/** 台帳の値・表示名・日付を扱う共通処理。独自プロパティも固定IDを使って参照します。 */
import FactoryAPI from '../../shared/api-client.js';
/** 台帳の値・表示名・日付を扱う共通処理。独自プロパティも固定IDを使って参照します。 */

export const api = FactoryAPI.request;
export const today = () =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export const statusNames = {
  active: '工事中',
  planned: '予定',
  done: '完了',
};
export const latest = (a) => [...(a.history || [])].sort((x, y) => y.date.localeCompare(x.date))[0];
export const nextDate = (a) => a.properties?.nextInspection || latest(a)?.nextDate || '';
export const normalize = (s) =>
  String(s ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase();
export const propertyValue = (d, value) =>
  value == null || value === ''
    ? ''
    : d.type === 'checkbox'
      ? value
        ? 'はい'
        : 'いいえ'
      : ['select', 'multiselect'].includes(d.type)
        ? (Array.isArray(value) ? value : [value])
            .map((v) => d.options?.find((o) => o.id === v)?.label || v)
            .join('、')
        : String(value) + (d.unit ? ' ' + d.unit : '');
