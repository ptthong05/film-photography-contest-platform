import type { JudgeContest } from '../../../types/judge';
import { formatDate } from '../../../utils/formatDate';
import { StatusBadge } from './StatusBadge';

interface ContestProgressItemProps {
  contest: JudgeContest;
  onOpenContest: (contestId: string) => void;
}

export function ContestProgressItem({ contest, onOpenContest }: ContestProgressItemProps) {
  const percent = contest.assignedCount === 0 ? 0 : Math.round((contest.evaluatedCount / contest.assignedCount) * 100);
  const isDone = contest.status === 'COMPLETED';

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
      <img src={contest.coverUrl} alt="" className="h-20 w-full rounded-lg object-cover sm:w-28" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{contest.title}</p>
        <p className="text-xs text-slate-500">
          {formatDate(contest.startDate)} - {formatDate(contest.endDate)}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusBadge kind="contest" status={contest.status} />
          <StatusBadge kind="custom" label={contest.currentRound.name} tone="sky" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-32">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Tiến độ</span>
            <span className="font-semibold text-slate-700">
              {contest.evaluatedCount}/{contest.assignedCount}
            </span>
          </div>
          <div
            className="mt-1 h-2 rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Đã chấm ${percent}%`}
          >
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">đã chấm</p>
        </div>
        <button type="button" onClick={() => onOpenContest(contest.id)} className="judge-btn-outline whitespace-nowrap">
          {isDone ? 'Xem bài' : 'Chấm điểm'}
        </button>
      </div>
    </div>
  );
}
