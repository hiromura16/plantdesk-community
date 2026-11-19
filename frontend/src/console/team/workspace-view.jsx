/** タスクの検索・表示切り替えと詳細ペインの配置。操作状態は管理フックに集約します。 */
import FactoryAPI from '../../shared/api-client.js';
import { Handover } from './handover.jsx';
import { InspectionRecords } from '../team-inspections.jsx';
import { Members } from './members.jsx';
import { Plans } from '../team-plans.jsx';
import { Projects } from '../team-projects.jsx';
import { TaskBoard, TaskList, TaskWeek } from '../task-views.jsx';
import { TaskDialog } from '../team-task.jsx';
import { api, kindNames, priorityNames, statusNames } from '../team-shared.jsx';
import { defaultView } from './view-model.js';
export function TeamWorkspaceView({
  bulk,
  bulkAssignee,
  busy,
  edit,
  editorGuard,
  exportCSV,
  filtered,
  filtersExpanded,
  limit,
  message,
  move,
  onRefresh,
  open,
  patchTask,
  quickAdd,
  quickTitle,
  quickViews,
  report,
  reportError,
  run,
  selected,
  setBulkAssignee,
  setEdit,
  setFiltersExpanded,
  setLimit,
  setMessage,
  setQuickTitle,
  setSelected,
  setTab,
  setWeek,
  state,
  tab,
  update,
  view,
  week,
}) {
  return (
    <div className={'task-workspace ' + (edit ? 'has-task-pane' : '')}>
      <div className="team-hero">
        <p className="work-page-purpose">
          担当・期限を決め、作業を進めます。点検・保守もここで管理します。
        </p>
        <button
          className="primary-product"
          onClick={() =>
            setEdit({
              initial: {
                kind: view.kind === 'maintenance' ? 'inspection' : view.kind || 'task',
              },
            })
          }
        >
          ＋ 仕事を登録
        </button>
      </div>
      <nav className="team-tabs" aria-label="チーム管理のメニュー">
        {[
          ['board', '作業一覧'],
          ['projects', '案件・改善'],
          ['plans', '点検計画'],
          ['history', '点検予定・履歴'],
          ['members', '担当者・負荷'],
          ['handover', '朝会・引き継ぎ'],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={tab === id}
            className={tab === id ? 'selected' : ''}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {(message || reportError) && (
        <p className="team-error" role="status">
          {message || reportError}
        </p>
      )}
      {tab === 'board' && (
        <>
          <nav className="team-queue-tabs" aria-label="タスクのビュー">
            {quickViews.map(([label, patch]) => (
              <button
                key={label}
                aria-pressed={Object.entries(patch).every(([k, v]) => view[k] === v)}
                onClick={() =>
                  update({
                    ...patch,
                    project: '',
                    readiness: '',
                    priority: '',
                    drawing: '',
                    query: '',
                  })
                }
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => {
                if (view.myMember) {
                  update({
                    assignee: view.myMember,
                    status: 'open',
                    range: '',
                    project: '',
                    kind: '',
                  });
                } else {
                  setTab('members');
                  setMessage('担当者の「自分として表示」を選んでください。');
                }
              }}
            >
              自分の担当
            </button>
          </nav>
          <section className="product-card team-board-card">
            <div className="team-board-toolbar">
              <input
                aria-label="チームの作業を検索"
                placeholder="作業・設備・担当・引き継ぎ内容で検索"
                value={view.query}
                onChange={(e) =>
                  update({
                    query: e.target.value,
                  })
                }
              />
              <div className="team-layout-switch" aria-label="作業の表示形式">
                {[
                  ['board', 'ボード'],
                  ['list', '一覧'],
                  ['week', '週間予定'],
                ].map(([id, name]) => (
                  <button
                    key={id}
                    aria-pressed={view.layout === id}
                    onClick={() =>
                      update({
                        layout: id,
                      })
                    }
                  >
                    {name}
                  </button>
                ))}
              </div>
              <button onClick={exportCSV}>CSV保存</button>
              <button
                className="team-filter-toggle"
                aria-expanded={filtersExpanded}
                onClick={() => setFiltersExpanded((v) => !v)}
              >
                絞り込み {filtersExpanded ? '−' : '＋'}
              </button>
            </div>
            <div className="team-board-filters" hidden={!filtersExpanded}>
              <label>
                担当
                <select
                  aria-label="作業一覧の担当"
                  value={view.assignee}
                  onChange={(e) =>
                    update({
                      assignee: e.target.value,
                    })
                  }
                >
                  <option value="">全員</option>
                  <option value="__none">未割り当て</option>
                  {state.teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                      {m.active ? '' : '（休止）'}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                種類
                <select
                  aria-label="作業一覧の種類"
                  value={view.kind || ''}
                  onChange={(e) =>
                    update({
                      kind: e.target.value,
                    })
                  }
                >
                  <option value="">すべての種類</option>
                  <option value="maintenance">点検・保守</option>
                  {Object.entries(kindNames).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                状態
                <select
                  aria-label="作業一覧の状態"
                  value={view.status}
                  onChange={(e) =>
                    update({
                      status: e.target.value,
                    })
                  }
                >
                  <option value="open">未完了すべて</option>
                  <option value="all">すべて（完了・中止も含む）</option>
                  {Object.entries(statusNames).map(([id, name]) => (
                    <option key={id} value={id === 'open' ? 'only_open' : id}>
                      {id === 'open' ? '未着手のみ' : name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                優先度
                <select
                  aria-label="作業一覧の優先度"
                  value={view.priority}
                  onChange={(e) =>
                    update({
                      priority: e.target.value,
                    })
                  }
                >
                  <option value="">すべて</option>
                  {Object.entries(priorityNames).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                絞り込み
                <select
                  aria-label="作業一覧の期限条件"
                  value={view.range}
                  onChange={(e) =>
                    update({
                      range: e.target.value,
                    })
                  }
                >
                  <option value="">指定なし</option>
                  {Object.entries({
                    overdue: '期限超過',
                    today: '今日が期限',
                    week: '7日以内',
                    unassigned: '未割り当て',
                    unscheduled: '期限未設定',
                  }).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                案件
                <select
                  aria-label="作業一覧の案件"
                  value={view.project || ''}
                  onChange={(e) =>
                    update({
                      project: e.target.value,
                    })
                  }
                >
                  <option value="">すべての案件</option>
                  {state.projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                着手条件
                <select
                  aria-label="作業一覧の着手条件"
                  value={view.readiness || ''}
                  onChange={(e) =>
                    update({
                      readiness: e.target.value,
                    })
                  }
                >
                  <option value="">指定なし</option>
                  <option value="blocked">先行作業待ち</option>
                  <option value="ready">着手できる仕事</option>
                </select>
              </label>
              <label>
                図面
                <select
                  aria-label="作業一覧の図面"
                  value={view.drawing}
                  onChange={(e) =>
                    update({
                      drawing: e.target.value,
                    })
                  }
                >
                  <option value="">すべて</option>
                  {state.drawings.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => {
                  if (view.myMember) {
                    update({
                      assignee: view.myMember,
                      status: 'open',
                      range: '',
                    });
                  } else {
                    setTab('members');
                    setMessage(
                      '名簿の「自分として表示」を選ぶと、自分の担当へすぐ切り替えられます。',
                    );
                  }
                }}
              >
                自分の担当
              </button>
              <button
                onClick={() =>
                  update({
                    ...defaultView,
                    myMember: view.myMember,
                    layout: view.layout,
                  })
                }
              >
                条件をクリア
              </button>
            </div>
            <div className="work-list-meta">
              <span>
                {filtered.length}件{view.query && ' · 検索中'}
                {view.project &&
                  ' · ' + (state.projects.find((p) => p.id === view.project)?.name || '案件')}
              </span>
              <label>
                並び順
                <select
                  aria-label="タスクの並び順"
                  value={view.sort || 'priority'}
                  onChange={(e) =>
                    update({
                      sort: e.target.value,
                    })
                  }
                >
                  <option value="priority">期限超過・優先度</option>
                  <option value="due">期限が近い順</option>
                  <option value="title">タスク名順</option>
                </select>
              </label>
              <small>N：追加 /：検索{view.layout === 'board' ? ' · ドラッグで状態変更' : ''}</small>
            </div>
            {view.layout === 'board' && (
              <TaskBoard state={state} filtered={filtered} limit={limit} move={move} open={open} />
            )}
            {view.layout === 'list' && (
              <TaskList
                state={state}
                filtered={filtered}
                limit={limit}
                selected={selected}
                setSelected={setSelected}
                bulkAssignee={bulkAssignee}
                setBulkAssignee={setBulkAssignee}
                busy={busy}
                bulk={bulk}
                edit={edit}
                open={open}
                move={move}
                patchTask={patchTask}
                quickAdd={quickAdd}
                quickTitle={quickTitle}
                setQuickTitle={setQuickTitle}
              />
            )}
            {view.layout === 'week' && (
              <TaskWeek
                state={state}
                filtered={filtered}
                week={week}
                setWeek={setWeek}
                setEdit={setEdit}
                open={open}
              />
            )}
            {filtered.length > limit && view.layout !== 'week' && (
              <button className="team-load-more" onClick={() => setLimit(limit + 50)}>
                さらに50件表示
              </button>
            )}
            {!filtered.length && (
              <div className="team-empty">
                <strong>条件に合う作業はありません。</strong>
                <p>仕事を追加するか、表示条件を変えて確認してください。</p>
              </div>
            )}
          </section>
        </>
      )}
      {tab === 'projects' && (
        <Projects
          state={state}
          onRefresh={onRefresh}
          onShowTasks={(id) => {
            update({
              project: id,
              status: 'open',
              range: '',
              readiness: '',
              assignee: '',
              kind: '',
              query: '',
            });
            setTab('board');
          }}
          onNewTask={(initial) =>
            setEdit({
              initial,
            })
          }
        />
      )}
      {tab === 'history' && (
        <InspectionRecords
          state={state}
          onOpenTask={open}
          onNewTask={(initial) =>
            setEdit({
              initial,
            })
          }
        />
      )}
      {tab === 'plans' && <Plans state={state} onRefresh={onRefresh} onOpenTask={open} />}
      {tab === 'members' && (
        <Members
          state={state}
          report={report}
          onRefresh={onRefresh}
          myMember={view.myMember}
          onUse={(id) => {
            update({
              myMember: id,
              assignee: id,
              status: 'open',
              range: '',
            });
            setTab('board');
          }}
          onFilter={(id) => {
            update({
              assignee: id || '__none',
              status: 'open',
              range: '',
            });
            setTab('board');
          }}
        />
      )}
      {tab === 'handover' && <Handover />}
      {!state.tasks.length && !state.teamMembers.length && !state.inspectionPlans.length && (
        <section className="team-demo-banner">
          <div>
            <strong>チーム管理をサンプルで試す</strong>
            <p>架空の担当者4人・作業8件・点検計画1件を追加します。既存の設備と工事は保持します。</p>
          </div>
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                await api('/api/team/demo', {
                  method: 'POST',
                  body: {
                    revision: FactoryAPI.revision,
                  },
                });
                await onRefresh();
                setMessage('サンプルの仕事を追加しました。');
              })
            }
          >
            サンプル作業を追加
          </button>
        </section>
      )}
      {edit && (
        <TaskDialog
          key={edit.editorKey}
          state={state}
          record={edit.record}
          initial={edit.initial}
          startComplete={edit.complete}
          guardRef={editorGuard}
          onClose={(force) => setEdit(null, force)}
          onRefresh={onRefresh}
          onOpenTask={(t) =>
            setEdit({
              record: t,
            })
          }
          onAddChild={(initial) =>
            setEdit({
              initial,
            })
          }
        />
      )}
    </div>
  );
}
