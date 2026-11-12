import React, { useEffect, useState } from 'react';
import { Trophy, ArrowRight, Medal, Award, Sparkles, User } from 'lucide-react';
import { getTop10RankedPhotographers } from '../../../services/publishedAwardService';
import type { PhotographerRankItem } from './leaderboard/data';

function RankMedalBadge({ rank }: { rank: 1 | 2 | 3 }) {
  if (rank === 1) {
    return (
      <div className="flex flex-col items-center justify-center select-none" title="Hạng 1 - Quán quân">
        <svg width="24" height="30" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 16L3 34L10 30L14 34L12 16" fill="#3B82F6" />
          <path d="M16 16L14 34L18 30L25 34L21 16" fill="#2563EB" />
          <circle cx="14" cy="13" r="12" fill="url(#goldGrad)" stroke="#F59E0B" strokeWidth="1.5" />
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
        <svg width="24" height="30" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 16L3 34L10 30L14 34L12 16" fill="#FB7185" />
          <path d="M16 16L14 34L18 30L25 34L21 16" fill="#E11D48" />
          <circle cx="14" cy="13" r="12" fill="url(#silverGrad)" stroke="#94A3B8" strokeWidth="1.5" />
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
      <svg width="24" height="30" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 16L3 34L10 30L14 34L12 16" fill="#64748B" />
        <path d="M16 16L14 34L18 30L25 34L21 16" fill="#475569" />
        <circle cx="14" cy="13" r="12" fill="url(#bronzeGrad)" stroke="#B45309" strokeWidth="1.5" />
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

export function LeaderboardSection({
  onViewAll,
  onSelectAuthor,
}: {
  onViewAll?: () => void;
  onSelectAuthor?: (authorName: string) => void;
}) {
  const [top10, setTop10] = useState<PhotographerRankItem[]>(getTop10RankedPhotographers);

  useEffect(() => {
    setTop10(getTop10RankedPhotographers());
    const handleStorage = () => setTop10(getTop10RankedPhotographers());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="home-leaderboard">
      {/* Tiêu đề mục Bảng xếp hạng */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Bảng xếp hạng 10 thí sinh đạt giải xuất sắc
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                Top 10
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Vinh danh các nhiếp ảnh gia phim có thành tích nổi bật và đạt điểm số cao nhất
            </p>
          </div>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer"
          >
            <span>Xem toàn bộ bảng xếp hạng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Danh sách 10 thí sinh dạng thẻ bảng tối ưu */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {/* Header */}
          <div className="bg-[#f0f5fc] border-b border-slate-200/80 flex items-center px-4 sm:px-6 py-3.5 text-xs font-bold text-blue-950 uppercase tracking-wider min-w-[640px]">
            <div className="w-14 text-center">Thứ hạng</div>
            <div className="flex-1 pl-3">Thí sinh đạt giải</div>
            <div className="w-28 text-center">Số bài dự thi</div>
            <div className="w-40 text-center">Giải thưởng (Vàng / Bạc / Đồng)</div>
            <div className="w-28 text-right pr-2">Điểm tổng</div>
          </div>

          {/* Body 10 hàng */}
          <div className="divide-y divide-slate-100 min-w-[640px]">
            {top10.slice(0, 10).map((author, index) => {
              const rank = index + 1;
              return (
                <div
                  key={author.id || author.name}
                  onClick={() => onSelectAuthor?.(author.name)}
                  className={`flex items-center px-4 sm:px-6 py-3.5 transition-colors cursor-pointer group ${
                    rank <= 3 ? 'bg-amber-50/20 hover:bg-amber-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-14 flex items-center justify-center shrink-0">
                    {rank <= 3 ? (
                      <RankMedalBadge rank={rank as 1 | 2 | 3} />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 pl-3 flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-400 transition-all shadow-xs"
                      />
                      {rank === 1 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[10px] shadow-xs text-white">
                          👑
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                          {author.name}
                        </h4>
                        {author.badge && (
                          <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-semibold">
                            {author.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" /> Nhiếp ảnh gia đạt giải
                      </span>
                    </div>
                  </div>

                  {/* Số bài dự thi */}
                  <div className="w-28 text-center font-semibold text-slate-700 text-sm">
                    {author.submissionCount} bài
                  </div>

                  {/* Huy chương */}
                  <div className="w-40 flex items-center justify-center gap-3 text-xs font-bold">
                    <div className="flex items-center gap-1 text-amber-600" title={`${author.gold} Giải Vàng / Nhất`}>
                      <Trophy className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                      <span>{author.gold}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500" title={`${author.silver} Giải Bạc / Nhì`}>
                      <Trophy className="w-4 h-4 fill-slate-300 text-slate-400 shrink-0" />
                      <span>{author.silver}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-700/80" title={`${author.bronze} Giải Đồng / Ba`}>
                      <Trophy className="w-4 h-4 fill-amber-600 text-amber-700 shrink-0" />
                      <span>{author.bronze}</span>
                    </div>
                  </div>

                  {/* Điểm tổng */}
                  <div className="w-28 text-right pr-2">
                    <span className="font-extrabold text-blue-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                      {author.totalPoints.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">điểm</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
