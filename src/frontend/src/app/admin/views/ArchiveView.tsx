import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive, CalendarDays, ChevronLeft, ChevronRight, Download,
  FilterX, Search, X,
} from 'lucide-react';
import {
  ARCHIVE_PRIZES,
  DigitalArchiveManagement,
  type ArchiveItem,
  type ArchivePrize,
} from '../components/DigitalArchiveManagement';

/**
 * Admin > Kho dữ liệu (Digital Archive).
 * Chỉ tra cứu tác phẩm đã đoạt giải; dữ liệu bên dưới hoàn toàn là MẪU.
 * Không có API, tải ảnh gốc, chức năng bình chọn hay sửa kết quả cuộc thi.
 */
const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=650&q=80',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=650&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=650&q=80',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=650&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=650&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=650&q=80',
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=650&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=650&q=80',
];

type DemoRow = {
  title: string;
  author: string;
  contest: string;
  year: number;
  prize: ArchivePrize;
  filmStock: string;
};

const DEMO_ROWS: DemoRow[] = [
  { title: 'Sài Gòn chiều mưa', author: 'Nguyễn Văn A', contest: 'Analog Moments 2025', year: 2025, prize: 'FIRST', filmStock: 'Kodak Portra 400' },
  { title: 'Nắng cuối ngày', author: 'Trần Thị B', contest: 'Film & City', year: 2025, prize: 'SECOND', filmStock: 'Kodak Gold 200' },
  { title: 'Đường về', author: 'Lê Thu D', contest: 'The Vintage Look', year: 2025, prize: 'THIRD', filmStock: 'Ilford HP5 Plus' },
  { title: 'Bình yên', author: 'Phạm Văn E', contest: 'Nature on Film', year: 2025, prize: 'HONORABLE', filmStock: 'Fujifilm Superia 400' },
  { title: 'Góc phố cũ', author: 'Hồ Thị Lan', contest: 'Black & White Stories', year: 2025, prize: 'FIRST', filmStock: 'Ilford Delta 100' },
  { title: 'Nhịp sống', author: 'Đỗ Minh G', contest: 'Film & City', year: 2025, prize: 'SECOND', filmStock: 'Cinestill 800T' },
  { title: 'Dòng sông', author: 'Vũ Thanh Mai', contest: 'Nature on Film', year: 2024, prize: 'THIRD', filmStock: 'Kodak Ektar 100' },
  { title: 'Chân dung', author: 'Nguyễn Phú H', contest: 'The Vintage Look', year: 2025, prize: 'HONORABLE', filmStock: 'Kodak Tri-X 400' },
  { title: 'Thành phố đêm', author: 'Trịnh Gia K', contest: 'Analog Moments 2025', year: 2025, prize: 'THIRD', filmStock: 'Cinestill 800T' },
  { title: 'Ánh sáng', author: 'Trần Mỹ Linh', contest: 'Film & City', year: 2025, prize: 'HONORABLE', filmStock: 'Kodak Portra 160' },
  { title: 'Phố cổ', author: 'Lâm Minh P', contest: 'Black & White Stories', year: 2024, prize: 'HONORABLE', filmStock: 'Ilford HP5 Plus' },
  { title: 'Biển chiều', author: 'Đinh Văn Q', contest: 'Nature on Film', year: 2025, prize: 'SECOND', filmStock: 'Kodak Ektar 100' },
  { title: 'Ngõ nhỏ', author: 'Lê Minh T', contest: 'The Vintage Look', year: 2024, prize: 'THIRD', filmStock: 'Kodak Gold 200' },
  { title: 'Sương sớm', author: 'Bùi Ngọc Anh', contest: 'Analog Moments 2025', year: 2025, prize: 'HONORABLE', filmStock: 'Ilford Delta 100' },
  { title: 'Cầu cũ', author: 'Phan Thanh Bình', contest: 'Film & City', year: 2025, prize: 'THIRD', filmStock: 'Fujicolor C200' },
  { title: 'Về nhà', author: 'Mai Đức Long', contest: 'Black & White Stories', year: 2024, prize: 'HONORABLE', filmStock: 'Kodak Tri-X 400' },
  { title: 'Mùa hoa', author: 'Ngô Thị Hương', contest: 'Nature on Film', year: 2025, prize: 'SECOND', filmStock: 'Fujifilm Superia 400' },
  { title: 'Qua ô cửa', author: 'Võ Quốc Minh', contest: 'The Vintage Look', year: 2025, prize: 'THIRD', filmStock: 'Kodak Portra 400' },
  { title: 'Chiều trên đồi', author: 'Tạ Quang Vinh', contest: 'Analog Moments 2025', year: 2025, prize: 'HONORABLE', filmStock: 'Kodak Ektar 100' },
  { title: 'Lối rẽ', author: 'Hoàng Thị Ngọc', contest: 'Film & City', year: 2025, prize: 'HONORABLE', filmStock: 'Ilford HP5 Plus' },
];

const DEMO_ARCHIVE: ArchiveItem[] = DEMO_ROWS.map((row, index) => ({
  id: `ARC-${String(index + 1).padStart(4, '0')}`,
  ...row,
  imageUrl: IMAGE_URLS[index % IMAGE_URLS.length],
  awardedAt: `${row.year}-12-15`,
  metadata: {
    filmStock: row.filmStock,
    iso: [100, 200, 400, 800][index % 4],
    camera: ['Nikon FM2', 'Canon AE-1', 'Pentax K1000', 'Olympus OM-1'][index % 4],
    lens: index % 2 ? '35mm f/2.8' : '50mm f/1.8',
    filmFormat: index % 5 === 0 ? '120' : '35mm',
    frameNumber: String((index * 3) % 36 + 1).padStart(2, '0'),
    developingLab: index % 2 ? 'Lab B (mẫu)' : 'Lab A (mẫu)',
    scanDetails: 'JPEG · 3000 × 2000 px · 24-bit (mẫu)',
  },
  judgeComment: 'Nhận xét minh họa. Chưa có dữ liệu đánh giá thực tế từ giám khảo.',
}));

const PAGE_SIZE = 10;
type PrizeFilter = 'ALL' | ArchivePrize;
const PRIZE_TABS: { value: PrizeFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'FIRST', label: 'Giải Nhất' },
  { value: 'SECOND', label: 'Giải Nhì' },
  { value: 'THIRD', label: 'Giải Ba' },
  { value: 'HONORABLE', label: 'Giải Khuyến khích' },
];

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
function formatDate(value: string) { return value.split('-').reverse().join('/'); }
function escapeCsv(value: string | number) { return `"${String(value).replace(/"/g, '""')}"`; }

function ArchiveDetail({ item, onClose }: { item: ArchiveItem; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const controls = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled])');
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  const meta = item.metadata;
  const details: [string, string][] = [
    ['Mã lưu trữ', item.id], ['Cuộc thi', item.contest], ['Năm', String(item.year)],
    ['Ngày trao giải (mẫu)', formatDate(item.awardedAt)],
    ['Film stock', meta.filmStock], ['ISO', String(meta.iso)],
    ['Máy ảnh', meta.camera], ['Ống kính', meta.lens],
    ['Film format', meta.filmFormat], ['Frame number', meta.frameNumber],
    ['Phòng lab', meta.developingLab], ['Thông số scan', meta.scanDetails],
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="archive-detail-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Digital Archive · Dữ liệu mẫu</p>
            <h2 id="archive-detail-title" className="mt-1 text-xl font-bold text-[#0B356B]">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{item.author} · {ARCHIVE_PRIZES[item.prize].label}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Đóng chi tiết tác phẩm"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600">
            <X size={21} aria-hidden="true" />
          </button>
        </header>
        <div className="space-y-5 p-5">
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Tác phẩm, giải thưởng và metadata bên dưới đều là dữ liệu minh họa, chưa được xác nhận bởi hệ thống thật.
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-lg border border-slate-200 p-3">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="font-semibold text-[#0B356B]">Nhận xét giám khảo</h3>
            <p className="mt-1 text-sm text-slate-600">{item.judgeComment}</p>
          </div>
        </div>
        <footer className="flex justify-end border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Đóng</button>
        </footer>
      </section>
    </div>
  );
}

export function ArchiveView() {
  const [search, setSearch] = useState('');
  const [prize, setPrize] = useState<PrizeFilter>('ALL');
  const [contest, setContest] = useState('ALL');
  const [year, setYear] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ArchiveItem | null>(null);

  const contests = useMemo(() => Array.from(new Set(DEMO_ARCHIVE.map((item) => item.contest))).sort(), []);
  const years = useMemo(() => Array.from(new Set(DEMO_ARCHIVE.map((item) => item.year))).sort((a, b) => b - a), []);
  const counts = useMemo(() => ({
    ALL: DEMO_ARCHIVE.length,
    FIRST: DEMO_ARCHIVE.filter((item) => item.prize === 'FIRST').length,
    SECOND: DEMO_ARCHIVE.filter((item) => item.prize === 'SECOND').length,
    THIRD: DEMO_ARCHIVE.filter((item) => item.prize === 'THIRD').length,
    HONORABLE: DEMO_ARCHIVE.filter((item) => item.prize === 'HONORABLE').length,
  }), []);

  const filtered = useMemo(() => {
    const term = normalizeSearch(search);
    return DEMO_ARCHIVE.filter((item) => {
      if (prize !== 'ALL' && item.prize !== prize) return false;
      if (contest !== 'ALL' && item.contest !== contest) return false;
      if (year !== 'ALL' && item.year !== Number(year)) return false;
      if (!term) return true;
      return [item.id, item.title, item.author, item.contest, item.metadata.filmStock]
        .some((value) => normalizeSearch(value).includes(term));
    });
  }, [search, prize, contest, year]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const start = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const resetFilters = () => { setSearch(''); setPrize('ALL'); setContest('ALL'); setYear('ALL'); setPage(1); };
  const exportCsv = () => {
    if (!filtered.length) return;
    const header = ['Mã', 'Tác phẩm', 'Tác giả', 'Cuộc thi', 'Năm', 'Giải thưởng', 'Film stock', 'Máy ảnh'];
    const rows = filtered.map((item) => [item.id, item.title, item.author, item.contest, item.year,
      ARCHIVE_PRIZES[item.prize].label, item.metadata.filmStock, item.metadata.camera]);
    const csv = '\uFEFF' + [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'filmcontest-digital-archive-demo.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <section aria-label="Kho dữ liệu tác phẩm đạt giải" className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Archive size={21} aria-hidden="true" /></span>
            <div>
              <h2 className="font-bold text-[#0B356B]">Thư viện tác phẩm đạt giải</h2>
              <p className="text-xs text-slate-500">{DEMO_ARCHIVE.length} tác phẩm minh họa — chưa kết nối MongoDB hoặc Cloud Storage</p>
            </div>
          </div>
          <button type="button" onClick={exportCsv} disabled={filtered.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40">
            <Download size={17} aria-hidden="true" />Tải danh sách CSV (mẫu)
          </button>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-2" role="group" aria-label="Lọc theo giải thưởng">
          {PRIZE_TABS.map((tab) => (
            <button key={tab.value} type="button" aria-pressed={prize === tab.value}
              onClick={() => { setPrize(tab.value); setPage(1); }}
              className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${prize === tab.value ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-700'}`}>
              {tab.label} ({counts[tab.value]})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 p-4">
          <label className="relative min-w-[190px] flex-1">
            <span className="sr-only">Tìm kiếm tác phẩm</span>
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Tìm tác phẩm, tác giả, mã..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="sr-only" htmlFor="admin-archive-contest">Lọc cuộc thi</label>
          <select id="admin-archive-contest" value={contest} onChange={(event) => { setContest(event.target.value); setPage(1); }}
            className="max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none">
            <option value="ALL">Tất cả cuộc thi</option>
            {contests.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <label className="sr-only" htmlFor="admin-archive-year">Lọc năm</label>
          <div className="relative">
            <CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <select id="admin-archive-year" value={year} onChange={(event) => { setYear(event.target.value); setPage(1); }}
              className="rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none">
              <option value="ALL">Tất cả năm</option>
              {years.map((value) => <option key={value} value={String(value)}>{value}</option>)}
            </select>
          </div>
          <button type="button" onClick={resetFilters} title="Xóa tất cả bộ lọc"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <FilterX size={16} aria-hidden="true" />Bỏ lọc
          </button>
        </div>
      </div>

      <DigitalArchiveManagement items={visible} onSelect={setSelected} />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <span>Hiển thị <strong className="text-slate-700">{start}–{end}</strong> / {filtered.length} tác phẩm mẫu</span>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Trang trước" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <span className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">{currentPage} / {pageCount}</span>
          <button type="button" aria-label="Trang sau" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      {selected && <ArchiveDetail item={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
