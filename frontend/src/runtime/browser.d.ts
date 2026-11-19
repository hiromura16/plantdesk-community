/** Leafletの描画に付ける、PlantDesk内だけで使う識別情報。 */
import 'leaflet';
declare module 'leaflet' {
  interface PolylineOptions {
    workId?: string;
  }
}

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: object, options?: { signal: AbortSignal }) => void;
      unregisterTool?: (name: string) => void;
    };
  }
}
