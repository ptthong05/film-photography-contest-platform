import React, { useState } from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import type { ContestDetailData } from './data';
import { ALL_CONTESTS, DEFAULT_PRIZES_TEMPLATE } from './data';
import {
  Calendar,
  Users,
  Image as ImageIcon,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Award,
  Clock,
  Send,
  ShieldCheck,
  Heart
} from 'lucide-react';

interface ContestDetailPageProps {
  contestId?: string;
  onGoHome: () => void;
  onGoContests: () => void;
  onSelectPortal: (portal: Portal) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  onOpenPhotoDetail?: (photoId: string) => void;
  onOpenWinningPhotos?: () => void;
}

export function ContestDetailPage({
  contestId = 'analog-moments-2025',
  onGoHome,
  onGoContests,
  onSelectPortal,
  onOpenAuth,
  onOpenPhotoDetail,
  onOpenWinningPhotos,
}: ContestDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'rules' | 'prizes'>('info');
  const [likedPast, setLikedPast] = useState<Record<string, boolean>>({});

  const handleToggleLikePast = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedPast((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Find contest data by id or fallback to the first contest
  const contest = ALL_CONTESTS.find((c) => c.id === contestId) || ALL_CONTESTS[0];

  const handleRegisterContest = () => {
    onOpenAuth('REGISTER');
  };

  const tabs = [
    { id: 'info', label: 'Thông tin' },
    { id: 'rules', label: 'Thể lệ' },
    { id: 'prizes', label: 'Giải thưởng' },
  ] as const;

  const defaultTimeline = contest.timeline || [
    { title: 'Bắt đầu nhận bài', date: contest.startDate },
    { title: 'Hạn cuối nhận bài', date: contest.endDate },
    { title: 'Chấm điểm', date: '01/10/2025 - 10/10/2025' },
    { title: 'Công bố kết quả', date: '15/10/2025' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. Header / Navbar */}
      <Navbar
        activeTab="Cuộc thi"
        onGoHome={onGoHome}
        onNavigateTab={(tab) => {
          if (tab === 'Trang chủ') onGoHome();
          if (tab === 'Cuộc thi') onGoContests();
        }}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">

        {/* Breadcrumb matching image */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
          <button
            onClick={onGoHome}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Trang chủ
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={onGoContests}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Cuộc thi
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
            {contest.title}
          </span>
        </nav>

        {/* Contest Hero Banner matching image */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 text-white min-h-[360px] sm:min-h-[420px] flex flex-col justify-between p-6 sm:p-10 border border-slate-200/50">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <img
              src={contest.image}
              alt={contest.title}
              className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          {/* Top Status Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/90 backdrop-blur-md text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {contest.statusLabel}
            </span>
          </div>

          {/* Banner Middle & Bottom Info */}
          <div className="relative z-10 space-y-5 pt-8 sm:pt-14">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {contest.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-200 font-normal line-clamp-2">
                Ghi lại những khoảnh khắc của thời đại nhiếp ảnh phim
              </p>
            </div>

            {/* Meta tags & Action Button */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
              <div className="space-y-3">
                {/* Dates & Numbers */}
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>{contest.startDate} - {contest.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <span>{contest.participantsCount} bài dự thi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>{Math.round(contest.participantsCount * 0.75)} người tham gia</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {contest.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-xs"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Big CTA Register Button */}
              <button
                onClick={handleRegisterContest}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Đăng ký tham gia</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar matching image */}
        <div className="border-b border-slate-200 bg-white rounded-2xl shadow-xs px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 sm:px-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer relative ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Section (Two Columns) */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Thông tin cuộc thi */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Thông tin cuộc thi
              </h2>

              <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-4 font-normal">
                <p>
                  <strong>Analog Moments 2025</strong> là cuộc thi nhiếp ảnh phim quy mô toàn quốc dành cho cộng đồng yêu thích nhiếp ảnh cơ học truyền thống. Cuộc thi nhằm tạo sân chơi chuyên nghiệp, tôn vinh kỹ nghệ làm chủ ánh sáng, độ phơi sáng và phong cách thị giác đặc trưng của từng cuộn phim.
                </p>
                <p>
                  Chủ đề mở rộng xoay quanh những khoảnh khắc đời thường, phong cảnh thiên nhiên hùng vĩ và chân dung con người. Khám phá vẻ đẹp thuần khiết từ các cuộn phim cổ điển, tôn vinh độ hạt grain tự nhiên và câu chuyện cảm xúc mà kỹ thuật số không thể thay thế.
                </p>
                <p>
                  Toàn bộ bài dự thi sẽ được xác thực bằng mô hình AI hỗ trợ phân tích hạt film và thông số quang học, đảm bảo tính nguyên bản và trung thực tuyệt đối.
                </p>
              </div>

              {/* Highlight box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                  <strong>Cam kết tính trung thực:</strong> Bài dự thi hợp lệ phải được scan từ âm bản thật. Ban tổ chức bảo lưu quyền yêu cầu gửi cuộn film hoặc file scan gốc 16-bit TIFF trong vòng thẩm định.
                </div>
              </div>
            </div>

            {/* Right Column: Thời gian quan trọng Timeline matching image */}
            <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Thời gian quan trọng</span>
              </h2>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200">
                {defaultTimeline.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle Step Dot */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-xs flex items-center justify-center text-white" />

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab Thể lệ */}
        {activeTab === 'rules' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Thể lệ & Quy định dự thi
            </h2>
            <div className="space-y-3">
              {(contest.rules || [
                'Tác phẩm dự thi bắt buộc phải chụp bằng máy ảnh cơ học sử dụng film 35mm hoặc 120 Medium Format.',
                'Chấp nhận ảnh scan từ file âm bản độ phân giải cao, không can thiệp AI tạo sinh hoặc chỉnh sửa ghép ảnh số.',
                'Mỗi thí sinh được gửi tối đa 5 tác phẩm đơn hoặc 1 bộ ảnh phóng sự (tối đa 8 ảnh).',
                'Thí sinh phải giữ file âm bản gốc (negative) để đối chứng khi có yêu cầu từ Ban Giám Khảo.',
              ]).map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Giải thưởng */}
        {activeTab === 'prizes' && (() => {
          const displayPrizes = contest.prizes && contest.prizes.length > 0 ? contest.prizes : DEFAULT_PRIZES_TEMPLATE;
          return (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-500" />
                  <span>Cơ cấu giải thưởng</span>
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Tổng cộng: {displayPrizes.length} hạng mục giải
                </span>
              </div>

              {/* Dynamic Responsive Grid for 1, 2, 3, 4, 5, 6, or more prizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {displayPrizes.map((prize, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 hover:border-amber-400 hover:shadow-md transition-all flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100/70 border border-amber-200/50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {prize.rank || '🏅'}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {prize.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {prize.reward}
                      </p>
                      {prize.quantity && (
                        <div className="pt-1">
                          <span className="inline-block text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                            Số lượng: {prize.quantity}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Bottom Section: Ảnh từ các mùa trước matching image */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Ảnh từ các mùa trước
            </h2>
            <button
              onClick={() => onOpenWinningPhotos?.()}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              <span>Xem thêm ảnh</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {(contest.pastPhotos || [
              { id: 'p5', title: 'Nét cười', author: 'Mai Anh', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
              { id: 'p6', title: 'Ánh nắng qua hiên', author: 'Hải Đăng', image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80' },
              { id: 'p7', title: 'Cụ già phố cổ', author: 'Đức Trọng', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
              { id: 'p8', title: 'Em bé vùng cao', author: 'Kim Oanh', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80' },
            ]).map((photo, idx) => (
              <div
                key={idx}
                onClick={() => onOpenPhotoDetail?.(photo.id || `p${idx + 1}`)}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs hover:shadow-xl transition-all cursor-pointer"
              >
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Heart Button floating at top-right corner */}
                <button
                  type="button"
                  onClick={(e) => handleToggleLikePast(e, photo.id || `p${idx + 1}`)}
                  className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                  title="Yêu thích tác phẩm"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      likedPast[photo.id || `p${idx + 1}`]
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-white hover:text-rose-400'
                    }`}
                  />
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white pointer-events-none">
                  <span className="text-xs font-bold leading-tight truncate">{photo.title}</span>
                  {photo.author && (
                    <span className="text-[11px] text-slate-300 mt-0.5">{photo.author}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
