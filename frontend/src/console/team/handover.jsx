/** 期間内の変更と完了・未完了を確認する、チームの引き継ぎ表示。 */
import { api, today, writeFile } from '../team-shared.jsx';
import { useEffect, useState } from 'react';
export function Handover() {
  const [day, setDay] = useState(today());
  const [report, setReport] = useState(
    /** @type {import('../../../../shared/model').TeamReport|null} */ (null),
  );
  const [message, setMessage] = useState('');
  useEffect(() => {
    let live = true;
    if (day) {
      api('/api/team/report?date=' + day)
        .then((r) => {
          if (live) {
            setReport(r);
          }
        })
        .catch((e) => {
          if (live) {
            setMessage(e.message);
          }
        });
    }
    return () => {
      live = false;
    };
  }, [day]);
  return (
    <section className="product-card team-handover">
      <div className="team-section-heading">
        <div>
          <h2>引き継ぎレポート</h2>
          <p>期限超過・手配待ち・未割り当て・直近の完了と引き継ぎコメントをまとめます。</p>
        </div>
        <input
          aria-label="引き継ぎの基準日"
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
      </div>
      <p className="team-error" role="status">
        {message}
      </p>
      {report && (
        <>
          <div className="product-actions">
            <button
              className="primary-product"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(report.markdown);
                  setMessage('引き継ぎ内容をコピーしました。');
                } catch {
                  setMessage(
                    'コピーできませんでした。本文を選択するか、ファイルを保存してください。',
                  );
                }
              }}
            >
              引き継ぎ内容をコピー
            </button>
            <button
              onClick={() => writeFile('施設グループ引き継ぎ-' + day + '.md', report.markdown)}
            >
              引き継ぎファイルを保存
            </button>
            <button
              onClick={() =>
                api('/api/team/report?date=' + day)
                  .then(setReport)
                  .catch((e) => setMessage(e.message))
              }
            >
              最新の情報に更新
            </button>
          </div>
          <textarea aria-label="引き継ぎレポート" readOnly value={report.markdown} />
          <p className="team-help">
            送信は行いません。コピーした内容を、朝会や普段使っているチャットで共有できます。基準日は期限判定と完了期間に使用し、過去時点の状態を復元するものではありません。
          </p>
        </>
      )}
    </section>
  );
}
