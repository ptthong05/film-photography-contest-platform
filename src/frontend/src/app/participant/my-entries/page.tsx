import React from 'react';

export default function MyEntriesPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Bài dự thi của tôi</h1>

        <div className="space-y-4">
          <div className="p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
            <div className="flex gap-4 items-center w-full sm:w-auto">
              <div className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0"></div>
              <div>
                <h2 className="font-bold text-slate-900">Khoảnh khắc trên đồi chè</h2>
                <p className="text-xs text-slate-500">Cuộc thi: Analog Moments 2025</p>
                <p className="text-xs text-slate-400 mt-1">🗓️ Nộp: 18/06/2025</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full">Đang chờ duyệt</span>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
            <div className="flex gap-4 items-center w-full sm:w-auto">
              <div className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0"></div>
              <div>
                <h2 className="font-bold text-slate-900">Mùa hè bên bờ biển</h2>
                <p className="text-xs text-slate-500">Cuộc thi: Analog Moments 2025</p>
                <p className="text-xs text-slate-400 mt-1">🗓️ Nộp: 20/06/2025</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">Đã duyệt</span>
          </div>
        </div>
      </div>
    </div>
  );
}