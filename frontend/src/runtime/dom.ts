/** DOMの取得は、存在とタグを確認する窓口を通します。省略可能な要素にはfind系を使います。 */
import { domIds } from './dom-ids';
type KnownId = keyof typeof domIds;
type Elements = { [Key in KnownId]: HTMLElementTagNameMap[(typeof domIds)[Key]] };
type ById<Key extends string> = Key extends KnownId
  ? Elements[Key]
  : Key extends `${string}-dialog`
    ? HTMLDialogElement
    : HTMLElement;
type BySelector<Selector extends string> = Selector extends `#${infer Id}`
  ? ById<Id>
  : Selector extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[Selector]
    : Selector extends `input${string}`
      ? HTMLInputElement
      : Selector extends `select${string}`
        ? HTMLSelectElement
        : Selector extends `textarea${string}`
          ? HTMLTextAreaElement
          : Selector extends keyof SVGElementTagNameMap
            ? SVGElementTagNameMap[Selector]
            : HTMLElement;
export function findById<Key extends string>(id: Key): ById<Key> | null {
  const element = document.getElementById(id);
  if (element === null) {
    return null;
  }
  const expected = domIds[id as KnownId] || (id.endsWith('-dialog') ? 'dialog' : undefined);
  if (expected && element.tagName.toLowerCase() !== expected) {
    throw new Error('DOMのタグが定義と一致しません: ' + id);
  }
  return element as ById<Key>;
}
export function byId<Key extends string>(id: Key): ById<Key> {
  const element = findById(id);
  if (!element) {
    throw new Error('必要な画面要素がありません: ' + id);
  }
  return element;
}
export function findQuery<Selector extends string>(
  selector: Selector,
  root: ParentNode | null = document,
): BySelector<Selector> | null {
  if (!root) {
    throw new Error('検索対象の画面要素がありません。');
  }
  const element = root.querySelector(selector);
  if (element === null) {
    return null;
  }
  if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) {
    throw new Error('画面要素を指定してください: ' + selector);
  }
  return element as BySelector<Selector>;
}
export function query<Selector extends string>(
  selector: Selector,
  root: ParentNode | null = document,
): BySelector<Selector> {
  const element = findQuery(selector, root);
  if (!element) {
    throw new Error('必要な画面要素がありません: ' + selector);
  }
  return element;
}
/** イベントの発生元をDOM要素として使う場合は、テキストノードやnullをここで除外します。 */
export function eventElement(value: EventTarget | null): Element {
  if (!(value instanceof Element)) {
    throw new Error('イベントの対象が要素ではありません。');
  }
  return value;
}
/** 複数要素の取得も、親が存在することを確認してから行います。 */
export function queryAll<Selector extends string>(
  selector: Selector,
  root: ParentNode | null = document,
): NodeListOf<BySelector<Selector>> {
  if (!root) {
    throw new Error('検索対象の画面要素がありません。');
  }
  return root.querySelectorAll(selector) as NodeListOf<BySelector<Selector>>;
}
/** ダイアログ専用の操作へ渡す前に、種類と存在を確認します。 */
export function dialogElement(value: EventTarget | null): HTMLDialogElement {
  if (!(value instanceof HTMLDialogElement)) {
    throw new Error('ダイアログが見つかりません。');
  }
  return value;
}
/** 操作する種類を実行時にも検査し、型の断定だけで不正なタグを通さないようにします。 */
export function requiredElement<T extends Element>(value: T | null | undefined): T {
  if (!value) {
    throw new Error('必要な画面要素がありません。');
  }
  return value;
}
export function htmlElement(value: EventTarget | null): HTMLElement {
  if (!(value instanceof HTMLElement)) {
    throw new Error('HTML要素を指定してください。');
  }
  return value;
}
export function inputElement(value: EventTarget | null): HTMLInputElement {
  if (!(value instanceof HTMLInputElement)) {
    throw new Error('入力欄を指定してください。');
  }
  return value;
}
export function selectElement(value: EventTarget | null): HTMLSelectElement {
  if (!(value instanceof HTMLSelectElement)) {
    throw new Error('選択欄を指定してください。');
  }
  return value;
}
export function formElement(value: EventTarget | null): HTMLFormElement {
  if (!(value instanceof HTMLFormElement)) {
    throw new Error('フォームを指定してください。');
  }
  return value;
}
export function canvasElement(value: EventTarget | null): HTMLCanvasElement {
  if (!(value instanceof HTMLCanvasElement)) {
    throw new Error('キャンバスを指定してください。');
  }
  return value;
}
export function valueControl(
  value: EventTarget | null,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  if (!(
    value instanceof HTMLInputElement ||
    value instanceof HTMLSelectElement ||
    value instanceof HTMLTextAreaElement
  )) {
    throw new Error('入力欄を指定してください。');
  }
  return value;
}
export function disableControl(
  value: EventTarget | null,
):
  | HTMLInputElement
  | HTMLButtonElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | HTMLFieldSetElement
  | HTMLOptGroupElement
  | HTMLOptionElement {
  if (!(
    value instanceof HTMLInputElement ||
    value instanceof HTMLButtonElement ||
    value instanceof HTMLSelectElement ||
    value instanceof HTMLTextAreaElement ||
    value instanceof HTMLFieldSetElement ||
    value instanceof HTMLOptGroupElement ||
    value instanceof HTMLOptionElement
  )) {
    throw new Error('無効化できる操作部品を指定してください。');
  }
  return value;
}
