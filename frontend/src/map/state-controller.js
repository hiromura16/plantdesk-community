import { byId as $ } from '../runtime/dom.ts';
/**
 * 敷地マップの状態、図面切り替え、工事描画、一覧・詳細の更新をまとめる入口。
 * 各機能は Factory... の公開APIで接続し、保存・権限・同時更新の判定は接続先APIに委ねます。
 */

import '../runtime/libraries.js';
import FactoryFeatures from './features.js';
import FactoryAPI from '../shared/api-client.js';
export /** 台帳の保存とエラー時の復元、選択対象、操作通知を管理します。
 * @param {ReturnType<typeof import('./runtime.js').createMapRuntime>} runtime
 * @param {import('./actions').MapActions} actions
 */
function createStateController(runtime, actions) {
  async function writeState() {
    await FactoryAPI.save(runtime.state);
  }
  /**
   * 保存前の画面状態を複製し、APIでの検証・保存が失敗したときは元へ戻します。
   * 画面表示だけが成功したように残るのを避けるため、機能ごとの編集もこの経路を使います。
   */
  async function changeState(fn) {
    const previous = structuredClone(runtime.state);
    try {
      fn();
      await actions.writeState();
    } catch (error) {
      runtime.state = previous;
      throw error;
    }
  }
  function toast(message, error = false) {
    clearTimeout(runtime.toastTimer);
    $('toast').textContent = message;
    $('toast').classList.toggle('error', error);
    $('toast').hidden = false;
    runtime.toastTimer = setTimeout(() => ($('toast').hidden = true), error ? 8000 : 4500);
  }
  function fail(error) {
    console.error(error);
    actions.toast(error.message || '操作を完了できませんでした。', true);
  }
  function current() {
    return runtime.state.drawings.find((x) => x.id === runtime.currentDrawing);
  }
  function getRecord() {
    return (runtime.tab === 'works' ? runtime.state.works : runtime.state.assets).find(
      (x) => x.id === runtime.selectedId && x.drawingId === runtime.currentDrawing,
    );
  }
  function attachmentsHTML(record) {
    return FactoryFeatures.filesHTML(record);
  }
  return {
    writeState,
    changeState,
    toast,
    fail,
    current,
    getRecord,
    attachmentsHTML,
  };
}
