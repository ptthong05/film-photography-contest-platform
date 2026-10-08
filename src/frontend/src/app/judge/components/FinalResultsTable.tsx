import { useCallback } from 'react';
import { Award, Info } from 'lucide-react';
import { judgeService } from '../../../services/judgeService';
import { useFetch } from '../../../hooks/useFetch';
import { AsyncState } from './AsyncState';

interface FinalResultsTableProps {
  contestId: string;
  isPublished: boolean;
}

export function FinalResultsTable({ contestId, isPublished }: FinalResultsTableProps) {
  const fetchResults = useCallback(() => judgeService.getContestResults(contestId), [contestId]);
  const { data: results, isLoading, error, refetch } = useFetch(fetchResults);

  // Kết quả chỉ hiển thị sau khi ban tổ chức xác nhận và công bố (BR-008)
  if (!isPublished) {
    return (
      <p className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Info className="h-4 w-4" />
        Ban tổ chức chưa công bố kết quả chính thức của cuộc thi này.
      </p>
    );
  }

  if (!results) {
    return <AsyncState isLoading={isLoading} error={error} onRetry={refetch} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
          <tr>
            <th className="px-3 py-3">Hạng</th>
            <th className="px-3 py-3">Tên tác phẩm</th>
            <th className="px-3 py-3">Tác giả</th>
            <th className="px-3 py-3 text-right">Điểm trung bình</th>
            <th className="px-3 py-3">Giải thưởng</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {results.map((item) => (
            <tr key={item.rank} className="hover:bg-slate-50">
              <td className="px-3 py-3 font-bold text-slate-900">#{item.rank}</td>
              <td className="px-3 py-3 font-semibold text-slate-900">{item.submissionTitle}</td>
              <td className="px-3 py-3 text-slate-600">{item.authorName}</td>
              <td className="px-3 py-3 text-right font-semibold text-slate-800 tabular-nums">{item.averageScore.toFixed(1)}</td>
              <td className="px-3 py-3">
                {item.award ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-700">
                    <Award className="h-4 w-4" /> {item.award}
                  </span>
                ) : (
                  <span className="text-slate-400">–</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
