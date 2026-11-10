import { useEffect, useMemo, useState } from "react";
import { Award, ChevronLeft, ChevronRight, Eye, Medal, Search, Trophy } from "lucide-react";
import type { OrganizerViewProps } from "../../../types/organizer";
import type { AwardLevel } from "../../../types/result";
import { OrganizerPageHeader } from "./OrganizerPageHeader";
import { getPublishedResults, type PublishedResultItem } from "../../../services/publishedAwardService";

type AwardFilter = "ALL" | AwardLevel;
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const AWARD_FILTERS: { value: AwardFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả giải" },
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

interface RankedSubmissionRow {
  id: string;
  rank: number;
  title: string;
  authorName: string;
  contestTitle: string;
  contestId: string;
  imageUrl?: string;
  score: number;
  award: AwardLevel;
  awardLabel: string;
}

function AwardBadge({ award, label }: { award: AwardLevel; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${AWARD_STYLE[award]}`}>
      <Award size={13} aria-hidden="true" />
      {label}
    </span>
  );
}

function rankBadgeStyle(rank: number): { badge: string; label: string } {
  if (rank === 1) return { badge: "bg-amber-100 text-amber-800 border border-amber-300 font-extrabold shadow-xs", label: "#1 👑" };
  if (rank === 2) return { badge: "bg-sky-100 text-sky-800 border border-sky-300 font-extrabold", label: "#2 🥈" };
  if (rank === 3) return { badge: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold", label: "#3 🥉" };
  if (rank === 4) return { badge: "bg-purple-100 text-purple-800 border border-purple-200 font-bold", label: "#4" };
  return { badge: "bg-slate-100 text-slate-700 font-bold", label: `#${rank}` };
}

export function ResultsView({ onNavigate }: Partial<OrganizerViewProps>) {
  const [keyword, setKeyword] = useState("");
  const [contestFilter, setContestFilter] = useState<string>("ALL");
  const [awardFilter, setAwardFilter] = useState<AwardFilter>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. Đọc danh sách kết quả bài thi ĐÃ CÔNG BỐ
  const [publishedRows, setPublishedRows] = useState<PublishedResultItem[]>(() => getPublishedResults());

  useEffect(() => {
    const handleUpdate = () => {
      setPublishedRows(getPublishedResults());
    };
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("filmcontest:published-results-updated", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("filmcontest:published-results-updated", handleUpdate);
    };
  }, []);

  // Danh sách các cuộc thi đã có bài công bố
  const contestOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of publishedRows) {
      map.set(r.contestId || r.contestTitle, r.contestTitle);
    }
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [publishedRows]);

  // 2. Lọc theo cuộc thi và sắp xếp theo điểm số từ cao nhất xuống thấp nhất (Lưu và hiển thị toàn bộ kết quả đã công bố, với Top 1-4 là các giải Nhất, Nhì, Ba, Khuyến khích)
  const processedRows: RankedSubmissionRow[] = useMemo(() => {
    let list = [...publishedRows];
    if (contestFilter !== "ALL") {
      list = list.filter((r) => r.contestId === contestFilter || r.contestTitle === contestFilter);
    }

    // Sắp xếp điểm số từ cao nhất đến thấp nhất
    list.sort((a, b) => b.score - a.score);

    const awardLevels: AwardLevel[] = ["FIRST", "SECOND", "THIRD", "HONORABLE"];
    const awardLabels = ["Giải Nhất", "Giải Nhì", "Giải Ba", "Khuyến khích"];

    return list.map((item, idx) => {
      const rank = idx + 1;
      const awardLevel = awardLevels[idx] || "HONORABLE";
      const awardLabel = idx < 4 ? awardLabels[idx] : `Hạng #${rank}`;
      return {
        id: item.id,
        rank,
        title: item.title,
        authorName: item.authorName || "Thí sinh",
        contestTitle: item.contestTitle,
        contestId: item.contestId,
        imageUrl: item.imageUrl,
        score: item.score,
        award: awardLevel,
        awardLabel,
      };
    });
  }, [publishedRows, contestFilter]);

  // Đếm theo giải thưởng
  const counts = useMemo(() => ({
    ALL: processedRows.length,
    FIRST: processedRows.filter((r) => r.award === "FIRST").length,
    SECOND: processedRows.filter((r) => r.award === "SECOND").length,
    THIRD: processedRows.filter((r) => r.award === "THIRD").length,
    HONORABLE: processedRows.filter((r) => r.award === "HONORABLE").length,
  }), [processedRows]);

  // 3. Lọc theo từ khóa và giải thưởng
  const filteredRows = useMemo(() => {
    const term = keyword.trim().toLocaleLowerCase("vi-VN");
    return processedRows.filter((r) => {
      if (awardFilter !== "ALL" && r.award !== awardFilter) return false;
      if (term) {
        const hay = `${r.title} ${r.authorName} ${r.contestTitle} ${r.id}`.toLocaleLowerCase("vi-VN");
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [processedRows, awardFilter, keyword]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstRow = filteredRows.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastRow = Math.min(currentPage * pageSize, filteredRows.length);
  const topScore = processedRows.length ? Number(processedRows[0].score ?? 0) : 0;
  const lowestScore = processedRows.length ? Number(processedRows[processedRows.length - 1].score ?? 0) : 0;

  return (
    <section aria-label="Kết quả cuộc thi" className="space-y-5">
      <OrganizerPageHeader
        title="Kết quả cuộc thi"
        description="Xếp hạng các bài thi đã được công bố theo điểm từ cao nhất đến thấp nhất, tra cứu giải thưởng và điểm số chi tiết."
      />

      {publishedRows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <Trophy size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#0B356B]">Chưa có kết quả nào được công bố</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Bảng kết quả chỉ hiển thị những bài thi đã được chấm điểm và bấm &ldquo;Công bố kết quả&rdquo;.
            Nếu công bố 3 bài thì sẽ hiện đúng Top 3, nếu công bố 10 hay 20 bài thì sẽ hiển thị đủ theo thứ tự từ điểm cao nhất đến thấp nhất.
          </p>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate({ view: "SCORING_PUBLISH" })}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
            >
              <Medal size={16} />
              <span>Chuyển đến mục Chấm điểm & Công bố</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Banner Tổng quan */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Trophy size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold text-[#0B356B]">Bảng xếp hạng điểm số đã công bố</h2>
                <p className="text-xs text-slate-500">
                  {processedRows.length} bài thi · Điểm cao nhất: <strong className="text-blue-700">{Number(topScore).toFixed(1)}</strong> · Điểm thấp nhất: <strong className="text-slate-600">{Number(lowestScore).toFixed(1)}</strong>
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200">
              <Medal size={15} className="text-amber-500" aria-hidden="true" />
              Sắp xếp: Top 1 (Cao nhất) → Top {processedRows.length} (Thấp nhất)
            </span>
          </div>

          {/* Tab Lọc theo giải thưởng */}
          <div role="tablist" aria-label="Lọc kết quả theo giải thưởng" className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-2">
            {AWARD_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={awardFilter === filter.value}
                onClick={() => { setAwardFilter(filter.value); setPage(1); }}
                className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition sm:text-sm cursor-pointer ${
                  awardFilter === filter.value
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-blue-700"
                }`}
              >
                {filter.label} ({counts[filter.value]})
              </button>
            ))}
          </div>

          {/* Bộ lọc Cuộc thi & Tìm kiếm */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
            {/* Lọc cuộc thi */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Cuộc thi:</span>
              <select
                value={contestFilter}
                onChange={(e) => { setContestFilter(e.target.value); setPage(1); }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0B356B] outline-none focus:border-blue-500"
              >
                <option value="ALL">Tất cả cuộc thi ({processedRows.length} bài)</option>
                {contestOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Ô tìm kiếm */}
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Tìm tác phẩm hoặc thí sinh</span>
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={keyword}
                onChange={(event) => { setKeyword(event.target.value); setPage(1); }}
                placeholder="Tìm theo tác phẩm, thí sinh, mã bài..."
                className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          {/* Bảng danh sách bài thi theo thứ hạng */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="w-20 px-5 py-3 text-center">Hạng</th>
                  <th scope="col" className="px-5 py-3">Tác phẩm</th>
                  <th scope="col" className="px-5 py-3">Thí sinh</th>
                  <th scope="col" className="px-5 py-3">Cuộc thi</th>
                  <th scope="col" className="w-28 px-5 py-3 text-center">Điểm số</th>
                  <th scope="col" className="px-5 py-3">Giải thưởng / Xếp loại</th>
                  <th scope="col" className="w-24 px-5 py-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map((item) => {
                  const rStyle = rankBadgeStyle(item.rank);
                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50/70">
                      {/* Cột Thứ hạng */}
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs ${rStyle.badge}`}>
                          {rStyle.label}
                        </span>
                      </td>

                      {/* Cột Tác phẩm + Hình ảnh */}
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80"}
                            alt={item.title}
                            className="size-11 rounded-lg border border-slate-200 object-cover shadow-xs shrink-0"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <span className="block font-semibold text-slate-800 hover:text-blue-700">
                              {item.title}
                            </span>
                            <span className="block text-xs font-normal text-slate-400">
                              Mã bài: {item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Thí sinh */}
                      <td className="px-5 py-3.5 text-slate-600">
                        {item.authorName}
                      </td>

                      {/* Cuộc thi */}
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="inline-block max-w-[200px] truncate" title={item.contestTitle}>
                          {item.contestTitle}
                        </span>
                      </td>

                      {/* Điểm số */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-base font-black text-blue-700">
                          {item.score.toFixed(1)}
                        </span>
                        <span className="ml-1 text-[11px] text-slate-400">/ 10</span>
                      </td>

                      {/* Giải thưởng */}
                      <td className="px-5 py-3.5">
                        <AwardBadge award={item.award} label={item.awardLabel} />
                      </td>

                      {/* Thao tác */}
                      <td className="px-5 py-3.5 text-right">
                        {onNavigate ? (
                          <button
                            type="button"
                            onClick={() => onNavigate({ view: "SUBMISSION_DETAIL", id: item.id, backTo: "RESULTS" })}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Xem</span>
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredRows.length === 0 && (
              <div className="px-4 py-14 text-center">
                <Search size={27} className="mx-auto text-slate-300" aria-hidden="true" />
                <p className="mt-3 font-semibold text-slate-700">Không tìm thấy kết quả phù hợp</p>
                <p className="mt-1 text-sm text-slate-500">Thử đổi từ khóa hoặc chọn một giải thưởng khác.</p>
              </div>
            )}
          </div>

          {/* Footer phân trang */}
          <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p>
                Hiển thị {firstRow}–{lastRow} trong tổng số {filteredRows.length} bài thi
              </p>
              <label className="flex items-center gap-2">
                Dòng mỗi trang:
                <select
                  value={pageSize}
                  onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <nav aria-label="Phân trang kết quả" className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Trang trước"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span className="px-2">Trang {currentPage} / {pageCount}</span>
              <button
                type="button"
                aria-label="Trang sau"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </nav>
          </footer>
        </div>
      )}
    </section>
  );
}
