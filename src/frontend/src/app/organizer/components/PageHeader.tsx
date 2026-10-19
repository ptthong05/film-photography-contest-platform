import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

export function PageHeader({ title, subtitle, onBack }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Quay lại"
        onClick={onBack}
        className="card flex size-10 items-center justify-center text-slate-600 hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
