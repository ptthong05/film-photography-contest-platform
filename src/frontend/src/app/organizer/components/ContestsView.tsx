import { useEffect, useMemo, useState } from "react";
import {
  Archive, ArchiveRestore, CalendarDays, ChevronLeft, ChevronRight, ClipboardCopy, Copy, Eye, Filter,
  Images, MoreVertical, Plus, Search, Trophy, UserRoundCheck, Users, X,
  Trash2,
} from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import type { Contest, ContestStatus } from "../../../types/contest";
import type { OrganizerViewProps } from "../../../types/organizer";
import { formatDate } from "../../../utils/formatDate";
import { CONTEST_STATUS } from "../../../utils/statusBadges";
import { ContestCover } from "./ContestCover";
import { OrganizerPageHeader } from "./OrganizerPageHeader";
import {
  archiveOrganizerContest,
  deleteOrganizerContest,
  duplicateOrganizerContest,
  getOrganizerContestCopies,
  isOrganizerContestArchived,
  isOrganizerContestDeleted,
  restoreOrganizerContest,
  withContestSettings,
} from "./contestManagementStorage";

type StatusFilter = ContestStatus | "ALL" | "ARCHIVED";

const FILTER_TABS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "ONGOING", label: "Đang diễn ra" },
  { value: "UPCOMING", label: "Sắp diễn ra" },
  { value: "ENDED", label: "Đã kết thúc" },
  { value: "ARCHIVED", label: "Đã lưu trữ" },
];
const PAGE_SIZE = 5;
const NUMBER_FORMAT = new Intl.NumberFormat("vi-VN");

export function ContestsView({ onNavigate }: OrganizerViewProps) {
  const { data, isLoading, error } = useFetch(contestService.getContests);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [collectionVersion, setCollectionVersion] = useState(0);

  const contests = useMemo(
    () => [...(data ?? []), ...getOrganizerContestCopies()].map(withContestSettings).filter((contest) => !isOrganizerContestDeleted(contest.id)),
    [data, collectionVersion],
  );
  const availableYears = [...new Set(contests.map((contest) => contest.startDate.slice(0, 4)))].sort().reverse();
  const availableCategories = [...new Set(contests.flatMap((contest) => contest.tags ?? []))]
    .sort((a, b) => a.localeCompare(b, "vi"));
  const filteredContests = useMemo(() => {
    const term = keyword.trim().toLocaleLowerCase("vi-VN");
    return contests.filter((contest) =>
      (statusFilter === "ARCHIVED" ? isOrganizerContestArchived(contest.id) : !isOrganizerContestArchived(contest.id) && (statusFilter === "ALL" || contest.status === statusFilter)) &&
      (categoryFilter === "ALL" || (contest.tags ?? []).includes(categoryFilter)) &&
      (yearFilter === "ALL" || contest.startDate.startsWith(yearFilter)) &&
      (!term || [contest.name, contest.id, contest.description ?? "", ...(contest.tags ?? []), ...(contest.judgeNames ?? [])]
        .some((value) => value.toLocaleLowerCase("vi-VN").includes(term)))
    ).sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [contests, keyword, statusFilter, categoryFilter, yearFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredContests.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filteredContests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetPage = () => { setPage(1); setOpenMenuId(null); };
  const clearFilters = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setYearFilter("ALL");
    setKeyword("");
    resetPage();
  };
  const showQuickView = (contest: Contest) => { setSelectedContest(contest); setOpenMenuId(null); };
  const copyId = async (id: string) => {
    setOpenMenuId(null);
    try {
      await navigator.clipboard.writeText(id);
      setNotice(`Đã sao chép mã cuộc thi ${id}.`);
    } catch {
      setNotice(`Không thể sao chép tự động. Mã cuộc thi: ${id}`);
    }
  };
  const openContestManagement = (contest: Contest) => {
    setSelectedContest(null);
    setOpenMenuId(null);
    onNavigate({ view: "CONTEST_DETAIL", id: contest.id });
  };
  const duplicateContest = (contest: Contest) => {
    const copy = duplicateOrganizerContest(contest);
    setCollectionVersion((version) => version + 1);
    setOpenMenuId(null);
    onNavigate({ view: "CONTEST_DETAIL", id: copy.id });
  };
  const archiveContest = (contest: Contest) => {
    archiveOrganizerContest(contest.id);
    setCollectionVersion((version) => version + 1);
    setOpenMenuId(null);
    setNotice(`Đã lưu trữ cuộc thi “${contest.name}”. Có thể mở lại trong tab Đã lưu trữ.`);
  };
  const restoreContest = (contest: Contest) => {
    restoreOrganizerContest(contest.id);
    setCollectionVersion((version) => version + 1);
    setOpenMenuId(null);
    setNotice(`Đã khôi phục cuộc thi “${contest.name}”.`);
  };
  const removeContest = (contest: Contest) => {
    if (!window.confirm(`Xóa cuộc thi “${contest.name}” khỏi danh sách Organizer?`)) return;
    deleteOrganizerContest(contest.id);
    setCollectionVersion((version) => version + 1);
    setOpenMenuId(null);
    setNotice(`Đã xóa cuộc thi “${contest.name}” khỏi danh sách Organizer.`);
  };

  return (
    <section aria-label="Quản lý cuộc thi" className="space-y-5">
      <OrganizerPageHeader title="Quản lý cuộc thi" description="Theo dõi thông tin, bài dự thi và tiến độ các chương trình."
        action={<button type="button" onClick={() => onNavigate({ view: "CREATE_CONTEST" })} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"><Plus size={17} aria-hidden="true" />Tạo cuộc thi</button>} />

      {notice && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Đóng thông báo"><X size={17} /></button>
        </div>
      )}
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}

      {data && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-3" role="tablist" aria-label="Lọc cuộc thi theo trạng thái">
            {FILTER_TABS.map((tab) => {
              const count = tab.value === "ALL"
                ? contests.filter((contest) => !isOrganizerContestArchived(contest.id)).length
                : tab.value === "ARCHIVED"
                  ? contests.filter((contest) => isOrganizerContestArchived(contest.id)).length
                  : contests.filter((contest) => !isOrganizerContestArchived(contest.id) && contest.status === tab.value).length;
              return (
                <button key={tab.value} type="button" role="tab" aria-selected={statusFilter === tab.value}
                  onClick={() => { setStatusFilter(tab.value); resetPage(); }}
                  className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:text-sm ${statusFilter === tab.value ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-600"}`}>
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Tìm kiếm cuộc thi</span>
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input type="search" value={keyword} onChange={(event) => { setKeyword(event.target.value); resetPage(); }}
                placeholder="Tìm theo tên, mã, hạng mục hoặc giám khảo..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="sr-only" htmlFor="organizer-contest-year">Lọc theo năm</label>
            <select id="organizer-contest-year" value={yearFilter} onChange={(event) => { setYearFilter(event.target.value); resetPage(); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
              <option value="ALL">Tất cả năm</option>
              {availableYears.map((year) => <option key={year} value={year}>Năm {year}</option>)}
            </select>
            <button type="button" onClick={() => setShowFilters((value) => !value)} aria-expanded={showFilters} aria-controls="organizer-contest-extra-filter"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              <Filter size={16} aria-hidden="true" /> Bộ lọc
              {categoryFilter !== "ALL" && <span className="rounded-full bg-blue-100 px-1.5 text-xs">1</span>}
            </button>
          </div>

          {showFilters && (
            <div id="organizer-contest-extra-filter" className="flex flex-wrap items-end gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
              <label className="space-y-1 text-xs font-medium text-slate-600">
                <span>Hạng mục cuộc thi</span>
                <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); resetPage(); }}
                  className="block min-w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  <option value="ALL">Tất cả hạng mục</option>
                  {availableCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                Xóa bộ lọc
              </button>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {pageItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
                <Trophy className="text-slate-300" size={36} aria-hidden="true" />
                <p className="font-semibold text-slate-700">Không tìm thấy cuộc thi phù hợp</p>
                <p className="text-sm text-slate-500">Thử đổi từ khóa, năm hoặc bộ lọc trạng thái.</p>
              </div>
            ) : pageItems.map((contest, index) => (
              <ContestRow key={contest.id} contest={contest} seed={(currentPage - 1) * PAGE_SIZE + index}
                isArchived={isOrganizerContestArchived(contest.id)}
                isMenuOpen={openMenuId === contest.id}
                onToggleMenu={() => setOpenMenuId((current) => current === contest.id ? null : contest.id)}
                onQuickView={() => showQuickView(contest)}
                onManage={() => openContestManagement(contest)}
                onCopyId={() => { void copyId(contest.id); }}
                onDuplicate={() => duplicateContest(contest)}
                onArchive={() => archiveContest(contest)}
                onRestore={() => restoreContest(contest)}
                onDelete={() => removeContest(contest)} />
            ))}
          </div>

          <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{filteredContests.length === 0 ? "Hiển thị 0 cuộc thi" : `Hiển thị ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredContests.length)} trong ${filteredContests.length} cuộc thi`}</span>
            <div className="flex items-center gap-1 self-end sm:self-auto" aria-label="Phân trang cuộc thi">
              <button type="button" disabled={currentPage === 1} aria-label="Trang trước" onClick={() => { setPage((value) => Math.max(1, value - 1)); setOpenMenuId(null); }}
                className="rounded-md border border-slate-200 p-2 text-slate-600 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} /></button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                <button key={number} type="button" onClick={() => { setPage(number); setOpenMenuId(null); }} aria-current={number === currentPage ? "page" : undefined}
                  className={`min-w-9 rounded-md px-2.5 py-2 text-xs font-semibold ${number === currentPage ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{number}</button>
              ))}
              <button type="button" disabled={currentPage === pageCount} aria-label="Trang sau" onClick={() => { setPage((value) => Math.min(pageCount, value + 1)); setOpenMenuId(null); }}
                className="rounded-md border border-slate-200 p-2 text-slate-600 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={15} /></button>
            </div>
          </footer>
        </div>
      )}

      {selectedContest && <ContestDetailModal contest={selectedContest} onClose={() => setSelectedContest(null)} onManage={() => openContestManagement(selectedContest)} />}
    </section>
  );
}

function ContestRow({ contest, seed, isArchived, isMenuOpen, onToggleMenu, onQuickView, onManage, onCopyId, onDuplicate, onArchive, onRestore, onDelete }: {
  contest: Contest;
  seed: number;
  isArchived: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onQuickView: () => void;
  onManage: () => void;
  onCopyId: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-slate-50/70 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-slate-300 to-slate-600 sm:h-24 sm:w-32">
          <ContestCover title={contest.name} seed={seed} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="max-w-full truncate text-sm font-bold text-[#0B356B] sm:text-base" title={contest.name}>{contest.name}</h2>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{contest.id}</span>
          </div>
          <p className="flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={13} aria-hidden="true" /> {formatDate(contest.startDate)} – {formatDate(contest.endDate)}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-700">
            <span className="inline-flex items-center gap-1"><Users size={13} aria-hidden="true" /> {NUMBER_FORMAT.format(contest.participantCount)} thí sinh</span>
            <span className="inline-flex items-center gap-1"><UserRoundCheck size={13} aria-hidden="true" /> {contest.judgeNames?.length ?? 0} giám khảo</span>
            <span className="inline-flex items-center gap-1"><Images size={13} aria-hidden="true" /> {NUMBER_FORMAT.format(contest.submissionCount)} bài dự thi</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <StatusBadge {...CONTEST_STATUS[contest.status]} />
            {isArchived && <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700">Đã lưu trữ</span>}
            {(contest.tags ?? []).slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-800">{tag}</span>)}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 lg:pl-2">
        <button type="button" onClick={onQuickView} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 sm:text-sm">
          <Eye size={15} aria-hidden="true" /> Xem chi tiết
        </button>
        <button type="button" onClick={onManage} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:text-sm">
          Quản lý
        </button>
        <div className="relative">
          <button type="button" onClick={onToggleMenu} aria-label={`Thao tác với cuộc thi ${contest.name}`} aria-expanded={isMenuOpen}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><MoreVertical size={17} /></button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <button type="button" onClick={onQuickView} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100"><Eye size={14} aria-hidden="true" /> Xem nhanh thông tin</button>
              <button type="button" onClick={onCopyId} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100"><ClipboardCopy size={14} aria-hidden="true" /> Sao chép mã</button>
              <button type="button" onClick={onDuplicate} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100"><Copy size={14} aria-hidden="true" /> Nhân bản cuộc thi</button>
              {isArchived
                ? <button type="button" onClick={onRestore} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-blue-700 hover:bg-blue-50"><ArchiveRestore size={14} aria-hidden="true" /> Khôi phục</button>
                : <button type="button" onClick={onArchive} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100"><Archive size={14} aria-hidden="true" /> Lưu trữ</button>}
              <button type="button" onClick={onDelete} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-rose-700 hover:bg-rose-50"><Trash2 size={14} aria-hidden="true" /> Xóa cuộc thi</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ContestDetailModal({ contest, onClose, onManage }: { contest: Contest; onClose: () => void; onManage: () => void }) {
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4" role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="organizer-contest-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Chi tiết cuộc thi</p>
            <h2 id="organizer-contest-detail-title" className="mt-1 text-xl font-bold text-[#0B356B]">{contest.name}</h2>
            <p className="mt-1 text-xs text-slate-500">Mã: {contest.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chi tiết cuộc thi" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={21} /></button>
        </div>
        <div className="space-y-5 p-5">
          <div className="h-40 overflow-hidden rounded-xl bg-slate-100 sm:h-52"><ContestCover title={contest.name} seed={0} className="h-full w-full object-cover" /></div>
          <div className="flex flex-wrap items-center gap-3"><StatusBadge {...CONTEST_STATUS[contest.status]} /><span className="text-sm text-slate-600">Giám khảo: <b>{contest.judgeNames?.join(", ") || "Chưa phân công"}</b></span></div>
          <p className="text-sm leading-relaxed text-slate-700">{contest.description || "Chưa có mô tả cuộc thi."}</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Bắt đầu", formatDate(contest.startDate)],
              ["Kết thúc", formatDate(contest.endDate)],
              ["Thí sinh", NUMBER_FORMAT.format(contest.participantCount)],
              ["Giám khảo", NUMBER_FORMAT.format(contest.judgeNames?.length ?? 0)],
              ["Bài dự thi", NUMBER_FORMAT.format(contest.submissionCount)],
              ["Hạng mục", contest.tags?.join(", ") || "Chưa thiết lập"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
          {!!contest.prizes?.length && (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Giải thưởng</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">{contest.prizes.map((prize, index) => <li key={`${prize.name}-${index}`} className="flex justify-between gap-3"><span>{prize.name}</span><span className="font-semibold text-slate-800">{prize.reward}</span></li>)}</ul>
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Đóng</button>
          <button type="button" onClick={onManage} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Mở trang quản lý</button>
        </div>
      </section>
    </div>
  );
}
