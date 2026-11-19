# PlantDesk Community

工場の設備・工事・点検・タスクを、敷地図とつなげて管理するセルフホスト版です。Freeの機能を含み、データは自分のサーバーのSQLiteへ保存します。

## 起動

Node.js 22.19以上（推奨24）とnpmを用意します。

```sh
npm ci
npm ci --prefix frontend
npm run build
mkdir -p secrets
openssl rand -base64 32 > secrets/password.txt
chmod 600 secrets/password.txt
PLANTDESK_PASSWORD_FILE=secrets/password.txt npm start
```

`http://127.0.0.1:18018/` を開き、ユーザー名 `plantdesk` とファイルに保存したパスワードでログインします。既定ではループバックだけで待ち受けます。外部から使う設定とDockerの手順は[セルフホストの運用](docs/self-hosting.md)を参照してください。

## 機能と利用枠

図面3枚、設備100台、資料10MB。敷地マップ、ASCII DXF、工事範囲、付箋、設備・分類・カスタム属性、点検履歴、案件、担当者、タスク、定期点検計画、工事・作業ごとの履歴、JSON/CSV移行、資料の添付、REST APIとWebMCPを利用できます。初期台帳には架空の設備12台を用意します。

有料デモ・課金・プラン変更・独自アイコン・配色やブランドの変更・アプリ内の世代バックアップ・管理者監査・SCIMは含みません。Freeの利用枠はサーバーでも検証します。台帳全体750KB、添付は各5MB・一度に合計5MBまでです。DWGはDXFへの変換が必要です。

通常の起動はCloudflareへの接続もアカウント登録も不要です。Notion同期は既定で無効で、[明示的に設定した場合](docs/self-hosting.md#notion同期)だけ動きます。

## 保存と運用

通常の起動では `.runtime/data/community.sqlite` を使い、再起動してもデータを保持します。データディレクトリをGitへ入れないでください。既存のSaaS/D1データベースを、この配布の初期化先に指定しないでください。移行はAPIで検証するJSON/CSV経由で行い、添付本体は別途扱います。

## 開発と検証

```sh
npm ci --prefix cloudflare
npm run generate
npm run check
npm test
npm run build
npm run test:runtime
```

`npm run dev` は検証用の一時SQLiteとテスト用の署名済みIDを使う開発サーバーです。永続運用には `npm start` を使います。画面検証は[開発ガイド](docs/development.md)を参照してください。

[操作ガイド](docs/team-workflow.md) · [機能](docs/features.md) · [API](api/README.md) · [構成](docs/architecture.md) · [ドキュメント一覧](docs/README.md)

## ライセンス

MIT License。元のPlantDeskの著作権表示と[依存ソフトウェアのライセンス](THIRD_PARTY_NOTICES.md)を保持します。Communityの公開履歴はこの配布のソースから開始し、元製品のGit履歴を含めません。
