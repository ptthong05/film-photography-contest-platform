import React from 'react';

export default function SubmitPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Nộp ảnh dự thi</h1>

        <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-2xl p-8 text-center space-y-3">
          <div className="text-4xl">📤</div>
          <p className="text-sm font-bold text-slate-700">Tải lên ảnh scan phim</p>
          <p className="text-xs text-slate-500">Định dạng JPG, PNG, TIFF - Dung lượng tối đa 10MB</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Chọn ảnh</button>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="font-bold text-slate-900 text-base">Thông tin kỹ thuật phim (Metadata)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Film brand / Film stock</label>
              <input type="text" defaultValue="Kodak Portra 400" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ISO</label>
              <input type="text" defaultValue="400" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Camera body</label>
              <input type="text" defaultValue="Canon AE-1" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Lens</label>
              <input type="text" defaultValue="50mm f/1.8" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Film format</label>
              <input type="text" defaultValue="35mm" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Frame number</label>
              <input type="text" defaultValue="12 - 15" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" />
            </div>
          </div>
        </div>

        <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">Tiếp tục →</button>
      </div>
    </div>
  );
}