/** 機能間で呼び出せる操作。実装の戻り値から型を作り、操作名のずれを検出します。 */
export type MapActions = ReturnType<typeof import('./state-controller.js').createStateController> &
  ReturnType<typeof import('./renderer.js').createRenderer> &
  ReturnType<typeof import('./drawings.js').createDrawings> &
  ReturnType<typeof import('./work-editor.js').createWorkEditor> &
  ReturnType<typeof import('./startup.js').createStartup>;
