# Communityの構成

ブラウザーのReact/Leaflet画面から、同じホストのNode.jsサーバーへ接続します。`server/application.mjs` が全要求をHTTP認証し、認証済みIDを共通マップAPIへ渡します。`server/database.mjs` がSQL境界をSQLiteへ接続します。Cloudflareを使う配置では同じAPIをWorkers/D1/Accessで実行できます。

HTTP受付、業務操作、入力検証、レコード保存を分けます。保存はrevision・Free上限・資料所有権・設備ロックを検証し、レコード変更、工事/作業履歴、revision更新を同じトランザクションで確定します。閲覧モードへ返すデータはサーバー側で投影します。

Notionは明示的に有効化した場合だけ定期処理を起動します。秘密値は環境変数・秘密ファイル・暗号化DBで管理し、静的配信へ含めません。初期データは架空です。通常起動は自動テレメトリーもCloudflare通信も必要としません。
