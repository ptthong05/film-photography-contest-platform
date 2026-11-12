import { ArrowLeft, CheckCircle2, Clock, Eye, Globe, ShieldAlert, ShieldCheck, UserRound, XCircle } from 'lucide-react';
import { CATEGORY_LABELS, ROLE_LABELS, formatLogDate, type AdminActivityLog } from '../components/ActivityLogs';

interface AdminLogDetailPageProps {
  log: AdminActivityLog;
  onBack: () => void;
}

export function AdminLogDetailPage({ log, onBack }: AdminLogDetailPageProps) {
  const isSuccess = log.result === 'SUCCESS';

  const fields: Array<[string, string]> = [
    ['Mã định danh Log', log.id],
    ['Thời gian ghi nhận', formatLogDate(log.occurredAt)],
    ['Người thực hiện (Actor)', log.actorName],
    ['Vai trò người dùng', ROLE_LABELS[log.actorRole]],
    ['Hành động', log.action],
    ['Phân loại nghiệp vụ', CATEGORY_LABELS[log.category]],
    ['Địa chỉ IP nguồn', log.ipAddress],
    ['Mã đối tượng tác động (Target ID)', log.targetId],
    ['Kết quả thực thi', isSuccess ? 'Thành công (SUCCESS)' : 'Thất bại (FAILURE)'],
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Quay lại danh sách nhật ký"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Audit Logs</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Mã sự kiện: {log.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B356B]">{log.action}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
            isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {isSuccess ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            {isSuccess ? 'Thực thi thành công' : 'Thất bại / Bị chặn'}
          </span>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cột trái: Thông tin người thực hiện & tóm tắt */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#0B356B]">Người thực hiện & Bối cảnh</h2>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <UserRound size={24} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900">{log.actorName}</p>
                <p className="text-xs font-semibold text-blue-700">{ROLE_LABELS[log.actorRole]}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Địa chỉ IP:</span>
                <span className="font-mono font-bold text-slate-800">{log.ipAddress}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Mốc thời gian:</span>
                <span className="font-semibold text-slate-800">{formatLogDate(log.occurredAt)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Danh mục:</span>
                <span className="font-semibold text-slate-800">{CATEGORY_LABELS[log.category]}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Mã đối tượng:</span>
                <span className="font-mono font-semibold text-slate-800">{log.targetId}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-bold text-[#0B356B]">Tính toàn vẹn kiểm toán (Audit Trail)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nhật ký hệ thống được ghi nhận tự động theo chuẩn bảo mật ISO/IEC 27001. Dữ liệu chỉ đọc (read-only), không thể bị xóa hay sửa đổi bởi người dùng kể cả quyền quản trị viên cao nhất.
            </p>
          </div>
        </div>

        {/* Cột phải: Chi tiết mô tả và sự kiện kỹ thuật */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#0B356B]">Mô tả chi tiết sự kiện</h2>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800 leading-relaxed">{log.description}</p>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold text-[#0B356B]">Thuộc tính bản ghi chi tiết</h3>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {fields.map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-bold text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
