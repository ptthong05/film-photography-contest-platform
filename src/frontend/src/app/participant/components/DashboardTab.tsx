import React, { useState, useEffect } from 'react';
import {
  Trophy,
  BookOpen,
  Clock,
  Image as ImageIcon,
  Sparkles,
  Bell,
  X,
  FileText,
  ShieldCheck,
  Disc,
  Award,
  Check,
  Trash2
} from 'lucide-react';
import {
  getUnifiedParticipantContests,
  type ParticipantContest,
} from '../../../services/unifiedContestService';
import { ParticipantContestDetailPage } from './ParticipantContestDetailPage';

export type ContestItem = ParticipantContest;

interface StoredDashboardEntryItem {
  status?: string;
}

export interface DashboardTabProps {
  registeredCount?: number;
  registeredIds?: string[];
  onNavigate?: (tab: string, filter?: string) => void;
  onToggleRegister?: (contestId: string) => void;
}

export function DashboardTab({ registeredCount = 0, registeredIds = [], onNavigate, onToggleRegister }: DashboardTabProps) {
  const [userName, setUserName] = useState('Hồ Thanh Bình');
  const [totalEntriesCount, setTotalEntriesCount] = useState(2);
  const [pendingEntriesCount, setPendingEntriesCount] = useState(0);
  const [contests, setContests] = useState<ParticipantContest[]>(() => getUnifiedParticipantContests());
  const [selectedContest, setSelectedContest] = useState<ParticipantContest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegisterClick = (contestId: string, contestTitle: string, isReg: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = contests.find((c) => c.id === contestId);
    if (!isReg && (target?.status === 'Sắp diễn ra' || target?.rawStatus === 'UPCOMING')) {
      showToast(`⚠️ Cuộc thi "${contestTitle}" sắp diễn ra, chưa mở đăng ký!`);
      return;
    }
    if (onToggleRegister) {
      onToggleRegister(contestId);
      showToast(isReg ? `❌ Đã hủy đăng ký cuộc thi "${contestTitle}".` : `✅ Đã đăng ký thành công cuộc thi "${contestTitle}"!`);
    }
  };

  useEffect(() => {
    const updateDashboardData = () => {
      try {
        const savedName = localStorage.getItem('participant_user_name');
        if (savedName) {
          setUserName(savedName);
        } else {
          const savedProfile = localStorage.getItem('participant_profile');
          if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            if (parsed.name) setUserName(parsed.name);
          }
        }

        const savedCount = localStorage.getItem('participant_total_entries_count');
        if (savedCount) {
          setTotalEntriesCount(parseInt(savedCount, 10));
        }

        const savedEntries = localStorage.getItem('participant_entries');
        if (savedEntries) {
          const parsedEntries: StoredDashboardEntryItem[] = JSON.parse(savedEntries);
          if (Array.isArray(parsedEntries)) {
            setTotalEntriesCount(parsedEntries.length);
            const pendingCount = parsedEntries.filter((item: StoredDashboardEntryItem) => item.status === 'Đang chờ duyệt').length;
            setPendingEntriesCount(pendingCount);
          }
        }

        // Tự động đồng bộ số lượng và danh sách cuộc thi thống nhất
        setContests(getUnifiedParticipantContests());
      } catch (e) {
        console.error(e);
      }
    };

    updateDashboardData();
    window.addEventListener('userNameChanged', updateDashboardData);
    window.addEventListener('storage', updateDashboardData);
    window.addEventListener('filmcontest:contests-updated', updateDashboardData);

    return () => {
      window.removeEventListener('userNameChanged', updateDashboardData);
      window.removeEventListener('storage', updateDashboardData);
      window.removeEventListener('filmcontest:contests-updated', updateDashboardData);
    };
  }, []);

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
        onNavigateSubmit={() => onNavigate && onNavigate('submit')}
      />
    );
  }

  return (
    <div className="space-y-5 w-full pb-16 font-sans text-slate-900 relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#0B356B] via-blue-700 to-indigo-800 rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="space-y-1.5 z-10 max-w-3xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 backdrop-blur-md inline-block">
            ● PARTICIPANT PORTAL • QUẢN LÝ THI NHIẾP ẢNH PHIM
          </span>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Xin chào, {userName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-normal leading-relaxed">
            Cùng khám phá các cuộc thi nhiếp ảnh phim độc bản, quản lý cuộn phim và lưu giữ những khoảnh khắc tuyệt vời nhất của bạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={() => onNavigate && onNavigate('contests', 'Đang diễn ra')}
            className="px-4 py-2 bg-white hover:bg-blue-50 text-[#0B356B] font-semibold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            Xem Cuộc Thi →
          </button>
          <button
            onClick={() => onNavigate && onNavigate('film-roll')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/30 backdrop-blur-md transition cursor-pointer active:scale-95"
          >
            Quản Lý Film Roll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate && onNavigate('contests', 'Đang diễn ra')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex justify-between items-center group"
        >
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CUỘC THI ĐANG MỞ</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B356B]">
                {contests.filter((c) => c.status === 'Đang diễn ra').length}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                / {contests.length} cuộc thi
              </span>
            </div>
            <p className="text-[10px] font-semibold text-emerald-600">🔥 +1 Mới cập nhật tuần này</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-200 flex-shrink-0 group-hover:scale-105 transition">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('my-registrations')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer flex justify-between items-center group"
        >
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ĐÃ ĐĂNG KÝ</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B356B]">{registeredCount}</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Hoàn tất</span>
            </div>
            <p className="text-[10px] font-semibold text-blue-600">
              {registeredCount > 0 ? '✔ Đang tham gia tích cực' : 'Chưa đăng ký cuộc thi nào'}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-200 flex-shrink-0 group-hover:scale-105 transition">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('my-entries', 'pending')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer flex justify-between items-center group"
        >
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ĐANG CHỜ DUYỆT</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B356B]">{pendingEntriesCount}</span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Bài chờ duyệt</span>
            </div>
            <p className="text-[10px] font-semibold text-amber-600">🕒 Hệ thống AI đang quét</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center border border-amber-200 flex-shrink-0 group-hover:scale-105 transition">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('my-entries', 'all')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition cursor-pointer flex justify-between items-center group"
        >
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TỔNG BÀI DỰ THI</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0B356B]">{totalEntriesCount}</span>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">Tác phẩm</span>
            </div>
            <p className="text-[10px] font-semibold text-indigo-600">🛡 Đồng bộ từ thư viện bài nộp</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-200 flex-shrink-0 group-hover:scale-105 transition">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Cuộc thi đang mở</h2>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('contests', 'Đang diễn ra')}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Xem tất cả ({contests.length} cuộc thi) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contests.slice(0, 3).map((contest) => (
            <div key={contest.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-400 transition flex flex-col justify-between">
              <div className="space-y-3 p-3.5 sm:p-4">
                <div className="relative h-36 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={contest.bannerUrl}
                    alt={contest.title}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-2 left-2 px-2.5 py-0.5 text-[10px] font-bold rounded-md shadow-md text-white ${
                    contest.status === 'Đang diễn ra' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}>
                    ● {contest.status}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-blue-600 uppercase truncate">{contest.category}</p>
                  <h3 className="font-bold text-slate-900 text-sm truncate">{contest.title}</h3>
                  <p className="text-[11px] text-slate-400 font-medium">📅 {contest.dateRange}</p>
                </div>
              </div>
              <div className="p-3.5 sm:p-4 pt-0">
                <button
                  onClick={() => setSelectedContest(contest)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer shadow-xs active:scale-95"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Trạng thái bài dự thi</h3>
            <button onClick={() => onNavigate && onNavigate('my-entries')} className="text-xs font-semibold text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80"
              alt="Mùa hè bên bờ biển"
              className="w-11 h-11 rounded-lg object-cover"
            />
            <div className="space-y-0.5 min-w-0">
              <h4 className="font-semibold text-xs text-slate-900 truncate">Mùa hè bên bờ biển</h4>
              <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold text-[10px] rounded-full">
                ● Đang chờ duyệt
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">AI Module Kiểm Tra & Xác Thực</h3>
          </div>
          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600 text-xs">Duplicate check</span>
              <span className="text-emerald-600 font-bold text-xs">✔ Hoàn tất (0.0%)</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600 text-xs">AI-generated detection</span>
              <span className="text-emerald-600 font-bold text-xs">✔ Hoàn tất</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Thông Báo Hệ Thống</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="space-y-0.5">
              <p className="font-medium text-slate-800 text-xs">● Cuộc thi Analog Moments 2025 đã mở đăng ký.</p>
              <p className="text-[10px] text-slate-400">2 ngày trước</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-slate-800 text-xs">● Bài dự thi của bạn đã được duyệt thành công.</p>
              <p className="text-[10px] text-slate-400">5 ngày trước</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}