import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const buttonClass = 'flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav className="flex items-center gap-1.5" aria-label="Phân trang">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className={`${buttonClass} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`} aria-label="Trang trước">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          aria-current={item === page ? 'page' : undefined}
          className={`${buttonClass} px-2 ${item === page ? 'border-blue-600 bg-blue-600 font-semibold text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          {item}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} className={`${buttonClass} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`} aria-label="Trang sau">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
