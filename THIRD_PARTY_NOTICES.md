# サードパーティーライブラリー

ブラウザー用SDKは固定したnpm依存からビルドし、配信ファイルへ同梱します。セルフホスト時にCDNへ接続する必要はありません。元ファイルとライセンスを手動で重複保存しません。

| ライブラリー        | バージョン   | ライセンス   | ビルド後のライセンス                                    |
| ------------------- | ------------ | ------------ | ------------------------------------------------------- |
| Leaflet             | 1.9.4        | BSD-2-Clause | public/vendor/LICENSE-leaflet.txt                       |
| Leaflet-Geoman Free | 2.20.6       | MIT          | public/vendor/LICENSE-geoman.txt                        |
| dxf-parser          | 1.1.2        | MIT          | public/vendor/LICENSE-dxf-parser.txt                    |
| React / React DOM   | 19.3.1       | MIT          | public/vendor/LICENSE-react.txt / LICENSE-react-dom.txt |
| Scheduler           | npm lock参照 | MIT          | public/vendor/LICENSE-scheduler.txt                     |
| PDF.js              | 6.5.438      | Apache-2.0   | public/vendor/pdfjs/LICENSE                             |
| Swagger UI          | 5.35.0       | Apache-2.0   | public/vendor/LICENSE-swagger-ui.txt                    |

Geoman Proは含みません。PDF.jsのフォント・CMap・WASMも同じ依存パッケージから用意します。バンドル内の第三者ライセンスコメントも隣接するLICENSEテキストへ出力します。

依存の正確な解決結果は、各ディレクトリのpackage-lock.json、Pythonのrequirements-dev.txtを参照してください。このプロジェクトのMITライセンスは、各配布元のライセンスを置き換えません。

配布元: [Leaflet](https://github.com/Leaflet/Leaflet)、[Geoman](https://github.com/geoman-io/leaflet-geoman)、[dxf-parser](https://github.com/gdsestimating/dxf-parser)、[React](https://github.com/facebook/react)、[PDF.js](https://github.com/mozilla/pdf.js)、[Swagger UI](https://github.com/swagger-api/swagger-ui)。
