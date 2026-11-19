/**
 * Gitの公開対象に、実設定・認証情報・ローカルの実行物を混ぜないための検査。
 * 値そのものはエラーへ出さず、ファイル名・行番号・理由だけを返します。
 * 既知形式の検査であり、手動レビューやGitHubの秘密情報検出を置き換えません。
 */
import { execFileSync } from 'node:child_process';
import { lstat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const privateFile =
  /(?:^|\/)(?:\.env(?!\.example$)[^/]*|\.dev\.vars[^/]*|wrangler(?:\.(?!example\.)[^/]+)?\.(?:jsonc?|toml)|[^/]+\.(?:pem|key|p12|pfx|sqlite3?|db|dump|bundle|log)|[^/]+\.sql\.gz|[^/]+\.tfstate[^/]*)(?:$)/i;
const privateDirectory = /(?:^|\/)(?:\.runtime|\.deploy|\.wrangler|node_modules|public)(?:\/|$)/;
const contentRules = [
  ['秘密鍵', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  [
    'プロバイダーの認証トークン',
    /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{35,}|(?:ntn_|secret_)[A-Za-z0-9]{35,}|sk-(?:proj-)?[A-Za-z0-9_-]{35,}|AKIA[A-Z0-9]{16})\b/g,
  ],
  ['固定されたJWT', /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/g],
  ['認証情報を埋め込んだURL', /https?:\/\/[^\s/"'`]+:[^\s/"'`]+@/g],
  ['Cloudflare環境固有のURL', /https?:\/\/[a-z0-9.-]+\.(?:cloudflareaccess\.com|workers\.dev)\b/gi],
  ['ローカル利用者の絶対パス', /(?:\/home\/[a-z0-9._-]+\/|[A-Z]:\\Users\\[^\\]+\\)/gi],
];

/** 検査用データにも使える純粋関数。許可される設定例に実IDを入れた場合も検出します。 */
export function publicSourceIssues(file, text) {
  const issues = [];
  if (privateFile.test(file) || privateDirectory.test(file)) {
    issues.push({ reason: '公開対象外の設定・認証・実行ファイル', line: 0 });
  }
  for (const [reason, pattern] of contentRules) {
    for (const match of text.matchAll(pattern)) {
      issues.push({ reason, line: text.slice(0, match.index).split('\n').length });
    }
  }
  const identifiers =
    /\b(?:account_id|database_id|zone_id|ACCESS_AUD)["']?\s*:\s*["']([0-9a-f-]{32,})["']/gi;
  for (const match of text.matchAll(identifiers)) {
    if (match[1] !== '00000000-0000-4000-8000-000000000000') {
      issues.push({
        reason: '実環境の識別子',
        line: text.slice(0, match.index).split('\n').length,
      });
    }
  }
  // CloudflareのAPIトークンには固定の接頭辞がないため、設定名との組合せでも検出します。
  const credentials =
    /\b(?:CLOUDFLARE_API_TOKEN|CF_API_TOKEN|CLOUDFLARE_API_KEY|CF_API_KEY|NOTION_TOKEN_KEY|SCIM_TOKEN_HASH)["']?\s*[:=]\s*["']?([A-Za-z0-9_+/-]{24,}={0,2})/gi;
  for (const match of text.matchAll(credentials)) {
    if (!/^(?:REPLACE_|EXAMPLE_|NOT_A_REAL_)/i.test(match[1])) {
      issues.push({
        reason: '設定に埋め込まれた認証情報',
        line: text.slice(0, match.index).split('\n').length,
      });
    }
  }
  return issues;
}

async function main() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  // 未追跡の公開候補も検査し、管理外の実設定は読みません。強制追加した場合は拒否します。
  const files = new Set(
    execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
      cwd: root,
      encoding: 'utf8',
    })
      .split('\0')
      .filter(Boolean),
  );
  let failures = 0;
  for (const file of files) {
    let bytes;
    try {
      const fullPath = join(root, file);
      if (!(await lstat(fullPath)).isFile()) {
        console.error(`${file}: 通常ファイル以外は公開候補へ含められません。`);
        failures++;
        continue;
      }
      bytes = await readFile(fullPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
    const text = bytes.includes(0) ? '' : bytes.toString('utf8');
    for (const issue of publicSourceIssues(file, text)) {
      console.error(`${file}${issue.line ? ':' + issue.line : ''}: ${issue.reason}`);
      failures++;
    }
  }
  if (failures) {
    process.exitCode = 1;
  } else {
    console.log('公開候補の設定・秘密値・ローカル実行物を確認しました。');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch {
    console.error(
      '公開候補の検査を完了できませんでした。Gitとファイルの読取り権限を確認してください。',
    );
    process.exitCode = 1;
  }
}
