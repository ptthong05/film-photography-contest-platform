import { ArrowLeft, CheckCircle2, Clock, ImageOff, Info, ShieldAlert, Sparkles, XCircle } from 'lucide-react';
import type { Submission } from './SubmissionsView';

interface AdminSubmissionDetailPageProps {
  submission: Submission;
  onBack: () => void;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const STATUS_MAP = {
  PENDING: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: 'Đã duyệt', className: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Từ chối', className: 'bg-rose-100 text-rose-800' },
  JUDGING: { label: 'Đang chấm', className: 'bg-blue-100 text-blue-800' },
};

function VerificationLine({ label, result }: { label: string; result: 'PASS' | 'REVIEW' | 'FLAGGED' }) {
  const meta = {
    PASS: { text: 'Đạt kiểm tra', icon: CheckCircle2, style: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    REVIEW: { text: 'Cần xem lại', icon: Clock, style: 'text-amber-800 bg-amber-50 border-amber-200' },
    FLAGGED: { text: 'Phát hiện nghi vấn', icon: ShieldAlert, style: 'text-rose-700 bg-rose-50 border-rose-200' },
  }[result];
  const Icon = meta.icon;

  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${meta.style}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className="inline-flex items-center gap-1.5 text-xs font-bold">
        <Icon size={16} />
        {meta.text}
      </span>
    </div>
  );
}

export function AdminSubmissionDetailPage({ submission, onBack }: AdminSubmissionDetailPageProps) {
  const status = STATUS_MAP[submission.status];
  const meta = submission.metadata;

  const metadataFields: [string, string][] = [
    ['Loại phim (Film stock)', meta.filmStock],
    ['Độ nhạy sáng (ISO)', String(meta.iso)],
    ['Thân máy ảnh (Camera)', meta.camera],
    ['Ống kính (Lens)', meta.lens],
    ['Định dạng phim (Format)', meta.format],
    ['Mã cuộn (Roll code)', meta.roll],
    ['Số khung hình (Frame)', meta.frame],
    ['Địa điểm chụp', meta.location],
    ['Lab tráng phim', meta.lab],
    ['Thông số scan ảnh', meta.scan],
    ['Phim âm bản / Contact sheet', meta.negativeReference ?? 'Không cung cấp (tùy chọn)'],
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Quay lại danh sách bài dự thi"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Chi tiết bài dự thi</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Mã: {submission.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B356B]">{submission.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}>
            Trạng thái: {status.label}
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
        {/* Cột trái: Ảnh tác phẩm & Thông tin dự thi */}
        <div className="space-y-6 lg:col-span-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
              <img
                src={submission.image}
                alt={submission.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-[#0B356B]">{submission.title}</h3>
                <p className="text-sm text-slate-600">Tác giả: <span className="font-semibold text-slate-800">{submission.author}</span></p>
              </div>
              <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 space-y-1.5">
                <p>Cuộc thi: <span className="font-semibold text-slate-700">{submission.contest}</span></p>
                <p>Ngày nộp: <span className="font-semibold text-slate-700">{formatDate(submission.submittedAt)}</span></p>
                <p>Mã bài thi: <span className="font-mono font-semibold text-slate-700">{submission.id}</span></p>
              </div>
            </div>
          </div>

          {/* AI & Verification Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-[#0B356B]">
              <Sparkles size={18} className="text-blue-600" />
              Kết quả AI kiểm tra & Xác thực (Mô phỏng)
            </h3>
            <div className="space-y-2.5">
              <VerificationLine label="Phát hiện trùng lặp / tương đồng" result={submission.duplicateCheck} />
              <VerificationLine label="Kiểm định dấu hiệu AI sinh ảnh" result={submission.aiImageCheck} />
              <VerificationLine label="Kiểm tra tính toàn vẹn Metadata" result={submission.metadataCheck} />
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
              <p className="text-xs font-semibold text-slate-700">Ghi chú xác minh:</p>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{submission.reviewNote}</p>
            </div>

            <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
              <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
              Không có mô hình AI thật sự chạy tại màn hình này. Đây là chế độ giám sát dành cho Admin.
            </p>
          </div>
        </div>

        {/* Cột phải: Thông số phim chi tiết */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#0B356B]">
              Thông tin kỹ thuật ảnh phim (Film Metadata)
            </h2>
            <dl className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {metadataFields.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:bg-slate-50">
                  <dt className="text-xs font-medium text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-bold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
