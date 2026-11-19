/** 設備・工事台帳の表示。値と操作関数は管理フックから受け取り、ここでは画面を組み立てます。 */
import { AssetImport, downloadJSON } from '../asset-import.jsx';
import { ColumnPicker } from '../column-picker.jsx';
import { WorkHistory } from './work-history.jsx';
import { api, statusNames } from './model.js';
export function RegisterView({
  batch,
  bulkStatus,
  busy,
  categoryDef,
  chosen,
  columns,
  currentPage,
  dateNow,
  defaults,
  defs,
  deletedOffset,
  equipment,
  exportRows,
  f,
  filter,
  history,
  importing,
  message,
  onRefresh,
  openMap,
  pageSize,
  perform,
  persist,
  rows,
  selected,
  setBulkStatus,
  setDeleted,
  setDeletedOffset,
  setHistory,
  setImporting,
  setMessage,
  setPage,
  setSelected,
  setTargetLayer,
  state,
  targetLayer,
  totalPages,
  update,
  view,
  visible,
}) {
  return (
    <>
      <p className="section-intro">
        {equipment
          ? '設備を、分類・図面・点検状況から管理。追加したプロパティも一覧の列にできます。'
          : '工事と関連設備のプロパティを、選んだ列でまとめて確認。複数設備の値は「 / 」で並べて表示します。'}
      </p>
      <section className="product-card register-card">
        <div className="section-heading">
          <h2>{equipment ? '設備一覧' : '工事一覧'}</h2>
          <div className="product-actions">
            <button
              onClick={() =>
                exportRows((equipment ? '設備' : '工事') + '一覧-' + dateNow + '.csv', [
                  chosen.map((c) => c.name),
                  ...rows.map((row) => chosen.map((c) => c.value(row))),
                ])
              }
            >
              絞り込んだ一覧をCSV保存
            </button>
            {equipment && (
              <>
                <button onClick={() => setImporting(true)}>JSONで一括登録</button>
                <button
                  onClick={() =>
                    downloadJSON('plantdesk-equipment.json', {
                      assets: rows.map((a) =>
                        Object.fromEntries(
                          Object.entries(a).filter(([k]) =>
                            [
                              'code',
                              'name',
                              'drawingId',
                              'point',
                              'location',
                              'properties',
                              'layerId',
                              'icon',
                            ].includes(k),
                          ),
                        ),
                      ),
                    })
                  }
                >
                  設備JSONを保存
                </button>
              </>
            )}
            <ColumnPicker
              columns={columns}
              chosen={view.columns}
              defaults={defaults}
              onChange={(columns) =>
                update({
                  columns,
                })
              }
            />
          </div>
        </div>
        <div className="register-filters">
          <label className="register-search">
            検索
            <input
              aria-label={equipment ? '設備一覧を検索' : '工事一覧を検索'}
              value={f.query || ''}
              placeholder="名前・ID・場所・属性を検索"
              onChange={(e) => filter('query', e.target.value, false)}
              onBlur={() => persist(view)}
            />
          </label>
          {equipment ? (
            <label>
              設備分類
              <select
                aria-label="一覧の設備分類"
                value={f.category || ''}
                onChange={(e) => filter('category', e.target.value)}
              >
                <option value="">すべて</option>
                {categoryDef?.options?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              状態
              <select
                aria-label="一覧の工事状態"
                value={f.status || ''}
                onChange={(e) => filter('status', e.target.value)}
              >
                <option value="">すべて</option>
                {Object.entries(statusNames).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            図面
            <select
              aria-label="一覧の図面"
              value={f.drawing || ''}
              onChange={(e) => filter('drawing', e.target.value)}
            >
              <option value="">すべての図面</option>
              {state.drawings.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            レイヤー
            <select
              aria-label="一覧のレイヤー"
              value={f.layer || ''}
              onChange={(e) => filter('layer', e.target.value)}
            >
              <option value="">すべて</option>
              <option value="__unset">標準（未分類）</option>
              {state.layers?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          {equipment ? (
            <label>
              管理上の条件
              <select
                aria-label="設備の管理条件"
                value={f.condition || ''}
                onChange={(e) => filter('condition', e.target.value)}
              >
                <option value="">すべて</option>
                {Object.entries({
                  due: '点検期限を迎えた設備',
                  attention: '点検で要対応',
                  uninspected: '点検記録なし',
                  locked: 'ロック中',
                  unlocked: 'ロックなし',
                  photos: '写真あり',
                  noFiles: '添付資料なし',
                }).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              削除済み工事
              <select
                aria-label="削除済み工事の表示"
                value={f.deleted || 'current'}
                onChange={(e) => filter('deleted', e.target.value)}
              >
                <option value="current">現在の工事</option>
                <option value="all">削除済みも含む</option>
                <option value="deleted">削除済みのみ</option>
              </select>
            </label>
          )}
          {!equipment && (
            <label>
              管理上の条件
              <select
                aria-label="工事の管理条件"
                value={f.condition || ''}
                onChange={(e) => filter('condition', e.target.value)}
              >
                <option value="">すべて</option>
                <option value="late">終了予定を超過</option>
                <option value="upcoming">7日以内の予定</option>
                <option value="traffic">通行への影響あり</option>
              </select>
            </label>
          )}
          <label>
            {equipment ? '次回点検日' : '開始日'}・以降
            <input
              type="date"
              aria-label="一覧の日付の始まり"
              value={f.from || ''}
              onChange={(e) => filter('from', e.target.value)}
            />
          </label>
          <label>
            以前
            <input
              type="date"
              aria-label="一覧の日付の終わり"
              value={f.to || ''}
              onChange={(e) => filter('to', e.target.value)}
            />
          </label>
          {equipment && (
            <>
              <label>
                プロパティ
                <select
                  aria-label="一覧のプロパティ条件"
                  value={f.property || ''}
                  onChange={(e) => filter('property', e.target.value)}
                >
                  <option value="">追加条件なし</option>
                  {defs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                含む値
                <input
                  aria-label="一覧のプロパティの値"
                  disabled={!f.property}
                  value={f.value || ''}
                  onChange={(e) => filter('value', e.target.value, false)}
                  onBlur={() => persist(view)}
                />
              </label>
            </>
          )}
          <button
            className="register-reset"
            onClick={() =>
              update({
                filters: {},
              })
            }
          >
            条件をクリア
          </button>
        </div>
        <p className="register-message" role="status">
          {message || '表示列と条件は自動保存されます。'}
        </p>
        {selected.size > 0 && (
          <div className="register-bulk">
            <strong>{selected.size}件を選択</strong>
            {equipment ? (
              <>
                <button
                  disabled={busy}
                  onClick={() =>
                    batch({
                      locks: {
                        position: true,
                        attributes: true,
                      },
                    })
                  }
                >
                  ロック
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    batch({
                      locks: {
                        position: false,
                        attributes: false,
                      },
                    })
                  }
                >
                  ロック解除
                </button>
                <select
                  aria-label="一括移動先のレイヤー"
                  value={targetLayer}
                  onChange={(e) => setTargetLayer(e.target.value)}
                >
                  <option value="">標準（未分類）</option>
                  {state.layers?.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <button
                  disabled={busy}
                  onClick={() =>
                    batch({
                      layerId: targetLayer,
                    })
                  }
                >
                  レイヤーへ移動
                </button>
              </>
            ) : (
              <>
                <select
                  aria-label="一括変更する工事状態"
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                >
                  {Object.entries(statusNames).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  disabled={busy}
                  onClick={() =>
                    batch({
                      status: bulkStatus,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                >
                  状態を更新
                </button>
              </>
            )}
            <button onClick={() => setSelected(new Set())}>選択解除</button>
          </div>
        )}
        <div className="table-scroll register-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="表示中の行を選択"
                    checked={
                      !!visible.filter((r) => !r.deleted).length &&
                      visible.filter((r) => !r.deleted).every((r) => selected.has(r.id))
                    }
                    onChange={(e) => {
                      const next = new Set(selected);
                      for (const row of visible.filter((r) => !r.deleted)) {
                        if (e.target.checked) {
                          next.add(row.id);
                        } else {
                          next.delete(row.id);
                        }
                      }
                      setSelected(next);
                    }}
                  />
                </th>
                {chosen.map((c) => (
                  <th
                    key={c.id}
                    aria-sort={
                      view.sort === c.id ? (view.descending ? 'descending' : 'ascending') : 'none'
                    }
                  >
                    <button
                      onClick={() =>
                        update({
                          sort: c.id,
                          descending: view.sort === c.id ? !view.descending : false,
                        })
                      }
                    >
                      {c.name}
                      {view.sort === c.id ? (view.descending ? ' ↓' : ' ↑') : ''}
                    </button>
                  </th>
                ))}
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr
                  key={row.id}
                  data-register-row={row.id}
                  className={row.deleted ? 'register-deleted' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      aria-label={row.code + 'を選択'}
                      disabled={row.deleted}
                      checked={selected.has(row.id)}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) {
                          next.add(row.id);
                        } else {
                          next.delete(row.id);
                        }
                        setSelected(next);
                      }}
                    />
                  </td>
                  {chosen.map((c) => (
                    <td
                      key={c.id}
                      className={c.id === 'name' || c.id === 'title' ? 'register-title' : ''}
                    >
                      {c.value(row) === undefined || c.value(row) === null || c.value(row) === ''
                        ? '—'
                        : c.value(row)}
                    </td>
                  ))}
                  <td>
                    <div className="register-row-actions">
                      {!row.deleted && (
                        <>
                          <button onClick={() => openMap(row)}>地図 ↗</button>
                          <button
                            onClick={() =>
                              (location.href =
                                'console.html?' +
                                (equipment ? 'newTaskAsset' : 'newTaskWork') +
                                '=' +
                                encodeURIComponent(row.id) +
                                '#tasks')
                            }
                          >
                            仕事を依頼
                          </button>
                        </>
                      )}
                      {equipment ? (
                        <button
                          disabled={busy}
                          onClick={() =>
                            perform(async () => {
                              const locked = !(row.locks?.position && row.locks?.attributes);
                              await api('/api/assets/' + row.id, {
                                method: 'PATCH',
                                body: {
                                  locks: {
                                    position: locked,
                                    attributes: locked,
                                  },
                                },
                              });
                            })
                          }
                        >
                          {row.locks?.position && row.locks?.attributes ? '解除' : 'ロック'}
                        </button>
                      ) : (
                        <>
                          <button onClick={() => setHistory(row)}>変更履歴</button>
                          {!row.deleted && (
                            <button
                              disabled={busy}
                              onClick={() => {
                                if (
                                  confirm(
                                    '工事「' + row.title + '」を削除しますか？変更履歴は残ります。',
                                  )
                                ) {
                                  perform(() =>
                                    api('/api/works/' + encodeURIComponent(row.id), {
                                      method: 'DELETE',
                                    }),
                                  );
                                }
                              }}
                            >
                              削除
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && (
            <p className="empty-product">条件に合う{equipment ? '設備' : '工事'}がありません。</p>
          )}
        </div>
        <div className="register-pagination">
          <span>
            {rows.length}件中 {rows.length ? currentPage * pageSize + 1 : 0}〜
            {Math.min((currentPage + 1) * pageSize, rows.length)}件
          </span>
          <label>
            表示件数
            <select
              aria-label="一覧の表示件数"
              value={pageSize}
              onChange={(e) =>
                update({
                  pageSize: Number(e.target.value),
                })
              }
            >
              {[20, 50, 100].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <button disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>
            前へ
          </button>
          <span>
            {currentPage + 1} / {totalPages}
          </span>
          <button disabled={currentPage + 1 >= totalPages} onClick={() => setPage(currentPage + 1)}>
            次へ
          </button>
        </div>
        {!equipment && deletedOffset !== null && (
          <button
            onClick={async () => {
              try {
                const r = await api('/api/work-register?offset=' + deletedOffset);
                setDeleted((v) => [...v, ...r.deleted]);
                setDeletedOffset(r.nextOffset);
              } catch (e) {
                setMessage(e.message);
              }
            }}
          >
            過去に削除した工事をさらに読み込む
          </button>
        )}
      </section>
      {importing && (
        <AssetImport state={state} onClose={() => setImporting(false)} onRefresh={onRefresh} />
      )}{' '}
      {history && <WorkHistory work={history} state={state} onClose={() => setHistory(null)} />}
    </>
  );
}
