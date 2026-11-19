# PlantDeskの開発

- 自作コードと設計の説明は日本語で書きます。単なる逐語説明より、役割・境界・設計理由・失敗時の扱いを残します。
- 入口、表示、状態、業務操作、検証、DB保存を分けます。内部依存はES Modulesのimport/exportで示します。
- 台帳の更新は共通の検証・保存処理を通し、組織・権限・ロック・資料所有権・revisionを維持します。
- APIとDOMの入口を変更したら `npm run generate` を実行します。生成物と第三者SDKの原本を手で修正しません。
- `npm run check`、`npm test`、`npm run build`、`npm run test:runtime`、変更に関係する画面検証を実行します。検査や型を弱めて不具合を隠しません。
- 秘密値、Cookie、実データ、公開環境のDBコピー、実行ログ、`.runtime/` とビルド出力をGitに含めません。
- ローカル検証は一時SQLite・D1・検証用IDを使います。GitHubへの反映と、Cloudflare/Notionの実環境変更は別の操作です。
- 実環境の設定はGit管理外のファイルとSecretで管理します。公開用の設定例・仕様・画像に、実環境のURL・識別子・認証情報を含めません。

構成は [docs/source-layout.md](docs/source-layout.md)、検証とコメントの方針は [docs/development.md](docs/development.md)、検査範囲は [docs/code-quality.md](docs/code-quality.md) を参照してください。
