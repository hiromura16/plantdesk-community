/** 台帳の取得・検索条件・選択・保存を管理するフック。表示部品は同じ結果を受け取って描画します。 */
import { api, latest, nextDate, normalize, propertyValue, today } from './model.js';
import { createRegisterColumns } from './columns.js';
import { useEffect, useMemo, useRef, useState } from 'react';
export function useRegister({ kind, state, session, onRefresh, exportRows, initialCondition }) {
  const equipment = kind === 'equipment';
  const defs = state.propertyDefinitions || [];
  const categoryDef = defs.find((d) => d.id === 'category');
  const columns = useMemo(
    () =>
      createRegisterColumns({
        kind,
        state,
      }),
    [kind, state],
  );
  const defaults = useMemo(
    () =>
      equipment
        ? ['code', 'name', 'category', 'location', 'nextDate', 'locks']
        : ['code', 'title', 'status', 'location', 'start', 'end', 'contact'],
    [equipment],
  );
  const [view, setView] = useState({
    columns: defaults,
    sort: equipment ? 'code' : 'start',
    descending: false,
    filters: {},
    pageSize: 50,
  });
  const [, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [deleted, setDeleted] = useState([]);
  const [deletedOffset, setDeletedOffset] = useState(/** @type {number|null} */ (null));
  const [history, setHistory] = useState(() => {
    const id = new URL(location.href).searchParams.get('work');
    if (!equipment && id) {
      return (
        state.works.find((w) => w.id === id) || {
          id,
          title: '工事の履歴',
        }
      );
    }
    return null;
  });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [targetLayer, setTargetLayer] = useState('');
  const [bulkStatus, setBulkStatus] = useState('done');
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const saveChain = useRef(Promise.resolve());
  const saveVersion = useRef(0);
  useEffect(() => {
    let valid = true;
    api('/api/preferences')
      .then((r) => {
        if (!valid) {
          return;
        }
        const saved = r.preferences.tableViews?.[kind];
        if (saved) {
          setView((v) => ({
            ...v,
            ...saved,
            columns: saved.columns?.length ? saved.columns : defaults,
            filters: {
              ...(saved.filters || {}),
              ...(initialCondition
                ? {
                    condition: initialCondition,
                  }
                : {}),
            },
          }));
        } else if (initialCondition) {
          setView((v) => ({
            ...v,
            filters: {
              condition: initialCondition,
            },
          }));
        }
        setReady(true);
      })
      .catch((e) => setMessage(e.message));
    if (!equipment) {
      api('/api/work-register')
        .then((r) => {
          if (valid) {
            setDeleted(r.deleted);
            setDeletedOffset(r.nextOffset);
          }
        })
        .catch((e) => setMessage(e.message));
    }
    return () => {
      valid = false;
    };
  }, [kind, session.profile, defaults, equipment, initialCondition]);
  const persist = (next) => {
    const version = ++saveVersion.current;
    setMessage('一覧の表示設定を保存しています…');
    saveChain.current = saveChain.current
      .catch(() => {})
      .then(async () => {
        const current = await api('/api/preferences');
        await api('/api/preferences', {
          method: 'PUT',
          body: {
            ...current.preferences,
            tableViews: {
              ...current.preferences.tableViews,
              [kind]: next,
            },
          },
        });
        if (version === saveVersion.current) {
          setMessage('一覧の表示設定を保存しました。');
        }
      })
      .catch((e) => setMessage(e.message));
  };
  const update = (patch, save = true) => {
    const next = {
      ...view,
      ...patch,
    };
    setView(next);
    setPage(0);
    if (save) {
      persist(next);
    }
  };
  const filter = (key, value, save = true) =>
    update(
      {
        filters: {
          ...view.filters,
          [key]: value,
        },
      },
      save,
    );
  const f = view.filters || {};
  const dateNow = today();
  const rows = (equipment ? state.assets : [...state.works, ...deleted]).filter((row) => {
    if (
      !equipment &&
      (((!f.deleted || f.deleted === 'current') && row.deleted) ||
        (f.deleted === 'deleted' && !row.deleted))
    ) {
      return false;
    }
    if (f.drawing && row.drawingId !== f.drawing) {
      return false;
    }
    if (f.layer && (f.layer === '__unset' ? !!row.layerId : row.layerId !== f.layer)) {
      return false;
    }
    if (equipment && f.category && row.properties?.category !== f.category) {
      return false;
    }
    if (!equipment && f.status && row.status !== f.status) {
      return false;
    }
    if (!equipment && f.condition) {
      const week = new Date(dateNow + 'T00:00:00Z');
      week.setUTCDate(week.getUTCDate() + 7);
      const conditions = {
        late: row.status !== 'done' && row.end < dateNow,
        upcoming: row.status === 'planned' && row.start <= week.toISOString().slice(0, 10),
        traffic: row.impacts?.some((x) => ['通行止め', '車両通行'].includes(x)),
      };
      if (!conditions[f.condition]) {
        return false;
      }
    }
    if (f.from && (equipment ? nextDate(row) : row.start) < f.from) {
      return false;
    }
    if (f.to && (equipment ? nextDate(row) : row.start) > f.to) {
      return false;
    }
    if (equipment && f.condition) {
      const h = latest(row);
      const locked = row.locks?.position || row.locks?.attributes;
      const conditions = {
        due: !!nextDate(row) && nextDate(row) <= dateNow,
        attention: h?.result === 'attention',
        uninspected: !h,
        locked,
        unlocked: !locked,
        photos: row.attachments?.some((a) => a.mime?.startsWith('image/')),
        noFiles: !row.attachments?.length,
      };
      if (!conditions[f.condition]) {
        return false;
      }
    }
    if (equipment && f.property && f.value) {
      const d = defs.find((d) => d.id === f.property);
      if (
        !normalize(propertyValue(d || {}, row.properties?.[f.property])).includes(
          normalize(f.value),
        )
      ) {
        return false;
      }
    }
    const words = normalize(f.query).trim().split(/\s+/).filter(Boolean);
    return words.every((word) =>
      normalize(columns.map((c) => c.value(row)).join(' ')).includes(word),
    );
  });
  const sortColumn = columns.find((c) => c.id === view.sort) || columns[0];
  rows.sort((a, b) => {
    const x = sortColumn.raw?.(a) ?? sortColumn.value(a);
    const y = sortColumn.raw?.(b) ?? sortColumn.value(b);
    const compare =
      typeof x === 'number' && typeof y === 'number'
        ? x - y
        : String(x ?? '').localeCompare(String(y ?? ''), 'ja', {
            numeric: true,
          });
    return view.descending ? -compare : compare;
  });
  const chosen = view.columns.map((id) => columns.find((c) => c.id === id)).filter(Boolean);
  const pageSize = [20, 50, 100].includes(view.pageSize) ? view.pageSize : 50;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const perform = async (fn) => {
    setBusy(true);
    setMessage('');
    try {
      await fn();
      await onRefresh();
      if (!equipment) {
        const r = await api('/api/work-register');
        setDeleted(r.deleted);
        setDeletedOffset(r.nextOffset);
      }
      setSelected(new Set());
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const batch = (record) =>
    perform(async () => {
      if (selected.size > 100) {
        throw new Error('一括操作は100件ずつ実行してください。');
      }
      await api('/api/batch', {
        method: 'POST',
        body: {
          operations: [...selected].map((id) => ({
            kind: equipment ? 'assets' : 'works',
            id,
            method: 'PATCH',
            record,
          })),
        },
      });
      setMessage(selected.size + '件を更新しました。');
    });
  const openMap = (row) =>
    (location.href =
      'index.html?' + (equipment ? 'asset' : 'work') + '=' + encodeURIComponent(row.id));
  return {
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
  };
}
