# 開発ガイド

Node.js 22.19以上、npm、Python 3.12以上を使用します。CIはNode.js 22と26で検証します。ブラウザー検証にはPlaywrightのChromiumが必要です。

## セットアップ

```sh
npm ci
npm ci --prefix frontend
npm ci --prefix cloudflare
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
npm run build
npm run dev
```

表示されたローカルURLを開きます。開発サーバーは一時SQLiteと検証用の署名済みIDを使い、終了時にDBを削除します。公開D1や実際のNotionには接続しません。ファイアウォールや認証設定を変更する必要はありません。

## 検証

```sh
npm run check
npm run check:public
npm test
npm run build
npm run test:runtime
npm run test:ui
npm run test:accessibility
npm run test:load
npm run audit:dependencies
pip-audit -r requirements-dev.txt
ruff check .
ruff format --check .
```

`check` は書式、実行環境別Lint、React Hooks推奨規則、型、OpenAPIとDOMの生成物、ドキュメント参照、JavaScript構文を検査します。型検査はJSDoc付きJavaScriptとTypeScriptの共通型を対象にし、ブラウザーとWorkersを分けています。

`check:public` は `check` に含まれます。Git追跡ファイルと未追跡の公開候補から、実環境の設定・識別子・既知形式のトークン・ローカル実行物を検出し、値は表示しません。管理外の実設定は読みません。設定変更後の型は `npm run types --prefix cloudflare` で公開用の設定例から生成します。

APIテストは実際の応答・成功した要求をOpenAPIと照合し、行85%・分岐80%・関数90%のカバレッジ下限を設けています。`test:runtime` はJWT・Notionコネクター・レコード保存をworkerdで実行します。DB保存はD1のバインディングでも検査します。

画面テストは実APIと一時SQLiteで操作します。アクセシビリティは主要画面・編集・テーマ・モバイルをaxeで検査し、ダイアログのEscapeとフォーカス復帰も確認します。負荷検査は公開環境へ接続せず、同時4件・計80要求のp95が3秒未満であることを確認します。検証結果は `.runtime/qa/` とCIの成果物に保存します。

## 変更時の約束

- 内部の依存はES Modulesで明示し、グローバル変数と読込順に頼りません。
- 自作コードのコメントは日本語で、役割・設計理由・守る条件・失敗時の扱いを説明します。
- 表示、状態、業務操作、DB保存を分けます。更新は共通の検証・保存入口を通します。
- APIやDOMの入口を変更したら `npm run generate` を実行します。
- 第三者ライブラリーと生成物は直接編集せず、固定依存と生成元を変更します。
- トークン、Cookie、接続先の秘密情報、実データ、実行ログはコミットしません。
- 検査の除外・型抑制・規則の無効化でエラーを隠しません。必要な互換境界は型と検証を付けます。

## スクリーンショット

```sh
npm run build
npm run screenshots
```

撮影スクリプトが検証専用データを一時DBへ入れ、ダッシュボード・一覧・ボード・詳細・点検・マップ・モバイルを `docs/images/` に保存します。実在のアカウントや工場データは撮影しません。
