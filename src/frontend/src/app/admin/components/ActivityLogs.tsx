import { ChevronLeft, ChevronRight, Eye, ScrollText } from 'lucide-react';

/** Các bản ghi nhật ký mẫu theo vai trò Admin; chưa lấy từ backend. */
export type LogCategory = 'ACCOUNT' | 'CONTEST' | 'SUBMISSION' | 'JUDGING' | 'SECURITY' | 'SYSTEM';
export type LogResult = 'SUCCESS' | 'FAILURE';
export type LogRole = 'Administrator' | 'Contest Organizer' | 'Judge' | 'Participant' | 'System';

export interface AdminActivityLog {
  id: string;
  occurredAt: string; // ISO 8601 (kèm múi giờ)
  actorName: string;
  actorRole: LogRole;
  action: string;
  description: string;
  category: LogCategory;
  result: LogResult;
  ipAddress: string;
  targetId: string;
}

export const CATEGORY_LABELS: Record<LogCategory, string> = {
  ACCOUNT: 'Tài khoản',
  CONTEST: 'Cuộc thi',
  SUBMISSION: 'Bài dự thi',
  JUDGING: 'Chấm thi',
  SECURITY: 'Bảo mật',
  SYSTEM: 'Hệ thống',
};

export const ROLE_LABELS: Record<LogRole, string> = {
  Administrator: 'Quản trị viên',
  'Contest Organizer': 'Ban tổ chức',
  Judge: 'Giám khảo',
  Participant: 'Người tham gia',
  System: 'Hệ thống',
};

/** Dùng múi giờ Việt Nam để kết quả nhất quán khi trình duyệt ở múi giờ khác. */
export function formatLogDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(iso));
}

interface ActivityLogsProps {
  logs: AdminActivityLog[];
  filteredCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewLog: (log: AdminActivityLog) => void;
}

/** Bảng trình bày log tách biệt khỏi tìm kiếm và dữ liệu của LogsView. */
export function ActivityLogs({
  logs, filteredCount, page, totalPages, onPageChange, onViewLog,
}: ActivityLogsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3">Thời gian</th>
              <th scope="col" className="px-4 py-3">Người thực hiện</th>
              <th scope="col" className="px-4 py-3">Hành động</th>
              <th scope="col" className="px-4 py-3">Mô tả</th>
              <th scope="col" className="px-4 py-3">Địa chỉ IP</th>
              <th scope="col" className="px-4 py-3">Kết quả</th>
              <th scope="col" className="px-4 py-3 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="transition-colors hover:bg-blue-50/40">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{formatLogDate(log.occurredAt)}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{log.actorName}</div>
                  <div className="text-xs text-slate-500">{ROLE_LABELS[log.actorRole]}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{log.action}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{CATEGORY_LABELS[log.category]}</div>
                </td>
                <td className="max-w-[270px] px-4 py-3 text-slate-600">
                  <span className="line-clamp-2">{log.description}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">{log.ipAddress}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                    log.result === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {log.result === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button type="button" onClick={() => onViewLog(log)}
                    className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"
                    aria-label={`Xem chi tiết nhật ký ${log.id}`}>
                    <Eye size={14} aria-hidden="true" /> Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-slate-500" role="status">
          <ScrollText size={30} aria-hidden="true" />
          <p className="font-medium text-slate-700">Không tìm thấy nhật ký phù hợp</p>
          <p className="text-sm">Hãy thử thay đổi từ khóa, khoảng ngày hoặc bộ lọc.</p>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-500">Hiển thị {logs.length} / {filteredCount} bản ghi phù hợp · Dữ liệu mẫu</p>
        <div className="flex items-center gap-2" aria-label="Phân trang nhật ký">
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}
            className="rounded-md border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Trang trước">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span className="min-w-20 text-center text-xs font-semibold text-slate-700">Trang {page} / {totalPages}</span>
          <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
            className="rounded-md border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Trang sau">
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}
