import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Download, FilterX, Info, Search, ShieldCheck, X } from 'lucide-react';
import {
  ActivityLogs, CATEGORY_LABELS, ROLE_LABELS, formatLogDate,
  type AdminActivityLog, type LogCategory, type LogResult, type LogRole,
} from '../components/ActivityLogs';
import { useFetch } from '../../../hooks/useFetch';
import { adminService } from '../../../services/adminService';
import type { Role } from '../../../types/user';

type CategoryFilter = 'ALL' | LogCategory;
type ResultFilter = 'ALL' | LogResult;
type RoleFilter = 'ALL' | LogRole;

const ROLE_FROM_API: Record<Role, LogRole> = {
  ADMIN: 'Administrator',
  ORGANIZER: 'Contest Organizer',
  JUDGE: 'Judge',
  PARTICIPANT: 'Participant',
};

/** Nhãn hiển thị của mã hành động do backend ghi */
export const ACTION_INFO: Record<string, { label: string; category: LogCategory }> = {
  LOGIN: { label: 'Đăng nhập', category: 'SECURITY' },
  PASSWORD_CHANGE: { label: 'Đổi mật khẩu', category: 'SECURITY' },
  CONTEST_CREATE: { label: 'Tạo cuộc thi', category: 'CONTEST' },
  CONTEST_UPDATE: { label: 'Cập nhật cuộc thi', category: 'CONTEST' },
  CONTEST_STATUS: { label: 'Đổi trạng thái cuộc thi', category: 'CONTEST' },
  CONTEST_ARCHIVE: { label: 'Lưu trữ cuộc thi', category: 'CONTEST' },
  CONTEST_RESTORE: { label: 'Khôi phục cuộc thi', category: 'CONTEST' },
  CONTEST_DUPLICATE: { label: 'Nhân bản cuộc thi', category: 'CONTEST' },
  CONTEST_DELETE: { label: 'Xóa cuộc thi', category: 'CONTEST' },
  CONTEST_REGISTER: { label: 'Đăng ký cuộc thi', category: 'CONTEST' },
  CONTEST_UNREGISTER: { label: 'Hủy đăng ký cuộc thi', category: 'CONTEST' },
  RESULT_PUBLISH: { label: 'Công bố kết quả', category: 'CONTEST' },
  RESULT_UNPUBLISH: { label: 'Hủy công bố kết quả', category: 'CONTEST' },
  SUBMISSION_CREATE: { label: 'Nộp bài dự thi', category: 'SUBMISSION' },
  SUBMISSION_DELETE: { label: 'Xóa bài dự thi', category: 'SUBMISSION' },
  SUBMISSION_REVIEW: { label: 'Duyệt bài dự thi', category: 'SUBMISSION' },
  ASSIGNMENT_CREATE: { label: 'Phân công giám khảo', category: 'JUDGING' },
  ASSIGNMENT_REASSIGN: { label: 'Đổi giám khảo', category: 'JUDGING' },
  ASSIGNMENT_REVOKE: { label: 'Thu hồi phân công', category: 'JUDGING' },
  JUDGE_CREATE: { label: 'Tạo tài khoản giám khảo', category: 'ACCOUNT' },
  PARTICIPANT_STATUS: { label: 'Đổi trạng thái thí sinh', category: 'ACCOUNT' },
  SETTING_UPDATE: { label: 'Thay đổi cấu hình', category: 'SYSTEM' },
};

const fetchLogs = async (): Promise<AdminActivityLog[]> => (await adminService.getLogs()).map((log) => {
  const info = ACTION_INFO[log.action] ?? { label: log.action, category: 'SYSTEM' as LogCategory };
  return {
    id: log.id,
    occurredAt: log.createdAt,
    actorName: log.actorName ?? 'Hệ thống',
    actorRole: log.actorRole ? ROLE_FROM_API[log.actorRole] : 'System',
    action: info.label,
    description: log.details ?? info.label,
    category: info.category,
    // Backend chỉ ghi các thao tác đã thực hiện thành công và chưa lưu địa chỉ IP
    result: 'SUCCESS',
    ipAddress: '—',
    targetId: log.targetId ?? '—',
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
  // API trả giờ UTC; đổi sang ngày Việt Nam cho bộ lọc
  return new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
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
  const { data, error } = useFetch(fetchLogs);
  const logs = useMemo(() => data ?? [], [data]);
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
    return logs.filter((log) => {
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
  }, [category, role, result, search, startDate, endDate, logs]);

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
    success: logs.filter((log) => log.result === 'SUCCESS').length,
    failure: logs.filter((log) => log.result === 'FAILURE').length,
    security: logs.filter((log) => log.category === 'SECURITY').length,
  };

  return (
    <section className="space-y-4" aria-label="Nhật ký hoạt động Admin">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <span className="flex items-start gap-2"><Info className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
          <span>Hiển thị 100 thao tác gần nhất được máy chủ ghi nhận.</span>
          {error && <span className="text-rose-600">{error}</span>}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Tổng số log', value: logs.length, color: 'text-blue-700' },
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
