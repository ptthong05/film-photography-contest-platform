import React, { useState } from 'react';

export default function ContestsPage() {
  const [selectedContest, setSelectedContest] = useState<number | null>(null);

  return (
    <div className="p-8 bg-slate-50 min-h-screen max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Danh sách cuộc thi</h1>

      {selectedContest === null ? (
        /* 3. Danh sách cuộc thi */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex gap-2 border-b border-slate-100 pb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Tất cả</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold">Đang mở</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold">Sắp diễn ra</button>
            <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold">Đã kết thúc</button>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-4 items-center bg-white shadow-xs">
              <div className="w-full sm:w-40 h-28 bg-slate-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2 w-full">
                <h2 className="font-bold text-slate-900 text-lg">Analog Moments 2025</h2>
                <div className="flex gap-2">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100 font-medium">Phong cảnh</span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100 font-medium">Chân dung</span>
                </div>
                <p className="text-xs text-slate-500">🗓️ 01/06/2025 - 31/08/2025</p>
              </div>
              <button onClick={() => setSelectedContest(1)} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Xem chi tiết</button>
            </div>
          </div>
        </div>
      ) : (
        /* 4. Chi tiết cuộc thi + Đăng ký thành công */
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <button onClick={() => setSelectedContest(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800">← Quay lại danh sách</button>
          <div className="h-48 bg-slate-200 rounded-2xl"></div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Analog Moments 2025</h2>
            <p className="text-sm text-slate-500 mt-1">Ghi lại những khoảnh khắc chân thực nhất bằng phim.</p>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-bold flex justify-between items-center">
            <span>✅ Đã đăng ký thành công! Bạn đã tham gia cuộc thi Analog Moments 2025.</span>
            <a href="/participant/submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700">Nộp bài ngay</a>
          </div>
        </div>
      )}
    </div>
  );
}