import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Mail,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Users,
  X,
} from 'lucide-react';
import type { AdminView } from '../components/AdminSidebar';

/**
 * Admin > Giám khảo.
 * Màn hình GIÁM SÁT tài khoản giám khảo theo SRS: quản lý quyền/tài khoản
 * thuộc Admin, việc phân công chấm và vận hành vòng chấm thuộc Organizer.
 * Chỉ dùng dữ liệu MẪU, chưa có API / kết nối MongoDB.
 */
type JudgeStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
type JudgeFilter = 'ALL' | JudgeStatus;

type Expertise =
  | 'Nhiếp ảnh phim'
  | 'Nghệ thuật thị giác'
  | 'Nhiếp ảnh tài liệu'
  | 'Nhiếp ảnh chân dung'
  | 'Nhiếp ảnh phong cảnh'
  | 'Lịch sử nhiếp ảnh';

interface Judge {
  id: string;
  name: string;
  email: string;
  expertise: Expertise;
  contestCount: number;
  evaluationCount: number;
  status: JudgeStatus;
  joinedAt: string;
}

const DEMO_NAMES = [
  'Lê Minh Cường', 'Đỗ Thị Hương', 'Trần Văn H', 'Phạm Thị Dung',
  'Nguyễn Văn E', 'Hoàng Minh K', 'Nguyễn Thị F', 'Võ Quốc Anh',
  'Bùi Thanh Mai', 'Phan Đức Minh', 'Trương Thu Hà', 'Đặng Quốc Bảo',
  'Ngô Thị Lan', 'Trịnh Hoài Nam', 'Đinh Minh Quân', 'Lý Thảo Vy',
  'Hồ Thanh Tùng', 'Đoàn Bảo Ngọc', 'Mai Đức Long', 'Vũ Khánh Linh',
  'Tạ Quốc Huy', 'Nguyễn Bích Ngọc', 'Trần Hải Yến', 'Lương Gia Hân',
  'Lê Quang Phúc', 'Đào Mỹ Linh', 'Cao Anh Tuấn', 'Phùng Ngọc Hà',
] as const;

const EXPERTISE: Expertise[] = [
  'Nhiếp ảnh phim',
  'Nghệ thuật thị giác',
  'Nhiếp ảnh tài liệu',
  'Nhiếp ảnh chân dung',
  'Nhiếp ảnh phong cảnh',
  'Lịch sử nhiếp ảnh',
];

// 28 bản ghi minh họa, phân bố trạng thái: 24 hoạt động, 3 tạm khóa, 1 vô hiệu.
// example.com là miền dành riêng cho dữ liệu ví dụ, KHÔNG phải email thực tế.
const DEMO_JUDGES: Judge[] = DEMO_NAMES.map((name, index) => ({
  id: `JDG-${String(index + 1).padStart(4, '0')}`,
  name,
  email: `judge${String(index + 1).padStart(2, '0')}@example.com`,
  expertise: EXPERTISE[index % EXPERTISE.length],
  contestCount: (index * 3 + 1) % 7 + 1,
  evaluationCount: (index * 13 + 17) % 120 + 8,
  status: index < 24 ? 'ACTIVE' : index < 27 ? 'SUSPENDED' : 'DISABLED',
  joinedAt: `2025-${String(index % 12 + 1).padStart(2, '0')}-${String(index % 25 + 1).padStart(2, '0')}`,
}));

const STATUS: Record<JudgeStatus, { label: string; style: string }> = {
  ACTIVE: { label: 'Đang hoạt động', style: 'bg-emerald-100 text-emerald-700' },
  SUSPENDED: { label: 'Tạm khóa', style: 'bg-amber-100 text-amber-700' },
  DISABLED: { label: 'Đã vô hiệu', style: 'bg-slate-200 text-slate-700' },
};

const FILTERS: { value: JudgeFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'SUSPENDED', label: 'Tạm khóa' },
  { value: 'DISABLED', label: 'Đã vô hiệu' },
];

const PAGE_SIZE = 7;
const formatDate = (iso: string) => iso.split('-').reverse().join('/');
const initials = (name: string) => name.trim().split(/\s+/).slice(-2).map((word) => word[0]).join('').toUpperCase();

function JudgeAvatar({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
      {initials(name)}
    </span>
  );
}

function JudgeDetailModal({ judge, onClose }: { judge: Judge; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-3 sm:p-6"
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="admin-judge-detail-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Hồ sơ giám khảo · Dữ liệu mẫu</p>
            <h2 id="admin-judge-detail-title" className="mt-1 text-xl font-bold text-[#0B356B]">{judge.name}</h2>
            <p className="mt-1 text-xs text-slate-500">Mã tài khoản: {judge.id}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Đóng chi tiết giám khảo"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-4">
            <JudgeAvatar name={judge.name} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">{judge.name}</p>
              <p className="break-all text-sm text-slate-500">{judge.email}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[judge.status].style}`}>
              {STATUS[judge.status].label}
            </span>
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {([
              ['Chuyên môn', judge.expertise],
              ['Vai trò', 'Judge (Giám khảo)'],
              ['Số cuộc thi tham gia', String(judge.contestCount)],
              ['Lượt đánh giá (mẫu)', String(judge.evaluationCount)],
              ['Ngày tạo tài khoản', formatDate(judge.joinedAt)],
              ['Mã giám khảo', judge.id],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 p-3">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-1 font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
            Đây là thông tin minh họa. Admin theo dõi và quản lý tài khoản; việc phân công bài thi, vòng chấm và xác nhận đánh giá thuộc quy trình của Ban tổ chức và Giám khảo.
          </p>
        </div>
        <footer className="flex justify-end border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Đóng
          </button>
        </footer>
      </section>
    </div>
  );
}

interface JudgesViewProps {
  onNavigate: (view: AdminView) => void;
}

export function JudgesView({ onNavigate }: JudgesViewProps) {
  const [statusFilter, setStatusFilter] = useState<JudgeFilter>('ALL');
  const [search, setSearch] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState<Expertise | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);

  const statusCounts = useMemo(() => ({
    ALL: DEMO_JUDGES.length,
    ACTIVE: DEMO_JUDGES.filter((judge) => judge.status === 'ACTIVE').length,
    SUSPENDED: DEMO_JUDGES.filter((judge) => judge.status === 'SUSPENDED').length,
    DISABLED: DEMO_JUDGES.filter((judge) => judge.status === 'DISABLED').length,
  }), []);

  const filteredJudges = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('vi-VN');
    return DEMO_JUDGES.filter((judge) => {
      if (statusFilter !== 'ALL' && judge.status !== statusFilter) return false;
      if (expertiseFilter !== 'ALL' && judge.expertise !== expertiseFilter) return false;
      if (!normalizedSearch) return true;
      return [judge.name, judge.email, judge.id, judge.expertise]
        .some((value) => value.toLocaleLowerCase('vi-VN').includes(normalizedSearch));
    });
  }, [statusFilter, search, expertiseFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJudges.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredJudges.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const firstRow = filteredJudges.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastRow = Math.min(currentPage * PAGE_SIZE, filteredJudges.length);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setExpertiseFilter('ALL');
    setPage(1);
  };

  return (
    <section aria-label="Danh sách giám khảo" className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <UserRoundCheck size={21} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0B356B]">Danh sách giám khảo</h2>
              <p className="text-xs text-slate-500">Dữ liệu mẫu — chưa kết nối Backend Java</p>
            </div>
          </div>
          <button type="button" onClick={() => onNavigate('users')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            <Users size={17} aria-hidden="true" /> Quản lý tài khoản giám khảo
          </button>
        </div>

        <div className="border-b border-slate-200 px-5">
          <div className="flex gap-5 overflow-x-auto" role="group" aria-label="Lọc trạng thái giám khảo">
            {FILTERS.map(({ value, label }) => (
              <button key={value} type="button" aria-pressed={statusFilter === value}
                onClick={() => { setStatusFilter(value); setPage(1); }}
                className={`shrink-0 border-b-2 py-3 text-sm font-medium transition-colors ${statusFilter === value
                  ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                {label} <span className="text-xs opacity-75">({statusCounts[value]})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <label className="relative block">
            <span className="sr-only">Tìm kiếm giám khảo</span>
            <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" value={search} placeholder="Tìm tên, email, mã giám khảo..."
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block">
            <span className="sr-only">Lọc chuyên môn</span>
            <select value={expertiseFilter}
              onChange={(event) => { setExpertiseFilter(event.target.value as Expertise | 'ALL'); setPage(1); }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option value="ALL">Tất cả chuyên môn</option>
              {EXPERTISE.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <button type="button" onClick={resetFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">
            <Filter size={16} aria-hidden="true" /> Xóa bộ lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[790px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Họ và tên</th>
                <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                <th scope="col" className="px-4 py-3 font-semibold">Chuyên môn</th>
                <th scope="col" className="px-4 py-3 text-center font-semibold">Số cuộc thi</th>
                <th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((judge) => (
                <tr key={judge.id} className="hover:bg-blue-50/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <JudgeAvatar name={judge.name} />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{judge.name}</p>
                        <p className="text-xs text-slate-400">{judge.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><Mail size={13} aria-hidden="true" /> {judge.email}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{judge.expertise}</td>
                  <td className="px-4 py-3 text-center font-semibold text-blue-700">{judge.contestCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[judge.status].style}`}>
                      {STATUS[judge.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button type="button" onClick={() => setSelectedJudge(judge)}
                      aria-label={`Xem chi tiết giám khảo ${judge.name}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                      <Eye size={15} aria-hidden="true" /> Xem
                    </button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <Search size={28} aria-hidden="true" className="mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-slate-700">Không tìm thấy giám khảo phù hợp</p>
                    <p className="mt-1 text-xs text-slate-500">Hãy thử từ khóa hoặc bộ lọc khác.</p>
                    <button type="button" onClick={resetFilters} className="mt-3 text-sm font-semibold text-blue-700 hover:underline">Hiện tất cả</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Hiển thị {firstRow} – {lastRow} của {filteredJudges.length} giám khảo <span className="text-xs">(mẫu)</span></p>
          <nav aria-label="Phân trang giám khảo" className="flex items-center gap-1">
            <button type="button" aria-label="Trang trước" disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronLeft size={15} aria-hidden="true" />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" aria-label={`Trang ${number}`} aria-current={number === currentPage ? 'page' : undefined}
                onClick={() => setPage(number)}
                className={`min-w-8 rounded-md px-2 py-1.5 text-xs font-semibold ${number === currentPage
                  ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                {number}
              </button>
            ))}
            <button type="button" aria-label="Trang sau" disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          </nav>
        </footer>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <ShieldCheck className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
        <p>Trang Admin dùng để tra cứu và giám sát tài khoản giám khảo. Phân công giám khảo, chấm điểm và xác nhận vòng chấm thuộc quy trình nghiệp vụ khác; mọi thông tin trên trang hiện là dữ liệu minh họa.</p>
      </div>

      {selectedJudge && <JudgeDetailModal judge={selectedJudge} onClose={() => setSelectedJudge(null)} />}
    </section>
  );
}
