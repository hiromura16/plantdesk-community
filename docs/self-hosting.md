# セルフホストの運用

## Docker

```sh
mkdir -p secrets
openssl rand -base64 32 > secrets/password.txt
chmod 600 secrets/password.txt
docker compose up -d --build
```

`http://127.0.0.1:18018/` にユーザー名 `plantdesk` と保存したパスワードでログインします。Composeはホストのループバックにだけポートを公開します。SQLiteは `plantdesk_data` ボリュームに保持します。コンテナを削除してもボリュームを削除しない限りデータは残ります。

複数人で使う場合も、この構成は一つの共有ワークスペースです。担当者名簿はログインアカウントではありません。閲覧モードは情報の投影であり、ログイン自体は必要です。

独自CAのプロキシを使う環境では、組織が配布したCA証明書をビルド時だけ渡せます。TLSの検証は維持し、証明書を実行用イメージへ含めません。

```sh
docker build --secret id=npm_ca,src=company-ca.crt -t plantdesk-community .
```

## Node.js

READMEのビルド後、`PLANTDESK_PASSWORD_FILE` に秘密ファイルを指定して `npm start` を実行します。パスワードは16文字以上が必要です。未設定・短すぎる値では起動しません。環境変数 `PLANTDESK_PASSWORD` も使えますが、ファイルを推奨します。

| 設定                      | 既定・意味                                        |
| ------------------------- | ------------------------------------------------- |
| `HOST`                    | `127.0.0.1`。Docker内部では `0.0.0.0`             |
| `PORT`                    | `18018`                                           |
| `PLANTDESK_DATA_DIR`      | `.runtime/data`。SQLite・WAL・SHMを同じ場所へ保存 |
| `PLANTDESK_PASSWORD_FILE` | HTTP認証のパスワードファイル                      |
| `PLANTDESK_ORIGIN`        | 外部公開時の正規origin。指定するとHostも照合      |
| `PLANTDESK_NOTION_SYNC`   | `true` の場合のみNotionの定期処理を起動           |
| `NOTION_TOKEN_KEY_FILE`   | Notionの保存トークンを暗号化するキーのファイル    |

外部公開する場合はHTTPSリバースプロキシを前段に置き、正しいHostを転送してください。HTTP認証を平文HTTPでインターネットへ公開しないでください。Cloudflareは必須ではありません。Cookie・組織ID・`x-factory-profile`・AccessヘッダーでFree以外へ切り替えることはできません。

## 保全

停止してからデータディレクトリまたはDockerボリュームを安全な保存先へコピーします。WAL稼働中にDBファイルだけをコピーしないでください。復元は停止中に同じ所有者・権限で戻します。保存先を消す操作や `docker compose down -v` は台帳・添付も消すため、通常の停止には使いません。

既存SaaSのDBへCommunityの初期マイグレーションを適用しないでください。Community専用の新しい保存先を使います。添付本体とトークンはJSONエクスポートに含みません。

## Notion同期

通常起動ではスケジューラーも外向きの定期通信も無効です。同期を使う場合は32バイトの暗号化キーを生成し、キーのファイルをGit管理外で保管します。

```sh
openssl rand -base64 32 > secrets/notion-key.txt
chmod 600 secrets/notion-key.txt
PLANTDESK_PASSWORD_FILE=secrets/password.txt NOTION_TOKEN_KEY_FILE=secrets/notion-key.txt PLANTDESK_NOTION_SYNC=true npm start
```

起動後に管理画面のNotion同期で接続先とトークンを設定します。既存の暗号化キーを失うと保存済みトークンを復号できません。実環境への初回同期は画面で設定を確認して行います。
