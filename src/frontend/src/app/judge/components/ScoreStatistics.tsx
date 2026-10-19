import type { Evaluation, JudgingCriterion } from '../../../types/judge';

const SCORE_BUCKETS = [
  { label: '< 6', min: 0, max: 6 },
  { label: '6 - 7', min: 6, max: 7 },
  { label: '7 - 8', min: 7, max: 8 },
  { label: '8 - 9', min: 8, max: 9 },
  { label: '9 - 10', min: 9, max: 10.01 },
];

interface ScoreStatisticsProps {
  criteria: JudgingCriterion[];
  evaluations: Evaluation[];
}

function average(values: number[]): number | null {
  return values.length === 0 ? null : Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

export function ScoreStatistics({ criteria, evaluations }: ScoreStatisticsProps) {
  if (evaluations.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-500">Chưa có phiếu chấm nào để thống kê.</p>;
  }

  const totals = evaluations.flatMap((item) => (item.totalScore === null ? [] : [item.totalScore]));
  const criterionAverages = criteria.map((criterion) => ({
    criterion,
    value: average(evaluations.flatMap((item) => item.scores.filter((score) => score.criterionId === criterion.id).map((score) => score.score))),
  }));
  const buckets = SCORE_BUCKETS.map((bucket) => ({
    ...bucket,
    count: totals.filter((value) => value >= bucket.min && value < bucket.max).length,
  }));
  const maxBucketCount = Math.max(1, ...buckets.map((bucket) => bucket.count));

  const tiles: [string, string][] = [
    ['Số bài đã chấm', String(evaluations.length)],
    ['Điểm trung bình', average(totals)?.toFixed(1) ?? '–'],
    ['Cao nhất', totals.length ? Math.max(...totals).toFixed(1) : '–'],
    ['Thấp nhất', totals.length ? Math.min(...totals).toFixed(1) : '–'],
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <figure className="rounded-xl border border-slate-200 p-4">
          <figcaption className="mb-4 text-sm font-semibold text-slate-900">Điểm trung bình theo tiêu chí của bạn</figcaption>
          <ul className="space-y-3">
            {criterionAverages.map(({ criterion, value }) => (
              <li key={criterion.id} title={`${criterion.name}: ${value ?? '–'}/${criterion.maxScore}`}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{criterion.name}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{value?.toFixed(1) ?? '–'}</span>
                </div>
                <div className="mt-1 h-2 rounded bg-slate-100">
                  <div className="h-2 rounded bg-blue-600" style={{ width: `${((value ?? 0) / criterion.maxScore) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </figure>

        <figure className="rounded-xl border border-slate-200 p-4">
          <figcaption className="mb-4 text-sm font-semibold text-slate-900">Phân bố điểm tổng</figcaption>
          <div className="flex h-44 items-end gap-3 border-b border-slate-200">
            {buckets.map((bucket) => (
              <div key={bucket.label} className="group flex h-full flex-1 flex-col justify-end" title={`${bucket.label} điểm: ${bucket.count} bài`}>
                <span className="mb-1 text-center text-xs font-semibold text-slate-700 tabular-nums">{bucket.count > 0 ? bucket.count : ''}</span>
                <div
                  className="rounded-t bg-blue-600 transition-colors group-hover:bg-blue-700"
                  style={{ height: `${(bucket.count / maxBucketCount) * 85}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3">
            {buckets.map((bucket) => (
              <span key={bucket.label} className="flex-1 text-center text-xs text-slate-500">{bucket.label}</span>
            ))}
          </div>
        </figure>
      </div>

      <details className="rounded-xl border border-slate-200 p-4 text-sm">
        <summary className="cursor-pointer font-medium text-slate-700">Xem dạng bảng</summary>
        <table className="mt-3 w-full text-left">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="py-1">Khoảng điểm</th>
              <th className="py-1 text-right">Số bài</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((bucket) => (
              <tr key={bucket.label} className="border-t border-slate-100">
                <td className="py-1.5 text-slate-600">{bucket.label}</td>
                <td className="py-1.5 text-right tabular-nums">{bucket.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
