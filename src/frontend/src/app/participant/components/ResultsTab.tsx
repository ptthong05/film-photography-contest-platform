import React, { useState } from 'react';
import { Trophy, Award, CheckCircle2, BookOpen, MessageSquare, Star, X } from 'lucide-react';

interface ResultItem {
  id: string;
  contestTitle: string;
  title: string;
  awardName: string;
  score: string;
  status: string;
  photoUrl: string;
  judgeName: string;
  judgeComments: string;
  criteriaScores: { name: string; score: number; maxScore: number; weight: string }[];
}

export function ResultsTab() {
  const [selectedResult, setSelectedResult] = useState<ResultItem | null>(null);

  const results: ResultItem[] = [
    {
      id: 'res-1',
      contestTitle: 'Khoảnh Khắc Sài Gòn Phim 2026',
      title: 'Hoàng Hôn Cầu Ba Son',
      awardName: 'Giải Nhì (Second Prize)',
      score: '94.5 / 100',
      status: 'Đã công bố chính thức',
      photoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
      judgeName: 'Nhiếp ảnh gia Trần Đức (Hội đồng Giám khảo)',
      judgeComments: 'Tác phẩm thể hiện dải tương phản động tuyệt vời của chất phim Kodak Portra. Bố cục ánh sáng hoang sơ nhưng giàu cảm xúc, bắt trọn khoảnh khắc vàng của Sài Gòn.',
      criteriaScores: [
        { name: 'Kỹ thuật tráng scan & Chất lượng phim', score: 29, maxScore: 30, weight: '30%' },
        { name: 'Bố cục & Ánh sáng analog', score: 28, maxScore: 30, weight: '30%' },
        { name: 'Thông điệp & Tính sáng tạo', score: 24, maxScore: 25, weight: '25%' },
        { name: 'Độ chính xác Metadata kỹ thuật', score: 13.5, maxScore: 15, weight: '15%' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Kết Quả Cuộc Thi & Digital Archive</h2>
        <p className="text-slate-600 text-sm">Xem kết quả chính thức, bảng điểm chi tiết và nhận xét từ Hội đồng Giám khảo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition cursor-pointer"
            onClick={() => setSelectedResult(r)}
          >
            <div className="p-5 space-y-4">
              <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100">
                <img src={r.photoUrl} alt={r.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> {r.awardName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-blue-600 uppercase">{r.contestTitle}</span>
                <h3 className="font-bold text-slate-900 text-lg">{r.title}</h3>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-700">
                <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Trạng thái: {r.status}</p>
                <p className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-500" /> Tổng điểm hội đồng: <strong>{r.score}</strong></p>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 border-t border-slate-100 text-xs text-blue-800 flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Bấm để xem chi tiết bảng điểm & nhận xét</span>
              <span className="text-blue-600 underline">Xem →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Bảng Điểm Tiêu Chí & Nhận Xét Của Giám Khảo */}
      {selectedResult && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">{selectedResult.contestTitle}</span>
                <h3 className="text-xl font-bold text-slate-900">{selectedResult.title}</h3>
              </div>
              <button onClick={() => setSelectedResult(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Điểm số tiêu chí */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500" /> Bảng Điểm Tiêu Chí Chi Tiết
              </h4>
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {selectedResult.criteriaScores.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-slate-700 font-medium">{c.name} ({c.weight})</span>
                    <span className="font-bold text-slate-900">{c.score} / {c.maxScore}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-blue-700">
                  <span>Tổng điểm tích hợp:</span>
                  <span>{selectedResult.score}</span>
                </div>
              </div>
            </div>

            {/* Nhận xét Giám khảo */}
            <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-xl space-y-2 text-xs">
              <p className="font-bold text-blue-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" /> Nhận xét từ {selectedResult.judgeName}:
              </p>
              <p className="text-slate-700 italic leading-relaxed">"{selectedResult.judgeComments}"</p>
            </div>

            <button
              onClick={() => setSelectedResult(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}