/** 担当者一覧と名簿の編集。ログインIDの招待とは別の割り当て用名簿です。 */
import FactoryAPI from '../../shared/api-client.js';
import { Modal, api } from '../team-shared.jsx';
import { useRef, useState } from 'react';
export function Members({ state, report, onRefresh, myMember, onUse, onFilter }) {
  const [edit, setEdit] = useState(
    /** @type {Partial<import('../../../../shared/model').Schemas['TeamMember']>|null} */ (null),
  );
  const error = '';
  return (
    <>
      <div className="team-section-heading">
        <div>
          <h2>担当者・作業負荷</h2>
          <p>未完了の件数と見積時間です。実際の稼働時間ではありません。</p>
        </div>
        <button className="primary-product" onClick={() => setEdit({})}>
          ＋ 担当者を追加
        </button>
      </div>
      <p className="team-help">
        この名簿は作業の担当を決めるためのものです。SSOのアカウント追加・招待・権限変更は行いません。
      </p>
      <p className="team-error">{error}</p>
      <div className="team-member-grid">
        {[
          ...state.teamMembers,
          {
            id: '',
            name: '未割り当て',
            specialty: '担当者が設定されていない作業',
            color: '#87998e',
            active: true,
          },
        ].map((m) => {
          const load = report?.loads.find((x) => x.id === m.id);
          return (
            <article className="team-member-card" key={m.id || 'none'}>
              <div className="team-member-title">
                <i
                  style={{
                    background: m.color,
                  }}
                >
                  {m.name.slice(0, 1)}
                </i>
                <div>
                  <h3>{m.name}</h3>
                  <small>
                    {m.active ? '' : '休止中 · '}
                    {m.specialty}
                  </small>
                </div>
              </div>
              <div className="team-member-metrics">
                <span>
                  <strong>{load?.count || 0}</strong>件
                </span>
                <span>
                  <strong>{load?.minutes || 0}</strong>分
                </span>
                <span className={load?.overdue ? 'task-overdue' : ''}>
                  超過 {load?.overdue || 0}件
                </span>
              </div>
              {m.contact && <p>{m.contact}</p>}
              <div className="product-actions">
                <button onClick={() => onFilter(m.id)}>担当の仕事を見る</button>
                {m.id && (
                  <>
                    <button onClick={() => setEdit(m)}>編集</button>
                    <button aria-pressed={myMember === m.id} onClick={() => onUse(m.id)}>
                      {myMember === m.id ? '自分として表示中' : '自分として表示'}
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {edit && (
        <MemberDialog
          record={edit.id ? edit : null}
          onRefresh={onRefresh}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
export function MemberDialog({ record, onRefresh, onClose }) {
  const [draft, setDraft] = useState({
    ...{
      name: '',
      specialty: '',
      contact: '',
      active: true,
      color: '#287f91',
    },
    ...record,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const revision = useRef(FactoryAPI.revision);
  const set = (k, v) =>
    setDraft((d) => ({
      ...d,
      [k]: v,
    }));
  return (
    <Modal
      title={record ? '担当者を編集' : '担当者を追加'}
      onClose={() => {
        if (!busy) {
          onClose();
        }
      }}
    >
      <div className="team-plan-fields">
        <label>
          担当者名
          <input
            aria-label="担当者名"
            value={draft.name}
            maxLength={80}
            onChange={(e) => set('name', e.target.value)}
          />
        </label>
        <label>
          専門・役割
          <input
            aria-label="担当者の専門"
            value={draft.specialty}
            maxLength={150}
            onChange={(e) => set('specialty', e.target.value)}
          />
        </label>
        <label>
          内線・連絡メモ
          <input
            aria-label="担当者の連絡先"
            value={draft.contact}
            maxLength={150}
            onChange={(e) => set('contact', e.target.value)}
          />
        </label>
        <label>
          表示色
          <input
            aria-label="担当者の色"
            type="color"
            value={draft.color}
            onChange={(e) => set('color', e.target.value)}
          />
        </label>
        <label className="team-checkbox">
          <input
            type="checkbox"
            aria-label="担当者を有効にする"
            checked={draft.active}
            onChange={(e) => set('active', e.target.checked)}
          />
          割り当て候補に表示する
        </label>
        <p className="team-help">休止しても、過去の担当や進行中の作業は保持します。</p>
      </div>
      <p className="team-error" role="alert">
        {error}
      </p>
      <button
        className="primary-product"
        disabled={busy || !draft.name.trim()}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            await api('/api/teamMembers' + (record ? '/' + record.id : ''), {
              method: record ? 'PATCH' : 'POST',
              body: {
                revision: revision.current,
                record: Object.fromEntries(
                  ['name', 'specialty', 'contact', 'active', 'color'].map((k) => [k, draft[k]]),
                ),
              },
            });
            await onRefresh();
            onClose();
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        担当者を保存
      </button>
    </Modal>
  );
}
