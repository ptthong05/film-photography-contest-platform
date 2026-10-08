import { useCallback } from 'react';
import { judgeService } from '../../../services/judgeService';
import { useFetch } from '../../../hooks/useFetch';
import { formatDate } from '../../../utils/formatDate';
import { AsyncState } from './AsyncState';
import { StatusBadge } from './StatusBadge';

interface EvaluationHistoryListProps {
  submissionId: string;
}

/** Chỉ hiển thị phiếu chấm của chính giám khảo — không lộ điểm giám khảo khác để giữ tính độc lập. */
export function EvaluationHistoryList({ submissionId }: EvaluationHistoryListProps) {
  const fetchHistory = useCallback(() => judgeService.getEvaluationHistory(submissionId), [submissionId]);
  const { data: history, isLoading, error, refetch } = useFetch(fetchHistory);

  if (!history) {
    return <AsyncState isLoading={isLoading} error={error} onRetry={refetch} />;
  }

  if (history.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">Bạn chưa gửi phiếu chấm nào cho bài này.</p>;
  }

  return (
    <ol className="space-y-3">
      {history.map((item) => (
        <li key={`${item.roundName}-${item.evaluatedAt}`} className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-900">{item.roundName}</p>
            <span className="text-lg font-bold text-blue-700">{item.totalScore.toFixed(1)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{item.comment}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{formatDate(item.evaluatedAt)}</span>
            {item.recommendNextRound && <StatusBadge kind="custom" label="Đề xuất vào vòng sau" tone="emerald" />}
          </div>
        </li>
      ))}
    </ol>
  );
}
