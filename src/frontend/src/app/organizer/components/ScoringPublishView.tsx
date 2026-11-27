import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Clock, FileImage, Megaphone, RotateCcw, Search, Trophy, X } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { Toast, type ToastNotice } from "../../../components/Toast";
import { useFetch } from "../../../hooks/useFetch";
import { organizerJudgingService } from "../../../services/organizerJudgingService";
import { PRIZE_LABELS, type ContestScoring, type PrizeRank, type ScoringEntry } from "../../../types/judgingAdmin";
import { formatDate } from "../../../utils/formatDate";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

type StatusFilter = "ALL" | "EVALUATED" | "WAITING";
type Item = ScoringEntry & { contestId: string; contestTitle: string; published: boolean };

/** Gợi ý mặc định theo thứ hạng điểm; ban tổ chức đổi lại trước khi công bố */
const DEFAULT_PRIZES: PrizeRank[] = ["FIRST", "SECOND", "THIRD", "HONORABLE"];
const PRIZE_OPTIONS: PrizeRank[] = ["FIRST", "SECOND", "THIRD", "HONORABLE"];

function suggestPrizes(scoring: ContestScoring): Record<string, PrizeRank | ""> {
  const scored = scoring.entries.filter((entry) => entry.averageScore !== null);
  return Object.fromEntries(scored.map((entry, index) => [entry.submission.id, DEFAULT_PRIZES[index] ?? ""]));
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function ScoringPublishView() {
  const contestsQuery = useFetch(organizerJudgingService.getContests);
  const [scorings, setScorings] = useState<Record<string, ContestScoring>>({});
  const [prizeDrafts, setPrizeDrafts] = useState<Record<string, Record<string, PrizeRank | "">>>({});
  const [selectedContestId, setSelectedContestId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  const loadScoring = useCallback(async (contestId: string) => {
    const scoring = await organizerJudgingService.getScoring(contestId);
    setScorings((current) => ({ ...current, [contestId]: scoring }));
    setPrizeDrafts((current) => ({ ...current, [contestId]: suggestPrizes(scoring) }));
  }, []);

  useEffect(() => {
    if (!contestsQuery.data) return;
    void Promise.all(contestsQuery.data.map((contest) => loadScoring(contest.id).catch(() => undefined)));
  }, [contestsQuery.data, loadScoring]);

  const contests = contestsQuery.data ?? [];
  const items: Item[] = useMemo(() => contests.flatMap((contest) => {
    const scoring = scorings[contest.id];
    if (!scoring) return [];
    return scoring.entries.map((entry) => ({ ...entry, contestId: contest.id, contestTitle: contest.name, published: scoring.published }));
  }), [contests, scorings]);

  const filteredItems = items.filter((item) => {
    if (selectedContestId !== "ALL" && item.contestId !== selectedContestId) return false;
    if (statusFilter === "EVALUATED" && item.averageScore === null) return false;
    if (statusFilter === "WAITING" && item.averageScore !== null) return false;
    const query = keyword.trim().toLowerCase();
    return !query || `${item.submission.title} ${item.submission.code} ${item.authorName ?? ""} ${item.contestTitle}`.toLowerCase().includes(query);
  });

  const target = selectedContestId === "ALL" ? items : items.filter((item) => item.contestId === selectedContestId);
  const evaluated = target.filter((item) => item.averageScore !== null);
  const maxScore = evaluated.length ? Math.max(...evaluated.map((item) => item.averageScore ?? 0)) : 0;
  const selectedScoring = selectedContestId === "ALL" ? undefined : scorings[selectedContestId];
  const drafts = prizeDrafts[selectedContestId] ?? {};

  const setPrize = (contestId: string, submissionId: string, prize: PrizeRank | "") =>
    setPrizeDrafts((current) => ({ ...current, [contestId]: { ...(current[contestId] ?? {}), [submissionId]: prize } }));

  const publish = async () => {
    if (!selectedScoring) return;
    const awards = Object.entries(drafts)
      .filter((entry): entry is [string, PrizeRank] => entry[1] !== "")
      .map(([submissionId, prizeRank]) => ({ submissionId, prizeRank }));
    if (!window.confirm(`Công bố kết quả cuộc thi "${selectedScoring.contestTitle}" với ${awards.length} giải? Sau khi công bố, giám khảo không chấm thêm được.`)) return;
    setIsWorking(true);
    try {
      const scoring = await organizerJudgingService.publish(selectedScoring.contestId, awards);
      setScorings((current) => ({ ...current, [scoring.contestId]: scoring }));
      showToast("Đã công bố kết quả cuộc thi", "success");
    } catch (err: unknown) {
      showToast(errorMessage(err, "Không công bố được kết quả"), "error");
    } finally {
      setIsWorking(false);
    }
  };

  const unpublish = async () => {
    if (!selectedScoring) return;
    if (!window.confirm("Rút lại công bố? Thí sinh sẽ không còn thấy kết quả và giám khảo được chấm tiếp.")) return;
    setIsWorking(true);
    try {
      await organizerJudgingService.unpublish(selectedScoring.contestId);
      await loadScoring(selectedScoring.contestId);
      showToast("Đã rút lại công bố", "info");
    } catch (err: unknown) {
      showToast(errorMessage(err, "Không rút lại được công bố"), "error");
    } finally {
      setIsWorking(false);
    }
  };

  const headerAction = !selectedScoring ? (
    <span className="text-xs text-slate-500">Chọn một cuộc thi để công bố kết quả</span>
  ) : selectedScoring.published ? (
    <button type="button" disabled={isWorking} onClick={() => void unpublish()} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-100 disabled:opacity-50">
      <RotateCcw size={15} /> Rút lại công bố
    </button>
  ) : (
    <button type="button" disabled={isWorking || !evaluated.length} onClick={() => void publish()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50">
      <Megaphone size={16} /> Công bố kết quả cuộc thi này
    </button>
  );

  return (
    <section aria-label="Chấm điểm và công bố kết quả" className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <OrganizerPageHeader
        title="Chấm điểm & Công bố kết quả"
        description="Điểm là trung bình các phiếu giám khảo đã gửi chính thức ở vòng chấm mới nhất. Chọn giải cho từng bài rồi công bố."
        action={headerAction}
      />

      {contestsQuery.isLoading && <StateMessage message="Đang tải cuộc thi và bảng điểm..." />}
      {contestsQuery.error && <StateMessage message={contestsQuery.error} isError />}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Bài hợp lệ</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-black text-[#0B356B]"><FileImage size={20} className="text-blue-600" />{target.length} bài</p>
          <p className="mt-1 text-[11px] text-slate-400">Bài đã duyệt của cuộc thi</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Đã có điểm</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-black text-emerald-700"><CheckCircle2 size={20} className="text-emerald-600" />{evaluated.length} / {target.length}</p>
          <p className="mt-1 text-[11px] text-slate-400">Có ít nhất 1 phiếu chính thức</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Điểm cao nhất</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-black text-amber-600"><Trophy size={20} className="text-amber-500" />{maxScore ? `${maxScore.toFixed(1)} / 10` : "Chưa có"}</p>
          <p className="mt-1 text-[11px] text-slate-400">Trung bình các giám khảo</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Trạng thái công bố</p>
          <div className="mt-1.5">
            {selectedScoring?.published ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={13} />Đã công bố</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"><Clock size={13} />{selectedScoring ? "Chưa công bố" : "Chọn cuộc thi"}</span>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">{selectedScoring?.publishedAt ? `Công bố ngày ${formatDate(selectedScoring.publishedAt)}` : "Thí sinh chưa xem được kết quả"}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="text-slate-500">Cuộc thi:</span>
            <select value={selectedContestId} onChange={(event) => setSelectedContestId(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0B356B] outline-none focus:border-blue-500">
              <option value="ALL">Tất cả cuộc thi ({items.length} bài)</option>
              {contests.map((contest) => <option key={contest.id} value={contest.id}>{contest.name}</option>)}
            </select>
          </label>
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Tìm theo tên bài, mã bài, tác giả..." value={keyword} onChange={(event) => setKeyword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-800 outline-none focus:border-blue-500" />
            {keyword && <button type="button" aria-label="Xoá tìm kiếm" onClick={() => setKeyword("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50/60 px-4 py-2">
          {([{ id: "ALL", label: "Tất cả" }, { id: "EVALUATED", label: "Đã có điểm" }, { id: "WAITING", label: "Chờ giám khảo chấm" }] as const).map((tab) => (
            <button key={tab.id} type="button" onClick={() => setStatusFilter(tab.id)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${statusFilter === tab.id ? "border border-slate-200 bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>{tab.label}</button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">Không có bài dự thi nào phù hợp với bộ lọc.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const rowKey = `${item.contestId}-${item.submission.id}`;
              const isExpanded = expandedId === rowKey;
              const prizeDraft = prizeDrafts[item.contestId]?.[item.submission.id] ?? "";
              const canChoosePrize = selectedContestId === item.contestId && !item.published && item.averageScore !== null;
              return (
                <article key={rowKey} className="p-5 transition hover:bg-slate-50/60">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      {item.submission.imageUrl
                        ? <img src={item.submission.imageUrl} alt={item.submission.title} className="size-20 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm" />
                        : <div className="size-20 shrink-0 rounded-2xl border border-slate-200 bg-slate-100" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{item.submission.code}</span>
                          <h4 className="truncate text-base font-bold text-[#0B356B]">{item.submission.title}</h4>
                          {item.submission.category && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">{item.submission.category}</span>}
                          {item.ranking !== null && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">Hạng {item.ranking}</span>}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Thí sinh: <strong className="text-slate-700">{item.authorName ?? "—"}</strong> · Cuộc thi: <span className="font-semibold text-slate-800">{item.contestTitle}</span>{item.roundName ? ` · ${item.roundName}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Phiếu chính thức: <b>{item.finalizedCount}</b> / {item.assignedJudgeCount} giám khảo được phân công</p>
                        {item.judgeScores.length > 0 && (
                          <button type="button" onClick={() => setExpandedId(isExpanded ? null : rowKey)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                            <ChevronDown size={14} className={isExpanded ? "rotate-180" : ""} /> {isExpanded ? "Ẩn" : "Xem"} điểm và nhận xét từng giám khảo
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-5 border-t border-slate-100 pt-3 lg:justify-end lg:border-t-0 lg:pt-0">
                      <div className="text-right">
                        {item.averageScore !== null ? (
                          <div><span className="text-2xl font-black tabular-nums text-blue-700">{item.averageScore.toFixed(1)}</span><span className="text-xs font-semibold text-slate-400"> / 10</span><p className="text-[10px] font-bold text-emerald-600">Điểm trung bình</p></div>
                        ) : (
                          <div><span className="text-sm font-semibold text-slate-400">Chưa có điểm</span><p className="text-[10px] text-slate-400">Đang chờ chấm</p></div>
                        )}
                      </div>
                      {item.published ? (
                        item.prizeRank
                          ? <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"><Trophy size={13} />{PRIZE_LABELS[item.prizeRank]}</span>
                          : <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={13} />Đã công bố</span>
                      ) : canChoosePrize ? (
                        <label className="text-xs font-semibold text-slate-600">
                          <span className="sr-only">Giải thưởng</span>
                          <select value={prizeDraft} onChange={(event) => setPrize(item.contestId, item.submission.id, event.target.value as PrizeRank | "")} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700">
                            <option value="">Không trao giải</option>
                            {PRIZE_OPTIONS.map((prize) => <option key={prize} value={prize}>{PRIZE_LABELS[prize]}</option>)}
                          </select>
                        </label>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500"><Clock size={13} />{item.averageScore === null ? "Chờ chấm điểm" : "Chưa công bố"}</span>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 rounded-xl border border-blue-100/70 bg-blue-50/50 p-3">
                      {item.judgeScores.map((score) => (
                        <div key={score.judgeId} className="text-xs text-slate-700">
                          <p><b>{score.judgeName ?? "Giám khảo"}</b>: <b className="text-blue-700">{score.totalScore.toFixed(1)}</b>/10{score.recommendNextRound ? " · đề xuất vào vòng sau" : ""}</p>
                          {score.comment && <p className="mt-0.5 italic text-slate-600">&ldquo;{score.comment}&rdquo;</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
