import React, { useState, useMemo } from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import {
  LEADERBOARD_AUTHORS,
  LEADERBOARD_PHOTOS,
  type PhotographerRankItem,
  type PhotoRankItem,
} from './data';
import {
  Trophy,
  ChevronDown,
  Search,
  Heart,
  Camera,
  Film,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  User,
} from 'lucide-react';

interface LeaderboardPageProps {
  onGoHome: () => void;
  onSelectPortal?: (portal: Portal) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  onOpenAuthorProfile?: (authorName: string) => void;
  onOpenPhotoDetail?: (photoId: string) => void;
  onOpenContestDetail?: (contestId: string) => void;
}

// Custom Ribbon Medal Component matching the top 1, 2, 3 badges in the screenshot
function RankMedalBadge({ rank }: { rank: 1 | 2 | 3 }) {
  if (rank === 1) {
    return (
      <div className="flex flex-col items-center justify-center select-none" title="Hạng 1 - Quán quân">
        <svg width="26" height="34" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Blue Ribbon tails */}
          <path d="M7 16L3 34L10 30L14 34L12 16" fill="#3B82F6" />
          <path d="M16 16L14 34L18 30L25 34L21 16" fill="#2563EB" />
          {/* Gold Circle */}
          <circle cx="14" cy="13" r="12" fill="url(#goldGrad)" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Star symbol inside */}
          <path d="M14 6.5L15.8 10.5L20.2 11L16.9 14L17.8 18.5L14 16.2L10.2 18.5L11.1 14L7.8 11L12.2 10.5L14 6.5Z" fill="#FFFBEB" />
          <defs>
            <linearGradient id="goldGrad" x1="4" y1="3" x2="24" y2="23" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="flex flex-col items-center justify-center select-none" title="Hạng 2 - Á quân">
        <svg width="26" height="34" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Coral / Red Ribbon tails */}
          <path d="M7 16L3 34L10 30L14 34L12 16" fill="#FB7185" />
          <path d="M16 16L14 34L18 30L25 34L21 16" fill="#E11D48" />
          {/* Silver Circle */}
          <circle cx="14" cy="13" r="12" fill="url(#silverGrad)" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Star symbol inside */}
          <path d="M14 6.5L15.8 10.5L20.2 11L16.9 14L17.8 18.5L14 16.2L10.2 18.5L11.1 14L7.8 11L12.2 10.5L14 6.5Z" fill="#F8FAFC" />
          <defs>
            <linearGradient id="silverGrad" x1="4" y1="3" x2="24" y2="23" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8FAFC" />
              <stop offset="1" stopColor="#94A3B8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center select-none" title="Hạng 3 - Quý quân">
      <svg width="26" height="34" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bronze / Slate Ribbon tails */}
        <path d="M7 16L3 34L10 30L14 34L12 16" fill="#64748B" />
        <path d="M16 16L14 34L18 30L25 34L21 16" fill="#475569" />
        {/* Bronze Circle */}
        <circle cx="14" cy="13" r="12" fill="url(#bronzeGrad)" stroke="#B45309" strokeWidth="1.5" />
        {/* Star symbol inside */}
        <path d="M14 6.5L15.8 10.5L20.2 11L16.9 14L17.8 18.5L14 16.2L10.2 18.5L11.1 14L7.8 11L12.2 10.5L14 6.5Z" fill="#FEF3C7" />
        <defs>
          <linearGradient id="bronzeGrad" x1="4" y1="3" x2="24" y2="23" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCD34D" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function LeaderboardPage({
  onGoHome,
  onSelectPortal,
  onOpenAuth,
  onOpenAuthorProfile,
  onOpenPhotoDetail,
  onOpenContestDetail,
}: LeaderboardPageProps) {
  const [activeTab, setActiveTab] = useState<'author' | 'work'>('author');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [contestFilter, setContestFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle navigation from Navbar
  const handleNavigateTab = (tab: string) => {
    if (tab === 'Trang chủ') {
      onGoHome();
    } else if (tab === 'Cuộc thi') {
      onSelectPortal?.('CONTESTS');
    } else if (tab === 'Bảng xếp hạng') {
      // already here
    } else if (tab === 'Kho ảnh đạt giải') {
      onSelectPortal?.('WINNING_PHOTOS');
    } else if (tab === 'Tin tức') {
      onSelectPortal?.('ARTICLES');
    } else if (tab === 'Hướng dẫn') {
      onSelectPortal?.('GUIDE');
    }
  };

  // Filter Authors
  const filteredAuthors = useMemo(() => {
    return LEADERBOARD_AUTHORS.filter((author) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTime = timeFilter === 'all' || author.year === timeFilter;
      const matchContest = contestFilter === 'all' || author.contestId === contestFilter;
      return matchSearch && matchTime && matchContest;
    });
  }, [searchQuery, timeFilter, contestFilter]);

  // Filter Photos
  const filteredPhotos = useMemo(() => {
    return LEADERBOARD_PHOTOS.filter((photo) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.authorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTime = timeFilter === 'all' || photo.year === timeFilter;
      const matchContest = contestFilter === 'all' || photo.contestId === contestFilter;
      return matchSearch && matchTime && matchContest;
    });
  }, [searchQuery, timeFilter, contestFilter]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* 1. Header Navbar */}
      <Navbar
        activeTab="Bảng xếp hạng"
        onGoHome={onGoHome}
        onNavigateTab={handleNavigateTab}
        onSelectPortal={onSelectPortal}
        onOpenContests={() => onSelectPortal?.('CONTESTS')}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
      />

      {/* 2. Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Title and Subtitle */}
        <div className="space-y-1 mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-950 tracking-tight">
            Bảng xếp hạng
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Top nhiếp ảnh gia và tác phẩm xuất sắc qua các cuộc thi
          </p>
        </div>

        {/* Tab switchers: Bảng xếp hạng cá nhân vs Bảng xếp hạng tác phẩm */}
        <div className="flex items-center gap-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('author')}
            className={`pb-3 text-sm sm:text-base font-semibold transition-all relative cursor-pointer ${
              activeTab === 'author'
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bảng xếp hạng cá nhân
          </button>
          <button
            onClick={() => setActiveTab('work')}
            className={`pb-3 text-sm sm:text-base font-semibold transition-all relative cursor-pointer ${
              activeTab === 'work'
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bảng xếp hạng tác phẩm
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter 1: Time */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200/90 rounded-xl px-4 py-2 pr-9 text-xs sm:text-sm font-medium text-slate-700 shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="2025">Năm 2025</option>
                <option value="2024">Năm 2024</option>
                <option value="2023">Năm 2023</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter 2: Contest */}
            <div className="relative">
              <select
                value={contestFilter}
                onChange={(e) => setContestFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200/90 rounded-xl px-4 py-2 pr-9 text-xs sm:text-sm font-medium text-slate-700 shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">Tất cả cuộc thi</option>
                <option value="analog-2025">Analog Moments 2025</option>
                <option value="analog-2024">Analog Moments 2024</option>
                <option value="monochrome">Monochrome Film Spirit</option>
                <option value="vintage">The Vintage Look 2024</option>
                <option value="city">Film & City Exhibition</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'author' ? 'Tìm nhiếp ảnh gia...' : 'Tìm tác phẩm, tác giả...'}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 3. Table / Ranking Cards Container */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          {/* TAB 1: BẢNG XẾP HẠNG CÁ NHÂN */}
          {activeTab === 'author' && (
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="bg-[#f2f7fd] border-b border-slate-100 flex items-center px-4 sm:px-6 py-3.5 text-xs font-semibold text-blue-900/80 uppercase tracking-wider min-w-[620px]">
                <div className="w-16 text-center">#</div>
                <div className="flex-1 pl-2">Nhiếp ảnh gia</div>
                <div className="w-28 sm:w-32 text-center">Số bài dự thi</div>
                <div className="w-36 sm:w-44 text-center">Giải thưởng</div>
                <div className="w-28 sm:w-32 text-right pr-2">Điểm tổng</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-100 min-w-[620px]">
                {filteredAuthors.length > 0 ? (
                  filteredAuthors.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onOpenAuthorProfile && onOpenAuthorProfile(item.name)}
                      className="flex items-center px-4 sm:px-6 py-3.5 hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Rank Column */}
                      <div className="w-16 flex items-center justify-center shrink-0">
                        {item.rank <= 3 ? (
                          <RankMedalBadge rank={item.rank as 1 | 2 | 3} />
                        ) : (
                          <span className="font-bold text-slate-600 text-sm">{item.rank}</span>
                        )}
                      </div>

                      {/* Photographer Info Column */}
                      <div className="flex-1 pl-2 flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-400 transition-all shadow-xs"
                          />
                          {item.rank === 1 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[10px] shadow-xs text-white">
                              👑
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                            {item.name}
                          </h4>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <User className="w-3 h-3" /> Thành viên tích cực
                          </span>
                        </div>
                      </div>

                      {/* Submission count */}
                      <div className="w-28 sm:w-32 text-center font-medium text-slate-700 text-sm">
                        {item.submissionCount}
                      </div>

                      {/* Prizes Trophies: Gold, Silver, Bronze */}
                      <div className="w-36 sm:w-44 flex items-center justify-center gap-3 sm:gap-4 text-xs font-semibold">
                        {/* Gold Trophy */}
                        <div className="flex items-center gap-1 text-amber-600" title={`${item.gold} Giải Vàng / Nhất`}>
                          <Trophy className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                          <span>{item.gold}</span>
                        </div>
                        {/* Silver Trophy */}
                        <div className="flex items-center gap-1 text-slate-500" title={`${item.silver} Giải Bạc / Nhì`}>
                          <Trophy className="w-4 h-4 fill-slate-300 text-slate-400 shrink-0" />
                          <span>{item.silver}</span>
                        </div>
                        {/* Bronze Trophy */}
                        <div className="flex items-center gap-1 text-amber-700/80" title={`${item.bronze} Giải Đồng / Ba`}>
                          <Trophy className="w-4 h-4 fill-amber-600 text-amber-700 shrink-0" />
                          <span>{item.bronze}</span>
                        </div>
                      </div>

                      {/* Total Points */}
                      <div className="w-28 sm:w-32 text-right pr-2">
                        <span className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                          {item.totalPoints.toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    Không tìm thấy nhiếp ảnh gia nào phù hợp với bộ lọc.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BẢNG XẾP HẠNG TÁC PHẨM */}
          {activeTab === 'work' && (
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="bg-[#f2f7fd] border-b border-slate-100 flex items-center px-4 sm:px-6 py-3.5 text-xs font-semibold text-blue-900/80 uppercase tracking-wider min-w-[720px]">
                <div className="w-16 text-center">#</div>
                <div className="flex-1 pl-2">Tác phẩm dự thi</div>
                <div className="w-40 pl-2">Nhiếp ảnh gia</div>
                <div className="w-36 text-center">Lượt bình chọn</div>
                <div className="w-36 text-center">Giải thưởng</div>
                <div className="w-28 text-right pr-2">Điểm tổng</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-100 min-w-[720px]">
                {filteredPhotos.length > 0 ? (
                  filteredPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => onOpenPhotoDetail && onOpenPhotoDetail(photo.id)}
                      className="flex items-center px-4 sm:px-6 py-3.5 hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Rank Column */}
                      <div className="w-16 flex items-center justify-center shrink-0">
                        {photo.rank <= 3 ? (
                          <RankMedalBadge rank={photo.rank as 1 | 2 | 3} />
                        ) : (
                          <span className="font-bold text-slate-600 text-sm">{photo.rank}</span>
                        )}
                      </div>

                      {/* Photo Thumbnail + Title Column */}
                      <div className="flex-1 pl-2 flex items-center gap-3 min-w-0">
                        <img
                          src={photo.image}
                          alt={photo.title}
                          className="w-14 h-12 rounded-lg object-cover ring-1 ring-slate-200 group-hover:scale-105 transition-transform shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                            {photo.title}
                          </h4>
                          <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Camera className="w-3 h-3" /> {photo.camera}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Film className="w-3 h-3" /> {photo.filmStock}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Author Column */}
                      <div
                        className="w-40 pl-2 flex items-center gap-2 min-w-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenAuthorProfile) onOpenAuthorProfile(photo.authorName);
                        }}
                      >
                        <img
                          src={photo.authorAvatar}
                          alt={photo.authorName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <span className="text-xs font-medium text-slate-700 hover:text-blue-600 truncate">
                          {photo.authorName}
                        </span>
                      </div>

                      {/* Likes count */}
                      <div className="w-36 text-center text-xs font-semibold text-rose-500 flex items-center justify-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>{photo.likesCount.toLocaleString('vi-VN')}</span>
                      </div>

                      {/* Prize / Award Badge */}
                      <div className="w-36 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            photo.awardType === 'first'
                              ? 'bg-amber-100 text-amber-800'
                              : photo.awardType === 'second'
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : photo.awardType === 'third'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {photo.award}
                        </span>
                      </div>

                      {/* Total Points */}
                      <div className="w-28 text-right pr-2">
                        <span className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                          {photo.totalPoints.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    Không tìm thấy tác phẩm nào phù hợp với bộ lọc.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Bottom Information Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50/30 rounded-2xl p-6 border border-blue-100/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Quy chế tính điểm bảng xếp hạng
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                Điểm số được tổng hợp tự động dựa trên số giải thưởng (Vàng: 100đ, Bạc: 60đ, Đồng: 40đ), điểm số từ ban giám khảo và số lượng tác phẩm hợp lệ.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectPortal?.('CONTESTS')}
            className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Tham gia ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* 5. Footer */}
      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
