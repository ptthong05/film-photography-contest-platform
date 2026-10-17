import { useState } from 'react';
import { Bell, ChevronDown, House, Menu, UserRound } from 'lucide-react';
import type { JudgeProfile } from '../../../types/judge';
import { Avatar } from './Avatar';

interface JudgeHeaderProps {
  title: string;
  subtitle: string;
  profile: JudgeProfile | null;
  unreadCount: number;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onExit: () => void;
}

export function JudgeHeader({
  title,
  subtitle,
  profile,
  unreadCount,
  onOpenMenu,
  onOpenNotifications,
  onOpenProfile,
  onExit,
}: JudgeHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleUserMenuAction = (action: () => void) => {
    setIsUserMenuOpen(false);
    action();
  };

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="mt-1 cursor-pointer rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-blue-950 sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative cursor-pointer rounded-full p-2 text-blue-700 hover:bg-blue-50"
          aria-label={`Thông báo (${unreadCount} chưa đọc)`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((value) => !value)}
            aria-expanded={isUserMenuOpen}
            className="flex cursor-pointer items-center gap-3 text-left"
          >
            {profile && <Avatar name={profile.fullName} imageUrl={profile.avatarUrl} />}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{profile?.fullName ?? '...'}</p>
              <p className="text-xs text-slate-500">Giám khảo</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
          </button>
          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg" role="menu">
                <button type="button" role="menuitem" onClick={() => handleUserMenuAction(onOpenProfile)} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <UserRound className="h-4 w-4" /> Hồ sơ cá nhân
                </button>
                <button type="button" role="menuitem" onClick={() => handleUserMenuAction(onExit)} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <House className="h-4 w-4" /> Về trang chủ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
