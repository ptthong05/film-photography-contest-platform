import type { LucideIcon } from 'lucide-react';

type StatTone = 'blue' | 'emerald' | 'indigo' | 'amber';

const TONE_CLASSES: Record<StatTone, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  amber: 'bg-amber-50 text-amber-600',
};

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  tone: StatTone;
}

export function StatCard({ icon: Icon, value, label, tone }: StatCardProps) {
  return (
    <div className="judge-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
