import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Calendar,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileCheck,
  FileImage,
  Film,
  Gift,
  HelpCircle,
  Info,
  Layers,
  Megaphone,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
  UserRoundCheck,
  Users,
  X,
  AlertTriangle,
} from 'lucide-react';
import type { AdminView } from '../components/AdminSidebar';
import type { AdminContest } from './ContestsView';
import { displayDate, statusInfo } from './ContestsView';

interface AdminContestDetailPageProps {
  contest: AdminContest;
  onBack: () => void;
  onNavigate?: (view: AdminView) => void;
}

type DetailTab = 'overview' | 'timeline' | 'prizes' | 'judges';

const TABS: { id: DetailTab; label: string; icon: typeof Info }[] = [
  { id: 'overview', label: 'Tổng quan & Thể lệ', icon: Info },
  { id: 'timeline', label: 'Lộ trình & Mốc thời gian', icon: CalendarDays },
  { id: 'prizes', label: 'Cơ cấu giải thưởng', icon: Gift },
  { id: 'judges', label: 'Hội đồng giám khảo', icon: UserRoundCheck },
];

const formatter = new Intl.NumberFormat('vi-VN');

export function AdminContestDetailPage({
  contest,
  onBack,
  onNavigate,
}: AdminContestDetailPageProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const status = statusInfo(contest.status);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3000);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Đã sao chép ${label}: ${text}`);
    } catch {
      showToast(`Không thể sao chép tự động: ${text}`);
    }
  };

  // Mock timeline milestones based on contest dates
  const timelineMilestones = useMemo(() => {
    const isUpcoming = contest.status === 'UPCOMING';
    const isCompleted = contest.status === 'COMPLETED';

    return [
      {
        id: 1,
        title: 'Mở cổng nhận bài dự thi',
        date: displayDate(contest.startDate),
        description: 'Thí sinh bắt đầu gửi tác phẩm chụp bằng máy ảnh cơ học và phim chuẩn.',
        status: isUpcoming ? 'UPCOMING' : 'COMPLETED',
      },
      {
        id: 2,
        title: 'Hạn chót nộp bài dự thi',
        date: displayDate(contest.endDate),
        description: 'Đóng cổng nộp bài, hệ thống kích hoạt rà soát AI Scanner và tính hợp lệ ảnh phim.',
        status: isUpcoming ? 'PENDING' : isCompleted ? 'COMPLETED' : 'CURRENT',
      },
      {
        id: 3,
        title: 'Chấm Sơ khảo & Chung khảo',
        date: 'Trong vòng 15 ngày sau khi đóng nhận bài',
        description: 'Hội đồng giám khảo đánh giá độc lập theo 4 tiêu chí chuyên môn trên nền tảng.',
        status: isUpcoming ? 'PENDING' : isCompleted ? 'COMPLETED' : 'PENDING',
      },
      {
        id: 4,
        title: 'Đối soát âm bản & Rà soát vi phạm',
        date: 'Trước ngày công bố 5 ngày',
        description: 'Admin & Organizer kiểm tra phim âm bản gốc của các tác phẩm vào vòng chung kết.',
        status: isUpcoming ? 'PENDING' : isCompleted ? 'COMPLETED' : 'PENDING',
      },
      {
        id: 5,
        title: 'Công bố kết quả & Khai mạc triển lãm',
        date: isCompleted ? 'Đã công bố' : 'Theo thông báo của BTC',
        description: 'Công bố danh sách đoạt giải trên cổng thông tin và lưu trữ vào Kho dữ liệu số.',
        status: isCompleted ? 'COMPLETED' : 'PENDING',
      },
    ];
  }, [contest]);

  // Mock judges for this contest
  const judgesList = useMemo(() => {
    const defaultList = [
      {
        id: 'JD-01',
        name: 'Lê Minh Cường',
        role: 'Trưởng ban Giám khảo',
        expertise: 'Nhiếp ảnh tài liệu & Phim 35mm',
        experience: '18 năm kinh nghiệm',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        scoredCount: contest.status === 'COMPLETED' ? contest.submissions : Math.floor(contest.submissions * 0.75),
        status: 'ACTIVE',
      },
      {
        id: 'JD-02',
        name: 'Đỗ Thị Hương',
        role: 'Thành viên Hội đồng',
        expertise: 'Nghệ thuật thị giác & Phòng tối',
        experience: '12 năm nghiên cứu phim Analog',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        scoredCount: contest.status === 'COMPLETED' ? contest.submissions : Math.floor(contest.submissions * 0.6),
        status: 'ACTIVE',
      },
      {
        id: 'JD-03',
        name: 'Trần Văn Hùng',
        role: 'Thành viên Hội đồng',
        expertise: 'Nhiếp ảnh đường phố & Kiến trúc',
        experience: 'Nhiếp ảnh gia độc lập',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        scoredCount: contest.status === 'COMPLETED' ? contest.submissions : Math.floor(contest.submissions * 0.8),
        status: 'ACTIVE',
      },
      {
        id: 'JD-04',
        name: 'Phạm Thị Dung',
        role: 'Cố vấn chuyên môn',
        expertise: 'Lịch sử nhiếp ảnh & Giám tuyển',
        experience: 'Giảng viên viện Mỹ thuật',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        scoredCount: contest.status === 'COMPLETED' ? contest.submissions : Math.floor(contest.submissions * 0.9),
        status: 'ACTIVE',
      },
    ];

    return defaultList.slice(0, Math.max(1, Math.min(contest.judges, defaultList.length)));
  }, [contest]);


  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-medium text-blue-900 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-3"
        >
          <CheckCircle2 size={18} className="text-blue-600" aria-hidden="true" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 rounded p-1 text-slate-400 hover:text-slate-600"
            aria-label="Đóng thông báo"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Action Navigation Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 font-semibold text-blue-600 transition hover:text-blue-800"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Quay lại danh sách</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">Quản lý cuộc thi</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800 truncate max-w-xs">{contest.title}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => copyToClipboard(contest.id, 'mã cuộc thi')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Copy size={14} aria-hidden="true" />
            <span>Sao chép mã</span>
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('submissions')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <FileImage size={14} aria-hidden="true" />
              <span>Xem bài dự thi</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => copyToClipboard(window.location.href, 'liên kết cuộc thi')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Share2 size={14} aria-hidden="true" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Hero Contest Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Cover Photo with rich gradient */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-800 sm:h-64">
          <img
            src={contest.image}
            alt={`Ảnh bìa cuộc thi ${contest.title}`}
            className="h-full w-full object-cover opacity-90 transition duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Top badges floating on cover */}
          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2 sm:left-6 sm:top-6">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-md ${status.color}`}>
              <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
              {status.label}
            </span>
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
              Mã: {contest.id}
            </span>
            <span className="rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Đơn vị: {contest.organizer}
            </span>
          </div>

          {/* Bottom Title on Cover */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200 sm:text-sm">
              CHI TIẾT CUỘC THI NHIẾP ẢNH PHIM
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              {contest.title}
            </h1>
            <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">
              {contest.description}
            </p>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/70 sm:grid-cols-4 sm:divide-x sm:divide-y-0 lg:grid-cols-6">
          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Thời gian nhận bài</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-800 sm:text-sm">
              <Calendar size={14} className="text-blue-600" aria-hidden="true" />
              {displayDate(contest.startDate)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Đến {displayDate(contest.endDate)}</p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Thí sinh tham gia</p>
            <p className="mt-1 flex items-center gap-1.5 text-base font-black text-[#0B356B] sm:text-lg">
              <Users size={16} className="text-blue-600" aria-hidden="true" />
              {formatter.format(contest.participants)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Thành viên đăng ký</p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Bài thi đã nộp</p>
            <p className="mt-1 flex items-center gap-1.5 text-base font-black text-emerald-700 sm:text-lg">
              <FileImage size={16} className="text-emerald-600" aria-hidden="true" />
              {formatter.format(contest.submissions)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Tác phẩm gửi về</p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Hội đồng giám khảo</p>
            <p className="mt-1 flex items-center gap-1.5 text-base font-black text-violet-700 sm:text-lg">
              <UserRoundCheck size={16} className="text-violet-600" aria-hidden="true" />
              {formatter.format(contest.judges)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Giám khảo chuyên môn</p>
          </div>

          <div className="p-4 sm:p-5 col-span-2 sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-medium text-slate-500">Hạng mục tranh tài</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {contest.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-md border border-blue-200 bg-white px-2 py-0.5 text-xs font-semibold text-blue-800"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Tab Navigation */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-200 px-3 pt-2 sm:px-6" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-bold transition sm:text-sm ${
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="p-5 sm:p-7">
          {/* TAB 1: OVERVIEW & RULES */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Giới thiệu chi tiết */}
              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                  1. Mục đích & Tinh thần cuộc thi
                </h2>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 sm:p-5">
                  <p className="font-medium text-slate-900">{contest.description}</p>
                  <p className="mt-2 text-slate-600">
                    Cuộc thi <strong className="text-blue-900">{contest.title}</strong> được tổ chức bởi{' '}
                    <strong className="text-blue-900">{contest.organizer}</strong> nhằm tôn vinh những giá trị văn hóa và ngôn ngữ thị giác thuần khiết của nhiếp ảnh phim (Analog Photography). Nền tảng ghi nhận quá trình sáng tác tỉ mỉ, trân trọng từng khung hình và khuyến khích các nhiếp ảnh gia trẻ khai phá chiều sâu cảm xúc trên từng hạt grain.
                  </p>
                </div>
              </section>

              {/* Bảng quy chuẩn kỹ thuật phim */}
              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                  2. Quy chuẩn thiết bị & Chất liệu ảnh phim
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                      <Camera size={18} />
                      <h3>Thiết bị chụp hợp lệ</h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      Bắt buộc chụp bằng máy ảnh cơ học, máy phim tự động (Point & Shoot), SLR hoặc Rangefinder sử dụng phim hóa chất thật.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                      <Film size={18} />
                      <h3>Định dạng phim</h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      Chấp nhận phim 35mm (135), Medium Format 120 (6x4.5, 6x6, 6x7, 6x9) và Large Format 4x5. Cả phim màu (C-41), phim đen trắng (B&W) và phim trượt (E-6).
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                      <Layers size={18} />
                      <h3>Lưu trữ âm bản gốc</h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      Thí sinh bắt buộc phải giữ lại cuộn phim âm bản gốc (negative) để Hội đồng giám khảo và Ban tổ chức đối chiếu khi tác phẩm được xét giải.
                    </p>
                  </div>
                </div>
              </section>

              {/* Chính sách AI Scanner & Chống gian lận */}
              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                  3. Chính sách kiểm định AI & Tính toàn vẹn
                </h2>
                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <ShieldAlert size={22} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
                    <div className="space-y-1.5 text-xs text-rose-900 sm:text-sm">
                      <p className="font-bold text-rose-950">
                        Nghiêm cấm ảnh AI tạo sinh & Chỉnh sửa ghép ảnh kỹ thuật số sai lệch thực tế
                      </p>
                      <ul className="list-disc space-y-1 pl-4 leading-relaxed">
                        <li>
                          Hệ thống AI tích hợp trong nền tảng tự động quét phổ hạt grain, kiểm tra độ phân giải âm bản và đối chiếu với các mô hình AI tạo sinh (Midjourney, DALL-E, Stable Diffusion).
                        </li>
                        <li>
                          Cho phép cân bằng màu cơ bản lúc scan tráng và làm sạch bụi trầy xước vật lý nhỏ ở lab.
                        </li>
                        <li>
                          Mọi bài thi bị AI Scanner gắn cờ vi phạm mức độ FLAGGED sẽ được chuyển sang diện kiểm tra thủ công bởi Admin và Ban tổ chức trước khi bị hủy tư cách tham dự.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tiêu chí đánh giá của Ban giám khảo */}
              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                  4. Tiêu chí chấm điểm của Hội đồng Giám khảo
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: 'Bố cục & Ánh sáng', weight: '30%', desc: 'Kỹ thuật kiểm soát nguồn sáng tự nhiên, khuôn hình và tỷ lệ khung ảnh phim.' },
                    { title: 'Cảm xúc & Kể chuyện', weight: '30%', desc: 'Khoảnh khắc chân thật, thông điệp truyền tải và tính nhân văn trong ảnh.' },
                    { title: 'Xử lý phòng tối & Grain', weight: '20%', desc: 'Đặc trưng hạt grain tự nhiên của cuộn phim, độ tương phản và kỹ thuật tráng quét.' },
                    { title: 'Sáng tạo & Độc bản', weight: '20%', desc: 'Góc nhìn độc đáo, khó trùng lặp và phong cách riêng biệt của tác giả.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {item.weight}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                    Lộ trình các mốc thời gian cuộc thi
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    Theo dõi tiến trình từ khi phát động, nhận bài, chấm thi cho đến công bố giải thưởng.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <Clock size={14} className="text-blue-600" />
                  Mùa giải 2026 – 2027
                </span>
              </div>

              {/* Timeline Flow */}
              <div className="relative border-l-2 border-blue-200 pl-6 sm:pl-8 space-y-8 ml-2 sm:ml-4 py-2">
                {timelineMilestones.map((item, index) => {
                  const isDone = item.status === 'COMPLETED';
                  const isCurrent = item.status === 'CURRENT';

                  return (
                    <div key={item.id} className="relative group">
                      {/* Node indicator */}
                      <span
                        className={`absolute -left-[31px] sm:-left-[39px] top-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-md'
                            : isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                            : 'border-2 border-slate-300 bg-white text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={15} /> : index + 1}
                      </span>

                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            {item.title}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : isCurrent
                                ? 'bg-blue-100 text-blue-800 animate-pulse'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isDone ? 'Đã hoàn thành' : isCurrent ? 'Đang diễn ra' : 'Sắp diễn ra'}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                          <Calendar size={13} aria-hidden="true" />
                          {item.date}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PRIZES */}
          {activeTab === 'prizes' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                    Cơ cấu giải thưởng & Phần thưởng chính thức
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    Tổng trị giá giải thưởng lên tới hơn 60.000.000 VNĐ cùng các trang thiết bị máy ảnh phim danh giá.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-bold text-amber-900">
                  🏆 Tài trợ bởi FilmContest & Retro Lab
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    rank: '🥇',
                    title: 'Giải Nhất (Grand Prize)',
                    quantity: '01 Giải',
                    cash: '25.000.000 VNĐ',
                    gift: 'Máy ảnh Rangefinder Leica M6 cổ điển + Cúp vàng biểu trưng + Giấy chứng nhận Admin & BTC',
                    border: 'border-amber-300 bg-gradient-to-b from-amber-50/50 to-white',
                  },
                  {
                    rank: '🥈',
                    title: 'Giải Nhì (Second Prize)',
                    quantity: '02 Giải',
                    cash: '12.000.000 VNĐ',
                    gift: '20 cuộn film Kodak Portra 400 cao cấp + Kỷ niệm chương pha lê',
                    border: 'border-slate-300 bg-gradient-to-b from-slate-50/50 to-white',
                  },
                  {
                    rank: '🥉',
                    title: 'Giải Ba (Third Prize)',
                    quantity: '03 Giải',
                    cash: '6.000.000 VNĐ',
                    gift: '10 cuộn film Fujifilm Superia X-TRA + Kỷ niệm chương lưu niệm',
                    border: 'border-orange-200 bg-gradient-to-b from-orange-50/30 to-white',
                  },
                  {
                    rank: '🏅',
                    title: 'Giải Sáng Tạo Analog',
                    quantity: '01 Giải',
                    cash: '5.000.000 VNĐ',
                    gift: 'Bộ kính lọc ngàm vintage Cokin cổ điển + Voucher thiết bị',
                    border: 'border-violet-200 bg-gradient-to-b from-violet-50/30 to-white',
                  },
                  {
                    rank: '🎖️',
                    title: 'Giải Khuyến Khích',
                    quantity: '05 Giải',
                    cash: '2.000.000 VNĐ',
                    gift: 'Voucher miễn phí tráng và quét scan film trọn năm tại hệ thống Lab đối tác',
                    border: 'border-blue-200 bg-gradient-to-b from-blue-50/30 to-white',
                  },
                  {
                    rank: '❤️',
                    title: 'Giải Bình Chọn Yêu Thích',
                    quantity: '01 Giải',
                    cash: '3.000.000 VNĐ',
                    gift: 'Bằng chứng nhận triển lãm ảnh số và quà tặng tri ân cộng đồng nhiếp ảnh',
                    border: 'border-rose-200 bg-gradient-to-b from-rose-50/30 to-white',
                  },
                ].map((prize) => (
                  <div
                    key={prize.title}
                    className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${prize.border}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{prize.rank}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                        {prize.quantity}
                      </span>
                    </div>
                    <h3 className="mt-3 font-bold text-slate-900 text-sm sm:text-base">
                      {prize.title}
                    </h3>
                    <p className="mt-1 text-base font-black text-blue-700 sm:text-lg">
                      {prize.cash}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-2">
                      🎁 <strong>Hiện vật:</strong> {prize.gift}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: JUDGES */}
          {activeTab === 'judges' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                    Hội đồng giám khảo cuộc thi ({contest.judges} thành viên)
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                    Danh sách các giám khảo chuyên môn được Ban tổ chức chỉ định chấm thi độc lập.
                  </p>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('users')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <UserRoundCheck size={15} />
                    <span>Quản lý người dùng & giám khảo</span>
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {judgesList.map((judge) => (
                  <div
                    key={judge.id}
                    className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:shadow-md"
                  >
                    <img
                      src={judge.avatar}
                      alt={judge.name}
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-blue-50 shadow-sm"
                    />
                    <h3 className="mt-3 font-bold text-slate-900 text-sm sm:text-base">
                      {judge.name}
                    </h3>
                    <span className="mt-0.5 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {judge.role}
                    </span>
                    <p className="mt-2 text-xs font-medium text-slate-600">{judge.expertise}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{judge.experience}</p>

                    <div className="mt-4 w-full border-t border-slate-100 pt-3 text-xs text-slate-500 flex justify-between items-center">
                      <span>Đã chấm:</span>
                      <strong className="text-slate-800">{judge.scoredCount} bài</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Quay lại danh sách cuộc thi</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Lên đầu trang ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
