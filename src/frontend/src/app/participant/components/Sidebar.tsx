import React, { useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { profileService } from '../../../services/profileService';
import {
  Home,
  Trophy,
  MapPin,
  Camera,
  Film,
  Image as ImageIcon,
  BarChart2,
  User as UserIcon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoHome?: () => void;
  userName?: string;
}

export function Sidebar({ activeTab, setActiveTab, onGoHome }: SidebarProps) {
  const { user } = useAuth();
  const avatar = user?.avatarUrl ?? '';
  const currentName = user?.name ?? '';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      profileService.saveAvatar(file).catch((err: unknown) => {
        window.alert(err instanceof Error ? err.message : 'Không thể cập nhật ảnh đại diện');
      });
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'contests', label: 'Cuộc thi', icon: Trophy },
    { id: 'my-registrations', label: 'Đăng ký của tôi', icon: MapPin },
    { id: 'submit', label: 'Nộp ảnh', icon: Camera },
    { id: 'film-roll', label: 'Film Roll & Frame', icon: Film },
    { id: 'my-entries', label: 'Bài dự thi', icon: ImageIcon },
    { id: 'results', label: 'Kết quả', icon: BarChart2 },
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserIcon }
  ];

  return (
    <aside className="w-72 bg-[#004282] text-white p-5 space-y-6 flex-shrink-0 min-h-screen shadow-2xl flex flex-col">
      <div className="space-y-6">
        <button
          type="button"
          onClick={onGoHome}
          aria-label="Về trang chủ FilmContest"
          className="flex w-full items-center gap-3 text-left transition-opacity hover:opacity-80 cursor-pointer"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Camera className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-white">FilmContest</p>
            <p className="text-[10px] font-semibold tracking-widest text-blue-200">PARTICIPANT PORTAL</p>
          </div>
        </button>

        <div className="flex items-center space-x-3.5 pb-4 border-b border-blue-400/30">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-12 h-12 rounded-full bg-[#1A6EDB] border-2 border-white/40 flex items-center justify-center font-bold text-white text-base shadow-md flex-shrink-0 cursor-pointer group overflow-hidden"
            title="Nhấn để thay đổi ảnh đại diện"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{currentName ? currentName.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase() : 'NV'}</span>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="overflow-hidden">
            <p className="font-bold text-base text-white truncate">{currentName}</p>
            <p className="text-xs text-blue-200">Nhiếp ảnh gia phim</p>
          </div>
        </div>

        <nav className="space-y-2 text-base font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1A6EDB] text-white shadow-lg font-bold'
                    : 'text-blue-100 hover:bg-blue-800/40'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}