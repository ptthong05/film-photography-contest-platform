import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  ChevronRight,
  CircleUser,
  ClipboardList,
  Film,
  Images,
  LayoutDashboard,
  Medal,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoHome?: () => void;
  userName?: string;
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'contests', label: 'Khám phá cuộc thi', icon: Trophy },
  { id: 'my-registrations', label: 'Đăng ký của tôi', icon: ClipboardList },
  { id: 'submit', label: 'Nộp ảnh dự thi', icon: Camera },
  { id: 'film-roll', label: 'Quản lý cuộn phim', icon: Film },
  { id: 'my-entries', label: 'Bài dự thi của tôi', icon: Images },
  { id: 'results', label: 'Kết quả & Giải thưởng', icon: Medal },
  { id: 'profile', label: 'Hồ sơ cá nhân', icon: CircleUser },
];

export function Sidebar({ activeTab, setActiveTab, onGoHome, className = '' }: SidebarProps) {
  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem('participant_avatar') || '';
  });

  const [currentName, setCurrentName] = useState<string>(() => {
    try {
      const savedProfile = localStorage.getItem('participant_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) return parsed.name;
      }
    } catch (e) {
      console.error(e);
    }
    return localStorage.getItem('participant_user_name') || 'Hồ Thanh Bình';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleAvatarChange = () => {
      const savedAvatar = localStorage.getItem('participant_avatar');
      if (savedAvatar) setAvatar(savedAvatar);
    };

    const handleNameChange = () => {
      try {
        const savedProfile = localStorage.getItem('participant_profile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          if (parsed.name) {
            setCurrentName(parsed.name);
            return;
          }
        }
        const savedName = localStorage.getItem('participant_user_name');
        if (savedName) setCurrentName(savedName);
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('avatarChanged', handleAvatarChange);
    window.addEventListener('userNameChanged', handleNameChange);

    return () => {
      window.removeEventListener('avatarChanged', handleAvatarChange);
      window.removeEventListener('userNameChanged', handleNameChange);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem('participant_avatar', base64String);
        try {
          const savedProfile = localStorage.getItem('participant_profile');
          if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            parsed.avatarUrl = base64String;
            localStorage.setItem('participant_profile', JSON.stringify(parsed));
          }
        } catch (err) {
          console.error(err);
        }
        setAvatar(base64String);
        window.dispatchEvent(new Event('avatarChanged'));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside
      className={`sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-[#0B356B] text-white shadow-xl ${className}`}
    >
      {/* Brand Header đồng bộ với Admin & Organizer */}
      <div className="flex items-center gap-3 border-b border-white/15 px-4 pb-5 pt-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Camera size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="text-base font-bold leading-5 text-white">FilmContest</p>
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.14em] text-blue-200">
            PARTICIPANT PORTAL
          </p>
        </div>
      </div>



      {/* Danh sách điều hướng */}
      <nav
        aria-label="Điều hướng thí sinh"
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4"
      >
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setActiveTab(id)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="flex-1 truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile người dùng */}
      <div className="border-t border-white/15 p-3">
        <div className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/10">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/25 bg-blue-500 text-xs font-bold text-white shadow-sm"
            title="Nhấn để đổi ảnh đại diện"
          >
            {avatar ? (
              <img src={avatar} alt={currentName} className="h-full w-full object-cover" />
            ) : (
              <span>
                {currentName
                  ? currentName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(-2)
                      .toUpperCase()
                  : 'TS'}
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={14} className="text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="min-w-0 flex-1 text-left cursor-pointer focus-visible:outline-none"
            aria-label="Mở hồ sơ cá nhân"
          >
            <span className="block truncate text-sm font-semibold text-white">{currentName}</span>
            <span className="block text-xs text-blue-200">Thí sinh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="text-blue-200 hover:text-white cursor-pointer"
            aria-label="Mở hồ sơ cá nhân"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
