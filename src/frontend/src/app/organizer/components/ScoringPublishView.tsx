import React, { useMemo, useState } from "react";
import {
  Award,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  FileCheck,
  FileImage,
  Filter,
  Layers,
  Megaphone,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  UserRoundCheck,
  X,
  XCircle,
} from "lucide-react";
import { Toast, type ToastNotice } from "../../../components/Toast";
import {
  getAllJudgeAssignedContests,
  getAllJudgeAssignedSubmissions,
  loadStoredEvaluations,
} from "../../../services/judgeService";
import type { AssignedSubmission, Evaluation, JudgeContest } from "../../../types/judge";
import { publishContestResultsToAllPlatforms, unpublishContestFromAllPlatforms } from "../../../services/publishedAwardService";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

const PUBLISHED_CONTESTS_KEY = "filmcontest.published-contests.v1";
const PARTICIPANT_ENTRIES_KEY = "participant_entries";

function readPublishedContestIds(): string[] {
  try {
    const raw = localStorage.getItem(PUBLISHED_CONTESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writePublishedContestIds(ids: string[]): void {
  localStorage.setItem(PUBLISHED_CONTESTS_KEY, JSON.stringify(ids));
}

export function ScoringPublishView() {
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [selectedContestId, setSelectedContestId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "EVALUATED" | "WAITING" | "PUBLISHED" | "UNPUBLISHED">("ALL");
  const [keyword, setKeyword] = useState<string>("");
  const [publishedIds, setPublishedIds] = useState<string[]>(readPublishedContestIds);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  // 1. Tải danh sách cuộc thi và bài thi từ Judge Service
  const contests = useMemo(() => getAllJudgeAssignedContests(), []);
  const allSubmissions = useMemo(() => getAllJudgeAssignedSubmissions(), []);
  const evaluations = useMemo(() => loadStoredEvaluations(), []);

  // Map evaluation vào submission
  const submissionsWithEval = useMemo(() => {
    const evalMap = new Map<string, Evaluation>();
    for (const ev of evaluations) {
      evalMap.set(ev.submissionId, ev);
    }

    return allSubmissions.map((sub) => {
      const evaluation = evalMap.get(sub.id);
      const hasScore = !!evaluation?.totalScore;
      const isContestPublished = publishedIds.includes(sub.contestId) || publishedIds.includes(sub.contestTitle);
      const isPublished = isContestPublished && hasScore;
      return {
        ...sub,
        evaluation,
        hasScore,
        isPublished,
      };
    });
  }, [allSubmissions, evaluations, publishedIds]);

  // Danh sách các cuộc thi duy nhất
  const contestOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const sub of allSubmissions) {
      map.set(sub.contestId, sub.contestTitle);
    }
    for (const c of contests) {
      map.set(c.id, c.title);
    }
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [allSubmissions, contests]);

  // Lọc theo cuộc thi, trạng thái, từ khóa
  const filteredItems = useMemo(() => {
    const q = (keyword ?? "").trim().toLowerCase();
    return submissionsWithEval.filter((item) => {
      // 1. Cuộc thi
      if (selectedContestId !== "ALL") {
        if (item.contestId !== selectedContestId && item.contestTitle !== selectedContestId) {
          const matchedOpt = contestOptions.find((o) => o.id === selectedContestId);
          if (!matchedOpt || matchedOpt.title !== item.contestTitle) return false;
        }
      }

      // 2. Trạng thái
      if (statusFilter === "EVALUATED" && !item.evaluation?.totalScore) return false;
      if (statusFilter === "WAITING" && item.evaluation?.totalScore) return false;
      if (statusFilter === "PUBLISHED" && !item.isPublished) return false;
      if (statusFilter === "UNPUBLISHED" && item.isPublished) return false;

      // 3. Từ khóa
      if (q) {
        const text = `${item.title} ${item.authorName} ${item.id} ${item.contestTitle}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [submissionsWithEval, selectedContestId, statusFilter, keyword, contestOptions]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const target = selectedContestId === "ALL"
      ? submissionsWithEval
      : submissionsWithEval.filter((item) => item.contestId === selectedContestId || item.contestTitle === selectedContestId);

    const evaluated = target.filter((item) => item.evaluation?.totalScore);
    const scores = evaluated.map((item) => item.evaluation?.totalScore ?? 0);
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const isContestPublished = selectedContestId !== "ALL" && publishedIds.includes(selectedContestId);

    return {
      total: target.length,
      evaluatedCount: evaluated.length,
      maxScore,
      isContestPublished,
    };
  }, [submissionsWithEval, selectedContestId, publishedIds]);

  // Hành động: Công bố kết quả cuộc thi đến thí sinh
  const handlePublishContest = (contestIdToPublish: string) => {
    const targetSubmissions = submissionsWithEval.filter(
      (item) => item.contestId === contestIdToPublish || item.contestTitle === contestIdToPublish
    );

    const contestTitle = targetSubmissions[0]?.contestTitle || contestIdToPublish;

    // Sắp xếp toàn bộ các bài thi đã có điểm theo thứ tự giảm dần
    const evaluatedSorted = [...targetSubmissions]
      .filter((item) => item.evaluation?.totalScore)
      .sort((a, b) => (b.evaluation?.totalScore ?? 0) - (a.evaluation?.totalScore ?? 0));

    // Cập nhật publishedIds
    const nextPublished = Array.from(new Set([...publishedIds, contestIdToPublish, contestTitle]));
    setPublishedIds(nextPublished);
    writePublishedContestIds(nextPublished);

    // Đồng bộ sang participant_entries để tất cả thí sinh đã nộp bài đều thấy kết quả
    try {
      const existingEntriesRaw = localStorage.getItem(PARTICIPANT_ENTRIES_KEY);
      const participantEntries: Array<{ id?: string; title?: string; [key: string]: unknown }> = existingEntriesRaw ? JSON.parse(existingEntriesRaw) : [];

      evaluatedSorted.forEach((item, index) => {
        const rank = index + 1;
        const prize = rank === 1 ? "Giải Nhất (Grand Prize)"
          : rank === 2 ? "Giải Nhì"
          : rank === 3 ? "Giải Ba"
          : rank === 4 ? "Giải Khuyến Khích"
          : "Đã hoàn thành chấm điểm";
        const scoreVal = item.evaluation?.totalScore ? (item.evaluation.totalScore * 10).toFixed(1) : "85.0";

        const existingIdx = participantEntries.findIndex((e) => e.title === item.title || e.id === item.id);
        const entryData = {
          id: item.id,
          contestTitle: item.contestTitle,
          title: item.title,
          status: "Đã chấm",
          score: scoreVal,
          photoUrl: item.thumbnailUrls?.[0] || item.imageUrls?.[0],
          submittedAt: item.submittedAt,
          description: item.evaluation?.comment || item.description,
          judgeName: "Trần Thị Bình (Hội đồng Giám khảo)",
          judgeComment: item.evaluation?.comment || "Tác phẩm được đánh giá cao về cảm xúc và kỹ thuật nhiếp ảnh phim.",
          prize,
          rankInfo: `Hạng ${rank} / ${evaluatedSorted.length}`,
        };

        if (existingIdx >= 0) {
          participantEntries[existingIdx] = { ...participantEntries[existingIdx], ...entryData };
        } else {
          participantEntries.unshift(entryData);
        }
      });

      localStorage.setItem(PARTICIPANT_ENTRIES_KEY, JSON.stringify(participantEntries));
    } catch {}

    // Lưu đúng 4 tác phẩm từ Top 1 đến Top 4 vào Kho Dữ Liệu Organizer & Admin, và lưu toàn bộ kết quả vào Tab Kết Quả
    publishContestResultsToAllPlatforms({
      contestId: contestIdToPublish,
      contestTitle,
      evaluatedSubmissions: evaluatedSorted,
    });

    window.dispatchEvent(new Event("filmcontest:published-results-updated"));
    window.dispatchEvent(new Event("filmcontest:submissions-updated"));
    window.dispatchEvent(new Event("storage"));

    showToast("Đã công bố kết quả thành công đến tất cả thí sinh!", "success");
  };

  // Hành động: Rút lại / Tạm ẩn công bố
  const handleUnpublishContest = (contestIdToUnpublish: string) => {
    const contestTitle = contestOptions.find((o) => o.id === contestIdToUnpublish)?.title;
    const nextPublished = publishedIds.filter((id) => id !== contestIdToUnpublish && id !== contestTitle);
    setPublishedIds(nextPublished);
    writePublishedContestIds(nextPublished);
    unpublishContestFromAllPlatforms(contestIdToUnpublish, contestTitle);
    showToast("Đã hủy công bố", "info");
  };

  const selectedContestTitle = contestOptions.find((o) => o.id === selectedContestId)?.title || selectedContestId;
  const isCurrentSelectionPublished = publishedIds.includes(selectedContestId) || publishedIds.includes(selectedContestTitle);

  return (
    <section aria-label="Chấm điểm và công bố kết quả" className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <OrganizerPageHeader
        title="Chấm điểm & Công bố kết quả"
        description="Theo dõi điểm thi và nhận xét của Giám khảo gửi về theo thời gian thực. Bấm công bố để hiển thị điểm và giải thưởng trên cổng Thí sinh."
        action={
          selectedContestId !== "ALL" ? (
            isCurrentSelectionPublished ? (
              <button
                type="button"
                onClick={() => handleUnpublishContest(selectedContestId)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-100 transition cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Rút lại công bố</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handlePublishContest(selectedContestId)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer"
              >
                <Megaphone size={16} />
                <span>Công bố kết quả cuộc thi này đến Thí sinh</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => {
                if (contestOptions.length > 0) {
                  contestOptions.forEach((c) => handlePublishContest(c.id));
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
            >
              <Megaphone size={16} />
              <span>Công bố kết quả các cuộc thi</span>
            </button>
          )
        }
      />

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tổng bài dự thi</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-black text-[#0B356B]">
            <FileImage size={20} className="text-blue-600" />
            {stats.total} bài
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Tác phẩm gửi về thẩm định</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Đã có điểm từ Giám khảo</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-black text-emerald-700">
            <CheckCircle2 size={20} className="text-emerald-600" />
            {stats.evaluatedCount} / {stats.total}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Đã chấm điểm & nhận xét</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Điểm số cao nhất</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-black text-amber-600">
            <Trophy size={20} className="text-amber-500" />
            {stats.maxScore ? `${stats.maxScore.toFixed(1)} / 10` : "Chưa có"}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Ứng viên sáng giá nhất</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Trạng thái công bố</p>
          <div className="mt-1.5 flex items-center gap-2">
            {isCurrentSelectionPublished ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={13} />
                Đã công bố đến Thí sinh
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                <Clock size={13} />
                Chưa công bố đến Thí sinh
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {isCurrentSelectionPublished ? "Thí sinh đã xem được điểm số" : "Thí sinh chưa xem được điểm"}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Dropdown chọn cuộc thi */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="text-slate-500">Cuộc thi:</span>
              <select
                value={selectedContestId}
                onChange={(e) => setSelectedContestId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0B356B] outline-none focus:border-blue-500"
              >
                <option value="ALL">Tất cả cuộc thi ({allSubmissions.length} bài)</option>
                {contestOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>

            {/* Trạng thái công bố của cuộc thi đang chọn */}
            {selectedContestId !== "ALL" && (
              isCurrentSelectionPublished ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                  <CheckCircle2 size={12} />
                  Đã công bố đến Thí sinh
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
                  Chưa công bố
                </span>
              )
            )}
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên bài thi, tác giả..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-800 outline-none focus:border-blue-500"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter status tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50/60 px-4 py-2">
          {(
            [
              { id: "ALL", label: "Tất cả" },
              { id: "EVALUATED", label: "Đã có điểm" },
              { id: "WAITING", label: "Chờ giám khảo chấm" },
              { id: "PUBLISHED", label: "Đã công bố" },
              { id: "UNPUBLISHED", label: "Chưa công bố" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Submissions Evaluation List */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Không tìm thấy bài dự thi nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item, index) => {
              const hasScore = Boolean(item.evaluation?.totalScore);
              const score = item.evaluation?.totalScore ?? null;
              const comment = item.evaluation?.comment || "Chưa có nhận xét";
              const isPublished = item.isPublished;

              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/60 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* Left: Thumbnail & Artwork info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <img
                      src={item.thumbnailUrls?.[0] || item.imageUrls?.[0]}
                      alt={item.title}
                      className="size-20 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                          {item.id}
                        </span>
                        <h4 className="font-bold text-[#0B356B] text-base truncate">
                          {item.title}
                        </h4>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                          {item.category}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Thí sinh: <strong className="text-slate-700">{item.authorName || "Ẩn danh"}</strong> · Cuộc thi: <span className="font-semibold text-slate-800">{item.contestTitle}</span>
                      </p>

                      {/* Judge comment quote */}
                      {hasScore && (
                        <div className="mt-2 rounded-xl bg-blue-50/60 border border-blue-100/70 p-2.5 text-xs text-slate-700">
                          <p className="line-clamp-2 italic">
                            💬 <strong>Giám khảo Trần Thị Bình:</strong> &ldquo;{comment}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Scores & Status & Publish Button */}
                  <div className="flex flex-wrap items-center gap-5 shrink-0 justify-between lg:justify-end border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                    {/* Score Box */}
                    <div className="text-right">
                      {hasScore ? (
                        <div>
                          <span className="text-2xl font-black text-blue-700 tabular-nums">
                            {score?.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold"> / 10</span>
                          <p className="text-[10px] text-emerald-600 font-bold">Đã chấm điểm</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-sm font-semibold text-slate-400">Chưa có điểm</span>
                          <p className="text-[10px] text-slate-400">Đang chờ chấm</p>
                        </div>
                      )}
                    </div>

                    {/* Publish Status Badge */}
                    <div>
                      {item.hasScore ? (
                        isPublished ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            Đã công bố điểm
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            <Clock size={13} className="text-amber-500" />
                            Chưa công bố điểm
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                          <Clock size={13} className="text-slate-400" />
                          Chờ chấm điểm
                        </span>
                      )}
                    </div>

                    {/* Single Item Action */}
                    <div>
                      {item.hasScore && !isPublished && (
                        <button
                          type="button"
                          onClick={() => handlePublishContest(item.contestId)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition cursor-pointer"
                        >
                          <Send size={13} />
                          <span>Công bố</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
