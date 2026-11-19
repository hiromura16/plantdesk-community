/** レコード検索・一括操作・点検履歴・設備と工事などの個別CRUD。 */
import { ApiError } from '../../core.mjs';
import { TEAM_COLLECTIONS } from '../../team.mjs';
import { commit } from '../repository.mjs';
import { editable } from '../context.mjs';
import { json, readJSON } from '../http.mjs';
import { mutate } from '../entities.mjs';
import { visibleState } from '../../map-validation.mjs';
export async function handleRecords({ request, env, c, state, url, path, method }) {
  if (path === '/api/search' && method === 'GET') {
    const q = (url.searchParams.get('q') || '').toLocaleLowerCase();
    const s = visibleState(state, c.editor);
    const items = ['works', 'assets', 'drawings', 'notes'].flatMap((kind) =>
      s[kind]
        .filter((x) => JSON.stringify(x).toLocaleLowerCase().includes(q))
        .map((record) => ({
          kind,
          record,
        })),
    );
    return json({
      items: items.slice(0, 200),
      total: items.length,
    });
  }
  if (path === '/api/batch' && method === 'POST') {
    editable(c);
    const input = await readJSON(request);
    if (!Array.isArray(input.operations) || input.operations.length > 100) {
      throw new ApiError(422, '一括操作は100件までです。');
    }
    const next = structuredClone(state);
    const results = [];
    for (const o of input.operations) {
      const kind = o.kind || o.collection;
      const op = o.operation || o.action;
      const method =
        o.method ||
        {
          create: 'POST',
          update: 'PATCH',
          delete: 'DELETE',
        }[op];
      results.push(mutate(next, kind, o.id, method, o.record || o.data || {}));
    }
    if (
      input.operations.some((o) => TEAM_COLLECTIONS.includes(o.kind || o.collection)) &&
      !Number.isSafeInteger(input.revision)
    ) {
      throw new ApiError(422, 'revisionが必要です。');
    }
    return json({
      results,
      revision: await commit(env, c, next, 'batch.update', input.revision),
    });
  }
  const history = path.match(/^\/api\/assets\/([^/]+)\/maintenance(?:\/([^/]+))?$/);
  if (history) {
    editable(c);
    const next = structuredClone(state);
    const a = next.assets.find((x) => x.id === history[1]);
    if (!a) {
      throw new ApiError(404, '設備がありません。');
    }
    if (method === 'GET') {
      return json({
        items: a.history,
      });
    }
    const input = method === 'DELETE' ? {} : await readJSON(request);
    let record;
    const i = a.history.findIndex((h) => h.id === history[2]);
    if (method === 'POST') {
      record = {
        ...input,
        id: input.id || crypto.randomUUID(),
      };
      a.history.unshift(record);
    } else if (i < 0) {
      throw new ApiError(404, '点検履歴がありません。');
    } else if (method === 'PATCH') {
      record = {
        ...a.history[i],
        ...input,
        id: history[2],
      };
      a.history[i] = record;
    } else if (method === 'DELETE') {
      record = a.history.splice(i, 1)[0];
    }
    return json({
      record,
      revision: await commit(env, c, next, 'inspection.' + method.toLowerCase()),
    });
  }
  const entity = path.match(
    /^\/api\/(drawings|works|assets|properties|notes|layers|drawingLinks|layerSets)(?:\/([^/]+))?$/,
  );
  if (entity) {
    const [, kind, id] = entity;
    const key = kind === 'properties' ? 'propertyDefinitions' : kind;
    if (method === 'GET') {
      if (['assets', 'properties'].includes(kind) && !c.editor) {
        throw new ApiError(403, '施設担当モードに切り替えてください。');
      }
      let list = visibleState(state, c.editor)[key];
      if (id) {
        const record = list.find((x) => x.id === id);
        if (!record) {
          throw new ApiError(404, '対象が見つかりません。');
        }
        return json({
          record,
          revision: c.org.revision,
        });
      }
      const q = (url.searchParams.get('q') || '').toLocaleLowerCase();
      const drawing = url.searchParams.get('drawingId');
      list = list.filter(
        (x) =>
          (!drawing || x.drawingId === drawing) &&
          (!q || JSON.stringify(x).toLocaleLowerCase().includes(q)),
      );
      return json({
        items: list.slice(0, 1000),
        total: list.length,
      });
    }
    editable(c);
    const next = structuredClone(state);
    const input = method === 'DELETE' ? {} : await readJSON(request);
    const record = mutate(next, kind, id, method, input);
    return json(
      {
        record,
        revision: await commit(env, c, next, kind + '.' + method.toLowerCase()),
      },
      method === 'POST' ? 201 : 200,
    );
  }
}
