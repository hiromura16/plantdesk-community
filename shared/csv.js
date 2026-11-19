/** CSVの出力。引用符を二重化し、表計算ソフトに入力値を数式として実行させないようにします。 */
export function csvCell(value) {
  let text = String(value ?? '');
  if (
    /^[\s\p{Cc}]*[=+@-]/u.test(text) ||
    text.startsWith('\t') ||
    text.startsWith('\r') ||
    text.startsWith('\n')
  ) {
    text = "'" + text;
  }
  return '"' + text.replaceAll('"', '""') + '"';
}
export function csvText(rows) {
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}
