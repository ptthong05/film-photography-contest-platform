import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  eyebrow?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, onBack, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-label="Quay lại"
        onClick={onBack}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-[#0B356B]">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="ml-auto flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
