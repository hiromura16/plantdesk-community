# ソースの配置

PlantDesk Communityは、ページの入口・表示・状態管理・業務処理・保存を分けています。ルートには設定、依存ロック、READMEなどを置き、アプリのJavaScriptは置きません。

```text
frontend/
  pages/                    HTMLの入口
  src/
    map-entry.js            マップの構成と起動順
    console-entry.js        管理画面の構成と起動順
    console/
      team/                 タスクの状態フック・画面・担当者・引き継ぎ
      register/             設備/工事台帳の状態フック・列・画面・履歴
      team-task.jsx         タスク詳細と完了処理
      notion-sync.jsx       同期設定・状態・競合の画面
    map/
      app.js                機能の組み立て
      runtime.js            ページ内の共有状態
      state-controller.js   保存と失敗時の復元
      renderer.js           一覧・詳細・マップの描画
      drawings.js           図面切り替え・CAD
      work-editor.js        工事範囲・工事フォーム
      startup.js            イベント・初期化・権限反映
      equipment.js          設備アイコンとロック
      notes.js              付箋の編集・移動・伸縮
    shared/                 API・表示設定・写真・PDF・WebMCP
    runtime/                DOMの型/検証、SDK、画像変換、ページ間の接続点
    styles/                 自作CSS
  static/                   サンプル図面・画像
cloudflare/
  worker.mjs                Free APIと共通応答の保護
  map/
    router.mjs              共通認証・CSRF・経路の振り分け
    routes/                 セッション、台帳、チーム、資料などのHTTP処理
    entities.mjs            台帳の業務操作
    repository.mjs          検証・履歴・リビジョンの確定
    records-store.mjs       レコード単位のSQL保存と復元
  notion/                   同期ジョブ、チェックポイント、接続設定
  security/                 応答ヘッダーと外部応答の受信量制限
  migrations/               番号順に適用するDB変更
  generated/                OpenAPIから作る許容経路表
shared/                     入出力型、共通検証、CSV、デモデータ
api/openapi.json            現行REST APIの仕様
connectors/notion/          アプリから独立したNotion通信・変換・マージ
server/                     HTTP認証・永続SQLite・セルフホスト起動
scripts/                    ビルド・生成・品質検査・撮影
tests/                     API契約、実行環境、ブラウザー、負荷の検証
```

## モジュールの境界

現行フロントエンドはES Modulesです。内部では明示的なimport/exportを使い、スクリプトの読込順に依存しません。`window.Factory...` と `window.factoryMap` はWebMCP・外部連携・画面検証との互換境界で公開します。内部の共有状態は `runtime/context.js` とマップのコンテキストを通します。

Reactの画面は、状態フックと表示部品を分けています。サーバーはHTTPの受付、台帳の操作、検証、保存の責務を分け、どの更新経路でも同じ保存処理を通します。

## 生成物

`frontend/build.mjs` がマップ・管理画面・Swagger UIの3つの入口をバンドルし、固定したnpm依存からSDKのCSS・PDFワーカー・フォント・ライセンスを用意します。`scripts/build.mjs` がWorkerと配信ファイルを構築します。CDNへ依存しません。

`public/`、`frontend/.build/`、`cloudflare/dist/`、`.deploy/`、`node_modules/`、`.runtime/` はGitへ含めません。第三者SDKの原本を重複して管理せず、3つのpackage-lock.jsonから再現します。

`npm run generate` はOpenAPIの型・HTTP経路表・DOMのID型を更新します。CIは `npm run check:generated` で仕様とのずれを検出します。Workersのバインディングと実行環境の型はWranglerで生成した `cloudflare/generated-env.d.ts` に保持します。
