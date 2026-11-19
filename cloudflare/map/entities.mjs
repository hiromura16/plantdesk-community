/** 台帳レコードの作成・更新・削除を、保存前の下書きへ適用する業務処理。 */
import { ApiError } from '../core.mjs';
import { makeProject } from '../workflow.mjs';
import { makeTask } from '../team.mjs';
import { now } from './http.mjs';
function mutate(state, kind, id, method, input) {
  const key = kind === 'properties' ? 'propertyDefinitions' : kind;
  const list = state[key];
  if (!list) {
    throw new ApiError(404, '対象がありません。');
  }
  let record;
  const index = list.findIndex((x) => x.id === id);
  if (method === 'POST' && ['tasks', 'projects'].includes(key)) {
    record = (key === 'tasks' ? makeTask : makeProject)(input);
    if (list.some((x) => x.id === record.id)) {
      throw new ApiError(409, 'IDが重複しています。');
    }
    list.push(record);
  } else if (method === 'POST') {
    record = {
      ...input,
      id: input.id || crypto.randomUUID(),
      updatedAt: now(),
    };
    if (list.some((x) => x.id === record.id)) {
      throw new ApiError(409, 'IDが重複しています。');
    }
    if (key === 'assets') {
      record.history ??= [];
      record.attachments ??= [];
      record.properties ??= {};
    }
    list.push(record);
  } else if (index < 0) {
    throw new ApiError(404, '対象が見つかりません。');
  } else if (method === 'PATCH' && ['tasks', 'projects'].includes(key)) {
    record = (key === 'tasks' ? makeTask : makeProject)(input, list[index]);
    list[index] = record;
  } else if (method === 'PATCH') {
    record = {
      ...list[index],
      ...input,
      id,
      updatedAt: now(),
    };
    list[index] = record;
  } else if (method === 'DELETE') {
    if (
      key === 'assets' &&
      (state.tasks.some((t) => t.assetId === id) ||
        state.inspectionPlans.some((p) => p.assetIds.includes(id)))
    ) {
      throw new ApiError(409, '作業・点検計画で使用中の設備です。先に関連を整理してください。');
    }
    if (key === 'works' && state.tasks.some((t) => t.workId === id)) {
      throw new ApiError(409, '作業から参照されています。先に関連工事の指定を外してください。');
    }
    if (
      key === 'teamMembers' &&
      (state.tasks.some((t) => t.assigneeId === id) ||
        state.inspectionPlans.some((p) => p.assigneeId === id))
    ) {
      throw new ApiError(
        409,
        '担当作業が残っています。担当者を休止するか、割り当てを変更してください。',
      );
    }
    record = list.splice(index, 1)[0];
    if (key === 'propertyDefinitions') {
      state.assets.forEach((a) => delete a.properties[id]);
    }
    if (key === 'assets') {
      state.works.forEach((w) => (w.assetIds = (w.assetIds || []).filter((x) => x !== id)));
    }
    if (key === 'layers') {
      for (const set of state.layerSets) {
        set.rules = set.rules.filter((r) => r.layerId !== id);
      }
    }
    if (key === 'layers') {
      for (const x of [...state.assets, ...state.works, ...state.notes, ...state.drawingLinks]) {
        if (x.layerId === id) {
          delete x.layerId;
        }
      }
    }
  } else {
    throw new ApiError(405, 'この操作に対応していません。');
  }
  return record;
}
export { mutate };
