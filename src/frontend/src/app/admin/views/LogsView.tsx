import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Download, FilterX, Info, Search, ShieldCheck, X } from 'lucide-react';
import {
  ActivityLogs, CATEGORY_LABELS, ROLE_LABELS, formatLogDate,
  type AdminActivityLog, type LogCategory, type LogResult, type LogRole,
} from '../components/ActivityLogs';

type CategoryFilter = 'ALL' | LogCategory;
type ResultFilter = 'ALL' | LogResult;
type RoleFilter = 'ALL' | LogRole;

// Những sự kiện sau chỉ để MINH HỌA giao diện; không phải nhật ký được máy chủ ghi nhận.
const DEMO_EVENTS: Array<Pick<AdminActivityLog,
  'actorName' | 'actorRole' | 'category' | 'action' | 'description' | 'result' | 'targetId'
>> = [
  { actorName: 'Nguyễn Văn A', actorRole: 'Administrator', category: 'ACCOUNT', action: 'Cập nhật tài khoản', description: 'Cập nhật trạng thái tài khoản người tham gia.', result: 'SUCCESS', targetId: 'USR-0008' },
  { actorName: 'Trần Thị B', actorRole: 'Participant', category: 'SECURITY', action: 'Đăng nhập', description: 'Đăng nhập thành công vào hệ thống.', result: 'SUCCESS', targetId: 'AUTH-0002' },
  { actorName: 'Hệ thống', actorRole: 'System', category: 'SECURITY', action: 'Đăng nhập thất bại', description: 'Từ chối yêu cầu vì thông tin xác thực không hợp lệ.', result: 'FAILURE', targetId: 'AUTH-0003' },
  { actorName: 'Lê Minh Cường', actorRole: 'Judge', category: 'JUDGING', action: 'Lưu đánh giá', description: 'Lưu điểm và nhận xét của một bài được phân công.', result: 'SUCCESS', targetId: 'EVA-0012' },
  { actorName: 'Phạm Thị Dung', actorRole: 'Contest Organizer', category: 'CONTEST', action: 'Cập nhật cuộc thi', description: 'Thay đổi lịch nhận bài dự thi.', result: 'SUCCESS', targetId: 'CNT-0003' },
  { actorName: 'Nguyễn Văn A', actorRole: 'Administrator', category: 'SYSTEM', action: 'Thay đổi cấu hình', description: 'Cập nhật ngôn ngữ và múi giờ hệ thống.', result: 'SUCCESS', targetId: 'CFG-0001' },
  { actorName: 'Đỗ Văn E', actorRole: 'Participant', category: 'SUBMISSION', action: 'Nộp bài dự thi', description: 'Tải ảnh scan kèm metadata lên cuộc thi.', result: 'SUCCESS', targetId: 'SUB-0019' },
  { actorName: 'Hệ thống', actorRole: 'System', category: 'SUBMISSION', action: 'Kiểm tra bài nộp', description: 'Từ chối tệp vì thiếu thông tin kỹ thuật bắt buộc.', result: 'FAILURE', targetId: 'SUB-0020' },
  { actorName: 'Nguyễn Văn A', actorRole: 'Administrator', category: 'ACCOUNT', action: 'Phân quyền', description: 'Cập nhật vai trò cho tài khoản nhân sự.', result: 'SUCCESS', targetId: 'USR-0015' },
  { actorName: 'Phạm Thị Dung', actorRole: 'Contest Organizer', category: 'CONTEST', action: 'Công bố kết quả', description: 'Xác nhận công bố danh sách tác phẩm đạt giải.', result: 'SUCCESS', targetId: 'CNT-0002' },
  { actorName: 'Hệ thống', actorRole: 'System', category: 'SYSTEM', action: 'Đồng bộ dữ liệu', description: 'Thao tác đồng bộ bị gián đoạn và cần thử lại.', result: 'FAILURE', targetId: 'JOB-0004' },
  { actorName: 'Trần Thị B', actorRole: 'Participant', category: 'ACCOUNT', action: 'Cập nhật hồ sơ', description: 'Thay đổi thông tin cá nhân.', result: 'SUCCESS', targetId: 'USR-0002' },
];

const DEMO_LOGS: AdminActivityLog[] = Array.from({ length: 48 }, (_, index) => {
  const event = DEMO_EVENTS[index % DEMO_EVENTS.length];
  const month = 12 - Math.floor(index / 4);
  const day = 24 - (index % 4) * 5;
  const hour = 9 + (index % 9);
  const minute = (index * 7) % 60;
  return {
    ...event,
    id: `LOG-${String(index + 1).padStart(5, '0')}`,
    occurredAt: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+07:00`,
    ipAddress: event.actorRole === 'System' ? '—' : `192.0.2.${10 + (index % 180)}`,
  };
});

const CATEGORY_TABS: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ACCOUNT', label: 'Tài khoản' },
  { value: 'CONTEST', label: 'Cuộc thi' },
  { value: 'SUBMISSION', label: 'Bài dự thi' },
  { value: 'SECURITY', label: 'Bảo mật' },
];
const ALL_CATEGORIES: LogCategory[] = ['ACCOUNT', 'CONTEST', 'SUBMISSION', 'JUDGING', 'SECURITY', 'SYSTEM'];
const ALL_ROLES: LogRole[] = ['Administrator', 'Contest Organizer', 'Judge', 'Participant', 'System'];
const PAGE_SIZE = 8;

function normalizeSearch(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
function localDate(iso: string) {
  // ISO đã có offset +07:00; trích phần ngày nghiệp vụ cho bộ lọc ngày Việt Nam.
  return iso.slice(0, 10);
}
function csvCell(value: string) {
  // Tránh công thức bị kích hoạt nếu CSV được mở bằng phần mềm bảng tính.
  const safe = /^[\s]*[=+@\-]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

function LogDetails({ log, onClose }: { log: AdminActivityLog; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const controls = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled])');
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault(); controls[controls.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
        event.preventDefault(); controls[0].focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  const fields: Array<[string, string]> = [
    ['Mã log', log.id],
    ['Thời gian', formatLogDate(log.occurredAt)],
    ['Người thực hiện', log.actorName],
    ['Vai trò', ROLE_LABELS[log.actorRole]],
    ['Nhóm sự kiện', CATEGORY_LABELS[log.category]],
    ['Hành động', log.action],
    ['Đối tượng tác động', log.targetId],
    ['Địa chỉ IP', log.ipAddress],
    ['Kết quả', log.result === 'SUCCESS' ? 'Thành công' : 'Thất bại'],
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="admin-log-detail-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">Nhật ký hoạt động · Demo</p>
            <h2 id="admin-log-detail-title" className="mt-1 text-xl font-bold text-[#0B356B]">Chi tiết sự kiện</h2>
          </div>
          <button ref={closeButton} type="button" onClick={onClose} aria-label="Đóng chi tiết nhật ký"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="space-y-4 p-5">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-lg bg-slate-50 px-3 py-2.5">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs font-medium text-slate-500">Mô tả hoạt động</p>
            <p className="mt-1 text-sm text-slate-800">{log.description}</p>
          </div>
          <p className="text-xs text-slate-500">Đây là bản ghi mẫu; chưa có dữ liệu audit từ Java Backend.</p>
        </div>
        <footer className="flex justify-end border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Đóng</button>
        </footer>
      </section>
    </div>
  );
}

/** Admin > Nhật ký log. Chỉ tra cứu dữ liệu giả; không tự nhận là audit log từ hệ thống thật. */
export function LogsView() {
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [role, setRole] = useState<RoleFilter>('ALL');
  const [result, setResult] = useState<ResultFilter>('ALL');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AdminActivityLog | null>(null);
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => {
    const query = normalizeSearch(search);
    return DEMO_LOGS.filter((log) => {
      if (category !== 'ALL' && log.category !== category) return false;
      if (role !== 'ALL' && log.actorRole !== role) return false;
      if (result !== 'ALL' && log.result !== result) return false;
      const date = localDate(log.occurredAt);
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      if (!query) return true;
      return normalizeSearch([
        log.id, log.actorName, ROLE_LABELS[log.actorRole], log.action, log.description,
        CATEGORY_LABELS[log.category], log.ipAddress, log.targetId,
      ].join(' ')).includes(query);
    }).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }, [category, role, result, search, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleLogs = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => { setPage(1); setNotice(''); };
  const clearFilters = () => {
    setCategory('ALL'); setRole('ALL'); setResult('ALL'); setSearch(''); setStartDate(''); setEndDate('');
    setPage(1); setNotice('Đã đặt lại bộ lọc.');
  };
  const exportCsv = () => {
    if (!filtered.length) { setNotice('Không có bản ghi phù hợp để xuất.'); return; }
    const headers = ['Mã log', 'Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Nhóm sự kiện', 'Mô tả', 'Đối tượng', 'IP', 'Kết quả'];
    const rows = filtered.map((log) => [
      log.id, formatLogDate(log.occurredAt), log.actorName, ROLE_LABELS[log.actorRole],
      log.action, CATEGORY_LABELS[log.category], log.description, log.targetId, log.ipAddress,
      log.result === 'SUCCESS' ? 'Thành công' : 'Thất bại',
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map((cells) => cells.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'filmcontest-admin-logs-demo.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Đã xuất ${filtered.length} nhật ký DEMO sang CSV. Không chứa dữ liệu từ server.`);
  };

  const stats = {
    success: DEMO_LOGS.filter((log) => log.result === 'SUCCESS').length,
    failure: DEMO_LOGS.filter((log) => log.result === 'FAILURE').length,
    security: DEMO_LOGS.filter((log) => log.category === 'SECURITY').length,
  };

  return (
    <section className="space-y-4" aria-label="Nhật ký hoạt động Admin">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <span className="flex items-start gap-2"><Info className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
          <span><strong>Dữ liệu minh họa.</strong> Các bản ghi, địa chỉ IP và hoạt động trên trang không phải audit log thật. Admin chỉ được xem và xuất danh sách mẫu.</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Tổng số log mẫu', value: DEMO_LOGS.length, color: 'text-blue-700' },
          { label: 'Thành công', value: stats.success, color: 'text-emerald-700' },
          { label: 'Thất bại', value: stats.failure, color: 'text-rose-700' },
          { label: 'Sự kiện bảo mật', value: stats.security, color: 'text-amber-700' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0B356B]">Danh sách sự kiện</h2>
            <p className="mt-0.5 text-xs text-slate-500">Lọc, tra cứu và xem chi tiết nhật ký (dữ liệu năm 2025).</p>
          </div>
          <button type="button" onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            <Download size={16} aria-hidden="true" /> Xuất CSV mẫu
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3" role="group" aria-label="Nhóm nhật ký">
          {CATEGORY_TABS.map((tab) => (
            <button key={tab.value} type="button" onClick={() => { setCategory(tab.value); resetPage(); }}
              aria-pressed={category === tab.value}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${category === tab.value
                ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative block xl:col-span-2">
            <span className="sr-only">Tìm nhật ký</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }}
              placeholder="Tìm theo tên, hành động, mã log, IP..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block">
            <span className="sr-only">Lọc theo vai trò</span>
            <select value={role} onChange={(event) => { setRole(event.target.value as RoleFilter); resetPage(); }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500">
              <option value="ALL">Tất cả vai trò</option>
              {ALL_ROLES.map((option) => <option key={option} value={option}>{ROLE_LABELS[option]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Lọc theo kết quả</span>
            <select value={result} onChange={(event) => { setResult(event.target.value as ResultFilter); resetPage(); }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500">
              <option value="ALL">Tất cả kết quả</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILURE">Thất bại</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500"><CalendarDays size={13} aria-hidden="true" /> Từ ngày</span>
            <input type="date" value={startDate} max={endDate || undefined}
              onChange={(event) => { setStartDate(event.target.value); resetPage(); }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500" />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500"><CalendarDays size={13} aria-hidden="true" /> Đến ngày</span>
            <input type="date" value={endDate} min={startDate || undefined}
              onChange={(event) => { setEndDate(event.target.value); resetPage(); }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500" />
          </label>
          <label className="block">
            <span className="mb-1 text-xs font-medium text-slate-500">Nhóm sự kiện</span>
            <select value={category} onChange={(event) => { setCategory(event.target.value as CategoryFilter); resetPage(); }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500">
              <option value="ALL">Tất cả nhóm</option>
              {ALL_CATEGORIES.map((option) => <option key={option} value={option}>{CATEGORY_LABELS[option]}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button type="button" onClick={clearFilters}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <FilterX size={16} aria-hidden="true" /> Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {notice && <p role="status" className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-800">{notice}</p>}

      <ActivityLogs logs={visibleLogs} filteredCount={filtered.length} page={safePage}
        totalPages={totalPages} onPageChange={setPage} onViewLog={setSelectedLog} />

      <p className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck size={15} aria-hidden="true" /> Giao diện nhật ký chỉ có quyền đọc; chưa có chức năng chỉnh sửa hoặc xóa log.
      </p>
      {selectedLog && <LogDetails log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </section>
  );
}
