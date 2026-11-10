import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  FilterX,
  ImageOff,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { getOrganizerPublishedArchives, type StoredOrganizerArchiveItem } from "../../../services/publishedAwardService";
import type { AwardLevel } from "../../../types/result";
import { AWARD_LEVEL } from "../../../utils/awardLevels";

type PrizeFilter = "ALL" | AwardLevel;
const PAGE_SIZE = 8;

const PRIZE_TABS: { value: PrizeFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "FIRST", label: "Giải Nhất" },
  { value: "SECOND", label: "Giải Nhì" },
  { value: "THIRD", label: "Giải Ba" },
  { value: "HONORABLE", label: "Giải Khuyến khích" },
];

const PRIZE_STYLE: Record<AwardLevel, string> = {
  FIRST: "bg-red-100 text-red-700 border border-red-200",
  SECOND: "bg-amber-100 text-amber-800 border border-amber-200",
  THIRD: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  HONORABLE: "bg-violet-100 text-violet-800 border border-violet-200",
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi-VN")
    .trim();
}

export function JudgeArchiveView() {
  const [search, setSearch] = useState("");
  const [prize, setPrize] = useState<PrizeFilter>("ALL");
  const [contestName, setContestName] = useState("ALL");
  const [year, setYear] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<StoredOrganizerArchiveItem | null>(null);
  const [archives, setArchives] = useState<StoredOrganizerArchiveItem[]>(getOrganizerPublishedArchives);

  useEffect(() => {
    setArchives(getOrganizerPublishedArchives());
    const handleSync = () => {
      setArchives(getOrganizerPublishedArchives());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("filmcontest:published-results-updated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("filmcontest:published-results-updated", handleSync);
    };
  }, []);

  const safeArchives = useMemo(() => {
    return (archives || []).filter((item) => item && item.result && item.contest);
  }, [archives]);

  const contests = useMemo(
    () => [...new Set(safeArchives.map((item) => item.contest?.name).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "vi")),
    [safeArchives]
  );

  const years = useMemo(
    () => [...new Set(safeArchives.map((item) => item.year).filter(Boolean))].sort((a, b) => b - a),
    [safeArchives]
  );

  const counts = useMemo(
    () => ({
      ALL: safeArchives.length,
      FIRST: safeArchives.filter((item) => item.result?.award === "FIRST").length,
      SECOND: safeArchives.filter((item) => item.result?.award === "SECOND").length,
      THIRD: safeArchives.filter((item) => item.result?.award === "THIRD").length,
      HONORABLE: safeArchives.filter((item) => item.result?.award === "HONORABLE").length,
    }),
    [safeArchives]
  );

  const filtered = useMemo(() => {
    const term = normalize(search);
    return safeArchives
      .filter((item) => {
        if (prize !== "ALL" && item.result?.award !== prize) return false;
        if (contestName !== "ALL" && item.contest?.name !== contestName) return false;
        if (year !== "ALL" && item.year !== Number(year)) return false;
        return (
          !term ||
          [
            item.result?.title ?? "",
            item.result?.authorName ?? "",
            item.contest?.name ?? "",
            item.submission?.code ?? "",
            item.submission?.metadata?.filmStock ?? "",
          ].some((val) => normalize(val).includes(term))
        );
      })
      .sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return (a.result?.rank ?? 0) - (b.result?.rank ?? 0);
      });
  }, [safeArchives, search, prize, contestName, year]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const start = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const resetFilters = () => {
    setSearch("");
    setPrize("ALL");
    setContestName("ALL");
    setYear("ALL");
    setPage(1);
  };

  return (
    <section aria-label="Kho dữ liệu tác phẩm đạt giải" className="space-y-6">
      {/* Khung tiêu đề và bộ lọc */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-xs">
              <Database size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold text-[#0B356B]">Kho dữ liệu tác phẩm đạt giải</h2>
              <p className="text-xs text-slate-500">
                Lưu trữ chính thức {archives.length} tác phẩm đạt giải (mỗi giải 1 bài, 4 giải 4 bài: Nhất, Nhì, Ba, Khuyến khích) khi công bố kết quả
              </p>
            </div>
          </div>
        </div>

        {/* Tab Lọc theo giải thưởng */}
        <div
          className="flex flex-wrap gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-2"
          role="group"
          aria-label="Lọc theo giải thưởng"
        >
          {PRIZE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={prize === tab.value}
              onClick={() => {
                setPrize(tab.value);
                setPage(1);
              }}
              className={`shrink-0 border-b-2 px-3.5 py-2.5 text-xs font-semibold sm:text-sm transition-colors cursor-pointer ${
                prize === tab.value
                  ? "border-blue-600 text-blue-700 font-bold"
                  : "border-transparent text-slate-500 hover:text-blue-700"
              }`}
            >
              {tab.label} ({counts[tab.value]})
            </button>
          ))}
        </div>

        {/* Thanh tìm kiếm và bộ lọc cuộc thi */}
        <div className="flex flex-wrap items-center gap-2.5 p-4">
          <label className="relative min-w-[200px] flex-1">
            <span className="sr-only">Tìm kiếm tác phẩm</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm tác phẩm, thí sinh, mã bài..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="sr-only" htmlFor="judge-archive-contest">
            Lọc cuộc thi
          </label>
          <select
            id="judge-archive-contest"
            value={contestName}
            onChange={(event) => {
              setContestName(event.target.value);
              setPage(1);
            }}
            className="max-w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">Tất cả cuộc thi</option>
            {contests.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="judge-archive-year">
            Lọc năm
          </label>
          <div className="relative">
            <CalendarDays
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <select
              id="judge-archive-year"
              value={year}
              onChange={(event) => {
                setYear(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs sm:text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Tất cả năm</option>
              {years.map((value) => (
                <option key={value} value={String(value)}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            title="Xóa tất cả bộ lọc"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <FilterX size={15} aria-hidden="true" />
            Bỏ lọc
          </button>
        </div>
      </div>

      {/* Grid danh sách tác phẩm đạt giải */}
      {visible.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => {
            const photoUrl = item.imageUrl || item.submission?.imageUrl;
            return (
              <article
                key={item.result.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={item.result.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400 text-xs">
                      Không có ảnh
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-xs ${
                      PRIZE_STYLE[item.result.award as AwardLevel] || "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <Award size={13} aria-hidden="true" />
                    {AWARD_LEVEL[item.result.award as AwardLevel] || "Đạt giải"}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-black text-[#0B356B] shadow-xs">
                    #{item.result.rank}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-3.5">
                  <p className="truncate text-sm font-bold text-[#0B356B]" title={item.result.title}>
                    {item.result.title}
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-slate-600" title={item.result.authorName}>
                    <UserRound size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
                    {item.result.authorName}
                  </p>
                  <p className="truncate text-xs text-slate-500" title={item.contest.name}>
                    {item.contest.name} · {item.year || "Năm chưa rõ"}
                  </p>

                  <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                    <span className="text-slate-500">Điểm đánh giá</span>
                    <span className="font-bold tabular-nums text-[#0B356B]">
                      {Number(item.result?.score ?? 0).toFixed(1)}
                      <span className="ml-1 text-[11px] font-medium text-slate-400">/ 10</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Eye size={15} aria-hidden="true" />
                    Xem chi tiết tác phẩm
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <ImageOff className="mx-auto size-12 text-slate-400" aria-hidden="true" />
          <p className="mt-3 font-semibold text-slate-700">
            {archives.length ? "Không tìm thấy tác phẩm phù hợp" : "Chưa có tác phẩm đạt giải trong kho dữ liệu"}
          </p>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {archives.length
              ? "Thử đổi bộ lọc hoặc xóa điều kiện tìm kiếm."
              : "Kho dữ liệu chỉ lưu và hiển thị mỗi giải 1 bài (đúng 4 giải 4 bài: Giải Nhất, Giải Nhì, Giải Ba, Giải Khuyến khích) sau khi ban tổ chức công bố kết quả cuộc thi."}
          </p>
          {archives.length > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 text-sm font-semibold text-blue-700 hover:underline cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Phân trang */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm text-slate-500 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <span>
            Hiển thị <strong className="text-slate-700">{start}–{end}</strong> / {filtered.length} tác phẩm đạt giải
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Trang trước"
              disabled={currentPage <= 1}
              onClick={() => setPage((val) => Math.max(1, val - 1))}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
              {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              aria-label="Trang sau"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((val) => Math.min(pageCount, val + 1))}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Modal chi tiết tác phẩm đạt giải */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-[#0B356B]">Chi tiết tác phẩm đạt giải</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative aspect-video max-h-72 w-full overflow-hidden rounded-xl bg-slate-900">
                <img
                  src={selected.imageUrl || selected.submission?.imageUrl}
                  alt={selected.result.title}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-[#0B356B]">{selected.result.title}</h4>
                  <p className="text-xs text-slate-500">
                    {selected.result.authorName} · {selected.contest.name}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    PRIZE_STYLE[selected.result.award]
                  }`}
                >
                  <Award size={14} />
                  {AWARD_LEVEL[selected.result.award]}
                </span>
              </div>

              <dl className="grid gap-2.5 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <dt className="text-slate-500">Điểm số đạt giải</dt>
                  <dd className="mt-0.5 text-base font-bold text-[#0B356B]">
                    {Number(selected.result?.score ?? 0).toFixed(1)} / 10
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <dt className="text-slate-500">Năm tổ chức cuộc thi</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">{selected.year || "2025"}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <dt className="text-slate-500">Mã bài dự thi</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">{selected.submission?.code ?? "Chưa rõ"}</dd>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <dt className="text-slate-500">Loại phim / Film stock</dt>
                  <dd className="mt-0.5 font-semibold text-slate-800">
                    {selected.submission?.metadata?.filmStock || "Kodak Portra 400"}
                  </dd>
                </div>
              </dl>

              {selected.submission?.metadata && (
                <div className="rounded-xl border border-slate-200 p-3.5 space-y-2">
                  <p className="text-xs font-bold text-[#0B356B]">Thông số kỹ thuật ảnh phim</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-3">
                    <div>
                      <span className="text-slate-400">Máy ảnh:</span>{" "}
                      <span className="font-medium text-slate-700">{selected.submission.metadata.camera || "Chưa rõ"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Ống kính:</span>{" "}
                      <span className="font-medium text-slate-700">{selected.submission.metadata.lens || "Chưa rõ"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">ISO:</span>{" "}
                      <span className="font-medium text-slate-700">{selected.submission.metadata.iso || "400"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Định dạng:</span>{" "}
                      <span className="font-medium text-slate-700">{selected.submission.metadata.format || "35mm"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Frame:</span>{" "}
                      <span className="font-medium text-slate-700">{selected.submission.metadata.frame || "01"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Lab tráng:</span>{" "}
                      <span className="font-medium text-slate-700">{selected.submission.metadata.lab || "Lab Sài Gòn"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

