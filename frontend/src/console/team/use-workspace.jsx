import { csvText } from '../../../../shared/csv.js';
import { findQuery as domFind } from '../../runtime/dom.ts';
import { defaultView } from './view-model.js';
/** タスクの取得・条件・編集対象と保存を管理するフック。詳細切り替えと個人設定の競合を制御します。 */
import FactoryAPI from '../../shared/api-client.js';
import {
  addDays,
  api,
  assigneeName,
  compareTasks,
  dependencyBlockers,
  kindNames,
  openTask,
  priorityNames,
  statusNames,
  today,
  writeFile,
} from '../team-shared.jsx';
import { useEffectEvent, useEffect, useRef, useState } from 'react';
import { useTaskEditor } from '../team-task.jsx';
function useReport(state) {
  const [report, setReport] = useState(
    /** @type {import('../../../../shared/model').TeamReport|null} */ (null),
  );
  const [error, setError] = useState('');
  useEffect(() => {
    let current = true;
    api('/api/team/report')
      .then((r) => {
        if (current) {
          setReport(r);
          setError('');
        }
      })
      .catch((e) => {
        if (current) {
          setError(e.message);
        }
      });
    return () => {
      current = false;
    };
  }, [state]);
  return /** @type {const} */ ([report, error]);
}
export function useTeamWorkspace({ state, session, onRefresh, focusId, initialFocus }) {
  const [edit, setEdit, editorGuard] = useTaskEditor();
  const [tab, setTab] = useState(
    ['projects', 'plans', 'history', 'members', 'handover'].includes(
      new URL(location.href).searchParams.get('teamTab') || '',
    )
      ? new URL(location.href).searchParams.get('teamTab')
      : 'board',
  );
  const [view, setView] = useState(defaultView);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [week, setWeek] = useState(today());
  const [limit, setLimit] = useState(50);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [report, reportError] = useReport(state);
  const prefsQueue = useRef(Promise.resolve());
  const shortcutEdit = useEffectEvent(() => setEdit({}));
  useEffect(() => {
    const key = (e) => {
      if (
        domFind('dialog[open]') ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '') ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        shortcutEdit();
      }
      if (e.key === '/') {
        e.preventDefault();
        domFind('[aria-label="チームの作業を検索"]')?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);
  const saveView = (next) => {
    prefsQueue.current = prefsQueue.current
      .catch(() => {})
      .then(async () => {
        const p = await api('/api/preferences');
        await api('/api/preferences', {
          method: 'PUT',
          body: {
            ...p.preferences,
            teamBoard: next,
          },
        });
      })
      .catch((e) => setMessage(e.message));
  };
  const hasProject = useEffectEvent((id) => state.projects?.some((p) => p.id === id));
  useEffect(() => {
    let valid = true;
    api('/api/preferences')
      .then((r) => {
        if (!valid) {
          return;
        }
        const saved = {
          ...defaultView,
          ...r.preferences.teamBoard,
        };
        const linked = new URL(location.href).searchParams.get('project');
        if (linked && hasProject(linked)) {
          Object.assign(saved, {
            project: linked,
            status: 'open',
            range: '',
            readiness: '',
            assignee: '',
            kind: '',
            query: '',
          });
          setTab('board');
        }
        if (initialFocus) {
          setTab('board');
          saved.query = '';
          saved.range = ['overdue', 'unassigned'].includes(initialFocus) ? initialFocus : '';
          saved.status =
            initialFocus === 'waiting' ? 'waiting' : initialFocus === 'done' ? 'done' : 'open';
          saved.assignee = initialFocus.startsWith('member:') ? initialFocus.slice(7) : '';
          saved.kind = '';
          saved.project = '';
          saved.readiness = '';
          if (initialFocus === 'members') {
            setTab('members');
          }
          if (initialFocus === 'inspections') {
            setTab('history');
          }
        }
        setView(saved);
        setReady(true);
      })
      .catch((e) => setMessage(e.message));
    return () => {
      valid = false;
    };
  }, [session.profile, initialFocus]);
  useEffect(() => {
    if (!ready) {
      return;
    }
    const timer = setTimeout(() => saveView(view), 400);
    return () => clearTimeout(timer);
  }, [view, ready]);
  const focusTask = useEffectEvent(() => {
    if (focusId) {
      const t = state.tasks.find((t) => t.id === focusId);
      if (t) {
        setEdit({
          record: t,
        });
      }
    }
  });
  useEffect(() => {
    focusTask();
  }, [focusId]);
  const openLinked = useEffectEvent(() => {
    const url = new URL(location.href);
    const asset = url.searchParams.get('newTaskAsset');
    const work = url.searchParams.get('newTaskWork');
    const task = url.searchParams.get('task');
    if (asset || work) {
      const a = state.assets.find((a) => a.id === asset);
      const w = state.works.find((w) => w.id === work);
      setEdit({
        initial: {
          assetId: a?.id || '',
          workId: w?.id || '',
          drawingId: a?.drawingId || w?.drawingId || '',
          title: a ? a.name + 'の確認' : w ? w.title + 'の調整' : '',
        },
      });
    } else if (task) {
      const t = state.tasks.find((t) => t.id === task);
      if (t) {
        setEdit({
          record: t,
        });
      }
    }
    if (asset || work || task) {
      for (const k of ['newTaskAsset', 'newTaskWork', 'task']) {
        url.searchParams.delete(k);
      }
      history.replaceState(null, '', url);
    }
  });
  useEffect(() => {
    openLinked();
  }, []);
  const update = (patch) => {
    setView((v) => ({
      ...v,
      ...patch,
    }));
    setLimit(50);
    setSelected(new Set());
  };
  const run = async (fn) => {
    setBusy(true);
    setMessage('');
    try {
      await fn();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const filtered = state.tasks
    .filter((t) => {
      if (
        view.kind &&
        (view.kind === 'maintenance'
          ? !['inspection', 'repair'].includes(t.kind)
          : t.kind !== view.kind)
      ) {
        return false;
      }
      if (view.project && t.projectId !== view.project) {
        return false;
      }
      if (
        (view.readiness === 'blocked' && !dependencyBlockers(state, t).length) ||
        (view.readiness === 'ready' &&
          (dependencyBlockers(state, t).length || !openTask(t) || t.status === 'waiting'))
      ) {
        return false;
      }
      if (
        (view.status === 'open' && !openTask(t)) ||
        (view.status === 'only_open' && t.status !== 'open') ||
        (view.status &&
          view.status !== 'open' &&
          view.status !== 'only_open' &&
          view.status !== 'all' &&
          t.status !== view.status)
      ) {
        return false;
      }
      if (
        view.assignee &&
        (view.assignee === '__none' ? !!t.assigneeId : t.assigneeId !== view.assignee)
      ) {
        return false;
      }
      if (view.priority && t.priority !== view.priority) {
        return false;
      }
      if (view.drawing && t.drawingId !== view.drawing) {
        return false;
      }
      if (
        (view.range === 'overdue' && (!openTask(t) || !t.dueDate || t.dueDate >= today())) ||
        (view.range === 'today' && t.dueDate !== today()) ||
        (view.range === 'week' &&
          (!t.dueDate || t.dueDate < today() || t.dueDate > addDays(today(), 7))) ||
        (view.range === 'unassigned' && !!t.assigneeId) ||
        (view.range === 'unscheduled' && !!t.dueDate)
      ) {
        return false;
      }
      const a = state.assets.find((a) => a.id === t.assetId);
      const w = state.works.find((w) => w.id === t.workId);
      const text = [
        t.title,
        t.description,
        t.blocker,
        t.requestor,
        t.acceptanceCriteria,
        state.projects?.find((p) => p.id === t.projectId)?.name,
        a?.name,
        a?.code,
        w?.title,
        assigneeName(state, t.assigneeId),
      ]
        .join(' ')
        .normalize('NFKC')
        .toLocaleLowerCase();
      return view.query
        .normalize('NFKC')
        .trim()
        .toLocaleLowerCase()
        .split(/\s+/)
        .every((q) => text.includes(q));
    })
    .sort(
      view.sort === 'due'
        ? (a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')
        : view.sort === 'title'
          ? (a, b) => a.title.localeCompare(b.title, 'ja')
          : compareTasks,
    );
  const move = (task, status) => {
    if (busy || edit || task.inspectionId) {
      return;
    }
    if (status === task.status) {
      return;
    }
    if (status === 'waiting') {
      setEdit({
        record: {
          ...task,
          status: 'waiting',
        },
      });
      return;
    }
    if (status === 'done') {
      setEdit({
        record: task,
        complete: true,
      });
      return;
    }
    run(async () => {
      await api('/api/tasks/' + task.id, {
        method: 'PATCH',
        body: {
          revision: FactoryAPI.revision,
          record: {
            status,
          },
        },
      });
      await onRefresh();
    });
  };
  const bulk = (record) =>
    run(async () => {
      if (selected.size > 100) {
        throw new Error('一括変更は100件までです。');
      }
      await api('/api/batch', {
        method: 'POST',
        body: {
          revision: FactoryAPI.revision,
          operations: [...selected].map((id) => ({
            kind: 'tasks',
            id,
            method: 'PATCH',
            record,
          })),
        },
      });
      setSelected(new Set());
      await onRefresh();
      setMessage('選択した作業を更新しました。');
    });
  const exportCSV = () => {
    const rows = [
      [
        '作業名',
        '種類',
        '状態',
        '優先度',
        '担当者',
        '期限',
        '見積時間（分）',
        '対象設備',
        '手配待ちの理由',
      ],
      ...filtered.map((t) => [
        t.title,
        kindNames[t.kind],
        statusNames[t.status],
        priorityNames[t.priority],
        assigneeName(state, t.assigneeId),
        t.dueDate,
        t.estimatedMinutes,
        state.assets.find((a) => a.id === t.assetId)?.code || '',
        t.blocker,
      ]),
    ];
    writeFile('チームの作業-' + today() + '.csv', csvText(rows), 'text/csv;charset=utf-8');
  };
  const open = (t) =>
    setEdit({
      record: t,
    });
  const patchTask = (t, record) =>
    run(async () => {
      await api('/api/tasks/' + t.id, {
        method: 'PATCH',
        body: {
          revision: FactoryAPI.revision,
          record,
        },
      });
      await onRefresh();
    });
  const quickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim() || busy || edit) {
      return;
    }
    if (view.kind === 'maintenance' || view.kind === 'inspection') {
      setEdit({
        initial: {
          title: quickTitle.trim(),
          kind: 'inspection',
        },
      });
      setQuickTitle('');
      return;
    }
    run(async () => {
      await api('/api/tasks', {
        method: 'POST',
        body: {
          revision: FactoryAPI.revision,
          record: {
            title: quickTitle.trim(),
            kind: ['task', 'inspection', 'repair', 'coordination'].includes(view.kind)
              ? view.kind
              : 'task',
            assigneeId: view.assignee && view.assignee !== '__none' ? view.assignee : '',
            projectId: view.project || '',
            dueDate: view.range === 'today' ? today() : '',
          },
        },
      });
      setQuickTitle('');
      update({
        status: 'open',
        range: '',
        query: '',
      });
      await onRefresh();
    });
  };
  const quickViews = [
    [
      '未完了',
      {
        status: 'open',
        range: '',
        kind: '',
        assignee: '',
      },
    ],
    [
      '今日',
      {
        status: 'open',
        range: 'today',
        kind: '',
        assignee: '',
      },
    ],
    [
      '期限超過',
      {
        status: 'open',
        range: 'overdue',
        kind: '',
        assignee: '',
      },
    ],
    [
      '担当未定',
      {
        status: 'open',
        range: 'unassigned',
        kind: '',
        assignee: '',
      },
    ],
    [
      '点検・保守',
      {
        status: 'open',
        range: '',
        kind: 'maintenance',
        assignee: '',
      },
    ],
    [
      '完了',
      {
        status: 'done',
        range: '',
        kind: '',
        assignee: '',
      },
    ],
  ];
  return {
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
  };
}
