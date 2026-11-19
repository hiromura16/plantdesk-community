-- 台帳の配列と点検履歴を行へ分離。APIの配列順序と所属アカウントを保持します。
CREATE TABLE map_workspaces (
  organization_id TEXT PRIMARY KEY REFERENCES organizations(id),
  version INTEGER NOT NULL CHECK(version=2)
);
CREATE TABLE map_records (
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  parent_id TEXT NOT NULL DEFAULT '',
  ordinal INTEGER NOT NULL,
  record_json TEXT NOT NULL CHECK(json_valid(record_json)),
  drawing_id TEXT,
  status TEXT,
  due_date TEXT,
  PRIMARY KEY(organization_id,collection,parent_id,id)
);
CREATE INDEX map_records_drawing ON map_records(organization_id,collection,drawing_id);
CREATE INDEX map_records_schedule ON map_records(organization_id,collection,status,due_date);
INSERT INTO map_records(organization_id,collection,id,parent_id,ordinal,record_json,drawing_id,status,due_date)
SELECT o.id,c.key,json_extract(r.value,'$.id'),'',CAST(r.key AS INTEGER),
 CASE WHEN c.key='assets' THEN json_remove(r.value,'$.history') ELSE r.value END,
 json_extract(r.value,'$.drawingId'),json_extract(r.value,'$.status'),COALESCE(json_extract(r.value,'$.dueDate'),json_extract(r.value,'$.end'))
FROM organizations o,json_each(o.state_json) c,json_each(c.value) r
WHERE json_extract(o.state_json,'$.version')=2
 AND c.key IN ('drawings','works','assets','propertyDefinitions','notes','layers','drawingLinks','layerSets','teamMembers','tasks','inspectionPlans','projects');
INSERT INTO map_records(organization_id,collection,id,parent_id,ordinal,record_json)
SELECT o.id,'maintenance',json_extract(h.value,'$.id'),json_extract(a.value,'$.id'),CAST(h.key AS INTEGER),h.value
FROM organizations o,json_each(o.state_json,'$.assets') a,json_each(a.value,'$.history') h
WHERE json_extract(o.state_json,'$.version')=2;
INSERT INTO map_workspaces(organization_id,version) SELECT id,2 FROM organizations WHERE json_extract(state_json,'$.version')=2;
-- v1 APIの独立したワークスペースはそのまま残す。現行マップの巨大JSONは重複保持しません。
UPDATE organizations SET state_json='{}' WHERE id IN (SELECT organization_id FROM map_workspaces);
