/** SDKの初期化順をモジュールで保証します。Geomanの互換窓口以外へグローバル依存を広げません。 */
import L from 'leaflet';
import DxfParser from 'dxf-parser';
globalThis.L = L;
await import('@geoman-io/leaflet-geoman-free');
export { L, DxfParser };
