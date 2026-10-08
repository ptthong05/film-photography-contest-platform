import type { EvaluationStatus, JudgeContestStatus } from '../../../types/judge';

type BadgeTone = 'amber' | 'sky' | 'emerald' | 'slate' | 'orange';

const TONE_CLASSES: Record<BadgeTone, string> = {
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
};

const EVALUATION_STATUS: Record<EvaluationStatus, { label: string; tone: BadgeTone }> = {
  NOT_STARTED: { label: 'Chưa chấm', tone: 'amber' },
  DRAFT: { label: 'Đang nháp', tone: 'sky' },
  FINALIZED: { label: 'Đã chấm', tone: 'emerald' },
};

const CONTEST_STATUS: Record<JudgeContestStatus, { label: string; tone: BadgeTone }> = {
  NOT_STARTED: { label: 'Chưa chấm', tone: 'orange' },
  JUDGING: { label: 'Đang chấm', tone: 'emerald' },
  COMPLETED: { label: 'Đã hoàn thành', tone: 'slate' },
};

type StatusBadgeProps =
  | { kind: 'evaluation'; status: EvaluationStatus }
  | { kind: 'contest'; status: JudgeContestStatus }
  | { kind: 'custom'; label: string; tone: BadgeTone };

export function StatusBadge(props: StatusBadgeProps) {
  let config: { label: string; tone: BadgeTone };
  if (props.kind === 'evaluation') {
    config = EVALUATION_STATUS[props.status];
  } else if (props.kind === 'contest') {
    config = CONTEST_STATUS[props.status];
  } else {
    config = props;
  }

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[config.tone]}`}>
      {config.label}
    </span>
  );
}
