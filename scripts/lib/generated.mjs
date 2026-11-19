/** 生成物も共通書式にそろえ、CIでは書換えずに仕様とのずれを検出します。 */
import { readFile, writeFile } from 'node:fs/promises';
import { format, resolveConfig } from 'prettier';
export async function writeGenerated(file, source) {
  const options = await resolveConfig(file);
  const text = await format(source, { ...options, filepath: file });
  if (process.argv.includes('--check')) {
    const current = await readFile(file, 'utf8');
    if (current !== text) {
      throw new Error('生成物を更新してください: ' + file);
    }
  } else {
    await writeFile(file, text);
  }
}
