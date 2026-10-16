import {
  Aperture,
  BarChart3,
  ClipboardList,
  CircleUser,
  Database,
  Images,
  LayoutDashboard,
  Medal,
  Trophy,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { OrganizerView } from "../../../types/organizer";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  view?: OrganizerView; // chưa có view = màn hình chưa được làm
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
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 bg-navy-950 p-3">
      <div className="mb-4 flex items-center gap-2 px-2 py-3 text-white">
        <Aperture size={28} className="text-brand-500" aria-hidden />
        <div>
          <p className="font-bold leading-tight">FilmContest</p>
          <p className="text-[10px] text-slate-400">Organizer panel</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {MENU_ITEMS.map(({ label, icon: Icon, view }) => {
          const isActive = view === activeView;
          const isDisabled = view === undefined;
          return (
            <button
              key={label}
              type="button"
              disabled={isDisabled}
              title={isDisabled ? "Sắp có" : undefined}
              onClick={() => view && onNavigate(view)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm focus-visible:outline-2 focus-visible:outline-brand-500 ${
                isActive ? "bg-brand-500 font-semibold text-white" : "text-slate-300 hover:bg-navy-800"
              } ${isDisabled ? "cursor-not-allowed opacity-45 hover:bg-transparent" : ""}`}
            >
              <Icon size={18} aria-hidden />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
