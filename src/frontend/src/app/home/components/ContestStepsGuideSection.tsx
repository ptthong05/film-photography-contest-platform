import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  Search,
  User,
  Lock,
  Eye,
  Camera,
  UploadCloud,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import type { Portal } from '../../../types/portal';

interface ContestStepsGuideSectionProps {
  onSelectPortal?: (portal: Portal) => void;
  onOpenAuth?: (mode: 'LOGIN' | 'REGISTER') => void;
}

export function ContestStepsGuideSection({
  onSelectPortal,
  onOpenAuth,
}: ContestStepsGuideSectionProps) {
  const [modalStep, setModalStep] = useState<number | null>(null);

  const steps = [
    {
      step: 1,
      num: '01',
      title: 'Chọn cuộc thi',
      description: 'Khám phá danh sách các cuộc thi đang diễn ra, xem chủ đề, thể lệ và giải thưởng.',
      btnText: 'Xem danh sách cuộc thi',
      action: () => {
        if (onSelectPortal) onSelectPortal('CONTESTS');
        else {
          const el = document.getElementById('live-contests');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      },
      renderMockup: () => (
        <div className="w-full h-28 bg-white rounded-xl border border-slate-200/90 p-2 shadow-2xs flex flex-col justify-between overflow-hidden relative group-hover:border-blue-300 transition-colors">
          {/* Top browser bar */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[8px] text-slate-400 font-mono">filmcontest.vn/contests</span>
          </div>

          {/* Grid of mini cards with magnifying glass */}
          <div className="grid grid-cols-2 gap-1.5 py-1 flex-1 relative">
            <div className="rounded bg-slate-200 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=150&q=80"
                alt="thumb"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded bg-slate-200 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80"
                alt="thumb"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Magnifying glass overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      step: 2,
      num: '02',
      title: 'Đăng ký tài khoản',
      description: 'Tạo tài khoản để tham gia cuộc thi, nộp tác phẩm và theo dõi kết quả.',
      btnText: 'Đăng ký ngay',
      action: () => onOpenAuth?.('REGISTER'),
      renderMockup: () => (
        <div className="w-full h-28 bg-white rounded-xl border border-slate-200/90 p-2 shadow-2xs flex flex-col justify-between overflow-hidden group-hover:border-blue-300 transition-colors">
          {/* Avatar icon */}
          <div className="flex items-center justify-center mb-1">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Mini form fields */}
          <div className="space-y-1">
            <div className="bg-slate-50 border border-slate-200/70 rounded px-1.5 py-0.5 text-[8px] text-slate-400 flex items-center gap-1">
              <span className="text-[7px]">👤</span> Họ và tên
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded px-1.5 py-0.5 text-[8px] text-slate-400 flex items-center gap-1">
              <span className="text-[7px]">✉️</span> Email
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded px-1.5 py-0.5 text-[8px] text-slate-400 flex items-center gap-1">
              <span className="text-[7px]">🔒</span> Mật khẩu
            </div>
          </div>

          {/* Button */}
          <div className="mt-1 bg-blue-600 text-white text-[8px] font-bold py-1 rounded text-center shadow-2xs">
            Đăng ký
          </div>
        </div>
      ),
    },
    {
      step: 3,
      num: '03',
      title: 'Đăng nhập',
      description: 'Sử dụng tài khoản đã đăng ký để đăng nhập và trải nghiệm đầy đủ các tính năng.',
      btnText: 'Đăng nhập ngay',
      action: () => onOpenAuth?.('LOGIN'),
      renderMockup: () => (
        <div className="w-full h-28 bg-white rounded-xl border border-slate-200/90 p-2 shadow-2xs flex flex-col justify-between overflow-hidden group-hover:border-blue-300 transition-colors">
          {/* Lock icon */}
          <div className="flex items-center justify-center mb-1">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Mini form fields */}
          <div className="space-y-1">
            <div className="bg-slate-50 border border-slate-200/70 rounded px-1.5 py-0.5 text-[8px] text-slate-400 flex items-center gap-1">
              <span className="text-[7px]">✉️</span> Email
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded px-1.5 py-0.5 text-[8px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="text-[7px]">🔒</span> Mật khẩu
              </span>
              <Eye className="w-2.5 h-2.5 text-slate-300" />
            </div>
            <div className="flex items-center gap-1 text-[7px] text-slate-500 pl-0.5">
              <span className="w-2 h-2 rounded bg-blue-600 text-white flex items-center justify-center text-[6px]">
                ✓
              </span>
              <span>Ghi nhớ đăng nhập</span>
            </div>
          </div>

          {/* Button */}
          <div className="mt-1 bg-blue-600 text-white text-[8px] font-bold py-1 rounded text-center shadow-2xs">
            Đăng nhập
          </div>
        </div>
      ),
    },
    {
      step: 4,
      num: '04',
      title: 'Trang cá nhân',
      description: 'Cập nhật thông tin, quản lý hồ sơ, xem các cuộc thi đã tham gia và tác phẩm của bạn.',
      btnText: 'Xem hướng dẫn',
      action: () => setModalStep(4),
      renderMockup: () => (
        <div className="w-full h-28 bg-white rounded-xl border border-slate-200/90 p-2 shadow-2xs flex flex-col justify-between overflow-hidden group-hover:border-blue-300 transition-colors">
          {/* Profile header */}
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
              alt="Avatar"
              className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-200"
            />
            <div className="leading-tight">
              <span className="text-[8px] font-bold text-slate-800 block truncate">Nguyễn Văn A</span>
              <span className="text-[7px] text-blue-600 font-medium">Nhiếp ảnh gia</span>
            </div>
          </div>

          {/* Mini tabs / menu */}
          <div className="space-y-0.5 my-auto text-[7px]">
            <div className="bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <span>👤</span> Trang cá nhân
            </div>
            <div className="text-slate-500 px-1.5 py-0.5 flex items-center gap-1">
              <span>🖼️</span> Tác phẩm của tôi
            </div>
            <div className="text-slate-500 px-1.5 py-0.5 flex items-center gap-1">
              <span>🏆</span> Cuộc thi đã tham gia
            </div>
            <div className="text-slate-500 px-1.5 py-0.5 flex items-center gap-1">
              <span>⚙️</span> Cài đặt tài khoản
            </div>
          </div>
        </div>
      ),
    },
    {
      step: 5,
      num: '05',
      title: 'Nộp tác phẩm',
      description: 'Tải ảnh dự thi theo đúng quy định của cuộc thi về định dạng, dung lượng và thông tin tác phẩm.',
      btnText: 'Xem quy định',
      action: () => setModalStep(5),
      renderMockup: () => (
        <div className="w-full h-28 bg-white rounded-xl border border-slate-200/90 p-2 shadow-2xs flex flex-col justify-between overflow-hidden group-hover:border-blue-300 transition-colors">
          {/* Dropzone */}
          <div className="border border-dashed border-blue-300 bg-blue-50/40 rounded-lg p-1 text-center">
            <UploadCloud className="w-3.5 h-3.5 text-blue-600 mx-auto" />
            <span className="text-[7px] font-bold text-blue-700 block leading-tight">
              Kéo thả ảnh vào đây
            </span>
            <span className="text-[6px] text-slate-400 block">JPG, PNG (tối đa 20MB)</span>
          </div>

          {/* Mini photo thumbnails */}
          <div className="flex items-center justify-center gap-1 my-1">
            <div className="w-6 h-6 rounded bg-slate-200 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=80&q=80"
                alt="thumb"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-0 right-0 w-2 h-2 bg-slate-900/80 text-white text-[5px] flex items-center justify-center">
                ×
              </span>
            </div>
            <div className="w-6 h-6 rounded bg-slate-200 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=80&q=80"
                alt="thumb"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-0 right-0 w-2 h-2 bg-slate-900/80 text-white text-[5px] flex items-center justify-center">
                ×
              </span>
            </div>
            <div className="w-6 h-6 rounded bg-slate-200 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=80&q=80"
                alt="thumb"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-0 right-0 w-2 h-2 bg-slate-900/80 text-white text-[5px] flex items-center justify-center">
                ×
              </span>
            </div>
          </div>

          {/* Button */}
          <div className="bg-blue-600 text-white text-[8px] font-bold py-1 rounded text-center shadow-2xs">
            Nộp tác phẩm
          </div>
        </div>
      ),
    },
    {
      step: 6,
      num: '06',
      title: 'Chờ kết quả',
      description: 'Theo dõi trạng thái duyệt tác phẩm, xem bảng xếp hạng và kết quả cuối cùng trên trang cá nhân.',
      btnText: 'Xem kết quả mẫu',
      action: () => {
        if (onSelectPortal) onSelectPortal('WINNING_PHOTOS');
        else setModalStep(6);
      },
      renderMockup: () => (
        <div className="w-full h-28 bg-white rounded-xl border border-slate-200/90 p-2 shadow-2xs flex flex-col justify-between overflow-hidden group-hover:border-blue-300 transition-colors">
          {/* Top title */}
          <div className="flex items-center gap-1 pb-1 border-b border-slate-100">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[8px] font-bold text-slate-800">Trạng thái hồ sơ</span>
          </div>

          {/* Timeline steps */}
          <div className="space-y-1.5 my-auto pl-1">
            <div className="flex items-center gap-1.5 text-[7px]">
              <span className="w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px] shrink-0 font-bold">
                ✓
              </span>
              <div>
                <span className="font-bold text-slate-800 block leading-tight">Đã nộp tác phẩm</span>
                <span className="text-[6px] text-slate-400">10/10/2025 14:32</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[7px]">
              <span className="w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px] shrink-0 font-bold">
                ✓
              </span>
              <div>
                <span className="font-bold text-slate-800 block leading-tight">Đang duyệt</span>
                <span className="text-[6px] text-slate-400">12/10/2025</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[7px]">
              <span className="w-3 h-3 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[7px] shrink-0 font-bold">
                •
              </span>
              <div>
                <span className="font-bold text-slate-600 block leading-tight">Công bố kết quả</span>
                <span className="text-[6px] text-slate-400">30/10/2025</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-to-join" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Outer Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden">
        {/* Background Vintage Camera & Script Art Graphic on Top Right */}
        <div className="absolute top-0 right-0 w-full sm:w-2/3 lg:w-1/2 h-44 sm:h-52 overflow-hidden pointer-events-none opacity-85 z-0">
          <img
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80"
            alt="Vintage camera banner decoration"
            className="w-full h-full object-cover object-right filter brightness-105"
          />
          {/* Subtle gradient to seamlessly fade photo into the white card */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

          {/* Aesthetic Cursive Script Text (Capture Develop Share) */}
          <div className="absolute top-6 right-28 sm:right-36 lg:right-48 text-right hidden sm:block">
            <div className="font-serif italic font-bold text-sky-600/75 text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-wider transform -rotate-6 drop-shadow-xs select-none">
              Capture
              <br />
              <span className="pl-4">Develop</span>
              <br />
              <span className="pl-8">Share</span>
            </div>
          </div>
        </div>

        {/* Top Header Content */}
        <div className="relative z-10 max-w-2xl mb-8 lg:mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2.5">
            <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span>Hướng dẫn dự thi</span>
            <span className="text-slate-300 font-normal">───</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2.5">
            Các bước <span className="text-blue-600">tham gia cuộc thi</span>
          </h2>

          {/* Description */}
          <p className="text-slate-500 text-xs sm:text-sm lg:text-base leading-relaxed">
            Tham gia FilmContest thật đơn giản chỉ với 6 bước. Hãy chuẩn bị những khoảnh khắc film tuyệt vời của bạn!
          </p>
        </div>

        {/* 6 Steps Process Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-3.5">
          {steps.map((item, index) => (
            <div key={item.step} className="relative flex flex-col">
              {/* Card Container */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col justify-between h-full group">
                {/* Step number badge & Mockup */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {item.num}
                    </span>
                  </div>

                  {/* Mockup Preview Area */}
                  <div className="mb-3.5">{item.renderMockup()}</div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-sm text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4 line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <button
                  type="button"
                  onClick={item.action}
                  className="w-full py-1.5 px-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98 shadow-2xs"
                >
                  <span className="truncate">{item.btnText}</span>
                  <ArrowRight className="w-3 h-3 shrink-0" />
                </button>
              </div>

              {/* Connecting arrow indicator between cards on desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-2.5 top-[38%] -translate-y-1/2 z-20 w-5 h-5 rounded-full bg-white border border-slate-200 shadow-2xs items-center justify-center text-slate-400 pointer-events-none">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Detail Modal for Steps 4, 5, 6 */}
      {modalStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setModalStep(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {modalStep === 4 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase">Bước 04</span>
                    <h3 className="text-lg font-bold text-slate-900">Quản lý hồ sơ & Trang cá nhân</h3>
                  </div>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  <p>
                    Tại trang cá nhân, bạn có thể hoàn thiện tiểu sử nhiếp ảnh gia, các thiết bị máy ảnh phim và dòng lens bạn đang sở hữu.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Theo dõi tiến trình bài thi đã nộp</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Xem nhận xét và điểm số từ Ban giám khảo</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Quản lý chứng nhận và giải thưởng đạt được</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setModalStep(null)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Đã hiểu
                </button>
              </div>
            )}

            {modalStep === 5 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase">Bước 05</span>
                    <h3 className="text-lg font-bold text-slate-900">Quy định tải lên tác phẩm</h3>
                  </div>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  <p>
                    Để đảm bảo chất lượng thẩm định và công bằng cho mọi thí sinh, vui lòng tuân thủ các quy tắc nộp ảnh:
                  </p>
                  <ul className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Định dạng file:</strong> JPG hoặc PNG chất lượng cao, dung lượng không quá 20MB/ảnh.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Nguồn gốc:</strong> Chụp bằng máy cơ/phim thực tế, điền đúng tên Film Stock (Kodak, Fuji, Ilford...).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Không can thiệp AI:</strong> Ảnh sẽ được quét qua mô hình kiểm duyệt gian lận kỹ thuật số trước khi vào vòng chấm.</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setModalStep(null)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Đã nắm rõ quy định
                </button>
              </div>
            )}

            {modalStep === 6 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase">Bước 06</span>
                    <h3 className="text-lg font-bold text-slate-900">Quy trình thẩm định & Chờ kết quả</h3>
                  </div>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  <p>
                    Quy trình thẩm định trải qua 3 giai đoạn minh bạch:
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      1. Tiền kiểm tra AI & Ban thư ký (24-48 giờ sau khi nộp)
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                      2. Ban giám khảo chấm điểm chuyên môn & Mở bình chọn cộng đồng
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
                      3. Công bố kết quả tại Gala trực tuyến và vinh danh trên mục Kho ảnh đạt giải
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setModalStep(null);
                      if (onSelectPortal) onSelectPortal('WINNING_PHOTOS');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Xem kho ảnh đạt giải
                  </button>
                  <button
                    onClick={() => setModalStep(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
