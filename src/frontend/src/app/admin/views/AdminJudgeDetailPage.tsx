import { ArrowLeft, Award, Calendar, CheckCircle, Mail, ShieldAlert, ShieldCheck, UserCheck, UserRoundCheck } from 'lucide-react';
import type { Judge } from './JudgesView';

interface AdminJudgeDetailPageProps {
  judge: Judge;
  onBack: () => void;
  onChangeStatus: (id: string, nextStatus: Judge['status']) => void;
}

const STATUS_MAP = {
  ACTIVE: { label: 'Đang hoạt động', style: 'bg-emerald-100 text-emerald-700' },
  SUSPENDED: { label: 'Tạm khóa', style: 'bg-amber-100 text-amber-700' },
  DISABLED: { label: 'Đã vô hiệu', style: 'bg-slate-200 text-slate-700' },
};

function formatDate(iso: string) {
  return iso.split('-').reverse().join('/');
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase();
}

export function AdminJudgeDetailPage({ judge, onBack, onChangeStatus }: AdminJudgeDetailPageProps) {
  const currentStatus = STATUS_MAP[judge.status];

  return (
    <div className="space-y-6">
      {/* Header điều hướng quay lại */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Quay lại danh sách giám khảo"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Hồ sơ Giám khảo</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Mã: {judge.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B356B]">{judge.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${currentStatus.style}`}>
            {currentStatus.label}
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
        {/* Cột trái: Thẻ tóm tắt thông tin giám khảo */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
              {getInitials(judge.name)}
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#0B356B]">{judge.name}</h2>
            <p className="mt-1 text-sm text-slate-600 flex items-center justify-center gap-1.5">
              <Mail size={15} className="text-slate-400" />
              {judge.email}
            </p>
            <div className="mt-3">
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                {judge.expertise}
              </span>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Cuộc thi tham gia</p>
                <p className="mt-1 text-xl font-bold text-[#0B356B]">{judge.contestCount}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Bài đã chấm</p>
                <p className="mt-1 text-xl font-bold text-[#0B356B]">{judge.evaluationCount}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 text-left text-xs text-slate-500 space-y-2">
              <p>Mã định danh: <span className="font-semibold text-slate-700">{judge.id}</span></p>
              <p>Ngày gia nhập: <span className="font-semibold text-slate-700">{formatDate(judge.joinedAt)}</span></p>
            </div>
          </div>

          {/* Hành động quản trị nhanh */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-[#0B356B]">Quản lý trạng thái tài khoản</h3>
            <div className="flex flex-wrap gap-2">
              {judge.status !== 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => onChangeStatus(judge.id, 'ACTIVE')}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Kích hoạt lại
                </button>
              )}
              {judge.status !== 'SUSPENDED' && (
                <button
                  type="button"
                  onClick={() => onChangeStatus(judge.id, 'SUSPENDED')}
                  className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  Tạm khóa tài khoản
                </button>
              )}
              {judge.status !== 'DISABLED' && (
                <button
                  type="button"
                  onClick={() => onChangeStatus(judge.id, 'DISABLED')}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Vô hiệu hóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Lịch sử và thông tin năng lực */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#0B356B]">
              Lĩnh vực chuyên môn & Thẩm định
            </h2>
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase">Chuyên môn chính</p>
                <p className="mt-1 text-base font-bold text-slate-900">{judge.expertise}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Giám khảo có kinh nghiệm dày dặn trong việc đánh giá cảm quan nghệ thuật, bố cục ánh sáng, kỹ thuật tráng rọi phim tương tự và tiêu chuẩn thẩm mỹ ảnh phim analog.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <dt className="text-xs text-slate-500">Tiêu chí chấm thi chính</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-800">Cảm quan phim & Nghệ thuật</dd>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <dt className="text-xs text-slate-500">Mức độ hoàn thành</dt>
                  <dd className="mt-1 text-sm font-semibold text-emerald-700">100% đúng hạn</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#0B356B]">
              Hoạt động chấm thi gần đây (Minh họa)
            </h2>
            <div className="space-y-3">
              {[
                { contest: 'Analog Moments 2026', count: 42, role: 'Giám khảo chính', date: 'Tháng 10/2026' },
                { contest: 'Film & City 2026', count: 35, role: 'Hội đồng giám khảo', date: 'Tháng 09/2026' },
                { contest: 'Black & White Stories', count: 50, role: 'Trưởng ban giám khảo', date: 'Tháng 06/2026' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                  <div>
                    <p className="text-sm font-bold text-[#0B356B]">{item.contest}</p>
                    <p className="text-xs text-slate-500">{item.role} • {item.date}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {item.count} bài đã chấm
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
