/// <reference path="./generated-env.d.ts" />
/** Wranglerの設定から作る型に、Secretとして登録する値だけを加えます。秘密の値は定義へ書きません。 */
export interface Env extends GeneratedEnv {
  NOTION_TOKEN_KEY?: string;
  LOCAL_AUTH?: { issuer: string; subject: string };
}
