import React from 'react';

export function MyEntriesList() {
  const entries = [
    { id: 1, title: 'Khoảnh khắc chân dung', contest: 'Analog Moments 2026', status: 'Đang chờ duyệt', date: '05/12/2026' },
    { id: 2, title: 'Nhịp sống phố cổ', contest: 'Film & City', status: 'Đã duyệt', date: '01/12/2026' }
  ];

  return (
    <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Bài dự thi của tôi</h1>
      <div className="space-y-4">
        {entries.map((item) => (
          <div key={item.id} className="p-5 border border-slate-200 rounded-2xl flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
              <p className="text-xs text-slate-500">Cuộc thi: {item.contest} • Ngày nộp: {item.date}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
              item.status === 'Đã duyệt' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}