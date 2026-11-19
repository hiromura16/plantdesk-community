/**
 * 台帳の永続化。設備・工事・図面・点検をレコード単位にし、変更した行だけを書き込みます。
 * APIへ返す配列の順番はordinalで保持し、設備の点検履歴は親設備IDで関連付けます。
 */
const collections = [
  'drawings',
  'works',
  'assets',
  'propertyDefinitions',
  'notes',
  'layers',
  'drawingLinks',
  'layerSets',
  'teamMembers',
  'tasks',
  'inspectionPlans',
  'projects',
];
const collectionSQL = collections.map((value) => "'" + value + "'").join(',');
/** 新規デモと既存JSONを同じ手順で取り込む。すべて同一batch内で実行します。 */
export function initializeWorkspace(db, organizationId) {
  return [
    db
      .prepare(
        `INSERT INTO map_records(organization_id,collection,id,parent_id,ordinal,record_json,drawing_id,status,due_date)
      SELECT o.id,c.key,json_extract(r.value,'$.id'),'',CAST(r.key AS INTEGER),
      CASE WHEN c.key='assets' THEN json_remove(r.value,'$.history') ELSE r.value END,
      json_extract(r.value,'$.drawingId'),json_extract(r.value,'$.status'),COALESCE(json_extract(r.value,'$.dueDate'),json_extract(r.value,'$.end'))
      FROM organizations o,json_each(o.state_json) c,json_each(c.value) r
      WHERE o.id=? AND json_extract(o.state_json,'$.version')=2 AND c.key IN (${collectionSQL}) AND NOT EXISTS(SELECT 1 FROM map_workspaces WHERE organization_id=o.id)`,
      )
      .bind(organizationId),
    db
      .prepare(
        `INSERT INTO map_records(organization_id,collection,id,parent_id,ordinal,record_json)
      SELECT o.id,'maintenance',json_extract(h.value,'$.id'),json_extract(a.value,'$.id'),CAST(h.key AS INTEGER),h.value
      FROM organizations o,json_each(o.state_json,'$.assets') a,json_each(a.value,'$.history') h
      WHERE o.id=? AND json_extract(o.state_json,'$.version')=2 AND NOT EXISTS(SELECT 1 FROM map_workspaces WHERE organization_id=o.id)`,
      )
      .bind(organizationId),
    db
      .prepare(
        "INSERT OR IGNORE INTO map_workspaces(organization_id,version) SELECT id,2 FROM organizations WHERE id=? AND json_extract(state_json,'$.version')=2",
      )
      .bind(organizationId),
    db
      .prepare(
        "UPDATE organizations SET state_json='{}' WHERE id=? AND EXISTS(SELECT 1 FROM map_workspaces WHERE organization_id=?)",
      )
      .bind(organizationId, organizationId),
  ];
}
/** 親のrevisionと子レコードを同じDBスナップショットから読む。読取り途中の更新による混在を避けます。 */
export async function readWorkspace(env, organization) {
  const [head, rows] = await env.DB.batch([
    env.DB.prepare(
      'SELECT o.*,w.version AS map_version FROM organizations o LEFT JOIN map_workspaces w ON w.organization_id=o.id WHERE o.id=?',
    ).bind(organization.id),
    env.DB.prepare(
      'SELECT collection,id,parent_id,ordinal,record_json FROM map_records WHERE organization_id=? ORDER BY collection,parent_id,ordinal,id',
    ).bind(organization.id),
  ]);
  const current = head.results[0];
  Object.assign(organization, current);
  if (!current.map_version) {
    return JSON.parse(current.state_json);
  }
  /** @type {import('../../shared/model').WorkspaceState} */
  const state = {
    version: 2,
    drawings: [],
    works: [],
    assets: [],
    propertyDefinitions: [],
    notes: [],
    layers: [],
    drawingLinks: [],
    layerSets: [],
    teamMembers: [],
    tasks: [],
    inspectionPlans: [],
    projects: [],
  };
  const histories = new Map();
  for (const row of rows.results) {
    const record = JSON.parse(row.record_json);
    if (row.collection === 'maintenance') {
      if (!histories.has(row.parent_id)) {
        histories.set(row.parent_id, []);
      }
      histories.get(row.parent_id).push(record);
    } else if (collections.includes(row.collection)) {
      state[row.collection].push(record);
    }
  }
  for (const asset of state.assets) {
    asset.history = histories.get(asset.id) || [];
  }
  return state;
}
function flatten(state) {
  const records = new Map();
  function add(collection, record, ordinal, parentId = '') {
    const { history, ...asset } = record;
    const value = collection === 'assets' ? asset : record;
    const row = {
      collection,
      id: record.id,
      parentId,
      ordinal,
      json: JSON.stringify(value),
      drawingId: record.drawingId || null,
      status: record.status || null,
      dueDate: record.dueDate || record.end || null,
    };
    records.set(JSON.stringify([collection, parentId, record.id]), row);
    if (collection === 'assets') {
      for (const [index, item] of (history || []).entries()) {
        add('maintenance', item, index, record.id);
      }
    }
  }
  for (const collection of collections) {
    for (const [index, record] of (state[collection] || []).entries()) {
      add(collection, record, index);
    }
  }
  return records;
}
/** レコード差分も履歴も親revisionの比較条件を共有し、競合時に一部だけ保存されないようにします。 */
export function recordChanges(db, c, next, expected) {
  const before = flatten(c.state),
    after = flatten(next);
  const changed = [...after]
    .filter(([key, row]) => {
      const previous = before.get(key);
      return !previous || previous.json !== row.json || previous.ordinal !== row.ordinal;
    })
    .map(([, row]) => row);
  const removed = [...before]
    .filter(([key]) => !after.has(key))
    .map(([, row]) => ({ collection: row.collection, id: row.id, parentId: row.parentId }));
  return [
    db
      .prepare(
        `DELETE FROM map_records WHERE organization_id=? AND EXISTS(SELECT 1 FROM json_each(?) d WHERE json_extract(d.value,'$.collection')=map_records.collection AND json_extract(d.value,'$.id')=map_records.id AND json_extract(d.value,'$.parentId')=map_records.parent_id) AND EXISTS(SELECT 1 FROM organizations WHERE id=? AND revision=? AND plan=?)`,
      )
      .bind(c.org.id, JSON.stringify(removed), c.org.id, expected, c.org.plan),
    db
      .prepare(
        `INSERT INTO map_records(organization_id,collection,id,parent_id,ordinal,record_json,drawing_id,status,due_date)
      SELECT ?,json_extract(r.value,'$.collection'),json_extract(r.value,'$.id'),json_extract(r.value,'$.parentId'),json_extract(r.value,'$.ordinal'),json_extract(r.value,'$.json'),json_extract(r.value,'$.drawingId'),json_extract(r.value,'$.status'),json_extract(r.value,'$.dueDate')
      FROM json_each(?) r WHERE EXISTS(SELECT 1 FROM organizations WHERE id=? AND revision=? AND plan=?)
      ON CONFLICT(organization_id,collection,parent_id,id) DO UPDATE SET ordinal=excluded.ordinal,record_json=excluded.record_json,drawing_id=excluded.drawing_id,status=excluded.status,due_date=excluded.due_date`,
      )
      .bind(c.org.id, JSON.stringify(changed), c.org.id, expected, c.org.plan),
  ];
}
