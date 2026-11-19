# API仕様

`openapi.json` はOpenAPI 3.0.3を宣言する仕様ファイルです。ビルド時に `/openapi.json` へコピーし、Swagger UIの `/api-docs` から表示・操作します。

現行マップの経路は `cloudflare/map/router.mjs` と `cloudflare/map/routes/`、Notion関連は `cloudflare/notion/routes.mjs`、全体の経路切り替えは `cloudflare/worker.mjs` にあります。画面からの呼び出しは `frontend/src/shared/api-client.js` を共用します。

APIを変更するときは、パス、認証、入力、正常・異常応答の仕様と、対応する回帰テストも更新します。機密情報や実際の利用者のデータを仕様の例へ入れないでください。

APIの型と許容メソッド表は `npm run generate` で仕様から生成します。CIは仕様全体を検証し、API回帰テストの実応答と成功した要求をAjvで照合します。仕様にない成功応答・ステータス・媒体・型は失敗にします。業務処理は手書きで、権限と参照・ロック・プランの検証を共通化しています。[品質の確認範囲](../docs/code-quality.md)と[連携機能の説明](../docs/features.md)を参照してください。
