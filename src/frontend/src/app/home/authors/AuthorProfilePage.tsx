import React, { useState } from 'react';
import type { Portal } from '../../../types/portal';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import type { AuthorProfile } from './data';
import { ALL_AUTHORS_DATA } from './data';
import {
  Award,
  Trophy,
  Calendar,
  MapPin,
  Camera,
  Film,
  Heart,
  Image as ImageIcon,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';

interface AuthorProfilePageProps {
  authorName?: string;
  onGoHome: () => void;
  onGoContests: () => void;
  onSelectContest?: (contestId: string) => void;
  onSelectPhoto?: (photoId: string) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
}

export function AuthorProfilePage({
  authorName = 'Hoàng Văn E',
  onGoHome,
  onGoContests,
  onSelectContest,
  onSelectPhoto,
  onOpenAuth,
}: AuthorProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'awards' | 'contests' | 'works'>('awards');
  const [copied, setCopied] = useState(false);

  // Find author data by name or fallback to Hoàng Văn E
  const author: AuthorProfile =
    ALL_AUTHORS_DATA[authorName] ||
    ALL_AUTHORS_DATA['Hoàng Văn E'];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <Navbar
        activeTab=""
        onNavigateTab={(tab) => {
          if (tab === 'Trang chủ') onGoHome();
          else if (tab === 'Cuộc thi') onGoContests();
        }}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <button
              onClick={onGoHome}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Trang chủ
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Tác giả đạt giải</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
              {author.name}
            </span>
          </nav>

          <button
            onClick={onGoContests}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Author Hero Profile Header */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Cover Photo */}
          <div className="relative h-48 sm:h-64 bg-slate-900 overflow-hidden">
            <img
              src={author.coverImage}
              alt="Cover"
              className="w-full h-full object-cover opacity-60 filter contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Chia sẻ hồ sơ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar with negative margin floating over cover */}
                <div className="relative -mt-16 sm:-mt-20 shrink-0">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-100"
                  />
                  <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white" title="Đã xác minh danh tính">
                    <CheckCircle2 className="w-4 h-4 fill-blue-600 text-white" />
                  </div>
                </div>

                {/* Name & Details cleanly positioned on the white background */}
                <div className="space-y-1.5 pt-1 sm:pt-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {author.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Tác giả đạt giải
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
                    {author.headline}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {author.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Tham gia từ {author.joinedYear}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio & Gears */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tiểu sử & Phong cách
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  {author.bio}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thiết bị & Loại phim yêu thích
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {author.favoriteGear.map((gear, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        <Camera className="w-3 h-3 text-slate-500" />
                        {gear}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {author.favoriteFilms.map((film, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-medium"
                      >
                        <Film className="w-3 h-3 text-amber-600" />
                        {film}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-between mb-1">
                  <span className="text-xs font-semibold text-amber-800">Giải thưởng</span>
                  <Trophy className="w-4 h-4 text-amber-600 hidden sm:block" />
                </div>
                <div className="text-2xl font-black text-amber-900">{author.awardsCount}</div>
                <div className="text-[11px] text-amber-700">Đã đạt tại các mùa</div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-between mb-1">
                  <span className="text-xs font-semibold text-blue-800">Cuộc thi</span>
                  <Award className="w-4 h-4 text-blue-600 hidden sm:block" />
                </div>
                <div className="text-2xl font-black text-blue-900">{author.contestsCount}</div>
                <div className="text-[11px] text-blue-700">Đã tham gia</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600">Tác phẩm</span>
                  <ImageIcon className="w-4 h-4 text-slate-500 hidden sm:block" />
                </div>
                <div className="text-2xl font-black text-slate-900">{author.photosCount}</div>
                <div className="text-[11px] text-slate-500">Ảnh phim dự thi</div>
              </div>

              <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-between mb-1">
                  <span className="text-xs font-semibold text-rose-800">Yêu thích</span>
                  <Heart className="w-4 h-4 text-rose-600 hidden sm:block" />
                </div>
                <div className="text-2xl font-black text-rose-900">{author.totalLikes.toLocaleString()}</div>
                <div className="text-[11px] text-rose-700">Từ cộng đồng</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('awards')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'awards'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Giải thưởng đạt được ({author.awards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'contests'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Các cuộc thi đã tham gia ({author.contests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('works')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'works'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Bộ sưu tập ảnh ({author.works.length})</span>
          </button>
        </div>

        {/* TAB 1: Các giải thưởng tác giả đã đạt được */}
        {activeTab === 'awards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Thành tích & Giải thưởng nhiếp ảnh
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Xác thực từ hệ thống ban tổ chức
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {author.awards.map((award) => (
                <div
                  key={award.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                    <img
                      src={award.photoImage}
                      alt={award.photoTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
                        <span>{award.rankIcon}</span>
                        <span>{award.rank}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[11px] text-slate-300">Tác phẩm đoạt giải:</div>
                      <div className="font-bold text-sm truncate">{award.photoTitle}</div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-blue-600">{award.contestName}</span>
                        <span>Mùa giải {award.year}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {award.title}
                      </h3>
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 font-medium">
                        🎁 {award.prizeReward}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectContest?.(award.contestId)}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <span>Xem cuộc thi này</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Các cuộc thi tác giả đó đã tham gia */}
        {activeTab === 'contests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Các cuộc thi tác giả đã tham gia
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {author.contests.length} cuộc thi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {author.contests.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Mùa giải {item.year}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'Đạt giải'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'Đang diễn ra'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      <div>Vai trò: <span className="font-semibold text-slate-800">{item.role}</span></div>
                      <div>Số lượng tác phẩm nộp: <span className="font-semibold text-slate-800">{item.entryCount} tác phẩm</span></div>
                      {item.awardReceived && (
                        <div className="text-amber-700 font-semibold pt-1">
                          🏅 Thành tích: {item.awardReceived}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => onSelectContest?.(item.id)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      <span>Xem trang chi tiết cuộc thi</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Bộ sưu tập tác phẩm */}
        {activeTab === 'works' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Tác phẩm ảnh phim của {author.name}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Click vào ảnh để xem đầy đủ thông số Exif & câu chuyện
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {author.works.map((work) => (
                <div
                  key={work.id}
                  onClick={() => onSelectPhoto?.(work.id)}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={work.image}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                    {work.award && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-[10px] font-bold text-white shadow-xs">
                          {work.award}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <h4 className="font-bold text-sm truncate">{work.title}</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 truncate">{work.contestName}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[120px]">{work.camera}</span>
                      </span>
                      <span className="text-rose-500 font-semibold flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-rose-500" />
                        {work.likes}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      <span className="truncate">{work.filmStock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
