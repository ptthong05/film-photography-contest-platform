import { useFetch } from '../../../../hooks/useFetch';
import { publicDataService } from '../../../../services/publicDataService';
import React, { useState, useMemo } from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { ContestDetailModal } from '../ContestDetailModal';
import type { ContestItem } from '../LiveContestsSection';
import { Trophy, Search, Calendar, Users } from 'lucide-react';

interface ContestsPageProps {
  onGoHome: () => void;
  onSelectPortal: (portal: Portal) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  onOpenContestDetail?: (contestId: string) => void;
}

const fetchContests = () => publicDataService.getContests();

export default function ContestsPage({
  onGoHome,
  onSelectPortal,
  onOpenAuth,
  onOpenContestDetail,
}: ContestsPageProps) {
  const contestsQuery = useFetch(fetchContests);
  const allContests = useMemo<ContestItem[]>(() => contestsQuery.data ?? [], [contestsQuery.data]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContest, setSelectedContest] = useState<ContestItem | null>(null);

  const filteredContests = useMemo(() => {
    return allContests.filter((contest) => {
      const matchStatus = statusFilter === 'all' || contest.status === statusFilter;
      const matchSearch =
        searchQuery === '' ||
        contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contest.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [statusFilter, searchQuery, allContests]);

  const counts = {
    all: allContests.length,
    active: allContests.filter((c) => c.status === 'active').length,
    upcoming: allContests.filter((c) => c.status === 'upcoming').length,
    ended: allContests.filter((c) => c.status === 'ended').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. Header / Navbar */}
      <Navbar
        activeTab="Cuộc thi"
        onGoHome={onGoHome}
        onNavigateTab={(tab) => {
          if (tab === 'Trang chủ') onGoHome();
          else if (tab === 'Bảng xếp hạng') onSelectPortal?.('LEADERBOARD');
          else if (tab === 'Kho ảnh đạt giải') onSelectPortal?.('WINNING_PHOTOS');
          else if (tab === 'Hướng dẫn') onSelectPortal?.('GUIDE');
          else if (tab === 'Tin tức') onSelectPortal?.('ARTICLES');
        }}
        onSelectPortal={onSelectPortal}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
      />

      {/* 2. Main Page Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        {/* Page Title & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Nhiếp ảnh phim truyền thống</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Danh sách cuộc thi
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-normal">
            Khám phá những cuộc thi nhiếp ảnh phim đang diễn ra và sắp diễn ra. Gửi tác phẩm dự thi và khẳng định dấu ấn sáng tạo của bạn.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Đang diễn ra ({counts.active})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  statusFilter === 'upcoming'
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sắp diễn ra ({counts.upcoming})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ended')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  statusFilter === 'ended'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Đã kết thúc ({counts.ended})
              </button>
            </div>

            {/* Search Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Field */}
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, thể loại..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Contests Cards Grid */}
        {filteredContests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">Không tìm thấy cuộc thi phù hợp</h3>
            <p className="text-xs text-slate-400">Vui lòng thử tìm kiếm với từ khoá khác hoặc đổi bộ lọc trạng thái.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredContests.map((contest) => {
              const isActive = contest.status === 'active';
              const isUpcoming = contest.status === 'upcoming';
              return (
                <div
                  key={contest.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                >
                  {/* Card Thumbnail */}
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img
                      src={contest.image}
                      alt={contest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Status Pill Badge */}
                    <div className="absolute top-3.5 left-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
                          isActive
                            ? 'bg-emerald-500/90 text-white'
                            : isUpcoming
                            ? 'bg-sky-500/90 text-white'
                            : 'bg-slate-700/90 text-white'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-white animate-pulse' : 'bg-white'
                          }`}
                        />
                        {contest.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {contest.title}
                      </h3>

                      {/* Dates & Participant meta */}
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contest.startDate} - {contest.endDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contest.participantsCount}</span>
                        </div>
                      </div>

                      {/* Category Tags */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {contest.categories.map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          if (onOpenContestDetail) {
                            onOpenContestDetail(contest.id);
                          } else {
                            setSelectedContest(contest);
                          }
                        }}
                        className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />

      {/* Contest Detail Modal */}
      {selectedContest && (
        <ContestDetailModal
          contest={selectedContest}
          onClose={() => setSelectedContest(null)}
          onRegisterSubmit={() => {
            onSelectPortal('PARTICIPANT');
          }}
        />
      )}
    </div>
  );
}
