import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, CheckCircle } from 'lucide-react';

export interface Contest {
  id: number;
  title: string;
  categories: string[];
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  rules: string[];
}

interface ContestsTabProps {
  registeredIds: number[];
  onToggleRegister: (id: number) => void;
  onNavigateSubmit: () => void;
}

export function ContestsTab({
  registeredIds,
  onToggleRegister,
  onNavigateSubmit
}: ContestsTabProps) {
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  const contestsList: Contest[] = [
    {
      id: 1,
      title: 'Analog Moments 2026',
      categories: ['Phong cảnh', 'Chân dung', 'Đời sống'],
      startDate: '01/06/2026',
      endDate: '31/08/2026',
      location: 'Online',
      description:
        'Cuộc thi Analog Moments 2026 là nơi dành cho những người yêu thích nhiếp ảnh phim, cùng nhau lưu giữ những khoảnh khắc chân thực, đậm chất nghệ thuật và cảm xúc.',
      rules: ['Tất cả các nhiếp ảnh gia sử dụng máy ảnh phim.', 'Không giới hạn độ tuổi.']
    },
    {
      id: 2,
      title: 'Film & City',
      categories: ['Đường phố', 'Kiến trúc', 'Đời sống'],
      startDate: '15/06/2026',
      endDate: '30/08/2026',
      location: 'TP. Hồ Chí Minh & Hà Nội',
      description: 'Khám phá nhịp sống đô thị qua ống kính film cổ điển.',
      rules: ['Ảnh chụp trên khổ phim 35mm hoặc Medium Format.']
    },
    {
      id: 3,
      title: 'The Vintage Look',
      categories: ['Chân dung', 'Tĩnh vật'],
      startDate: '01/07/2026',
      endDate: '30/08/2026',
      location: 'Toàn quốc',
      description: 'Tôn vinh vẻ đẹp phong cách cổ điển qua các góc máy độc đáo.',
      rules: ['Mỗi tác giả nộp tối đa 3 tác phẩm.']
    }
  ];

  if (selectedContest) {
    const isRegistered = registeredIds.includes(selectedContest.id);
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => setSelectedContest(null)}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </button>

        <div className="bg-gradient-to-r from-[#004282] to-[#1A6EDB] p-8 rounded-2xl text-white space-y-4 shadow-lg">
          <h1 className="text-3xl font-extrabold">{selectedContest.title}</h1>
          <div className="flex flex-wrap gap-2">
            {selectedContest.categories.map((cat, idx) => (
              <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
                {cat}
              </span>
            ))}
          </div>
          <div className="flex gap-6 text-sm text-blue-100 pt-2 font-medium">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {selectedContest.startDate} - {selectedContest.endDate}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Địa điểm: {selectedContest.location}</span>
          </div>
          
          <div className="pt-2">
            <button
              onClick={() => onToggleRegister(selectedContest.id)}
              className={`px-8 py-3 rounded-xl font-bold transition-all shadow-md ${
                isRegistered
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isRegistered ? 'Hủy đăng ký' : 'Đăng ký tham gia'}
            </button>
          </div>
        </div>

        {isRegistered && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center text-emerald-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-bold text-sm">Đăng ký thành công!</p>
                <p className="text-xs">Bạn đã đăng ký tham gia cuộc thi {selectedContest.title}.</p>
              </div>
            </div>
            <button
              onClick={onNavigateSubmit}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Nộp bài ngay
            </button>
          </div>
        )}

        <div className="space-y-4 pt-2 text-slate-700">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Mô tả</h3>
          <p className="text-sm leading-relaxed">{selectedContest.description}</p>
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Đối tượng tham gia</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {selectedContest.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Danh sách cuộc thi</h1>
        <span className="text-xs font-bold text-slate-500">Hiển thị {contestsList.length} cuộc thi</span>
      </div>

      <div className="space-y-4">
        {contestsList.map((contest) => {
          const isRegistered = registeredIds.includes(contest.id);
          return (
            <div
              key={contest.id}
              className="p-6 border border-slate-200 rounded-2xl flex justify-between items-center bg-slate-50 hover:bg-white hover:border-blue-300 transition-all shadow-sm"
            >
              <div className="space-y-2">
                <h3 className="font-extrabold text-lg text-slate-900">{contest.title}</h3>
                <div className="flex gap-2">
                  {contest.categories.map((cat, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md text-xs font-semibold">
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {contest.startDate} - {contest.endDate}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isRegistered && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    Đã đăng ký
                  </span>
                )}
                <button
                  onClick={() => setSelectedContest(contest)}
                  className="px-5 py-2.5 bg-[#1A6EDB] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}