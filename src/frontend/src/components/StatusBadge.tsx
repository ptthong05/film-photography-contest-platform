import type { BadgeTone } from "../types/badge";

const TONE_CLASS: Record<BadgeTone, string> = {
  success: "bg-emerald-50 text-emerald-600",
  info: "bg-sky-50 text-sky-600",
  danger: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
};

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={`rounded-md px-2 py-1 text-xs font-medium ${TONE_CLASS[tone]}`}>{label}</span>;
}
