import type { ReactNode } from "react";

interface OrganizerPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}

export function OrganizerPageHeader({ title, description, action, eyebrow = "BAN TỔ CHỨC" }: OrganizerPageHeaderProps) {
  return <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0B356B]">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
  </header>;
}
