/** マップ機能の構成と起動順だけを定義します。共有状態と機能間の呼び出しは引数で明示します。 */
import { createMapRuntime } from './runtime.js';
import { createStateController } from './state-controller.js';
import { createRenderer } from './renderer.js';
import { createDrawings } from './drawings.js';
import { createWorkEditor } from './work-editor.js';
import { createStartup } from './startup.js';
export default async function startMap() {
  const runtime = createMapRuntime();
  /** 全モジュールを接続してから初期化し、作成途中の操作を呼ばないようにします。 */
  const actions = /** @type {import('./actions').MapActions} */ ({});
  Object.assign(actions, createStateController(runtime, actions));
  Object.assign(actions, createRenderer(runtime, actions));
  Object.assign(actions, createDrawings(runtime, actions));
  Object.assign(actions, createWorkEditor(runtime, actions));
  Object.assign(actions, createStartup(runtime, actions));
  return actions.init();
}
