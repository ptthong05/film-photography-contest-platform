import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 py-3">
      <label className="flex w-[34rem] max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-[#eef3fa] px-4 py-2.5 text-sm text-slate-500">
        <Search size={18} aria-hidden />
        <input
          placeholder="Tìm kiếm cuộc thi, bài dự thi, nhiếp ảnh gia..."
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
        />
      </label>
      <div className="flex items-center gap-5">
        <button type="button" aria-label="Thông báo" className="relative rounded-xl bg-[#eef3fa] p-3 text-slate-600">
          <Bell size={20} />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-rose-500" />
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="text-right leading-tight">
          <p className="text-sm font-bold text-navy-900">Nguyễn Văn A</p>
          <p className="text-xs text-slate-500">Organizer Portal</p>
        </div>
      </div>
    </header>
  );
}
