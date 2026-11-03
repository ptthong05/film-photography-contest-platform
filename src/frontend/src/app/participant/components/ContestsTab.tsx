import React, { useState } from 'react';
import { useFetch } from '../../../hooks/useFetch';
import { participantService, type ContestItem } from '../../../services/participantService';
import {
  Trophy, Calendar, Users, Eye, X, CheckCircle2, AlertTriangle,
  Sparkles, ShieldCheck, FileText, Award, Disc, MapPin, Trash2, Check
} from 'lucide-react';


export interface ContestsTabProps {
  registeredIds?: string[];
  onToggleRegister?: (contestId: string) => Promise<void>;
  onNavigateSubmit?: () => void;
  filterRegisteredOnly?: boolean;
}

export function ContestsTab({ registeredIds = [], onToggleRegister, filterRegisteredOnly = false }: ContestsTabProps) {
  const { data, isLoading, error } = useFetch(participantService.getContests);
  const contests = data ?? [];
  const [selectedContest, setSelectedContest] = useState<ContestItem | null>(null);
  const [filterTab, setFilterTab] = useState<'Tất cả' | 'Đang diễn ra' | 'Sắp diễn ra' | 'Đã kết thúc'>('Tất cả');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegisterClick = async (contestId: string, contestTitle: string, isReg: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onToggleRegister) return;
    try {
      await onToggleRegister(contestId);
      showToast(isReg ? `❌ Đã hủy đăng ký cuộc thi "${contestTitle}".` : `✅ Đã đăng ký thành công cuộc thi "${contestTitle}"!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể cập nhật đăng ký');
    }
  };

  const baseContests = filterRegisteredOnly
    ? contests.filter(item => registeredIds.includes(item.id))
    : contests;

  const filteredContests = baseContests.filter(item => {
    if (filterTab === 'Tất cả') return true;
    return item.status === filterTab;
  });

  if (isLoading) return <p className="p-8 text-sm text-slate-500">Đang tải danh sách cuộc thi...</p>;
  if (error) return <p className="p-8 text-sm text-rose-600">{error}</p>;

  return (
    <div className="space-y-8 max-w-[1800px] mx-auto pb-24 relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {selectedContest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 md:p-8 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] max-w-5xl w-full max-h-[92vh] overflow-y-auto border-2 border-slate-200 shadow-2xl space-y-8 p-8 md:p-12 relative animate-scale-up custom-scrollbar">

            <button
              onClick={() => setSelectedContest(null)}
              className="absolute top-6 right-6 md:top-8 md:right-8 p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer z-10 shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src={selectedContest.bannerUrl}
                alt={selectedContest.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-8 text-white space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3.5 py-1 text-[11px] font-black rounded-full uppercase tracking-wider shadow-md text-white ${
                    selectedContest.status === 'Đang diễn ra' ? 'bg-emerald-500' : selectedContest.status === 'Sắp diễn ra' ? 'bg-blue-500' : 'bg-slate-500'
                  }`}>
                    ● {selectedContest.status}
                  </span>
                  <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-black rounded-full border border-white/30">
                    {selectedContest.category}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{selectedContest.title}</h2>
                <p className="text-xs md:text-sm text-slate-200 font-bold flex items-center gap-4">
                  <span>📅 Thời gian: {selectedContest.dateRange}</span>
                  <span>👥 Đã tham gia: {selectedContest.participantsCount} tay máy</span>
                </p>
              </div>
            </div>

            <div className="space-y-8 text-slate-800 text-sm md:text-base">
              <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Giới thiệu quy chế cuộc thi
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {selectedContest.description}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Thể lệ & Quy định nộp bài
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedContest.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-slate-700 font-medium text-xs md:text-sm leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" /> Cơ cấu giải thưởng hoành tráng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 space-y-1">
                    <p className="text-[11px] font-black text-amber-700 uppercase">🥇 Giải Nhất</p>
                    <p className="text-xs md:text-sm font-black text-slate-900">{selectedContest.prizes.first}</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-50 to-zinc-100 p-5 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[11px] font-black text-slate-600 uppercase">🥈 Giải Nhì</p>
                    <p className="text-xs md:text-sm font-black text-slate-900">{selectedContest.prizes.second}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-900/5 to-amber-700/10 p-5 rounded-2xl border border-amber-800/20 space-y-1">
                    <p className="text-[11px] font-black text-amber-900 uppercase">🥉 Giải Ba</p>
                    <p className="text-xs md:text-sm font-black text-slate-900">{selectedContest.prizes.third}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[11px] font-black text-blue-600 uppercase">🎁 Giải Khuyến Khích</p>
                    <p className="text-xs md:text-sm font-black text-slate-900">{selectedContest.prizes.consolation}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 md:p-8 rounded-3xl border border-purple-200 space-y-3">
                <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
                  <Disc className="w-5 h-5 text-purple-600" /> Tiêu chuẩn kỹ thuật máy & scan phim
                </h3>
                <p className="text-purple-900 text-xs md:text-sm font-medium leading-relaxed">
                  {selectedContest.technicalRequirements}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" /> Tiêu chí đánh giá từ Hội đồng giám khảo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedContest.judgingCriteria.map((crit, idx) => (
                    <div key={idx} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-indigo-950 font-bold text-xs flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0"></span>
                      <span>{crit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={() => setSelectedContest(null)}
                className="w-full md:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl transition cursor-pointer"
              >
                Đóng cửa sổ
              </button>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {selectedContest.status === 'Đã kết thúc' ? (
                  <span className="px-6 py-4 bg-slate-100 text-slate-500 font-black text-xs rounded-2xl">
                    Cuộc thi đã kết thúc (Khóa đăng ký)
                  </span>
                ) : registeredIds.includes(selectedContest.id) ? (
                  <button
                    onClick={() => handleRegisterClick(selectedContest.id, selectedContest.title, true)}
                    className="w-full md:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" /> Hủy đăng ký cuộc thi này
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegisterClick(selectedContest.id, selectedContest.title, false)}
                    className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Check className="w-4 h-4" /> Đăng ký tham gia ngay
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
        <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
          ● {filterRegisteredOnly ? 'QUẢN LÝ CÁC CUỘC THI CỦA BẠN' : 'NHIẾP ẢNH PHIM TRUYỀN THỐNG'}
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          {filterRegisteredOnly ? 'Danh sách cuộc thi đã đăng ký' : 'Danh sách cuộc thi'}
        </h1>
        <p className="text-sm text-slate-500">
          {filterRegisteredOnly
            ? 'Quản lý các cuộc thi mà bạn đã tham gia đăng ký, theo dõi thời hạn và tiến hành gửi bài dự thi.'
            : 'Khám phá những cuộc thi nhiếp ảnh phim đang diễn ra, sắp diễn ra và đã kết thúc. Gửi tác phẩm dự thi và khẳng định dấu ấn sáng tạo của bạn.'
          }
        </p>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-3 overflow-x-auto">
        {(['Tất cả', 'Đang diễn ra', 'Sắp diễn ra', 'Đã kết thúc'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-6 py-3 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
              filterTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {tab} ({tab === 'Tất cả' ? baseContests.length : baseContests.filter(c => c.status === tab).length})
          </button>
        ))}
      </div>

      {filteredContests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <p className="text-base font-bold text-slate-600">Bạn chưa đăng ký tham gia cuộc thi nào trong mục này.</p>
          <p className="text-xs text-slate-400">Hãy qua mục "Cuộc thi" để khám phá và đăng ký tham gia ngay nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContests.map((contest) => {
            const isReg = registeredIds.includes(contest.id);
            return (
              <div
                key={contest.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="space-y-4 p-6">
                  <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={contest.bannerUrl}
                      alt={contest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className={`absolute top-3 left-3 px-3.5 py-1 text-[10px] font-black rounded-full shadow-md text-white ${
                      contest.status === 'Đang diễn ra' ? 'bg-emerald-500' : contest.status === 'Sắp diễn ra' ? 'bg-blue-500' : 'bg-slate-500'
                    }`}>
                      ● {contest.status}
                    </span>

                    <span className={`absolute top-3 right-3 px-3.5 py-1 text-[10px] font-black rounded-full shadow-md ${
                      isReg ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isReg ? '✔ Đã đăng ký' : 'Chưa đăng ký'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{contest.category}</p>
                    <h3 className="font-black text-slate-900 text-xl">{contest.title}</h3>
                    <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                      <span>📅 {contest.dateRange}</span>
                      <span>•</span>
                      <span>👥 {contest.participantsCount} tham gia</span>
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 pt-1 leading-relaxed font-medium">
                      {contest.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedContest(contest)}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <Eye className="w-4 h-4" /> Xem chi tiết
                  </button>

                  {contest.status === 'Đã kết thúc' ? (
                    <button
                      onClick={() => setSelectedContest(contest)}
                      className="w-full py-3.5 bg-slate-100 text-slate-400 font-black text-xs rounded-2xl cursor-default flex items-center justify-center gap-1.5"
                    >
                      Đã kết thúc
                    </button>
                  ) : isReg ? (
                    <button
                      onClick={(e) => handleRegisterClick(contest.id, contest.title, true, e)}
                      className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Hủy đăng ký
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleRegisterClick(contest.id, contest.title, false, e)}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Đăng ký ngay
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