import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, ClipboardCopy,
  Eye, Filter, ImageOff, MoreVertical, Search, Trophy, Users,
  UserRoundCheck, X,
} from 'lucide-react';

/**
 * Admin > Quản lý cuộc thi.
 * Chỉ xem và giám sát: việc tạo/sửa/công bố cuộc thi thuộc Organizer theo SRS.
 * Tất cả dữ liệu dưới đây là dữ liệu minh họa, CHƯA kết nối Java API.
 */
type ContestStatus = 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
type ContestFilter = 'ALL' | ContestStatus;

interface AdminContest {
  id: string;
  title: string;
  organizer: string;
  description: string;
  startDate: string; // YYYY-MM-DD, để lọc/sắp xếp nhất quán
  endDate: string;
  status: ContestStatus;
  participants: number;
  judges: number;
  submissions: number;
  categories: string[];
  image: string;
}

const PHOTO = {
  mountains: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
  city: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
  coast: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  streets: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
  nature: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
};

// Dữ liệu minh họa được đặt theo những mốc thời gian hợp lý trong 2025–2027.
// Trạng thái là GIẢ LẬP, không phải trạng thái tự tính từ đồng hồ hệ thống.
const DEMO_CONTESTS: AdminContest[] = [
  { id: 'CT-2026-001', title: 'Analog Moments 2026', organizer: 'FilmContest Studio', description: 'Lưu giữ những khoảnh khắc chân thật qua nhiếp ảnh phim.', startDate: '2026-09-01', endDate: '2026-11-30', status: 'ACTIVE', participants: 342, judges: 8, submissions: 568, categories: ['Đời sống', 'Chân dung'], image: PHOTO.mountains },
  { id: 'CT-2026-002', title: 'Film & City 2026', organizer: 'Urban Film Club', description: 'Nhịp sống thành phố nhìn từ máy ảnh phim.', startDate: '2026-08-15', endDate: '2026-10-31', status: 'ACTIVE', participants: 285, judges: 6, submissions: 371, categories: ['Đường phố', 'Kiến trúc'], image: PHOTO.city },
  { id: 'CT-2026-003', title: 'The Vintage Look', organizer: 'Retro Lab', description: 'Tôn vinh phong cách ảnh cổ điển và sắc màu analog.', startDate: '2026-10-01', endDate: '2026-12-15', status: 'ACTIVE', participants: 198, judges: 5, submissions: 294, categories: ['Chân dung', 'Nghệ thuật'], image: PHOTO.streets },
  { id: 'CT-2026-004', title: 'Nature on Film', organizer: 'Green Frames', description: 'Ghi lại vẻ đẹp thiên nhiên trên chất liệu phim.', startDate: '2026-11-01', endDate: '2026-12-31', status: 'UPCOMING', participants: 120, judges: 4, submissions: 0, categories: ['Thiên nhiên', 'Phong cảnh'], image: PHOTO.nature },
  { id: 'CT-2026-005', title: 'Black & White Stories', organizer: 'Analog Collective', description: 'Những câu chuyện giàu cảm xúc qua phim đen trắng.', startDate: '2026-04-01', endDate: '2026-06-30', status: 'COMPLETED', participants: 430, judges: 10, submissions: 612, categories: ['Đen trắng', 'Đời sống'], image: PHOTO.coast },
  { id: 'CT-2026-006', title: 'Golden Hour Film', organizer: 'Golden Photo Club', description: 'Khám phá ánh sáng lúc bình minh và hoàng hôn.', startDate: '2026-09-10', endDate: '2026-11-20', status: 'ACTIVE', participants: 156, judges: 4, submissions: 220, categories: ['Phong cảnh'], image: PHOTO.coast },
  { id: 'CT-2026-007', title: 'Frames of Everyday Life', organizer: 'FilmContest Studio', description: 'Những khoảnh khắc đời thường được kể bằng ảnh phim.', startDate: '2026-10-05', endDate: '2026-12-05', status: 'ACTIVE', participants: 212, judges: 5, submissions: 187, categories: ['Đời sống'], image: PHOTO.city },
  { id: 'CT-2026-008', title: 'Portraits in Grain', organizer: 'Retro Lab', description: 'Cuộc thi ảnh chân dung nhấn mạnh ngôn ngữ hạt phim.', startDate: '2026-11-15', endDate: '2027-01-15', status: 'UPCOMING', participants: 64, judges: 3, submissions: 0, categories: ['Chân dung'], image: PHOTO.streets },
  { id: 'CT-2027-001', title: 'New Year on Film', organizer: 'Urban Film Club', description: 'Ghi lại những khoảnh khắc đầu năm bằng máy phim.', startDate: '2027-01-01', endDate: '2027-03-31', status: 'UPCOMING', participants: 0, judges: 4, submissions: 0, categories: ['Đời sống', 'Đường phố'], image: PHOTO.mountains },
  { id: 'CT-2026-009', title: 'Spring Film Diary', organizer: 'Green Frames', description: 'Nhật ký mùa xuân qua từng khung hình analog.', startDate: '2026-02-01', endDate: '2026-04-30', status: 'COMPLETED', participants: 275, judges: 6, submissions: 390, categories: ['Thiên nhiên'], image: PHOTO.forest },
  { id: 'CT-2025-001', title: 'Classic Street Photography', organizer: 'Urban Film Club', description: 'Khám phá đường phố qua cảm quan nhiếp ảnh phim.', startDate: '2025-08-01', endDate: '2025-10-31', status: 'COMPLETED', participants: 389, judges: 8, submissions: 520, categories: ['Đường phố'], image: PHOTO.city },
  { id: 'CT-2025-002', title: 'Stories in 35mm', organizer: 'Analog Collective', description: 'Tác phẩm kể chuyện qua định dạng phim 35mm.', startDate: '2025-05-01', endDate: '2025-07-30', status: 'COMPLETED', participants: 201, judges: 5, submissions: 296, categories: ['Đời sống', 'Nghệ thuật'], image: PHOTO.coast },
];

const FILTER_TABS: { id: ContestFilter; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'ACTIVE', label: 'Đang diễn ra' },
  { id: 'UPCOMING', label: 'Sắp diễn ra' },
  { id: 'COMPLETED', label: 'Đã kết thúc' },
];
const PAGE_SIZE = 5;
const formatter = new Intl.NumberFormat('vi-VN');

function displayDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function statusInfo(status: ContestStatus) {
  switch (status) {
    case 'ACTIVE': return { label: 'Đang diễn ra', color: 'bg-emerald-100 text-emerald-700' };
    case 'UPCOMING': return { label: 'Sắp diễn ra', color: 'bg-violet-100 text-violet-700' };
    case 'COMPLETED': return { label: 'Đã kết thúc', color: 'bg-slate-100 text-slate-600' };
  }
}

function ContestImage({ contest }: { contest: AdminContest }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-300 to-slate-600 sm:h-24 sm:w-32">
      {imageFailed ? (
        <ImageOff size={25} className="text-white" aria-label="Chưa thể tải ảnh minh họa" />
      ) : (
        <img src={contest.image} alt={`Ảnh minh họa ${contest.title}`} loading="lazy"
          onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
      )}
    </div>
  );
}

function ContestDetail({ contest, onClose }: { contest: AdminContest; onClose: () => void }) {
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [onClose]);
  const status = statusInfo(contest.status);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="admin-contest-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Chi tiết cuộc thi · Dữ liệu mẫu</p>
            <h2 id="admin-contest-detail-title" className="mt-1 text-xl font-bold text-[#0B356B]">{contest.title}</h2>
            <p className="mt-1 text-xs text-slate-500">Mã: {contest.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chi tiết cuộc thi"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={21} /></button>
        </div>
        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>{status.label}</span>
            <span className="text-sm text-slate-600">Đơn vị tổ chức: <b>{contest.organizer}</b></span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700">{contest.description}</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ['Bắt đầu', displayDate(contest.startDate)],
              ['Kết thúc', displayDate(contest.endDate)],
              ['Người tham gia', formatter.format(contest.participants)],
              ['Giám khảo', formatter.format(contest.judges)],
              ['Bài dự thi', formatter.format(contest.submissions)],
              ['Hạng mục', contest.categories.join(', ')],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
            Chế độ giám sát Admin: việc tạo, chỉnh sửa thể lệ hoặc công bố kết quả do Ban tổ chức thực hiện theo SRS.
          </p>
        </div>
        <div className="flex justify-end border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Đóng</button>
        </div>
      </section>
    </div>
  );
}

/** Màn hình số 3 trong giao diện Admin: chỉ xem, lọc và tra cứu cuộc thi. */
export function ContestsView() {
  const [activeTab, setActiveTab] = useState<ContestFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedContest, setSelectedContest] = useState<AdminContest | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const availableYears = [...new Set(DEMO_CONTESTS.map((contest) => contest.startDate.slice(0, 4)))].sort().reverse();
  const availableCategories = [...new Set(DEMO_CONTESTS.flatMap((contest) => contest.categories))].sort((a, b) => a.localeCompare(b, 'vi'));
  const filteredContests = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('vi');
    return DEMO_CONTESTS.filter((contest) =>
      (activeTab === 'ALL' || contest.status === activeTab) &&
      (categoryFilter === 'ALL' || contest.categories.includes(categoryFilter)) &&
      (yearFilter === 'ALL' || contest.startDate.startsWith(yearFilter)) &&
      (!term || [contest.title, contest.organizer, contest.id, ...contest.categories]
        .some((value) => value.toLocaleLowerCase('vi').includes(term)))
    ).sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [activeTab, categoryFilter, yearFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filteredContests.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filteredContests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetPage = () => { setPage(1); setOpenMenuId(null); };
  const showDetail = (contest: AdminContest) => { setSelectedContest(contest); setOpenMenuId(null); };
  const copyId = async (id: string) => {
    setOpenMenuId(null);
    try {
      await navigator.clipboard.writeText(id);
      setNotice(`Đã sao chép mã cuộc thi ${id}.`);
    } catch {
      setNotice(`Không thể sao chép tự động. Mã cuộc thi: ${id}`);
    }
  };

  return (
    <section aria-label="Quản lý cuộc thi" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Dữ liệu minh họa — chưa kết nối API Java / MongoDB
        </span>
        <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          Admin: chế độ xem và giám sát
        </span>
      </div>

      {notice && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Đóng thông báo"><X size={17} /></button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-3" role="tablist" aria-label="Lọc cuộc thi theo trạng thái">
          {FILTER_TABS.map((tab) => {
            const count = tab.id === 'ALL' ? DEMO_CONTESTS.length : DEMO_CONTESTS.filter((contest) => contest.status === tab.id).length;
            return (
              <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id}
                onClick={() => { setActiveTab(tab.id); resetPage(); }}
                className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold sm:text-sm ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-600'}`}>
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Tìm kiếm cuộc thi</span>
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }}
              placeholder="Tìm theo tên, ban tổ chức, hạng mục..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="sr-only" htmlFor="admin-contest-year">Lọc theo năm</label>
          <select id="admin-contest-year" value={yearFilter} onChange={(event) => { setYearFilter(event.target.value); resetPage(); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
            <option value="ALL">Tất cả năm</option>
            {availableYears.map((year) => <option key={year} value={year}>Năm {year}</option>)}
          </select>
          <button type="button" onClick={() => setShowFilters((value) => !value)}
            aria-expanded={showFilters} aria-controls="admin-contest-extra-filter"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            <Filter size={16} aria-hidden="true" /> Bộ lọc
          </button>
        </div>

        {showFilters && (
          <div id="admin-contest-extra-filter" className="flex flex-wrap items-end gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <label className="space-y-1 text-xs font-medium text-slate-600">
              <span>Hạng mục cuộc thi</span>
              <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); resetPage(); }}
                className="block min-w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <option value="ALL">Tất cả hạng mục</option>
                {availableCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => { setActiveTab('ALL'); setCategoryFilter('ALL'); setYearFilter('ALL'); setSearch(''); resetPage(); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
              Xóa bộ lọc
            </button>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {pageItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
              <Trophy className="text-slate-300" size={36} aria-hidden="true" />
              <p className="font-semibold text-slate-700">Không tìm thấy cuộc thi phù hợp</p>
              <p className="text-sm text-slate-500">Thử đổi từ khóa, năm hoặc bộ lọc trạng thái.</p>
            </div>
          ) : pageItems.map((contest) => {
            const status = statusInfo(contest.status);
            return (
              <article key={contest.id} className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                  <ContestImage contest={contest} />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h2 className="truncate text-sm font-bold text-[#0B356B] sm:text-base" title={contest.title}>{contest.title}</h2>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <CalendarDays size={13} aria-hidden="true" /> {displayDate(contest.startDate)} – {displayDate(contest.endDate)}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-700">
                      <span className="inline-flex items-center gap-1"><Users size={13} aria-hidden="true" /> {formatter.format(contest.participants)} người tham gia</span>
                      <span className="inline-flex items-center gap-1"><UserRoundCheck size={13} aria-hidden="true" /> {contest.judges} giám khảo</span>
                    </div>
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-2 lg:pl-2">
                  <button type="button" onClick={() => showDetail(contest)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                    <Eye size={15} aria-hidden="true" /> Xem chi tiết
                  </button>
                  <div className="relative">
                    <button type="button" onClick={() => setOpenMenuId((current) => current === contest.id ? null : contest.id)}
                      aria-label={`Thao tác với cuộc thi ${contest.title}`} aria-expanded={openMenuId === contest.id}
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><MoreVertical size={17} /></button>
                    {openMenuId === contest.id && (
                      <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                        <button type="button" onClick={() => showDetail(contest)}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100">
                          <Eye size={14} aria-hidden="true" /> Xem chi tiết
                        </button>
                        <button type="button" onClick={() => { void copyId(contest.id); }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100">
                          <ClipboardCopy size={14} aria-hidden="true" /> Sao chép mã
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {filteredContests.length === 0 ? 'Hiển thị 0 cuộc thi' :
              `Hiển thị ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredContests.length)} trong ${filteredContests.length} cuộc thi`}
          </span>
          <div className="flex items-center gap-1 self-end sm:self-auto" aria-label="Phân trang cuộc thi">
            <button type="button" disabled={currentPage === 1} aria-label="Trang trước" onClick={() => { setPage((p) => Math.max(1, p - 1)); setOpenMenuId(null); }}
              className="rounded-md border border-slate-200 p-2 text-slate-600 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => (
              <button key={number} type="button" onClick={() => { setPage(number); setOpenMenuId(null); }}
                aria-current={number === currentPage ? 'page' : undefined}
                className={`min-w-9 rounded-md px-2.5 py-2 text-xs font-semibold ${number === currentPage
                  ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {number}
              </button>
            ))}
            <button type="button" disabled={currentPage === pageCount} aria-label="Trang sau" onClick={() => { setPage((p) => Math.min(pageCount, p + 1)); setOpenMenuId(null); }}
              className="rounded-md border border-slate-200 p-2 text-slate-600 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronRight size={15} />
            </button>
          </div>
        </footer>
      </div>
      {selectedContest && <ContestDetail contest={selectedContest} onClose={() => setSelectedContest(null)} />}
    </section>
  );
}
