/** 初回の外部データ取得を、画面の反映後に開始します。開始前に画面を閉じた場合は取り消せます。 */
export function defer(task) {
  const timer = setTimeout(task, 0);
  return () => clearTimeout(timer);
}
