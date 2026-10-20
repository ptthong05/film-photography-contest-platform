import React, { useState } from 'react';
import { Calendar, MapPin, Trophy, CheckCircle2, ArrowRight, FileText, X, Trash2 } from 'lucide-react';
import { MOCK_CONTESTS } from '../../../mocks/organizerData';

interface ContestsTabProps {
  registeredIds: string[];
  onToggleRegister: (contestId: string) => void;
  onNavigateSubmit: () => void;
}

export function ContestsTab({ registeredIds, onToggleRegister, onNavigateSubmit }: ContestsTabProps) {
  const [selectedContest, setSelectedContest] = useState<any | null>(null);

  const contests = MOCK_CONTESTS.map((c) => ({
    id: String(c.id),
    title: c.name,
    theme: c.status === 'ONGOING' ? 'Đang diễn ra' : c.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Đã kết thúc',
    description: `Thời gian tổ chức: ${c.startDate} đến ${c.endDate}. Số lượng tham gia: ${c.participantCount} nhiếp ảnh gia.`,
    regulations: 'Tuân thủ nghiêm ngặt quy định về metadata ảnh phim, thông số cuộn phim và phòng lab tráng scan.',
    startDate: c.startDate,
    endDate: c.endDate,
    location: 'Toàn quốc',
    maxSubmissions: 3,
    status: c.status
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Danh Sách Cuộc Thi Nhiếp Ảnh</h2>
        <p className="text-slate-600 text-sm">Đồng bộ trực tiếp từ cổng thông tin chung của nhóm</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contests.map((c) => {
          const isRegistered = registeredIds.includes(c.id);
          const isEnded = c.status === 'ENDED';

          return (
            <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    c.status === 'ONGOING'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : c.status === 'UPCOMING'
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {c.status === 'ONGOING' ? 'Đang diễn ra' : c.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {c.startDate} - {c.endDate}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{c.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{c.description}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {c.location}</span>
                  <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> Tối đa {c.maxSubmissions} bài</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedContest(c)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Xem Quy Định
                </button>

                {isEnded ? (
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    Cuộc thi đã kết thúc
                  </span>
                ) : isRegistered ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã đăng ký
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleRegister(c.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl border border-red-200 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hủy
                    </button>
                    <button
                      type="button"
                      onClick={onNavigateSubmit}
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      Nộp bài <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onToggleRegister(c.id)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl transition text-xs shadow-md cursor-pointer relative z-10"
                  >
                    Gửi Đăng Ký
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedContest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-bold text-slate-900">{selectedContest.title}</h3>
              <button onClick={() => setSelectedContest(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm space-y-3 text-slate-700">
              <p><strong>Trạng thái:</strong> {selectedContest.status === 'ONGOING' ? 'Đang diễn ra' : selectedContest.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Đã kết thúc'}</p>
              <p><strong>Mô tả:</strong> {selectedContest.description}</p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-amber-900">Quy định cuộc thi:</p>
                <p className="text-amber-800">{selectedContest.regulations}</p>
              </div>
              <p className="text-xs text-slate-500">Thời gian: {selectedContest.startDate} đến {selectedContest.endDate}</p>
            </div>
            <button
              onClick={() => setSelectedContest(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}