import React from 'react';

export default function ResultsPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2 border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">Kết quả cuộc thi</h1>
          <p className="text-sm text-slate-500">Analog Moments 2025</p>
          <div className="inline-block px-6 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-lg mt-2">
            🏆 Giải Nhất (Hạng 1 / 25) • Điểm tổng: 86.5/100
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-bold text-slate-900 text-sm">Chi tiết điểm đánh giá từ Giám khảo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100"><span>Bố cục</span><span className="font-bold text-slate-800">18.5 / 20</span></div>
            <div className="flex justify-between py-2 border-b border-slate-100"><span>Ánh sáng</span><span className="font-bold text-slate-800">17.5 / 20</span></div>
            <div className="flex justify-between py-2 border-b border-slate-100"><span>Nội dung</span><span className="font-bold text-slate-800">17.0 / 20</span></div>
            <div className="flex justify-between py-2 border-b border-slate-100"><span>Kỹ thuật (film & scan)</span><span className="font-bold text-slate-800">16.5 / 20</span></div>
            <div className="flex justify-between py-2"><span>Tính sáng tạo</span><span className="font-bold text-slate-800">17.0 / 20</span></div>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Nhận xét của giám khảo</h3>
          <p className="text-sm text-slate-600 italic">"Bức ảnh có bố cục tốt, ánh sáng hài hòa và thể hiện được cảm xúc rất chân thực."</p>
          <p className="text-xs text-slate-500 text-right font-semibold">— Giám khảo: Lê Minh Tuấn</p>
        </div>
      </div>
    </div>
  );
}