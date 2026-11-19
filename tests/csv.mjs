/** 空白・制御文字を使った数式入力も、引用符・改行を含む値も、安全なCSVセルとして出力します。 */
import assert from 'node:assert/strict';
import { csvCell, csvText } from '../shared/csv.js';
for (const value of [
  '=1+1',
  ' +SUM(A1:A2)',
  '\t@SUM(1)',
  '\r-2',
  '\nline',
  '\u0000=HYPERLINK(1)',
]) {
  assert.ok(csvCell(value).startsWith('"\''), JSON.stringify(value));
}
assert.equal(csvCell('設備"A"'), '"設備""A"""');
assert.equal(csvCell(null), '""');
assert.equal(
  csvText([
    ['項目', '値'],
    ['台数', 2],
  ]),
  '\uFEFF"項目","値"\r\n"台数","2"',
);
console.log('PASS: CSV escaping and formula injection boundaries');
