/** 画像の縮小と添付で共用するCanvasの窓口。変換できない場合は呼び出し元で原本利用・エラー表示を選びます。 */
/** @param {HTMLCanvasElement} canvas */
export function imageContext(canvas) {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('画像の変換に必要な描画機能がありません。');
  }
  return context;
}
/** @param {HTMLCanvasElement} canvas @returns {Promise<Blob>} */
export function pngBlob(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('画像を変換できませんでした。'));
      }
    }, 'image/png'),
  );
}
