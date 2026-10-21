import { useMemo, useState } from "react";
import { Award, ChevronLeft, ChevronRight, Medal, Search, Trophy } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { resultService } from "../../../services/resultService";
import type { ContestResult, AwardLevel } from "../../../types/result";
import { AWARD_LEVEL } from "../../../utils/awardLevels";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

type AwardFilter = "ALL" | AwardLevel;
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const AWARD_FILTERS: { value: AwardFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "FIRST", label: "Giải Nhất" },
  { value: "SECOND", label: "Giải Nhì" },
  { value: "THIRD", label: "Giải Ba" },
  { value: "HONORABLE", label: "Khuyến khích" },
];
const AWARD_STYLE: Record<AwardLevel, string> = {
  FIRST: "border-red-200 bg-red-100 text-red-700",
  SECOND: "border-amber-200 bg-amber-100 text-amber-700",
  THIRD: "border-emerald-200 bg-emerald-100 text-emerald-700",
  HONORABLE: "border-blue-200 bg-blue-50 text-blue-700",
};

function AwardLabel({ award }: { award: AwardLevel }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${AWARD_STYLE[award]}`}><Award size={13} aria-hidden="true" />{AWARD_LEVEL[award]}</span>;
}

function rankStyle(rank: number): string {
  if (rank === 1) return "bg-red-100 text-red-700";
  if (rank === 2) return "bg-amber-100 text-amber-700";
  if (rank === 3) return "bg-emerald-100 text-emerald-700";
  return "bg-blue-50 text-blue-700";
}

export function ResultsView() {
  const { data, isLoading, error } = useFetch(resultService.getResults);
  const [keyword, setKeyword] = useState("");
  const [awardFilter, setAwardFilter] = useState<AwardFilter>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const rows = data ?? [];
  const counts = useMemo(() => ({
    ALL: rows.length,
    FIRST: rows.filter((result) => result.award === "FIRST").length,
    SECOND: rows.filter((result) => result.award === "SECOND").length,
    THIRD: rows.filter((result) => result.award === "THIRD").length,
    HONORABLE: rows.filter((result) => result.award === "HONORABLE").length,
  }), [rows]);
  const filteredRows = useMemo(() => {
    const term = keyword.trim().toLocaleLowerCase("vi-VN");
    return [...rows]
      .filter((result) => awardFilter === "ALL" || result.award === awardFilter)
      .filter((result) => !term || `${result.title} ${result.authorName}`.toLocaleLowerCase("vi-VN").includes(term))
      .sort((a, b) => a.rank - b.rank);
  }, [rows, keyword, awardFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstRow = filteredRows.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastRow = Math.min(currentPage * pageSize, filteredRows.length);
  const topThreeCount = rows.filter((result) => result.rank <= 3).length;

  return <section aria-label="Kết quả cuộc thi" className="space-y-5">
    <OrganizerPageHeader title="Kết quả cuộc thi" description="Tra cứu thứ hạng, điểm số và giải thưởng của các tác phẩm." />

    {isLoading && <StateMessage message="Đang tải kết quả..." />}
    {error && <StateMessage message={error} isError />}
    {data && <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Trophy size={20} aria-hidden="true" /></span><div><h2 className="font-bold text-[#0B356B]">Bảng xếp hạng</h2><p className="text-xs text-slate-500">{rows.length} tác phẩm · {topThreeCount} vị trí dẫn đầu</p></div></div>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"><Medal size={15} className="text-amber-500" aria-hidden="true" />Thành tích cuộc thi</span>
      </div>

      <div role="tablist" aria-label="Lọc kết quả theo giải thưởng" className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-2">
        {AWARD_FILTERS.map((filter) => <button key={filter.value} type="button" role="tab" aria-selected={awardFilter === filter.value} onClick={() => { setAwardFilter(filter.value); setPage(1); }} className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition sm:text-sm ${awardFilter === filter.value ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700"}`}>{filter.label} ({counts[filter.value]})</button>)}
      </div>

      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1"><span className="sr-only">Tìm tác phẩm hoặc thí sinh</span><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} placeholder="Tìm theo tác phẩm hoặc thí sinh..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th scope="col" className="w-24 px-5 py-3">Hạng</th><th scope="col" className="px-5 py-3">Tác phẩm</th><th scope="col" className="px-5 py-3">Thí sinh</th><th scope="col" className="w-32 px-5 py-3">Điểm</th><th scope="col" className="px-5 py-3">Giải thưởng</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((result: ContestResult) => <tr key={result.id} className="transition-colors hover:bg-blue-50/30"><td className="px-5 py-3.5"><span className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 font-extrabold ${rankStyle(result.rank)}`}>#{result.rank}</span></td><td className="px-5 py-3.5 font-semibold text-[#0B356B]">{result.title}</td><td className="px-5 py-3.5 text-slate-600">{result.authorName}</td><td className="px-5 py-3.5"><span className="font-bold tabular-nums text-[#0B356B]">{result.score.toFixed(1)}</span><span className="ml-1 text-xs text-slate-400">/ 10</span></td><td className="px-5 py-3.5"><AwardLabel award={result.award} /></td></tr>)}
          </tbody>
        </table>
        {filteredRows.length === 0 && <div className="px-4 py-14 text-center"><Search size={27} className="mx-auto text-slate-300" aria-hidden="true" /><p className="mt-3 font-semibold text-slate-700">Không tìm thấy kết quả phù hợp</p><p className="mt-1 text-sm text-slate-500">Thử đổi từ khóa hoặc chọn một giải thưởng khác.</p></div>}
      </div>

      <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-3"><p>Hiển thị {firstRow}–{lastRow} trong {filteredRows.length} kết quả</p><label className="flex items-center gap-2">Dòng<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-2 py-1.5">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}</select></label></div><nav aria-label="Phân trang kết quả" className="flex items-center gap-1"><button type="button" aria-label="Trang trước" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} aria-hidden="true" /></button><span className="px-2">Trang {currentPage} / {pageCount}</span><button type="button" aria-label="Trang sau" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} aria-hidden="true" /></button></nav></footer>
    </div>}
  </section>;
}
