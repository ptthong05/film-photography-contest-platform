import { ArrowLeft, Mail, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { ARCHIVE_PRIZES, type ArchiveItem } from '../components/DigitalArchiveManagement';

interface AdminArchiveDetailPageProps {
  item: ArchiveItem;
  onBack: () => void;
}

function formatDate(value: string) {
  return value.split('-').reverse().join('/');
}

export function AdminArchiveDetailPage({ item, onBack }: AdminArchiveDetailPageProps) {
  const meta = item.metadata;
  const prize = ARCHIVE_PRIZES[item.prize];

  const details: [string, string][] = [
    ['Mã lưu trữ', item.id],
    ['Cuộc thi', item.contest],
    ['Năm tổ chức', String(item.year)],
    ['Ngày trao giải (mẫu)', formatDate(item.awardedAt)],
    ['Film stock', meta.filmStock],
    ['ISO', String(meta.iso)],
    ['Máy ảnh (Camera)', meta.camera],
    ['Ống kính (Lens)', meta.lens],
    ['Film format', meta.filmFormat],
    ['Frame number', meta.frameNumber],
    ['Lab tráng phim', meta.developingLab],
    ['Thông số scan', meta.scanDetails],
  ];

  return (
    <div className="space-y-6">
      {/* Header điều hướng quay lại */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Quay lại danh sách kho lưu trữ"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Digital Archive</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Mã: {item.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B356B]">{item.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>

      {/* Banner thông báo */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Tác phẩm, giải thưởng và metadata bên dưới đều là dữ liệu minh họa từ kho lưu trữ số, chưa được xác nhận bởi hệ thống thật.
      </div>

      {/* Grid nội dung chi tiết */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cột trái: Ảnh tác phẩm & Tác giả */}
        <div className="space-y-6 lg:col-span-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${prize.badge}`}>
                {prize.label}
              </span>
            </div>

            <div className="mt-4 space-y-3 px-2 pb-2">
              <div>
                <h3 className="text-lg font-bold text-[#0B356B]">{item.title}</h3>
                <p className="text-sm text-slate-600">Tác giả: <span className="font-semibold text-slate-800">{item.author}</span></p>
              </div>

              <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 space-y-1">
                <p>Cuộc thi: <span className="font-medium text-slate-700">{item.contest}</span></p>
                <p>Năm tổ chức: <span className="font-medium text-slate-700">{item.year}</span></p>
                <p>Ngày trao giải: <span className="font-medium text-slate-700">{formatDate(item.awardedAt)}</span></p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-bold text-[#0B356B] flex items-center gap-2">
              <UserRoundCheck size={18} className="text-blue-600" />
              Nhận xét của Giám khảo
            </h3>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 italic">
              "{item.judgeComment}"
            </div>
          </div>
        </div>

        {/* Cột phải: Thông số kỹ thuật metadata & Chi tiết lưu trữ */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#0B356B]">
              Thông số kỹ thuật ảnh phim (Exif / Film Metadata)
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:bg-slate-50">
                  <dt className="text-xs font-medium text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-bold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#0B356B]">
              Thông tin bảo tồn số & Bản quyền
            </h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-emerald-900">
                <ShieldCheck size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Bản quyền tác phẩm gốc</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Tác phẩm được bảo hộ bản quyền bởi tác giả {item.author}. Nền tảng giữ quyền lưu trữ và trưng bày phục vụ mục đích văn hóa, giáo dục và lịch sử nhiếp ảnh analog.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

