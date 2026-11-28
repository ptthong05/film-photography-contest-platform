import { judgeService } from '../../../services/judgeService';
import { useFetch } from '../../../hooks/useFetch';
import { formatDate } from '../../../utils/formatDate';
import { AsyncState } from './AsyncState';
import { ContestProgressItem } from './ContestProgressItem';

interface MyContestsViewProps {
  onOpenContest: (contestId: string) => void;
}

export function MyContestsView({ onOpenContest }: MyContestsViewProps) {
  const { data: contests, isLoading, error, refetch } = useFetch(judgeService.getContests);

  return (
    <div className="space-y-4">
      <AsyncState isLoading={isLoading} error={error} onRetry={refetch} />
      {contests && contests.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          <p className="text-base font-medium text-slate-700">Chưa có cuộc thi nào được phân công</p>
          <p className="mt-1 text-sm text-slate-500">Khi Ban tổ chức phân công chấm thi cho bạn, các cuộc thi sẽ hiển thị tại đây.</p>
        </div>
      )}
      {contests?.map((contest) => (
        <section key={contest.id} className="judge-card px-5">
          <ContestProgressItem contest={contest} onOpenContest={onOpenContest} />
          <div className="grid gap-4 border-t border-slate-100 py-4 text-sm md:grid-cols-[220px_1fr]">
            <div className="space-y-1 text-slate-600">
              <p className="font-medium text-slate-900">{contest.currentRound.name}</p>
              <p>
                Thời gian chấm: {formatDate(contest.currentRound.startDate)} - {formatDate(contest.currentRound.endDate)}
              </p>
            </div>
            <div>
              <p className="mb-2 font-medium text-slate-900">Tiêu chí chấm (thang {contest.criteria[0]?.maxScore ?? 10})</p>
              <div className="flex flex-wrap gap-2">
                {contest.criteria.map((criterion) => (
                  <span key={criterion.id} title={criterion.description} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                    {criterion.name} · <span className="font-semibold">{criterion.weight}%</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
