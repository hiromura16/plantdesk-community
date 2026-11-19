# Cloudflareへの配置

このリポジトリはアプリのソースと汎用の設定例を公開します。実際のWorker名、ドメイン、DB名・ID、Accessの接続先・AUD、認証情報は含めません。

## 設定を分ける

[wrangler.example.jsonc](../cloudflare/wrangler.example.jsonc) を手元の `cloudflare/wrangler.jsonc` へコピーします。コピー先はGit管理外です。例に含まれるドメイン・DB ID・認証設定は仮の値で、そのまま実環境へ配置しません。

```sh
cp cloudflare/wrangler.example.jsonc cloudflare/wrangler.jsonc
```

コピー先に、自分の環境の値を設定します。

| 項目           | 設定する内容                                                                |
| -------------- | --------------------------------------------------------------------------- |
| Workerと公開先 | 自分のWorker名、既存ゾーン配下のCustom Domain                               |
| D1             | 自分のDB名・ID。bindingは `DB`、マイグレーションは `cloudflare/migrations/` |
| 静的ファイル   | ビルド後の `public/`。bindingは `ASSETS`                                    |
| Access         | 自分のチームURLとアプリのAUD。許可ポリシーとWorkerの関連付けも設定          |
| `APP_ORIGIN`   | アプリの公開先。パスを含まないHTTPSのorigin。Notionのアプリリンクに使用     |
| Cron           | Notionの同期要求・次回予定を毎分確認                                        |

`APP_ORIGIN` が未設定の場合、Notionのレコードにアプリリンクを書き込みません。同期データを別環境のURLへ誘導しないためです。

APIトークン、Notionの接続トークン、`NOTION_TOKEN_KEY`、SCIMのトークンは `vars` やソースへ書かず、配置先のSecretとアプリの接続設定で管理します。Notionの暗号鍵は既存の接続を復号するために必要です。稼働中の環境では、別途移行せずに交換しないでください。

## ビルドと配置前の検証

Node.js 22.19以上とPython 3.12以上で実行します。

```sh
npm ci
npm ci --prefix frontend
npm ci --prefix cloudflare
npm run check
npm test
npm run build
npm run types --prefix cloudflare
npm exec --prefix cloudflare -- wrangler deploy --dry-run --config cloudflare/wrangler.jsonc
```

型の生成は、実設定を読み込まず公開用の設定例から行います。dry runはビルド・梱包の検査で、実環境のAccess、DB、ドメインが正しいことまでは確認しません。認証情報はCLIの正式な仕組みや秘密ストアから供給し、チャットやGitへ貼り付けません。

## 自分の環境へ配置する

対象アカウント・Worker・DBとバックアップを確認してから、すべてのマイグレーションを適用します。binding名 `DB` はコピー先の設定に対応します。

```sh
npm exec --prefix cloudflare -- wrangler d1 migrations apply DB --remote --config cloudflare/wrangler.jsonc
npm exec --prefix cloudflare -- wrangler deploy --config cloudflare/wrangler.jsonc
```

独自ドメインは、既存のCloudflareゾーンへCustom Domainとして接続します。Accessの許可ポリシーを設定し、DNS・TLS・ログイン・閲覧モード・利用者ごとのデータ分離を確認します。既存の公開先を切り替える場合は、新URLでの利用を確認してから旧URLを停止します。

GitHubへの反映だけでは、公開環境・ドメイン・DBを変更しません。CIにも本番の認証情報を置かず、自動配置は行いません。

## 公開前の確認

`npm run check:public` は実設定や既知形式の秘密値を公開候補から検出します。`.env` と `.dev.vars` の環境別ファイル、証明書・秘密鍵、DBダンプ、実行ログもGit管理外です。Issue、説明、スクリーンショットにも実環境の情報を含めないでください。

参照：[Wranglerの設定](https://developers.cloudflare.com/workers/wrangler/configuration/)、[Secret](https://developers.cloudflare.com/workers/configuration/secrets/)、[Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)、[Cloudflare Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)。
