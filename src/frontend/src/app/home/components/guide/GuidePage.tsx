import React from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { ContestStepsGuideSection } from '../ContestStepsGuideSection';
import {
  BookOpen,
  Camera,
  Film,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  FileText,
  UploadCloud,
  Sliders,
} from 'lucide-react';

interface GuidePageProps {
  onGoHome: () => void;
  onSelectPortal?: (portal: Portal) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  onOpenContestDetail?: (contestId: string) => void;
}

export function GuidePage({
  onGoHome,
  onSelectPortal,
  onOpenAuth,
  onOpenContestDetail,
}: GuidePageProps) {
  const technicalRules = [
    {
      icon: Film,
      title: 'Định dạng & Thể loại phim',
      description:
        'Chấp nhận ảnh chụp từ phim 35mm (135), phim cuộn 120 (Medium format), hoặc Large format. Mọi loại phim màu âm bản (C-41), phim đen trắng (B&W), hoặc phim dương bản (E-6) đều hợp lệ.',
      status: 'Bắt buộc',
      statusColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      icon: Camera,
      title: 'Thiết bị chụp hợp lệ',
      description:
        'Sử dụng máy ảnh phim cơ học (SLR, Rangefinder, Point & Shoot, TLR, Medium Format...). Không chấp nhận ảnh chụp từ máy kỹ thuật số giả lập màu phim bằng filter hoặc preset.',
      status: 'Bắt buộc',
      statusColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      icon: Sliders,
      title: 'Mức độ can thiệp hậu kỳ',
      description:
        'Cho phép cân chỉnh sáng tối, độ tương phản nhẹ và chấm bụi xước scan cơ bản. Nghiêm cấm sử dụng AI sinh hình ảnh, ghép ảnh (composite) hoặc can thiệp làm sai lệch bản chất khoảnh khắc.',
      status: 'Nghiêm cấm AI',
      statusColor: 'bg-rose-100 text-rose-800',
    },
    {
      icon: ShieldCheck,
      title: 'Bảo lưu phim gốc (Negative)',
      description:
        'Thí sinh cần lưu giữ cuộn phim/dải film âm bản gốc. Ban tổ chức và Hội đồng giám khảo có quyền yêu cầu cung cấp film gốc hoặc ảnh chụp dải phim để đối chiếu trước khi trao giải.',
      status: 'Lưu ý quan trọng',
      statusColor: 'bg-amber-100 text-amber-800',
    },
  ];

  const submissionSpecs = [
    { label: 'Định dạng tệp tải lên', value: 'JPG, JPEG, PNG chất lượng cao (RGB/sRGB)' },
    { label: 'Độ phân giải khuyến nghị', value: 'Tối thiểu 3000px cạnh dài (300 DPI)' },
    { label: 'Dung lượng file tối đa', value: '25 MB mỗi ảnh' },
    { label: 'Thông tin tác phẩm cần có', value: 'Tên ảnh, Dòng máy ảnh, Loại phim chụp, Câu chuyện tác phẩm' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. Header / Navbar */}
      <Navbar
        activeTab="Hướng dẫn"
        onGoHome={onGoHome}
        onSelectPortal={onSelectPortal}
        onOpenContests={() => onSelectPortal?.('CONTESTS')}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
      />

      {/* 2. Main Page Content */}
      <main className="flex-1 w-full">
        {/* Hero Banner Header */}
        <div className="bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white py-12 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200/80 mb-4 font-medium">
              <button
                onClick={onGoHome}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-blue-300/50" />
              <span className="text-white font-semibold">Hướng dẫn dự thi</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Cẩm nang tham gia cuộc thi ảnh phim FilmContest</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Hướng dẫn chi tiết từ A-Z cho người mới & nhiếp ảnh gia
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Khám phá quy trình 6 bước đơn giản để nộp tác phẩm ảnh phim, các tiêu chuẩn kỹ thuật về cuộn film, quy cách scan và thể lệ chấm giải công tâm.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Section: 6 Bước tham gia cuộc thi (Interactive Guide Mockup) */}
        <div className="py-6">
          <ContestStepsGuideSection
            onSelectPortal={onSelectPortal}
            onOpenAuth={onOpenAuth}
          />
        </div>

        {/* 4. Section: Quy chuẩn kỹ thuật & Tiêu chuẩn ảnh phim */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TIÊU CHUẨN TÁC PHẨM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Quy định kỹ thuật và tính hợp lệ của ảnh phim
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Để đảm bảo tính minh bạch và giữ trọn tinh thần nhiếp ảnh phim thuần túy, tất cả bài thi cần tuân thủ các nguyên tắc sau:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technicalRules.map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${rule.statusColor}`}>
                        {rule.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">
                      {rule.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Specs Table Card */}
          <div className="mt-8 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <span>Thông số file scan khi gửi bài dự thi</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {submissionSpecs.map((spec, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    {spec.label}
                  </span>
                  <strong className="text-sm font-bold text-slate-900 block">
                    {spec.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Call To Action (CTA) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Bạn đã sẵn sàng chia sẻ khoảnh khắc phim của mình?
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">
                Tham gia ngay hôm nay để có cơ hội nhận các giải thưởng giá trị, cuộn film cao cấp và triển lãm ảnh tại phòng tranh toàn quốc.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => onSelectPortal?.('CONTESTS')}
                className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Xem các cuộc thi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuth('REGISTER')}
                className="px-6 py-3 bg-blue-500/40 hover:bg-blue-500/60 border border-white/30 text-white rounded-xl font-bold text-sm backdrop-blur-xs transition-all cursor-pointer"
              >
                Đăng ký tài khoản
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 6. Footer */}
      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
