# コード品質と検証

PlantDeskは、以下の検査をローカルとCIで再現できます。外部認証・第三者の脆弱性診断・WCAG全項目の適合認証を表すものではありません。検査名だけでなく、実際の対象と合格条件を記載します。

| 分野             | 実装と検査                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 配置と責務       | ページ入口、Reactの状態/表示、マップの描画/図面/編集/起動、HTTP/業務操作/検証/保存を分離。内部はES Modules                   |
| 書式             | Prettier、EditorConfig、PythonのRuffを固定設定で検査                                                                         |
| JavaScriptの規則 | 実行環境別のESLint。ブラウザー・Worker・Nodeを一括で許可しない。大文字名を未使用検査の除外にしない                           |
| React            | Hooksの推奨設定とexhaustive-depsをエラー扱い。未保存確認、最新のコールバック、画面離脱時の解除を検証                         |
| 型               | JSDoc付きJS/JSXと共通TypeScript型をcheckJs/strictNullChecksで検査。ブラウザーとWorkersの設定を分離                           |
| API契約          | OpenAPIを正式なパーサーで検証。型と許容メソッドを生成。APIテストの実応答・成功した要求をAjvで照合                            |
| DB               | レコード単位の保存、点検履歴の親子関係、配列順序、revision/planの比較条件、履歴の同時保存をSQLiteとD1で検証                  |
| 移行             | 既存version 2の全台帳・点検履歴・順序と、汎用v1台帳の保持を移行テストで検証                                                  |
| セキュリティ     | JWT署名/claims、組織分離、資料所有権、閲覧投影、設備ロック、CSRF、405/Allow、受信量制限、保護ヘッダー、CSV数式対策の回帰検査 |
| 公開前確認       | 実環境設定・識別子・既知形式の秘密値・ローカル実行物をGit公開候補から検出。値をエラーに出さない                              |
| アクセシビリティ | axeのWCAG 2/2.1/2.2 A/AAタグとbest-practice。管理画面、編集、表示設定、テーマ、モバイル。Escapeとフォーカス復帰も操作で検証  |
| カバレッジ       | APIとNotionコネクターを対象に行85%・分岐80%・関数90%を下限にする                                                             |
| 負荷             | ローカルHTTPとSQLiteに同時4件・計80要求。失敗なし、p95が3秒未満                                                              |
| 依存             | 3つのnpm lock、ハッシュ付きPython依存を監査。個別アドバイザリーの無視は設定しない                                            |
| CI               | Node 22/26、Python 3.12。Actionsは確認したリリースのコミットSHAに固定。認証情報の常駐と自動本番配置は行わない                |

## 型と生成物の範囲

ソース全体をTypeScriptへ書き換えた構成ではありません。JavaScriptにはJSDocを付けて型検査し、入出力・共通モデル・DOM・マップ操作にはTypeScript型を使います。OpenAPIの型は仕様から、Workersの型はWranglerの設定から生成します。`any`を完全に排除したstrict TypeScriptプロジェクトと同一ではありません。

`npm run check:generated` がAPIの型・経路・DOM IDのずれを検出します。実行時の入力検証・権限確認は、静的型とは独立して維持します。

## セキュリティの確認箇所

| 観点         | 実装 / 回帰テスト                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 本人確認     | `cloudflare/auth.mjs`、`tests/worker-auth-runtime.mjs`。RS256、issuer/audience/期限/azp、設定した公開鍵URL、転送拒否、外部応答上限             |
| 組織と権限   | `map/context.mjs`、`map-product.test.mjs`、`worker.test.mjs`。別利用者・別組織・閲覧者の書込みと資料取得を拒否                                 |
| 保存の原子性 | `map/repository.mjs`、`records-store.mjs`、`tests/records-runtime.mjs`。競合時に台帳・履歴の一部だけが確定しない                               |
| 入力と出力   | `map-validation.mjs`、`map/http.mjs`、`security/responses.mjs`、`shared/csv.js`。型・サイズ・参照・MIME、CSP、nosniff、no-store、CSV数式を検査 |
| 秘密と同期   | `notion/credentials.mjs`、`notion-sync.test.mjs`。組織ごとの暗号化、トークンの非公開、予算・再開・不確実な作成の照合                           |

OWASP ASVSはこれらの管理項目を確認する際の参照基準です。項目すべてを監査して認証を受けたという意味ではありません。Cloudflare Accessの実ポリシー、運用者の権限、バックアップ保管先などの配置条件は、コード検査と区別します。

### ブラウザーと添付の境界

添付固有の `default-src 'none'; sandbox` と共通CSPを併用し、共通処理が添付の制約を上書きしません。HTTPSのHSTS、同一オリジンのCORP/COOP、no-store、nosniffを付けます。APIクライアントは同一オリジンへ限定し、転送を追跡しません。[CSPの複数ポリシー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy#multiple_content_security_policies)を参照してください。

`tests/security_ui.py` は、実APIに保存したHTML形式の設備名・添付名を文字列として表示すること、PDFを描画できること、HTML添付を実行せずダウンロードすること、閲覧者の添付取得を拒否することをChromiumで検証します。API側でも別利用者・別ワークスペース・閲覧者の取得拒否と応答ヘッダーを確認します。

公開前検査は管理外の実設定を読みません。既知形式の検査で、すべての秘密値を網羅する保証ではありません。スクリーンショットは検証専用データから生成し、差分と画像を手動でも確認します。

## アクセシビリティの確認箇所

自動検査の指摘を無視するルールや要素除外は設けません。文字色、見出し順、操作名、ランドマークを修正し、ダイアログをキーボードで閉じた後のフォーカスも確認します。任意のカスタム色・実際の読み上げ機器・支援技術との組合せまで、自動検査だけで保証するものではありません。

## コメントとドキュメント

自作コードは日本語で、役割・境界・設計理由・守る条件・失敗や再試行の扱いを説明します。単純な代入の逐語説明で埋めません。変更時にコメント、API仕様、生成物、操作ガイドも一緒に見直します。第三者ライブラリーの原本とライセンス、既に適用した過去のマイグレーションは、説明の翻訳だけを目的に書き換えません。

検査コマンドは [開発ガイド](development.md)、ソースの位置は [配置](source-layout.md)、検査結果はCIの成果物から確認できます。

参照: [OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3.html)、[D1のバッチ処理](https://developers.cloudflare.com/d1/worker-api/d1-database/)、[OWASP ASVS](https://asvs.owasp.org/)、[WCAG 2.2](https://www.w3.org/TR/WCAG22/)。
