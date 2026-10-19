import {
  BarChart3,
  ClipboardList,
  CircleUser,
  Database,
  Globe,
  Images,
  LayoutDashboard,
  Medal,
  Settings,
  Trophy,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { OrganizerView } from "../../../types/organizer";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  view: OrganizerView;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Tổng quan", icon: LayoutDashboard, view: "OVERVIEW" },
  { label: "Quản lý cuộc thi", icon: Trophy, view: "CONTESTS" },
  { label: "Quản lý thí sinh", icon: Users, view: "PARTICIPANTS" },
  { label: "Quản lý bài dự thi", icon: Images, view: "SUBMISSIONS" },
  { label: "Quản lý giám khảo", icon: UserCheck, view: "JUDGES" },
  { label: "Phân công giám khảo", icon: ClipboardList, view: "ASSIGNMENTS" },
  { label: "Kho dữ liệu", icon: Database, view: "ARCHIVE" },
  { label: "Kết quả", icon: Medal, view: "RESULTS" },
  { label: "Báo cáo", icon: BarChart3, view: "REPORTS" },
  { label: "Hồ sơ cá nhân", icon: CircleUser, view: "PROFILE" },
];

interface SidebarProps {
  activeView: OrganizerView;
  onNavigate: (view: OrganizerView) => void;
  onGoHome?: () => void;
}

export function Sidebar({ activeView, onNavigate, onGoHome }: SidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col gap-4 overflow-y-auto bg-[#00468a] p-5 text-white">
      {onGoHome && (
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1a6fe0] px-4 py-3 text-sm font-bold hover:bg-[#2b7df0]"
        >
          <Globe size={18} aria-hidden />
          Về Trang Chủ
        </button>
      )}
      <div className="flex items-center gap-3 border-b border-white/15 pb-4">
        <span className="flex size-11 items-center justify-center rounded-full border-2 border-white/40 bg-white/15 text-sm font-bold">
          NV
        </span>
        <div className="leading-tight">
          <p className="font-bold">Nguyễn Văn A</p>
          <p className="text-xs text-white/70">Ban tổ chức</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {MENU_ITEMS.map(({ label, icon: Icon, view }) => (
          <button
            key={label}
            type="button"
            onClick={() => onNavigate(view)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
              view === activeView ? "bg-[#1a6fe0] text-white" : "text-white/85 hover:bg-white/10"
            }`}
          >
            <Icon size={20} aria-hidden />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-center text-sm font-bold">
        <Settings size={20} aria-hidden />
        Film Photography Smarter with AI
      </div>
    </aside>
  );
}
