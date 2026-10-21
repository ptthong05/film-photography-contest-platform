import { Bell, Search } from "lucide-react";

export function Topbar({ organizerName = "Nguyễn Văn A" }: { organizerName?: string }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:gap-4 sm:px-8">
      <label className="flex w-[34rem] max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">
        <Search size={18} aria-hidden />
        <input
          placeholder="Tìm kiếm cuộc thi, bài dự thi, nhiếp ảnh gia..."
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
        />
      </label>
      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <button type="button" aria-label="Thông báo" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 sm:p-3">
          <Bell size={20} />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-rose-500" />
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-bold text-[#0B356B]">{organizerName}</p>
          <p className="text-xs text-slate-500">Organizer Portal</p>
        </div>
      </div>
    </header>
  );
}
