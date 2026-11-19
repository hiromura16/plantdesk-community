/** 管理画面の入口。APIとReactの公開部品を接続してから起動します。 */
import FactoryAPI from './shared/api-client.js';
import FactoryProduct from './console/product.jsx';
import FactoryReactPhotos, { mountDeveloperMenu } from './console/ui.jsx';
import startProduct from './shared/product.js';
Object.assign(window, { FactoryAPI, FactoryProduct, FactoryReactPhotos });
mountDeveloperMenu();
await startProduct();
