export /** マップ画面内だけの共有状態。DBへの確定はstate-controllerの保存処理を通します。 */
function createMapRuntime() {
  const escapeHTML = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );
  const statusNames = {
    active: '工事中',
    planned: '予定',
    done: '完了',
  };
  const uid = () =>
    [...crypto.getRandomValues(new Uint8Array(16))]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
  const today = () =>
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  const fmt = (date) => (date ? date.replaceAll('-', '.') : '—');
  /** @returns {import('leaflet').LatLngTuple} */
  const ll = (point) => [point[1], point[0]];
  let state;
  let map;
  let workGroup;
  let assetGroup;
  let baseGroup;
  let scaleControl;
  let currentDrawing = 'site';
  let selectedId = null;
  let tab = 'works';
  let editor = false;
  let pendingLayer = null;
  let pendingPoints = null;
  let impactOnly = false;
  let toastTimer;
  let searchTimer;
  let drawingActive = false;
  const cadGroups = {};
  let editingWorkId = null;
  let redrawId = null;
  return {
    get escapeHTML() {
      return escapeHTML;
    },
    get statusNames() {
      return statusNames;
    },
    get uid() {
      return uid;
    },
    get today() {
      return today;
    },
    get fmt() {
      return fmt;
    },
    get ll() {
      return ll;
    },
    get state() {
      return state;
    },
    set state(value) {
      state = value;
    },
    get map() {
      return map;
    },
    set map(value) {
      map = value;
    },
    get workGroup() {
      return workGroup;
    },
    set workGroup(value) {
      workGroup = value;
    },
    get assetGroup() {
      return assetGroup;
    },
    set assetGroup(value) {
      assetGroup = value;
    },
    get baseGroup() {
      return baseGroup;
    },
    set baseGroup(value) {
      baseGroup = value;
    },
    get scaleControl() {
      return scaleControl;
    },
    set scaleControl(value) {
      scaleControl = value;
    },
    get currentDrawing() {
      return currentDrawing;
    },
    set currentDrawing(value) {
      currentDrawing = value;
    },
    get selectedId() {
      return selectedId;
    },
    set selectedId(value) {
      selectedId = value;
    },
    get tab() {
      return tab;
    },
    set tab(value) {
      tab = value;
    },
    get editor() {
      return editor;
    },
    set editor(value) {
      editor = value;
    },
    get pendingLayer() {
      return pendingLayer;
    },
    set pendingLayer(value) {
      pendingLayer = value;
    },
    get pendingPoints() {
      return pendingPoints;
    },
    set pendingPoints(value) {
      pendingPoints = value;
    },
    get impactOnly() {
      return impactOnly;
    },
    set impactOnly(value) {
      impactOnly = value;
    },
    get toastTimer() {
      return toastTimer;
    },
    set toastTimer(value) {
      toastTimer = value;
    },
    get searchTimer() {
      return searchTimer;
    },
    set searchTimer(value) {
      searchTimer = value;
    },
    get drawingActive() {
      return drawingActive;
    },
    set drawingActive(value) {
      drawingActive = value;
    },
    get cadGroups() {
      return cadGroups;
    },
    get editingWorkId() {
      return editingWorkId;
    },
    set editingWorkId(value) {
      editingWorkId = value;
    },
    get redrawId() {
      return redrawId;
    },
    set redrawId(value) {
      redrawId = value;
    },
  };
}
