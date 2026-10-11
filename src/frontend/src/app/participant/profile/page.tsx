import React from 'react';

export default function ProfilePage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-bold text-3xl flex items-center justify-center shadow-md">NV</div>
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">Nguyễn Văn A</h2>
            <p className="text-sm text-slate-500">Nhiếp ảnh gia phim</p>
            <button className="mt-2 px-4 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50">Chỉnh sửa</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-slate-500">Email:</span> <span className="font-semibold text-slate-800 ml-2">nguyenvana@gmail.com</span></div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-slate-500">Số điện thoại:</span> <span className="font-semibold text-slate-800 ml-2">0901 234 567</span></div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-slate-500">Địa chỉ:</span> <span className="font-semibold text-slate-800 ml-2">Quận 1, TP. Hồ Chí Minh</span></div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-slate-500">Ngày tham gia:</span> <span className="font-semibold text-slate-800 ml-2">15/05/2025</span></div>
        </div>

        <div className="pt-4 space-y-4">
          <h3 className="font-bold text-slate-900">Portfolio của tôi</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="h-32 bg-slate-200 rounded-xl"></div>
            <div className="h-32 bg-slate-200 rounded-xl"></div>
            <div className="h-32 bg-slate-200 rounded-xl"></div>
            <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-semibold cursor-pointer hover:border-blue-500 hover:text-blue-500">+ Thêm ảnh</div>
          </div>
        </div>
      </div>
    </div>
  );
}