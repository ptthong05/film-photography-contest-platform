import React from 'react';
import {
  Globe,
  Home,
  Trophy,
  MapPin,
  Camera,
  Film,
  Image as ImageIcon,
  BarChart2,
  User as UserIcon,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoHome?: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onGoHome }: SidebarProps) {
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
    <aside className="w-72 bg-[#004282] text-white p-5 space-y-6 flex-shrink-0 min-h-screen shadow-2xl flex flex-col justify-between">
      <div className="space-y-6">
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-[#1A6EDB] hover:bg-[#155BB8] text-white rounded-xl font-bold text-base transition-all shadow-md"
          >
            <Globe className="w-5 h-5" />
            <span>Về Trang Chủ System</span>
          </button>
        )}

        <div className="flex items-center space-x-3.5 pb-4 border-b border-blue-400/30">
          <div className="w-12 h-12 rounded-full bg-[#1A6EDB] border-2 border-white/40 flex items-center justify-center font-bold text-white text-base shadow-md flex-shrink-0">
            NV
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-base text-white truncate">Nguyễn Văn A</p>
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
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all ${
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

      <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-center space-y-2 border border-blue-300/30 shadow-lg">
        <Settings className="w-6 h-6 mx-auto text-white" />
        <p className="font-bold text-sm text-white leading-tight">
          Film Photography Smarter with AI
        </p>
      </div>
    </aside>
  );
}