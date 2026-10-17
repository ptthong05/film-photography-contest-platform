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
