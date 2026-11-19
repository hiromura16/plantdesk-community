/** 敷地マップの起動順と、外部ツール向け互換APIを定義します。 */
import FactoryAppearance from '../../shared/appearance.js';
import FactoryLayerSetState from '../../shared/layer-set-state.js';
import FactoryPreferences from './shared/preferences.js';
import FactoryProduct from './console/product.jsx';
import FactoryReactPhotos, { mountDeveloperMenu } from './console/ui.jsx';
import FactoryCAD from './map/cad.js';
import FactoryCategories from './map/categories.js';
import FactoryEquipment from './map/equipment.js';
import FactoryFeatures from './map/features.js';
import FactoryLayerSets from './map/layer-sets.js';
import FactoryDisplay from './map/map-display.js';
import FactoryOrganization from './map/map-organization.js';
import FactoryNotes from './map/notes.js';
import FactoryAPI from './shared/api-client.js';
import FactoryMedia from './shared/media.js';
import FactoryPDF from './shared/pdf-preview.js';
import FactoryWebMCP from './shared/webmcp.js';
import startMap from './map/app.js';
import startProduct from './shared/product.js';
Object.assign(window, {
  FactoryAppearance,
  FactoryLayerSetState,
  FactoryPreferences,
  FactoryProduct,
  FactoryReactPhotos,
  FactoryCAD,
  FactoryCategories,
  FactoryEquipment,
  FactoryFeatures,
  FactoryLayerSets,
  FactoryDisplay,
  FactoryOrganization,
  FactoryNotes,
  FactoryAPI,
  FactoryMedia,
  FactoryPDF,
  FactoryWebMCP,
});
await startMap();
await FactoryPreferences.init();
mountDeveloperMenu();
await startProduct();
