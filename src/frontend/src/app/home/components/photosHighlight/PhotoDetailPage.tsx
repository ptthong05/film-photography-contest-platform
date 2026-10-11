import React, { useState } from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import type { PhotoDetailItem } from './data';
import { ALL_PHOTOS_DATA } from './data';
import {
  ChevronRight,
  Heart,
  Eye,
  Share2,
  Camera,
  Film,
  Aperture,
  Clock,
  MapPin,
  Calendar,
  Award,
  Sparkles,
  ShieldCheck,
  UserPlus,
  ArrowLeft,
  Maximize2,
  Check
} from 'lucide-react';

interface PhotoDetailPageProps {
  photoId?: string;
  onGoHome: () => void;
  onGoContests: () => void;
  onSelectPhoto: (photoId: string) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  onOpenAuthorProfile?: (authorName: string) => void;
  onOpenWinningPhotos?: () => void;
}

export function PhotoDetailPage({
  photoId = 'p1',
  onGoHome,
  onGoContests,
  onSelectPhoto,
  onOpenAuth,
  onOpenAuthorProfile,
  onOpenWinningPhotos,
}: PhotoDetailPageProps) {
  // Find photo by id or fallback to default
  const photo: PhotoDetailItem = ALL_PHOTOS_DATA[photoId] || ALL_PHOTOS_DATA.p1;

  const [likesCount, setLikesCount] = useState(photo.likes || 120);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likedRelated, setLikedRelated] = useState<Record<string, boolean>>({});

  const handleToggleLikeRelated = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedRelated((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLike = () => {
    if (isLiked) {
      setLikesCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Other related photos
  const relatedPhotos = Object.values(ALL_PHOTOS_DATA).filter((p) => p.id !== photo.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. Header / Navbar */}
      <Navbar
        activeTab="Kho ảnh đạt giải"
        onGoHome={onGoHome}
        onNavigateTab={(tab) => {
          if (tab === 'Trang chủ') onGoHome();
          if (tab === 'Cuộc thi') onGoContests();
        }}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
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
              {photo.title}
            </span>
          </nav>

          <button
            onClick={onGoContests}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách</span>
          </button>
        </div>

        {/* Two Columns Photo Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: High-Res Photo Display (7-8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center min-h-[420px] sm:min-h-[550px] group">
              <img
                src={photo.image}
                alt={photo.title}
                className="max-h-[650px] w-full object-contain filter contrast-[1.05]"
              />

              {/* Award Badge Floating */}
              {photo.award && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-lg backdrop-blur-md">
                    <Award className="w-4 h-4" />
                    <span>{photo.award}</span>
                  </span>
                </div>
              )}

              {/* Contest Tag Floating */}
              {photo.contestName && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/60 text-slate-200 backdrop-blur-md border border-white/10">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span>{photo.contestName}</span>
                  </span>
                </div>
              )}

              {/* Overlay controls on bottom */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{photo.filmStock}</span>
                  <span className="hidden sm:inline text-white/40">•</span>
                  <span className="hidden sm:inline">{photo.camera}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{photo.views} lượt xem</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Interaction Buttons below photo */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{isLiked ? 'Đã yêu thích' : 'Yêu thích'} ({likesCount})</span>
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600">Đã copy link!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Chia sẻ</span>
                    </>
                  )}
                </button>
              </div>

              {photo.category && (
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                  Thể loại: {photo.category}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Full Details & Camera EXIF Specs (4-5 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Author Profile Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div
                onClick={() => onOpenAuthorProfile?.(photo.author)}
                className="group flex items-center justify-between p-2 -m-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                title="Bấm vào để xem thông tin tác giả, giải thưởng & các cuộc thi đã tham gia"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={photo.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={photo.author}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-200 shadow-xs group-hover:border-blue-500 group-hover:scale-105 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 border border-white flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tác giả đạt giải</div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                      {photo.author}
                    </h3>
                    <div className="text-xs text-blue-600 font-medium mt-0.5">Nhiếp ảnh gia phim</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span className="hidden sm:inline text-[11px]">Xem hồ sơ</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Title & Location */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {photo.title}
                </h1>
                {photo.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{photo.location}</span>
                  </div>
                )}
                {photo.dateTaken && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Ngày chụp: {photo.dateTaken}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Film Camera Specs Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <span>Thông số kỹ thuật ảnh phim</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1">
                    <Film className="w-3 h-3 text-amber-500" />
                    <span>Cuộn phim (Film stock)</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{photo.filmStock}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1">
                    <Camera className="w-3 h-3 text-blue-500" />
                    <span>Thân máy (Camera)</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm truncate">{photo.camera}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1">
                    <Aperture className="w-3 h-3 text-emerald-500" />
                    <span>Ống kính (Lens)</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm truncate">{photo.lens}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-500" />
                    <span>Tốc độ màn trập</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{photo.shutterSpeed || '1/125s'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-slate-400 font-medium">Khẩu độ (Aperture)</div>
                  <div className="font-bold text-slate-900 text-sm">{photo.aperture || 'f/2.8'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-slate-400 font-medium">Độ nhạy sáng (ISO)</div>
                  <div className="font-bold text-slate-900 text-sm">{photo.iso || '400'}</div>
                </div>
              </div>

              {photo.lab && (
                <div className="pt-2 text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                  <span className="font-semibold text-blue-900">Lab tráng & scan:</span>
                  <span className="font-medium text-blue-700">{photo.lab}</span>
                </div>
              )}
            </div>

            {/* Author Story & Description Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Câu chuyện tác phẩm
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {photo.story}
              </p>

              {/* AI Verification Badge */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã kiểm định độ hạt & tính nguyên bản film quang học bởi AI</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section: Các tác phẩm nổi bật khác */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tác phẩm phim tiêu biểu khác
            </h2>
            <button
              onClick={() => {
                if (onOpenWinningPhotos) {
                  onOpenWinningPhotos();
                } else {
                  onGoContests();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              <span>Xem tác phẩm tiêu biểu</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedPhotos.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectPhoto(item.id)}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Heart Button floating at top-right corner */}
                <button
                  type="button"
                  onClick={(e) => handleToggleLikeRelated(e, item.id)}
                  className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                  title="Yêu thích tác phẩm"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      likedRelated[item.id]
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-white hover:text-rose-400'
                    }`}
                  />
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white pointer-events-none">
                  <span className="text-xs font-bold truncate leading-tight">{item.title}</span>
                  <span className="text-[11px] text-slate-300 mt-0.5">{item.author}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
