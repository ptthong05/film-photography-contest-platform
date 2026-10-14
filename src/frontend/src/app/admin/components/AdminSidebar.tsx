import {
  BrainCircuit,
  Camera,
  ChevronRight,
  ClipboardList,
  Database,
  FileImage,
  LayoutDashboard,
  Settings,
  Trophy,
  UserCircle,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

// Danh sách màn hình thuộc riêng khu vực Admin.
export type AdminView =
  | 'dashboard'
  | 'users'
  | 'contests'
  | 'submissions'
  | 'judges'
  | 'archive'
  | 'ai-settings'
  | 'settings'
  | 'logs'
  | 'profile';

interface AdminSidebarProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  adminName?: string;
  className?: string;
}

interface AdminMenuItem {
  id: AdminView;
  label: string;
  icon: LucideIcon;
}

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'users', label: 'Quản lý người dùng', icon: Users },
  { id: 'contests', label: 'Quản lý cuộc thi', icon: Trophy },
  { id: 'submissions', label: 'Bài dự thi', icon: FileImage },
  { id: 'judges', label: 'Giám khảo', icon: UserRoundCheck },
  { id: 'archive', label: 'Kho dữ liệu', icon: Database },
  { id: 'ai-settings', label: 'Cấu hình AI', icon: BrainCircuit },
  { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
  { id: 'logs', label: 'Nhật ký log', icon: ClipboardList },
  { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
];

export function AdminSidebar({
  activeView,
  onNavigate,
  adminName = 'Quản trị viên',
  className = '',
}: AdminSidebarProps) {
  return (
    <aside
      className={`sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-[#0B356B] text-white ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-white/15 px-4 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <Camera size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="text-base font-bold leading-5">FilmContest</p>
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.14em] text-blue-200">
            ADMIN PANEL
          </p>
        </div>
      </div>

      <nav aria-label="Điều hướng quản trị" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {ADMIN_MENU_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;

          return (
            <button
              key={id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(id)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/15 p-3">
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Mở hồ sơ cá nhân"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-200 text-blue-950">
            <UserCircle size={23} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{adminName}</span>
            <span className="block text-xs text-blue-200">Administrator</span>
          </span>
          <ChevronRight size={16} className="text-blue-200" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
