import React, { useState, useEffect } from 'react';
import { Trophy, Disc, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { MOCK_CONTESTS } from '../../../mocks/organizerData';

interface DashboardTabProps {
  onNavigate: (tab: string) => void;
  registeredCount?: number;
}

export function DashboardTab({ onNavigate, registeredCount = 0 }: DashboardTabProps) {
  const totalContests = MOCK_CONTESTS.length;

  const [rollsCount, setRollsCount] = useState<number>(0);
  const [submissionsCount, setSubmissionsCount] = useState<number>(0);

  useEffect(() => {
    const loadData = () => {
      const rawRolls = localStorage.getItem('participant_film_rolls');
      if (rawRolls) {
        try {
          const parsedRolls = JSON.parse(rawRolls);
          if (Array.isArray(parsedRolls)) setRollsCount(parsedRolls.length);
        } catch (e) {}
      }

      const rawSubs = localStorage.getItem('participant_submissions');
      if (rawSubs) {
        try {
          const parsedSubs = JSON.parse(rawSubs);
          if (Array.isArray(parsedSubs)) setSubmissionsCount(parsedSubs.length);
          else setSubmissionsCount(0);
        } catch (e) {
          setSubmissionsCount(0);
        }
      } else {
        setSubmissionsCount(0);
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    const interval = setInterval(loadData, 300);

    return () => {
      window.removeEventListener('storage', loadData);
      clearInterval(interval);
    };
  }, []);

  const handleNavigateRolls = () => {
    onNavigate('film-roll');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between space-y-6">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> PARTICIPANT PORTAL
          </span>
          <h1 className="text-3xl font-bold">Nền Tảng Quản Lý Cuộc Thi Nhiếp Ảnh Phim</h1>
          <p className="text-blue-100 text-sm max-w-2xl">
            Quản lý cuộn phim, khung hình, nộp bài dự thi kèm thông số kỹ thuật chuẩn xác và theo dõi kết quả đánh giá từ hội đồng giám khảo.
          </p>
        </div>
        <div className="flex items-center gap-4 z-10 flex-wrap">
          <button
            onClick={() => onNavigate('contests')}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-xl transition text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            Xem Cuộc Thi Ngay <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNavigateRolls}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition text-xs border border-white/20 backdrop-blur-md cursor-pointer"
          >
            Quản Lý Film Roll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => onNavigate('contests')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Cuộc thi đã đăng ký</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{registeredCount}</span>
            <span className="text-sm font-semibold text-slate-400">/ {totalContests}</span>
          </div>
          <p className="text-xs text-slate-500">Bấm để xem danh sách cuộc thi và đăng ký tham gia</p>
        </div>

        <div 
          onClick={handleNavigateRolls}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Cuộn phim (Film Rolls)</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Disc className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{rollsCount}</span>
            <span className="text-sm font-semibold text-slate-400">cuộn đã khai báo</span>
          </div>
          <p className="text-xs text-slate-500">Quản lý thông số ISO, máy ảnh, ống kính và lab tráng</p>
        </div>

        <div 
          onClick={() => onNavigate('my-entries')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Bài nộp (Submissions)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{submissionsCount}</span>
            <span className="text-sm font-semibold text-slate-400">bài đã gửi</span>
          </div>
          <p className="text-xs text-slate-500">Bấm để xem danh sách bài dự thi đã nộp</p>
        </div>
      </div>
    </div>
  );
}