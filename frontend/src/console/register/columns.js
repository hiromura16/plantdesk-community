/** 設備と工事の列定義。表示名・値・独自属性を、画面状態から分離して組み立てます。 */
import { latest, nextDate, propertyValue, statusNames, today } from './model.js';
export function createRegisterColumns({ kind, state }) {
  const equipment = kind === 'equipment';
  const defs = state.propertyDefinitions || [];
  const categoryDef = defs.find((d) => d.id === 'category');
  const drawingName = (id) => state.drawings.find((d) => d.id === id)?.name || '';
  const layerName = (id) => state.layers?.find((l) => l.id === id)?.name || '標準（未分類）';
  const related = (w) =>
    (w.assetIds || []).map((id) => state.assets.find((a) => a.id === id)).filter(Boolean);
  const aggregate = (w, fn) =>
    [
      ...new Set(
        related(w)
          .map(fn)
          .filter((v) => v !== '' && v !== undefined && v !== null),
      ),
    ].join(' / ');
  return equipment
    ? [
        {
          id: 'code',
          name: '設備ID',
          value: (a) => a.code,
        },
        {
          id: 'name',
          name: '設備名',
          value: (a) => a.name,
        },
        {
          id: 'category',
          name: '設備分類',
          value: (a) => propertyValue(categoryDef || {}, a.properties?.category),
        },
        {
          id: 'location',
          name: '場所',
          value: (a) => a.location,
        },
        {
          id: 'drawing',
          name: '図面',
          value: (a) => drawingName(a.drawingId),
        },
        {
          id: 'layer',
          name: 'レイヤー',
          value: (a) => layerName(a.layerId),
        },
        {
          id: 'nextDate',
          name: '次回点検日',
          value: nextDate,
        },
        {
          id: 'lastDate',
          name: '最終点検日',
          value: (a) => latest(a)?.date || '',
        },
        {
          id: 'inspection',
          name: '点検状況',
          value: (a) =>
            latest(a)?.result === 'attention'
              ? '要対応'
              : nextDate(a) && nextDate(a) < today()
                ? '期限超過'
                : latest(a)
                  ? '点検済み'
                  : '未点検',
        },
        {
          id: 'historyCount',
          name: '点検回数',
          value: (a) => a.history?.length || 0,
        },
        {
          id: 'files',
          name: '添付数',
          value: (a) => a.attachments?.length || 0,
        },
        {
          id: 'locks',
          name: 'ロック',
          value: (a) =>
            a.locks?.position && a.locks?.attributes
              ? '位置・属性'
              : a.locks?.position
                ? '位置'
                : a.locks?.attributes
                  ? '属性'
                  : 'なし',
        },
        {
          id: 'x',
          name: 'X座標',
          group: '位置・管理情報',
          value: (a) => a.point?.[0],
          raw: (a) => a.point?.[0],
        },
        {
          id: 'y',
          name: 'Y座標',
          group: '位置・管理情報',
          value: (a) => a.point?.[1],
          raw: (a) => a.point?.[1],
        },
        {
          id: 'icon',
          name: 'アイコン',
          group: '位置・管理情報',
          value: (a) => a.icon || '標準',
        },
        {
          id: 'fileNames',
          name: '添付ファイル名',
          group: '点検・資料',
          value: (a) => (a.attachments || []).map((f) => f.name).join(' / '),
        },
        {
          id: 'lastInspector',
          name: '最終点検の担当者',
          group: '点検・資料',
          value: (a) => latest(a)?.inspector || '',
        },
        {
          id: 'lastText',
          name: '最終点検の内容',
          group: '点検・資料',
          value: (a) => latest(a)?.text || '',
        },
        {
          id: 'updatedAt',
          name: '更新日時',
          group: '位置・管理情報',
          value: (a) => a.updatedAt || '',
        },
        ...defs
          .filter((d) => d.id !== 'category')
          .map((d) => ({
            id: 'prop:' + d.id,
            name: d.name,
            group: '設備プロパティ',
            type: d.type,
            value: (a) => propertyValue(d, a.properties?.[d.id]),
            raw: (a) => a.properties?.[d.id],
          })),
      ]
    : [
        {
          id: 'code',
          name: '工事ID',
          value: (w) => w.code,
        },
        {
          id: 'title',
          name: '工事名',
          value: (w) => w.title,
        },
        {
          id: 'status',
          name: '状態',
          value: (w) => (w.deleted ? '削除済み' : statusNames[w.status]),
        },
        {
          id: 'location',
          name: '場所',
          value: (w) => w.location,
        },
        {
          id: 'drawing',
          name: '図面',
          value: (w) => drawingName(w.drawingId),
        },
        {
          id: 'layer',
          name: 'レイヤー',
          value: (w) => layerName(w.layerId),
        },
        {
          id: 'start',
          name: '開始日',
          value: (w) => w.start,
        },
        {
          id: 'end',
          name: '終了日',
          value: (w) => w.end,
        },
        {
          id: 'contact',
          name: '担当',
          value: (w) => w.contact,
        },
        {
          id: 'phone',
          name: '内線',
          value: (w) => w.phone,
        },
        {
          id: 'impacts',
          name: '周囲への影響',
          value: (w) => (w.impacts || []).join('、'),
        },
        {
          id: 'assets',
          name: '関連設備数',
          value: (w) => w.assetIds?.length || 0,
        },
        {
          id: 'files',
          name: '添付数',
          value: (w) => w.attachments?.length || 0,
        },
        {
          id: 'notes',
          name: '工事内容',
          value: (w) => w.notes,
        },
        {
          id: 'updatedAt',
          name: '更新日時',
          value: (w) => w.updatedAt?.slice(0, 16).replace('T', ' ') || '',
        },
        {
          id: 'assetCodes',
          name: '関連設備ID',
          group: '関連設備',
          value: (w) => aggregate(w, (a) => a.code),
        },
        {
          id: 'assetNames',
          name: '関連設備名',
          group: '関連設備',
          value: (w) => aggregate(w, (a) => a.name),
        },
        {
          id: 'assetLocations',
          name: '関連設備の場所',
          group: '関連設備',
          value: (w) => aggregate(w, (a) => a.location),
        },
        {
          id: 'assetNextDate',
          name: '関連設備の次回点検日',
          group: '関連設備',
          value: (w) => aggregate(w, nextDate),
        },
        {
          id: 'fileNames',
          name: '添付ファイル名',
          group: '工事の資料・履歴',
          value: (w) => (w.attachments || []).map((f) => f.name).join(' / '),
        },
        {
          id: 'deletedAt',
          name: '削除日時',
          group: '工事の資料・履歴',
          value: (w) => w.deletedAt || '',
        },
        ...defs.map((d) => ({
          id: 'assetProp:' + d.id,
          name: '関連設備：' + d.name,
          group: '関連設備のプロパティ',
          type: d.type,
          value: (w) => aggregate(w, (a) => propertyValue(d, a.properties?.[d.id])),
        })),
      ];
}
