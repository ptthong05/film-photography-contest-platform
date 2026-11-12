import { useEffect, useMemo, useState } from 'react';
import {
  Archive, CalendarDays, ChevronLeft, ChevronRight, Download,
  FilterX, Search,
} from 'lucide-react';
import {
  ARCHIVE_PRIZES,
  DigitalArchiveManagement,
  type ArchiveItem,
  type ArchivePrize,
} from '../components/DigitalArchiveManagement';
import { AdminArchiveDetailPage } from './AdminArchiveDetailPage';
import { getAdminPublishedArchives } from '../../../services/publishedAwardService';

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
  judgeComment: 'Nhận xét minh họa. Tác phẩm thể hiện xuất sắc ngôn ngữ ảnh phim, bố cục chặt chẽ và tương phản ánh sáng đặc sắc.',
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

export function ArchiveView() {
  const [activeTab, setActiveTab] = useState<PrizeFilter>('ALL');
  const [contestFilter, setContestFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
  const [publishedArchives, setPublishedArchives] = useState<ArchiveItem[]>(getAdminPublishedArchives);

  useEffect(() => {
    setPublishedArchives(getAdminPublishedArchives());
    const handleStorage = () => setPublishedArchives(getAdminPublishedArchives());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('filmcontest:published-results-updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('filmcontest:published-results-updated', handleStorage);
    };
  }, []);

  const combinedArchive = useMemo(() => {
    return [
      ...publishedArchives,
      ...DEMO_ARCHIVE.filter(demo => !publishedArchives.some(pub => pub.title === demo.title || pub.id === demo.id))
    ];
  }, [publishedArchives]);

  const contests = useMemo(() => ['ALL', ...Array.from(new Set(combinedArchive.map((item) => item.contest)))], [combinedArchive]);
  const years = useMemo(() => ['ALL', ...Array.from(new Set(combinedArchive.map((item) => String(item.year))))].sort().reverse(), [combinedArchive]);

  const filtered = useMemo(() => {
    const term = normalizeSearch(search);
    return combinedArchive.filter((item) => {
      if (activeTab !== 'ALL' && item.prize !== activeTab) return false;
      if (contestFilter !== 'ALL' && item.contest !== contestFilter) return false;
      if (yearFilter !== 'ALL' && String(item.year) !== yearFilter) return false;
      if (term) {
        const hay = normalizeSearch(`${item.title} ${item.author} ${item.contest} ${item.id} ${item.metadata.filmStock}`);
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [combinedArchive, activeTab, contestFilter, yearFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFilters = () => {
    setActiveTab('ALL');
    setContestFilter('ALL');
    setYearFilter('ALL');
    setSearch('');
    setPage(1);
  };

  const handleExportCsv = () => {
    const headers = ['Mã lưu trữ', 'Tác phẩm', 'Tác giả', 'Cuộc thi', 'Năm', 'Giải thưởng', 'Film stock', 'ISO', 'Máy ảnh', 'Ống kính', 'Ngày trao giải'];
    const rows = filtered.map((item) => [
      item.id,
      item.title,
      item.author,
      item.contest,
      item.year,
      ARCHIVE_PRIZES[item.prize].label,
      item.metadata.filmStock,
      item.metadata.iso,
      item.metadata.camera,
      item.metadata.lens,
      formatDate(item.awardedAt),
    ]);
    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kho-anh-doat-giai-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // NẾU ĐANG CHỌN XEM CHI TIẾT: Hiển thị giao diện trang riêng biệt
  if (selectedItem) {
    return (
      <AdminArchiveDetailPage
        item={selectedItem}
        onBack={() => setSelectedItem(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Banner lưu ý */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Dữ liệu mẫu kho số — chỉ phục vụ tra cứu các tác phẩm đã đoạt giải
        </span>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Download size={15} />
          Xuất danh sách CSV ({filtered.length})
        </button>
      </div>

      {/* Thẻ bảng điều khiển chính */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Bộ lọc Giải thưởng Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 px-5 pt-3">
          {PRIZE_TABS.map((tab) => {
            const count = tab.value === 'ALL'
              ? combinedArchive.length
              : combinedArchive.filter((it) => it.prize === tab.value).length;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => { setActiveTab(tab.value); setPage(1); }}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold sm:text-sm transition ${
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-600 hover:text-blue-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Thanh tìm kiếm và bộ lọc con */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo tác phẩm, tác giả, cuộc thi, loại phim..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={contestFilter}
              onChange={(e) => { setContestFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả cuộc thi</option>
              {contests.filter((c) => c !== 'ALL').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả năm</option>
              {years.filter((y) => y !== 'ALL').map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>

            {(search || activeTab !== 'ALL' || contestFilter !== 'ALL' || yearFilter !== 'ALL') && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <FilterX size={16} />
                Đặt lại
              </button>
            )}
          </div>
        </div>

        {/* Lưới tác phẩm */}
        <div className="p-4 sm:p-5">
          <DigitalArchiveManagement items={pageItems} onSelect={(item) => setSelectedItem(item)} />
        </div>

        {/* Phân trang */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Hiển thị {pageItems.length} / {filtered.length} tác phẩm</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 font-semibold text-slate-700">Trang {currentPage} / {totalPages}</span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
