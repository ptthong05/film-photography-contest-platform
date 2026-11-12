import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Award,
  Disc,
  MapPin,
  Trash2,
  Check,
  Clock,
} from 'lucide-react';
import {
  getUnifiedParticipantContests,
  type ParticipantContest,
} from '../../../services/unifiedContestService';
import { isSubmissionDeadlinePassed } from '../../../services/contestSyncService';
import { ParticipantContestDetailPage } from './ParticipantContestDetailPage';

export type ContestItem = ParticipantContest;

export interface ContestsTabProps {
  registeredIds?: string[];
  onToggleRegister?: (contestId: string) => void;
  onNavigateSubmit?: () => void;
  filterRegisteredOnly?: boolean;
}

export function ContestsTab({
  registeredIds = [],
  onToggleRegister,
  onNavigateSubmit,
  filterRegisteredOnly = false,
}: ContestsTabProps) {
  const [contests, setContests] = useState<ParticipantContest[]>(() =>
    getUnifiedParticipantContests()
  );
  const [selectedContest, setSelectedContest] = useState<ParticipantContest | null>(null);
  const [filterTab, setFilterTab] = useState<'Tất cả' | 'Đang diễn ra' | 'Sắp diễn ra' | 'Đã kết thúc'>('Tất cả');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lắng nghe sự kiện cài đặt cuộc thi hoặc phân công thay đổi từ Organizer/Admin
  useEffect(() => {
    const refreshContests = () => {
      setContests(getUnifiedParticipantContests());
    };
    window.addEventListener('contestRegistrationChanged', refreshContests);
    window.addEventListener('assignmentChanged', refreshContests);
    window.addEventListener('storage', refreshContests);
    return () => {
      window.removeEventListener('contestRegistrationChanged', refreshContests);
      window.removeEventListener('assignmentChanged', refreshContests);
      window.removeEventListener('storage', refreshContests);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegisterClick = (
    contestId: string,
    contestTitle: string,
    isReg: boolean,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const target = contests.find((c) => c.id === contestId);
    if (!isReg && (target?.status === 'Sắp diễn ra' || target?.rawStatus === 'UPCOMING')) {
      showToast(`⚠️ Cuộc thi "${contestTitle}" sắp diễn ra, chưa mở cổng đăng ký!`);
      return;
    }
    if (onToggleRegister) {
      onToggleRegister(contestId);
      showToast(
        isReg
          ? `❌ Đã hủy đăng ký cuộc thi "${contestTitle}".`
          : `✅ Đã đăng ký thành công cuộc thi "${contestTitle}"!`
      );
    }
  };

  const baseContests = filterRegisteredOnly
    ? contests.filter((item) => registeredIds.includes(item.id))
    : contests;

  const filteredContests = baseContests.filter((item) => {
    if (filterTab === 'Tất cả') return true;
    return item.status === filterTab;
  });

  // Khi bấm xem chi tiết cuộc thi: HIỂN THỊ DẠNG TRANG (PAGE) RIÊNG BIỆT, KHÔNG DÙNG MODAL GIỮA MÀN HÌNH
  if (selectedContest) {
    const isReg = registeredIds.includes(selectedContest.id);
    return (
      <ParticipantContestDetailPage
        contest={selectedContest}
        isRegistered={isReg}
        onToggleRegister={() =>
          handleRegisterClick(selectedContest.id, selectedContest.title, isReg)
        }
        onBack={() => setSelectedContest(null)}
        onNavigateSubmit={onNavigateSubmit}
      />
    );
  }

  return (
    <div className="space-y-5 w-full pb-16 relative font-sans text-slate-900">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header giới thiệu tab */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
        <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-block">
          ● {filterRegisteredOnly ? 'QUẢN LÝ CÁC CUỘC THI CỦA BẠN' : 'NHIẾP ẢNH PHIM TRUYỀN THỐNG'}
        </span>
        <h1 className="text-xl md:text-2xl font-bold text-[#0B356B] tracking-tight">
          {filterRegisteredOnly ? 'Danh sách cuộc thi đã đăng ký' : 'Danh sách cuộc thi'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {filterRegisteredOnly
            ? 'Quản lý các cuộc thi mà bạn đã tham gia đăng ký, theo dõi thời hạn và tiến hành gửi bài dự thi.'
            : 'Khám phá những cuộc thi nhiếp ảnh phim đang diễn ra, sắp diễn ra và đã kết thúc. Gửi tác phẩm dự thi và khẳng định dấu ấn sáng tạo của bạn.'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {(['Tất cả', 'Đang diễn ra', 'Sắp diễn ra', 'Đã kết thúc'] as const).map((tab) => {
          const count =
            tab === 'Tất cả'
              ? baseContests.length
              : baseContests.filter((c) => c.status === tab).length;
          const isActive = filterTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Danh sách thẻ cuộc thi */}
      {filteredContests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">Chưa có cuộc thi nào phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filterRegisteredOnly
              ? 'Bạn chưa đăng ký tham gia cuộc thi nào. Hãy chuyển sang mục "Khám phá cuộc thi" để tìm kiếm các giải đấu hấp dẫn.'
              : 'Hiện chưa có cuộc thi nào trong danh mục này. Vui lòng quay lại sau.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContests.map((contest) => {
            const isReg = registeredIds.includes(contest.id);
            const isDeadlinePassed = isSubmissionDeadlinePassed(contest);

            return (
              <div
                key={contest.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-3.5 sm:p-4 space-y-3">
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                    <img
                      src={contest.bannerUrl}
                      alt={contest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs ${
                          contest.status === 'Đang diễn ra'
                            ? 'bg-emerald-500'
                            : contest.status === 'Sắp diễn ra'
                            ? 'bg-blue-500'
                            : 'bg-slate-500'
                        }`}
                      >
                        ● {contest.status}
                      </span>
                      {isDeadlinePassed && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                          ⏰ Hết hạn nộp
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                          isReg
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/90 text-slate-700 backdrop-blur-xs'
                        }`}
                      >
                        {isReg ? 'Đã đăng ký' : 'Chưa đăng ký'}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-lg truncate">
                      Tổ chức bởi: <strong>{contest.organizer}</strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider truncate">
                      {contest.category}
                    </p>
                    <h3
                      className="font-bold text-slate-900 text-sm sm:text-base truncate"
                      title={contest.title}
                    >
                      {contest.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 truncate">
                      <span>📅 {contest.dateRange}</span>
                      <span>•</span>
                      <span>👥 {contest.participantsCount} tham gia</span>
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 pt-0.5 leading-relaxed">
                      {contest.description}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedContest(contest)}
                    className="w-full py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> Chi tiết
                  </button>

                  {contest.status === 'Đã kết thúc' ? (
                    <button
                      type="button"
                      onClick={() => setSelectedContest(contest)}
                      className="w-full py-2 px-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-lg cursor-default flex items-center justify-center gap-1"
                    >
                      Đã kết thúc
                    </button>
                  ) : contest.status === 'Sắp diễn ra' || contest.rawStatus === 'UPCOMING' ? (
                    <button
                      type="button"
                      disabled
                      title="Cuộc thi sắp diễn ra, chưa đến thời gian mở đăng ký"
                      className="w-full py-2 px-2 bg-slate-100 text-slate-400 border border-slate-200 font-semibold text-xs rounded-lg cursor-not-allowed flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Clock className="w-3.5 h-3.5" /> Chưa mở đăng ký
                    </button>
                  ) : isReg ? (
                    <button
                      type="button"
                      onClick={(e) => handleRegisterClick(contest.id, contest.title, true, e)}
                      className="w-full py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hủy đăng ký
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleRegisterClick(contest.id, contest.title, false, e)}
                      className="w-full py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Đăng ký
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
