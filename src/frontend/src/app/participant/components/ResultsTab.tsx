import React, { useState } from 'react';
import { Award } from 'lucide-react';

export function ResultsTab() {
  const [subTab, setSubTab] = useState<'result' | 'history'>('result');

  return (
    <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-8">
      <div className="flex gap-4 border-b pb-4">
        <button
          onClick={() => setSubTab('result')}
          className={`px-6 py-2 rounded-xl font-bold ${subTab === 'result' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
        >
          Kết quả của tôi
        </button>
        <button
          onClick={() => setSubTab('history')}
          className={`px-6 py-2 rounded-xl font-bold ${subTab === 'history' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
        >
          Lịch sử thi
        </button>
      </div>

      {subTab === 'result' ? (
        <div className="space-y-6">
          <div className="text-center space-y-2 border-b pb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Sony World Photography Awards</h2>
            <span className="inline-flex items-center gap-2 px-6 py-2 bg-amber-50 text-amber-900 border border-amber-200 rounded-full font-bold">
              <Award className="w-5 h-5 text-amber-600" /> Giải Nhất • Điểm tổng: 86.5/100
            </span>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-sm uppercase text-slate-700">Nhận xét của giám khảo</h4>
            <p className="italic text-slate-700">"Bức ảnh có bố cục tốt, ánh sáng hài hòa và thể hiện được cảm xúc rất chân thực."</p>
            <p className="text-xs text-right font-bold text-slate-600">— Giám khảo: Lê Minh Tuấn</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Lịch sử tham gia</h3>
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
            <span className="font-semibold text-slate-700">Analog Moments 2025 - Giải Nhì (84.0/100)</span>
            <span className="text-xs font-bold text-emerald-700">Đã hoàn thành</span>
          </div>
        </div>
      )}
    </div>
  );
}