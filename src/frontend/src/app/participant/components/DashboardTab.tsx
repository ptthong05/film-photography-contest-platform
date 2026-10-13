import React from 'react';
import { Trophy, MapPin, Clock, Folder } from 'lucide-react';

interface DashboardTabProps {
  contestCount: number;
  registeredCount: number;
  onNavigate: (tab: string) => void;
}

export function DashboardTab({ contestCount, registeredCount, onNavigate }: DashboardTabProps) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900">Xin chào, Nguyễn Văn A! 👋</h1>
        <p className="text-slate-600 text-base mt-2">
          Cùng khám phá các cuộc thi nhiếp ảnh phim và lưu giữ những khoảnh khắc tuyệt vời.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div
            onClick={() => onNavigate('contests')}
            className="p-6 bg-blue-50/70 hover:bg-blue-100 rounded-2xl border border-blue-100 flex items-center space-x-4 cursor-pointer transition-all"
          >
            <Trophy className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-3xl font-extrabold text-blue-900">{contestCount}</p>
              <p className="text-sm font-bold text-blue-600 mt-0.5">Cuộc thi đang mở</p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('my-registrations')}
            className="p-6 bg-sky-50/70 hover:bg-sky-100 rounded-2xl border border-sky-100 flex items-center space-x-4 cursor-pointer transition-all"
          >
            <MapPin className="w-8 h-8 text-sky-600" />
            <div>
              <p className="text-3xl font-extrabold text-sky-900">{registeredCount}</p>
              <p className="text-sm font-bold text-sky-600 mt-0.5">Đã đăng ký</p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('my-entries')}
            className="p-6 bg-amber-50/70 hover:bg-amber-100 rounded-2xl border border-amber-100 flex items-center space-x-4 cursor-pointer transition-all"
          >
            <Clock className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-3xl font-extrabold text-amber-900">1</p>
              <p className="text-sm font-bold text-amber-600 mt-0.5">Bài dự thi chờ duyệt</p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('my-entries')}
            className="p-6 bg-indigo-50/70 hover:bg-indigo-100 rounded-2xl border border-indigo-100 flex items-center space-x-4 cursor-pointer transition-all"
          >
            <Folder className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-3xl font-extrabold text-indigo-900">5</p>
              <p className="text-sm font-bold text-indigo-600 mt-0.5">Tổng bài dự thi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}