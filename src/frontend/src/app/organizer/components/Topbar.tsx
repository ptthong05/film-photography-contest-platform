import { Bell, Search } from "lucide-react";
import { Avatar } from "../../../components/Avatar";

export function Topbar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3">
      <label className="flex w-72 items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-slate-500">
        <Search size={16} aria-hidden />
        <input placeholder="Tìm kiếm..." className="w-full bg-transparent outline-none" />
      </label>
      <div className="flex items-center gap-4">
        <button type="button" aria-label="Thông báo" className="relative text-slate-500 hover:text-navy-900">
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-rose-500" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar name="Nguyễn Văn A" />
          <div className="text-xs leading-tight">
            <p className="font-semibold text-navy-900">Nguyễn Văn A</p>
            <p className="text-slate-500">Organizer</p>
          </div>
        </div>
      </div>
    </header>
  );
}
