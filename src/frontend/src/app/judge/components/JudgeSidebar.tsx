import { Camera, ChevronRight, ClipboardList, House, Mail, PenLine, Trophy, UserRound, Calendar } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { JudgeProfile, JudgeView } from '../../../types/judge';
import { Avatar } from './Avatar';

interface NavItem {
  view: JudgeView;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'OVERVIEW', label: 'Tổng quan', icon: House },
  { view: 'CONTESTS', label: 'Cuộc thi của tôi', icon: Calendar },
  { view: 'ASSIGNED', label: 'Bài dự thi được phân công', icon: ClipboardList },
  { view: 'SCORING', label: 'Đánh giá', icon: PenLine },
  { view: 'RESULTS', label: 'Kết quả', icon: Trophy },
  { view: 'MESSAGES', label: 'Tin nhắn', icon: Mail },
  { view: 'PROFILE', label: 'Hồ sơ cá nhân', icon: UserRound },
];

interface JudgeSidebarProps {
  activeView: JudgeView;
  profile: JudgeProfile | null;
  isOpen: boolean;
  onNavigate: (view: JudgeView) => void;
  onClose: () => void;
}

export function JudgeSidebar({ activeView, profile, isOpen, onNavigate, onClose }: JudgeSidebarProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-blue-950 text-slate-200 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Camera className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-white">FilmContest</p>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">JUDGE PANEL</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Điều hướng giám khảo">
          {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
            const isActive = view === activeView;
            return (
              <button
                key={view}
                type="button"
                onClick={() => onNavigate(view)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="flex-1">{label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => onNavigate('PROFILE')}
          className="m-3 flex cursor-pointer items-center gap-3 rounded-xl border-t border-white/10 p-3 text-left transition-colors hover:bg-white/10"
        >
          {profile && <Avatar name={profile.fullName} imageUrl={profile.avatarUrl} />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{profile?.fullName ?? '...'}</p>
            <p className="text-xs text-slate-400">Giám khảo</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </aside>
    </>
  );
}
