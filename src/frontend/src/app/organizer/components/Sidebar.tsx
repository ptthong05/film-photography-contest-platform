import {
  BarChart3,
  Camera,
  ClipboardList,
  CircleUser,
  Database,
  Globe,
  Images,
  LayoutDashboard,
  Medal,
  Trophy,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { OrganizerView } from "../../../types/organizer";
import { OrganizerAvatar } from "./OrganizerAvatar";

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
  organizerName?: string;
}

export function Sidebar({ activeView, onNavigate, onGoHome, organizerName = "Nguyễn Văn A" }: SidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-[#0B356B] text-white">
      <div className="flex items-center gap-3 border-b border-white/15 px-4 pb-5 pt-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600"><Camera size={22} aria-hidden="true" /></span>
        <div><p className="text-base font-bold leading-5">FilmContest</p><p className="mt-0.5 text-[10px] font-semibold tracking-[0.14em] text-blue-200">ORGANIZER PORTAL</p></div>
      </div>
      {onGoHome && (
        <button
          type="button"
          onClick={onGoHome}
          className="mx-3 mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500"
        >
          <Globe size={18} aria-hidden />
          Về Trang Chủ
        </button>
      )}
      <nav aria-label="Điều hướng ban tổ chức" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {MENU_ITEMS.map(({ label, icon: Icon, view }) => (
          <button
            key={label}
            type="button"
            onClick={() => onNavigate(view)}
            aria-current={view === activeView ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              view === activeView ? "bg-blue-600 text-white shadow-sm" : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={20} aria-hidden />
            {label}
          </button>
        ))}
      </nav>
      <div className="border-t border-white/15 p-3">
        <button type="button" onClick={() => onNavigate("PROFILE")} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/10" aria-label="Mở hồ sơ cá nhân">
          <OrganizerAvatar name={organizerName} />
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{organizerName}</span><span className="block text-xs text-blue-200">Ban tổ chức</span></span>
          <span aria-hidden="true" className="text-blue-200">›</span>
        </button>
      </div>
    </aside>
  );
}
