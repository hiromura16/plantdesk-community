import { defer } from '../../runtime/defer.js';
import { requiredElement } from '../../runtime/dom.ts';
/** 工事の変更履歴を参照する表示。削除済みの工事も履歴から確認できます。 */
import { api, statusNames } from './model.js';
import { useEffectEvent, useEffect, useRef, useState } from 'react';
export function WorkHistory({ work, state, onClose }) {
  const ref = useRef(/** @type {HTMLDialogElement|null} */ (null));
  const [events, setEvents] = useState(
    /** @type {import('../../../../shared/model').HistoryEvent<import('../../../../shared/model').Work>[]} */ ([]),
  );
  const [cursor, setCursor] = useState(/** @type {number|null} */ (null));
  const [message, setMessage] = useState('');
  const load = async (before) => {
    try {
      const r = await api(
        '/api/works/' +
          encodeURIComponent(work.id) +
          '/history' +
          (before ? '?before=' + before : ''),
      );
      setEvents((v) => (before ? [...v, ...r.items] : r.items));
      setCursor(r.nextCursor);
    } catch (e) {
      setMessage(e.message);
    }
  };
  const initialLoad = useEffectEvent(() => load());
  useEffect(() => {
    requiredElement(ref.current).showModal();
    return defer(() => initialLoad());
  }, [work.id]);
  const labels = {
    title: '工事名',
    code: '工事ID',
    status: '状態',
    location: '場所',
    start: '開始日',
    end: '終了日',
    notes: '内容・注意事項',
    contact: '担当',
    phone: '内線',
    impacts: '周囲への影響',
    drawingId: '図面',
    layerId: 'レイヤー',
    points: '工事範囲',
    assetIds: '関連設備',
    attachments: '添付資料',
    coverPhotoId: '代表写真',
  };
  const value = (key, v) =>
    v == null || v === ''
      ? '未設定'
      : key === 'status'
        ? statusNames[v]
        : key === 'drawingId'
          ? state.drawings.find((d) => d.id === v)?.name || v
          : key === 'layerId'
            ? state.layers?.find((l) => l.id === v)?.name || '削除されたレイヤー'
            : key === 'points'
              ? v.length + '頂点の範囲'
              : key === 'assetIds'
                ? v.length + '台'
                : key === 'attachments'
                  ? v.map((f) => f.name || '資料').join('、') || 'なし'
                  : Array.isArray(v)
                    ? v.join('、')
                    : String(v);
  return (
    <dialog
      ref={ref}
      className="work-history-dialog"
      aria-labelledby="work-history-title"
      onClose={onClose}
    >
      <div className="dialog-heading">
        <div>
          <h2 id="work-history-title">工事の変更履歴</h2>
          <p>
            {work.code} · {work.title}
          </p>
        </div>
        <button
          className="icon-close"
          aria-label="履歴を閉じる"
          onClick={() => requiredElement(ref.current).close()}
        >
          ×
        </button>
      </div>
      <p className="product-note">
        登録・変更・削除を記録します。履歴機能の導入前の変更は復元できないため、導入時点の台帳を最初の記録として残しています。
      </p>
      {message && <p role="alert">{message}</p>}
      <div className="work-history-timeline">
        {events.map((e) => (
          <article key={e.id}>
            <div className="work-history-meta">
              <b>
                {
                  {
                    baseline: '初期記録',
                    created: '登録',
                    updated: '変更',
                    deleted: '削除',
                  }[e.action]
                }
              </b>
              <time>
                {new Date(e.createdAt).toLocaleString('ja-JP', {
                  timeZone: 'Asia/Tokyo',
                })}
              </time>
              <small>
                {e.actor} · 更新 #{e.revision}
              </small>
            </div>
            <dl>
              {Object.entries(labels)
                .filter(([key]) => {
                  const a = e.before?.[key];
                  const b = e.after?.[key];
                  return (
                    !((a == null || a === '') && (b == null || b === '')) &&
                    JSON.stringify(a) !== JSON.stringify(b)
                  );
                })
                .map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>
                      {e.before && <del>{value(key, e.before[key])}</del>}
                      {e.after && <span>{value(key, e.after?.[key])}</span>}
                      {key === 'points' && e.before && e.after && <small>位置・形状を変更</small>}
                    </dd>
                  </div>
                ))}
            </dl>
            {[
              ...new Map(
                [...(e.before?.attachments || []), ...(e.after?.attachments || [])].map((f) => [
                  f.fileId || f.id,
                  f,
                ]),
              ).values(),
            ].map((f) => (
              <a
                key={f.fileId || f.id}
                href={'/api/files/' + encodeURIComponent(f.fileId || f.id || '')}
                target="_blank"
                rel="noreferrer"
              >
                {f.name} ↗
              </a>
            ))}
          </article>
        ))}
      </div>
      {cursor !== null && (
        <button className="button secondary" onClick={() => load(cursor)}>
          以前の履歴を読み込む
        </button>
      )}
      {!events.length && !message && <p>履歴を読み込んでいます…</p>}
    </dialog>
  );
}
