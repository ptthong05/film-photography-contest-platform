import { Award, Eye, ImageOff, UserRound } from 'lucide-react';
import { useState } from 'react';

/** Dữ liệu của một ảnh đoạt giải được lưu trong kho số. */
export type ArchivePrize = 'FIRST' | 'SECOND' | 'THIRD' | 'HONORABLE';

export interface ArchiveItem {
  id: string;
  title: string;
  author: string;
  contest: string;
  year: number;
  prize: ArchivePrize;
  imageUrl: string;
  awardedAt: string;
  metadata: {
    filmStock: string;
    iso: number;
    camera: string;
    lens: string;
    filmFormat: string;
    frameNumber: string;
    developingLab: string;
    scanDetails: string;
  };
  judgeComment: string;
}

export const ARCHIVE_PRIZES: Record<ArchivePrize, { label: string; badge: string }> = {
  FIRST: { label: 'Giải Nhất', badge: 'bg-amber-100 text-amber-800' },
  SECOND: { label: 'Giải Nhì', badge: 'bg-sky-100 text-sky-800' },
  THIRD: { label: 'Giải Ba', badge: 'bg-emerald-100 text-emerald-800' },
  HONORABLE: { label: 'Giải Khuyến khích', badge: 'bg-violet-100 text-violet-800' },
};

function ArchiveThumbnail({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100">
      {failed ? (
        <span className="flex flex-col items-center gap-2 text-xs text-slate-400">
          <ImageOff size={28} aria-hidden="true" />Không tải được ảnh mẫu
        </span>
      ) : (
        <img
          src={src}
          alt={`Ảnh minh họa: ${title}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

interface DigitalArchiveManagementProps {
  items: ArchiveItem[];
  onSelect: (item: ArchiveItem) => void;
}

/** Lưới ảnh sử dụng lại được; việc lọc/trang/chi tiết do ArchiveView quản lý. */
export function DigitalArchiveManagement({ items, onSelect }: DigitalArchiveManagementProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <ImageOff className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
        <p className="mt-3 font-semibold text-slate-700">Không tìm thấy tác phẩm phù hợp</p>
        <p className="mt-1 text-sm text-slate-500">Thử đổi từ khóa hoặc xóa bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item) => {
        const prize = ARCHIVE_PRIZES[item.prize];
        return (
          <article key={item.id} className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <ArchiveThumbnail src={item.imageUrl} title={item.title} />
            <div className="flex flex-1 flex-col gap-2 p-3">
              <p className="truncate text-sm font-bold text-[#0B356B]" title={item.title}>{item.title}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${prize.badge}`}>
                  <Award size={12} aria-hidden="true" />{prize.label}
                </span>
              </div>
              <p className="flex items-center gap-1.5 truncate text-xs text-slate-600" title={item.author}>
                <UserRound size={13} className="shrink-0" aria-hidden="true" />{item.author}
              </p>
              <p className="truncate text-xs text-slate-500" title={item.contest}>{item.contest} · {item.year}</p>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                aria-label={`Xem chi tiết tác phẩm ${item.title}`}
              >
                <Eye size={15} aria-hidden="true" />Xem chi tiết
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
