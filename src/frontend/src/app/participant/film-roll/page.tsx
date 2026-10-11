import React from 'react';

export default function FilmRollPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Film Roll & Frame</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">+ Thêm cuộn phim</button>
        </div>

        <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Roll #001 - Kodak Portra 400</h2>
              <p className="text-xs text-slate-500">36 frame • 35mm • Máy: Canon AE-1</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">Đang sử dụng</span>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-3">Chi tiết 36 frame phim:</p>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="h-9 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-xs font-bold text-slate-700 shadow-xs hover:border-blue-500 cursor-pointer">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}