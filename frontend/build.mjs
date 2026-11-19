/** ページごとのESMをビルドし、配信するSDKとライセンスをロック済みの依存から用意します。 */
import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const directory = fileURLToPath(new URL('.', import.meta.url));
const output = new URL('.build/vendor/', import.meta.url);
await rm(new URL('.build/', import.meta.url), { recursive: true, force: true });
await build({
  absWorkingDir: directory,
  entryPoints: {
    'plantdesk-map': 'src/map-entry.js',
    'plantdesk-console': 'src/console-entry.js',
    'plantdesk-api-docs': 'src/developer/api-docs.js',
  },
  outdir: '.build/vendor',
  bundle: true,
  minify: true,
  jsx: 'automatic',
  platform: 'browser',
  format: 'esm',
  target: ['es2022'],
  external: ['/vendor/*'],
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'linked',
});
await mkdir(new URL('pdfjs/', output), { recursive: true });
const copies = {
  'leaflet/dist/leaflet.css': 'leaflet.css',
  '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css': 'geoman.css',
  'swagger-ui-dist/swagger-ui.css': 'swagger-ui.css',
  'pdfjs-dist/build/pdf.mjs': 'pdfjs/pdf.mjs',
  'pdfjs-dist/build/pdf.worker.mjs': 'pdfjs/pdf.worker.mjs',
  'leaflet/LICENSE': 'LICENSE-leaflet.txt',
  '@geoman-io/leaflet-geoman-free/LICENSE': 'LICENSE-geoman.txt',
  'dxf-parser/LICENSE': 'LICENSE-dxf-parser.txt',
  'swagger-ui-dist/LICENSE': 'LICENSE-swagger-ui.txt',
  'pdfjs-dist/LICENSE': 'pdfjs/LICENSE',
};
for (const name of ['react', 'react-dom', 'scheduler']) {
  copies[name + '/LICENSE'] = 'LICENSE-' + name + '.txt';
}
for (const [source, target] of Object.entries(copies)) {
  await copyFile(new URL('node_modules/' + source, import.meta.url), new URL(target, output));
}
for (const [source, target] of Object.entries({
  'leaflet/dist/images': 'images',
  'pdfjs-dist/cmaps': 'pdfjs/cmaps',
  'pdfjs-dist/standard_fonts': 'pdfjs/standard_fonts',
  'pdfjs-dist/wasm': 'pdfjs/wasm',
})) {
  await cp(new URL('node_modules/' + source, import.meta.url), new URL(target, output), {
    recursive: true,
  });
}
