/** ページ内のマップと設定を共有する明示的な接続点。公開用の互換APIだけをwindowへ渡します。 */
let app;
let preferences;
export const getMapApp = () => app;
export const getPreferences = () => preferences;
export function setMapApp(value) {
  app = value;
  Object.assign(window, { factoryMap: value });
}
export function registerPreferences(value) {
  preferences = value;
}
