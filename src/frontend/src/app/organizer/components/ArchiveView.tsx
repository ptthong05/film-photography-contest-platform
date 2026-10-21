import { useMemo, useState } from "react";
import { Award, CalendarDays, ChevronLeft, ChevronRight, Download, Eye, FilterX, ImageOff, Search, UserRound } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { resultService } from "../../../services/resultService";
import { submissionService } from "../../../services/submissionService";
import type { Contest } from "../../../types/contest";
import type { OrganizerViewProps } from "../../../types/organizer";
import type { ContestResult, AwardLevel } from "../../../types/result";
import type { Submission } from "../../../types/submission";
import { AWARD_LEVEL } from "../../../utils/awardLevels";
import { formatDate } from "../../../utils/formatDate";
import { ContestCover } from "./ContestCover";
import { Modal } from "../../../components/Modal";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

type PrizeFilter = "ALL" | AwardLevel;
type ArchiveItem = { result: ContestResult; contest: Contest; submission?: Submission; year: number };
const PAGE_SIZE = 10;
const PRIZE_TABS: { value: PrizeFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "FIRST", label: "Giải Nhất" },
  { value: "SECOND", label: "Giải Nhì" },
  { value: "THIRD", label: "Giải Ba" },
  { value: "HONORABLE", label: "Giải Khuyến khích" },
];
const PRIZE_STYLE: Record<AwardLevel, string> = {
  FIRST: "bg-red-100 text-red-700",
  SECOND: "bg-amber-100 text-amber-700",
  THIRD: "bg-emerald-100 text-emerald-700",
  HONORABLE: "bg-violet-100 text-violet-700",
};

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLocaleLowerCase("vi-VN").trim();
}

function escapeCsv(value: string | number): string { return `"${String(value).replace(/"/g, '""')}"`; }

function makeArchive(results: ContestResult[], contests: Contest[], submissions: Submission[]): ArchiveItem[] {
  return results.flatMap((result) => {
    const submission = submissions.find((item) => normalize(item.title) === normalize(result.title))
      ?? submissions.find((item) => normalize(item.authorName) === normalize(result.authorName));
    if (!submission) return [];
    const contest = contests.find((item) => item.name === submission.contestName);
    if (!contest) return [];
    const year = Number(contest.startDate.slice(0, 4));
    return [{ result, contest, submission, year: Number.isFinite(year) ? year : 0 }];
  });
}

function ArchiveDetail({ item, onClose, onOpenSubmission }: { item: ArchiveItem; onClose: () => void; onOpenSubmission: () => void }) {
  const metadata = item.submission?.metadata;
  return <Modal title="Chi tiết tác phẩm đạt giải" onClose={onClose} isWide>
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <ContestCover title={item.contest.name} seed={item.result.rank} className="h-52 w-full" />
        <div className="flex flex-wrap items-start justify-between gap-3 p-4">
          <div className="min-w-0"><h3 className="text-lg font-bold text-[#0B356B]">{item.result.title}</h3><p className="mt-1 text-sm text-slate-500">{item.result.authorName} · {item.contest.name}</p></div>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${PRIZE_STYLE[item.result.award]}`}><Award size={14} />{AWARD_LEVEL[item.result.award]}</span>
        </div>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3"><dt className="text-xs text-slate-500">Điểm</dt><dd className="mt-1 font-bold text-[#0B356B]">{item.result.score.toFixed(1)} / 10</dd></div>
        <div className="rounded-lg border border-slate-200 p-3"><dt className="text-xs text-slate-500">Năm cuộc thi</dt><dd className="mt-1 font-semibold text-slate-800">{item.year || "Chưa cập nhật"}</dd></div>
        <div className="rounded-lg border border-slate-200 p-3"><dt className="text-xs text-slate-500">Ngày nộp</dt><dd className="mt-1 font-semibold text-slate-800">{item.submission ? formatDate(item.submission.submittedAt) : "Chưa cập nhật"}</dd></div>
        <div className="rounded-lg border border-slate-200 p-3"><dt className="text-xs text-slate-500">Mã bài dự thi</dt><dd className="mt-1 font-semibold text-slate-800">{item.submission?.code ?? "Chưa liên kết"}</dd></div>
      </dl>
      {metadata && <section><h4 className="mb-2 font-semibold text-[#0B356B]">Thông tin ảnh phim</h4><dl className="grid gap-2 sm:grid-cols-2">{[["Loại phim", metadata.filmStock], ["ISO", metadata.iso], ["Máy ảnh", metadata.camera], ["Ống kính", metadata.lens], ["Định dạng", metadata.format], ["Địa điểm", metadata.location], ["Lab tráng phim", metadata.lab], ["Thông số scan", metadata.scan]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 px-3 py-2"><dt className="text-[11px] text-slate-500">{label}</dt><dd className="mt-0.5 break-words text-sm font-medium text-slate-700">{value || "Chưa cập nhật"}</dd></div>)}</dl></section>}
      {item.submission && <button type="button" onClick={onOpenSubmission} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Eye size={16} />Mở bài dự thi</button>}
    </div>
  </Modal>;
}

export function ArchiveView({ onNavigate }: OrganizerViewProps) {
  const contestsQuery = useFetch(contestService.getContests);
  const resultsQuery = useFetch(resultService.getResults);
  const submissionsQuery = useFetch(submissionService.getSubmissions);
  const [search, setSearch] = useState("");
  const [prize, setPrize] = useState<PrizeFilter>("ALL");
  const [contestName, setContestName] = useState("ALL");
  const [year, setYear] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ArchiveItem | null>(null);

  const archive = useMemo(() => makeArchive(resultsQuery.data ?? [], contestsQuery.data ?? [], submissionsQuery.data ?? []), [resultsQuery.data, contestsQuery.data, submissionsQuery.data]);
  const contests = useMemo(() => [...new Set(archive.map((item) => item.contest.name))].sort((a, b) => a.localeCompare(b, "vi")), [archive]);
  const years = useMemo(() => [...new Set(archive.map((item) => item.year).filter(Boolean))].sort((a, b) => b - a), [archive]);
  const counts = useMemo(() => ({
    ALL: archive.length,
    FIRST: archive.filter((item) => item.result.award === "FIRST").length,
    SECOND: archive.filter((item) => item.result.award === "SECOND").length,
    THIRD: archive.filter((item) => item.result.award === "THIRD").length,
    HONORABLE: archive.filter((item) => item.result.award === "HONORABLE").length,
  }), [archive]);
  const filtered = useMemo(() => {
    const term = normalize(search);
    return archive.filter((item) => {
      if (prize !== "ALL" && item.result.award !== prize) return false;
      if (contestName !== "ALL" && item.contest.name !== contestName) return false;
      if (year !== "ALL" && item.year !== Number(year)) return false;
      return !term || [item.result.title, item.result.authorName, item.contest.name, item.submission?.code ?? "", item.submission?.metadata.filmStock ?? ""].some((value) => normalize(value).includes(term));
    }).sort((a, b) => a.result.rank - b.result.rank);
  }, [archive, search, prize, contestName, year]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const start = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const isLoading = contestsQuery.isLoading || resultsQuery.isLoading || submissionsQuery.isLoading;
  const error = contestsQuery.error ?? resultsQuery.error ?? submissionsQuery.error;
  const resetFilters = () => { setSearch(""); setPrize("ALL"); setContestName("ALL"); setYear("ALL"); setPage(1); };
  const exportCsv = () => {
    if (!filtered.length) return;
    const header = ["Tác phẩm", "Thí sinh", "Cuộc thi", "Năm", "Giải thưởng", "Điểm", "Mã bài dự thi", "Film stock"];
    const rows = filtered.map((item) => [item.result.title, item.result.authorName, item.contest.name, item.year, AWARD_LEVEL[item.result.award], item.result.score.toFixed(1), item.submission?.code ?? "", item.submission?.metadata.filmStock ?? ""]);
    const csv = "\uFEFF" + [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "organizer-kho-tac-pham-dat-giai.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return <section aria-label="Kho dữ liệu tác phẩm đạt giải" className="space-y-5">
    <OrganizerPageHeader title="Kho dữ liệu" description="Tra cứu và xem lại tác phẩm đạt giải trong các cuộc thi bạn quản lý."
      action={<button type="button" onClick={exportCsv} disabled={!filtered.length} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><Download size={17} aria-hidden="true" />Xuất CSV</button>} />
    {isLoading && <StateMessage message="Đang tải kho tác phẩm đạt giải..." />}
    {error && <StateMessage message={error} isError />}
    {!isLoading && !error && <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4"><span className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Award size={21} aria-hidden="true" /></span><div><h2 className="font-bold text-[#0B356B]">Thư viện tác phẩm đạt giải</h2><p className="text-xs text-slate-500">{archive.length} tác phẩm trong các cuộc thi đang quản lý</p></div></div>
        <div className="flex flex-wrap gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-2" role="group" aria-label="Lọc theo giải thưởng">{PRIZE_TABS.map((tab) => <button key={tab.value} type="button" aria-pressed={prize === tab.value} onClick={() => { setPrize(tab.value); setPage(1); }} className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${prize === tab.value ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700"}`}>{tab.label} ({counts[tab.value]})</button>)}</div>
        <div className="flex flex-wrap items-center gap-2 p-4">
          <label className="relative min-w-[190px] flex-1"><span className="sr-only">Tìm kiếm tác phẩm</span><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm tác phẩm, thí sinh, mã bài..." className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <label className="sr-only" htmlFor="organizer-archive-contest">Lọc cuộc thi</label><select id="organizer-archive-contest" value={contestName} onChange={(event) => { setContestName(event.target.value); setPage(1); }} className="max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"><option value="ALL">Tất cả cuộc thi</option>{contests.map((name) => <option key={name} value={name}>{name}</option>)}</select>
          <label className="sr-only" htmlFor="organizer-archive-year">Lọc năm</label><div className="relative"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" /><select id="organizer-archive-year" value={year} onChange={(event) => { setYear(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"><option value="ALL">Tất cả năm</option>{years.map((value) => <option key={value} value={String(value)}>{value}</option>)}</select></div>
          <button type="button" onClick={resetFilters} title="Xóa tất cả bộ lọc" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><FilterX size={16} aria-hidden="true" />Bỏ lọc</button>
        </div>
      </div>

      {visible.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visible.map((item) => <article key={item.result.id} className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative"><ContestCover title={item.contest.name} seed={item.result.rank} className="aspect-[4/3] w-full" /><span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${PRIZE_STYLE[item.result.award]}`}><Award size={13} aria-hidden="true" />{AWARD_LEVEL[item.result.award]}</span><span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-[#0B356B] shadow-sm">#{item.result.rank}</span></div>
        <div className="flex flex-1 flex-col gap-2 p-3"><p className="truncate text-sm font-bold text-[#0B356B]" title={item.result.title}>{item.result.title}</p><p className="flex items-center gap-1.5 truncate text-xs text-slate-600" title={item.result.authorName}><UserRound size={13} className="shrink-0" aria-hidden="true" />{item.result.authorName}</p><p className="truncate text-xs text-slate-500" title={item.contest.name}>{item.contest.name} · {item.year || "Năm chưa rõ"}</p><div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2"><span className="text-xs text-slate-500">Điểm</span><span className="font-bold tabular-nums text-[#0B356B]">{item.result.score.toFixed(1)}<span className="ml-1 text-[11px] font-medium text-slate-400">/ 10</span></span></div><button type="button" onClick={() => setSelected(item)} className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50" aria-label={`Xem chi tiết tác phẩm ${item.result.title}`}><Eye size={15} aria-hidden="true" />Xem chi tiết</button></div>
      </article>)}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><ImageOff className="mx-auto size-10 text-slate-400" aria-hidden="true" /><p className="mt-3 font-semibold text-slate-700">{archive.length ? "Không tìm thấy tác phẩm phù hợp" : "Chưa có tác phẩm đạt giải"}</p><p className="mt-1 text-sm text-slate-500">{archive.length ? "Thử đổi bộ lọc hoặc xóa điều kiện tìm kiếm." : "Tác phẩm sẽ xuất hiện tại đây sau khi kết quả cuộc thi được công bố."}</p>{archive.length > 0 && <button type="button" onClick={resetFilters} className="mt-3 text-sm font-semibold text-blue-700 hover:underline">Xóa bộ lọc</button>}</div>}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between"><span>Hiển thị <strong className="text-slate-700">{start}–{end}</strong> / {filtered.length} tác phẩm đạt giải</span><div className="flex items-center gap-2"><button type="button" aria-label="Trang trước" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={17} aria-hidden="true" /></button><span className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">{currentPage} / {pageCount}</span><button type="button" aria-label="Trang sau" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={17} aria-hidden="true" /></button></div></div>
    </>}
    {selected && <ArchiveDetail item={selected} onClose={() => setSelected(null)} onOpenSubmission={() => { setSelected(null); if (selected.submission) onNavigate({ view: "SUBMISSION_DETAIL", id: selected.submission.id, backTo: "ARCHIVE" }); }} />}
  </section>;
}
