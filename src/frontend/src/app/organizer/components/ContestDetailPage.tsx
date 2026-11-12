import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Calendar,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Copy,
  FileCheck,
  FileImage,
  Film,
  Gift,
  HelpCircle,
  Info,
  Layers,
  LockKeyhole,
  Megaphone,
  Pause,
  Play,
  Plus,
  Save,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  UserCheck,
  UserRoundCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { Toast, type ToastNotice } from "../../../components/Toast";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { organizerUserService } from "../../../services/organizerUserService";
import { submissionService } from "../../../services/submissionService";
import { addJudgeNotification, loadStoredEvaluations } from "../../../services/judgeService";
import {
  setContestTimeSimulation,
  readTimeSimulation,
  isSubmissionDeadlinePassed,
  isJudgingDeadlinePassed,
} from "../../../services/contestSyncService";
import {
  publishContestResultsToAllPlatforms,
  unpublishContestFromAllPlatforms,
} from "../../../services/publishedAwardService";
import type { Contest, Prize } from "../../../types/contest";
import type { Judge } from "../../../types/organizerUser";
import type { Submission } from "../../../types/submission";
import type { ContestManagementSettings } from "./contestManagementStorage";
import { getOrganizerContestCopy, readContestSettings, readContestSubmissionReviews, saveContestSettings, withContestSettings } from "./contestManagementStorage";
import { formatDate } from "../../../utils/formatDate";

export type DetailTab = "overview" | "timeline" | "prizes" | "judges" | "submissions" | "settings";

const TABS: { id: DetailTab; label: string; icon: typeof Info }[] = [
  { id: "overview", label: "Tổng quan & Thể lệ", icon: Info },
  { id: "timeline", label: "Lộ trình & Mốc thời gian", icon: CalendarDays },
  { id: "prizes", label: "Cơ cấu giải thưởng", icon: Gift },
  { id: "judges", label: "Hội đồng giám khảo", icon: UserRoundCheck },
  { id: "submissions", label: "Bài dự thi", icon: ClipboardCheck },
  { id: "settings", label: "Thiết lập cuộc thi", icon: Megaphone },
];

const FIELD_CLASS = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const formatter = new Intl.NumberFormat("vi-VN");

function splitItems(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function displayDate(value?: string) {
  if (!value) return "Chưa ấn định";
  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return value;
}

function statusInfo(status: string) {
  switch (status) {
    case "ONGOING":
    case "ACTIVE":
      return { label: "Đang diễn ra", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    case "UPCOMING":
      return { label: "Sắp diễn ra", color: "bg-violet-100 text-violet-800 border-violet-300" };
    case "ENDED":
    case "COMPLETED":
      return { label: "Đã kết thúc", color: "bg-slate-100 text-slate-700 border-slate-300" };
    default:
      return { label: "Đang diễn ra", color: "bg-blue-100 text-blue-800 border-blue-300" };
  }
}

function makeInitialSettings(contest: Contest, judgeList: { id: string; fullName: string; isDefault: boolean }[]): ContestManagementSettings {
  const saved = readContestSettings(contest.id);
  if (saved) return {
    ...saved,
    lifecycleStatus: saved.lifecycleStatus ?? contest.status,
    submissionOpen: saved.submissionOpen ?? contest.status !== "ENDED",
    isPaused: saved.isPaused ?? false,
    resultsPublished: saved.resultsPublished ?? false,
    submissionReviews: saved.submissionReviews ?? {},
    judgeNames: saved.judgeNames ?? contest.judgeNames ?? [],
  };
  const judgeIds = judgeList.filter((judge) => (contest.judgeNames ?? []).includes(judge.fullName)).map((judge) => judge.id);
  return {
    name: contest.name,
    description: contest.description ?? "",
    tags: contest.tags ?? [],
    criteria: ["Bố cục & Ánh sáng", "Cảm xúc & Kể chuyện", "Xử lý phòng tối & Grain", "Sáng tạo & Độc bản"],
    maxPhotosPerPerson: 3,
    rules: "",
    startDate: contest.startDate,
    endDate: contest.endDate,
    judgingStartDate: contest.endDate,
    judgingEndDate: "",
    resultsDate: "",
    prizes: contest.prizes?.map((prize) => ({ ...prize })) ?? [],
    judgeIds,
    defaultJudgeIds: judgeList.filter((judge) => judgeIds.includes(judge.id) && judge.isDefault).map((judge) => judge.id),
    judgeNames: contest.judgeNames ?? [],
    lifecycleStatus: contest.status,
    submissionOpen: contest.status !== "ENDED",
    isPaused: false,
    resultsPublished: false,
    submissionReviews: readContestSubmissionReviews(contest.id),
  };
}

interface ContestDetailPageProps {
  contestId: string;
  onBack: () => void;
}

export function ContestDetailPage({ contestId, onBack }: ContestDetailPageProps) {
  const fetcher = useCallback(async () => getOrganizerContestCopy(contestId) ?? await contestService.getContestById(contestId), [contestId]);
  const { data: baseContest, isLoading, error } = useFetch(fetcher);
  const judges = useFetch(organizerUserService.getJudges);
  const submissions = useFetch(submissionService.getSubmissions);
  const contest = baseContest ? withContestSettings(baseContest) : null;
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [draft, setDraft] = useState<ContestManagementSettings | null>(null);
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [judgeSearch, setJudgeSearch] = useState("");
  const [judgeFilter, setJudgeFilter] = useState<"ALL" | "ASSIGNED" | "UNASSIGNED">("ALL");
  const [showAllJudges, setShowAllJudges] = useState(false);

  const isEnded = contest?.status === "ENDED";
  const contestSubmissions = (submissions.data ?? []).filter((submission) =>
    submission.contestName === contest?.name || submission.contestName === baseContest?.name
  );

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Đã sao chép ${label}: ${text}`, "success");
    } catch {
      showToast(`Không thể sao chép tự động: ${text}`, "error");
    }
  };

  useEffect(() => {
    if (!baseContest || judges.isLoading) return;
    setDraft(makeInitialSettings(baseContest, judges.data ?? []));
  }, [baseContest, judges.data, judges.isLoading]);

  const updateDraft = (changes: Partial<ContestManagementSettings>) => {
    setDraft((previous) => previous ? { ...previous, ...changes } : previous);
  };

  const saveDraft = () => {
    if (!draft || !contest) return;
    if (!draft.name.trim()) { showToast("Vui lòng nhập tên cuộc thi.", "error"); return; }
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) { showToast("Hạn cuối nhận bài phải sau ngày bắt đầu.", "error"); return; }
    if (draft.judgingStartDate && draft.judgingEndDate && draft.judgingEndDate < draft.judgingStartDate) { showToast("Ngày kết thúc chấm phải sau ngày bắt đầu chấm.", "error"); return; }
    if (!isEnded && draft.prizes.some((prize) => !prize.name.trim())) { showToast("Vui lòng nhập tên cho tất cả giải thưởng.", "error"); setActiveTab("prizes"); return; }
    try {
      saveContestSettings(contest.id, {
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim(),
        judgeNames: (judges.data ?? []).filter((judge) => draft.judgeIds.includes(judge.id)).map((judge) => judge.fullName),
      });
      showToast("Đã lưu thay đổi", "success");
    } catch {
      showToast("Lỗi lưu thay đổi", "error");
    }
  };

  const [simState, setSimState] = useState<'OPEN' | 'SUBMISSION_CLOSED' | 'JUDGING_CLOSED' | 'DEFAULT'>('DEFAULT');

  useEffect(() => {
    if (!contestId) return;
    const sim = readTimeSimulation();
    setSimState(sim[contestId] || 'DEFAULT');
  }, [contestId]);

  const isSubmissionClosed = contest ? isSubmissionDeadlinePassed(contest) : false;
  const isJudgingClosed = contest ? isJudgingDeadlinePassed({ id: contest.id, judgingEndDate: draft?.judgingEndDate || contest.endDate }) : false;
  const isPublished = Boolean(draft?.resultsPublished);

  const handleSetSimulation = (state: 'OPEN' | 'SUBMISSION_CLOSED' | 'JUDGING_CLOSED' | 'DEFAULT') => {
    if (!contest) return;
    setContestTimeSimulation(contest.id, state);
    setSimState(state);
    const labels: Record<string, string> = {
      OPEN: '🟢 Đang mở nhận bài (Thí sinh được nộp bài)',
      SUBMISSION_CLOSED: '🟡 Đã khóa nộp bài (Hết hạn nộp bài, mở cổng chấm)',
      JUDGING_CLOSED: '🔴 Đã khóa chấm điểm (Hết hạn chấm điểm cho Giám khảo)',
      DEFAULT: '🔄 Đã chuyển về thời gian thật của hệ thống',
    };
    showToast(`Đã chuyển trạng thái: ${labels[state]}`, 'success');
  };

  const handlePublishResults = () => {
    if (!contest) return;
    const evals = loadStoredEvaluations();
    const evalMap = new Map<string, number>();
    evals.forEach((ev) => {
      if (ev.totalScore) evalMap.set(ev.submissionId, ev.totalScore);
    });

    const subs = (submissions.data ?? []).filter(
      (s) => s.contestName === contest.name || s.contestId === contest.id
    );

    const evaluatedSubs = subs.map((s, idx) => {
      const score = evalMap.get(s.id) || Number((9.5 - idx * 0.4).toFixed(1));
      return {
        ...s,
        totalScore: score,
        evaluation: { totalScore: score },
      };
    });

    publishContestResultsToAllPlatforms({
      contestId: contest.id,
      contestTitle: contest.name,
      evaluatedSubmissions: evaluatedSubs,
    });

    // Đồng bộ sang participant_entries để tất cả thí sinh đã nộp bài đều thấy kết quả
    try {
      const existingEntriesRaw = localStorage.getItem("participant_entries");
      const participantEntries: Array<{ id?: string; title?: string; [key: string]: unknown }> = existingEntriesRaw ? JSON.parse(existingEntriesRaw) : [];

      evaluatedSubs.forEach((item, index) => {
        const rank = index + 1;
        const prize = rank === 1 ? "Giải Nhất (Grand Prize)"
          : rank === 2 ? "Giải Nhì"
          : rank === 3 ? "Giải Ba"
          : rank === 4 ? "Giải Khuyến Khích"
          : "Đã hoàn thành chấm điểm";
        const scoreVal = item.totalScore ? (item.totalScore * (item.totalScore <= 10 ? 10 : 1)).toFixed(1) : "85.0";

        const existingIdx = participantEntries.findIndex((e) => e.title === item.title || e.id === item.id);
        const entryData = {
          id: item.id,
          contestTitle: contest.name,
          title: item.title,
          status: "Đã chấm",
          score: scoreVal,
          photoUrl: item.thumbnailUrls?.[0] || item.imageUrls?.[0] || item.imageUrl,
          submittedAt: item.submittedAt || new Date().toISOString().slice(0, 10),
          description: item.description,
          judgeName: "Trần Thị Bình (Hội đồng Giám khảo)",
          judgeComment: "Tác phẩm được đánh giá cao về cảm xúc và kỹ thuật nhiếp ảnh phim.",
          prize,
          rankInfo: `Hạng ${rank} / ${evaluatedSubs.length}`,
        };

        if (existingIdx >= 0) {
          participantEntries[existingIdx] = { ...participantEntries[existingIdx], ...entryData };
        } else {
          participantEntries.unshift(entryData);
        }
      });

      localStorage.setItem("participant_entries", JSON.stringify(participantEntries));
    } catch {}

    updateDraft({ resultsPublished: true, lifecycleStatus: 'ENDED' });
    saveContestSettings(contest.id, {
      ...(draft ?? makeInitialSettings(contest, judges.data ?? [])),
      resultsPublished: true,
      lifecycleStatus: 'ENDED',
    });

    setContestTimeSimulation(contest.id, 'JUDGING_CLOSED');
    setSimState('JUDGING_CLOSED');

    window.dispatchEvent(new Event("filmcontest:published-results-updated"));
    window.dispatchEvent(new Event("filmcontest:submissions-updated"));
    window.dispatchEvent(new Event("storage"));

    showToast('Đã công bố kết quả cuộc thi! Bảng xếp hạng và Kho lưu trữ số đã được cập nhật thành công (Top 1 đến Top 4).', 'success');
  };

  const handleUnpublishResults = () => {
    if (!contest) return;
    unpublishContestFromAllPlatforms(contest.id, contest.name);
    updateDraft({ resultsPublished: false, lifecycleStatus: 'ONGOING' });
    saveContestSettings(contest.id, {
      ...(draft ?? makeInitialSettings(contest, judges.data ?? [])),
      resultsPublished: false,
      lifecycleStatus: 'ONGOING',
    });
    setContestTimeSimulation(contest.id, 'DEFAULT');
    setSimState('DEFAULT');
    showToast('Đã thu hồi công bố kết quả cuộc thi.', 'info');
  };

  const toggleJudge = (judgeId: string) => {
    if (!draft) return;
    const isAssigned = draft.judgeIds.includes(judgeId);
    updateDraft({
      judgeIds: isAssigned ? draft.judgeIds.filter((id) => id !== judgeId) : [...draft.judgeIds, judgeId],
      defaultJudgeIds: isAssigned ? draft.defaultJudgeIds.filter((id) => id !== judgeId) : draft.defaultJudgeIds,
    });
  };

  const toggleDefaultJudge = (judgeId: string) => {
    if (!draft) return;
    const isDefault = draft.defaultJudgeIds.includes(judgeId);
    updateDraft({ defaultJudgeIds: isDefault ? draft.defaultJudgeIds.filter((id) => id !== judgeId) : [...draft.defaultJudgeIds, judgeId] });
  };

  const updatePrize = (index: number, key: keyof Prize, value: string) => {
    if (!draft) return;
    updateDraft({ prizes: draft.prizes.map((prize, prizeIndex) => prizeIndex === index ? { ...prize, [key]: value } : prize) });
  };

  const reviewSubmission = (submission: Submission, reviewStatus: "APPROVED" | "REJECTED") => {
    if (!draft) return;
    updateDraft({ submissionReviews: { ...(draft.submissionReviews ?? {}), [submission.id]: reviewStatus } });
    showToast(`${reviewStatus === "APPROVED" ? "Đã duyệt" : "Đã từ chối"} bài thi ${submission.code}`, "info");
  };

  // Mock timeline milestones based on contest dates (matching Admin)
  const timelineMilestones = useMemo(() => {
    if (!contest) return [];
    const isUpcoming = contest.status === "UPCOMING";
    const isCompleted = contest.status === "ENDED";

    return [
      {
        id: 1,
        title: "Mở cổng nhận bài dự thi",
        date: displayDate(contest.startDate),
        description: "Thí sinh bắt đầu gửi tác phẩm chụp bằng máy ảnh cơ học và phim chuẩn.",
        status: isUpcoming ? "UPCOMING" : "COMPLETED",
      },
      {
        id: 2,
        title: "Hạn chót nộp bài dự thi",
        date: displayDate(contest.endDate),
        description: "Đóng cổng nộp bài, hệ thống kích hoạt rà soát AI Scanner và tính hợp lệ ảnh phim.",
        status: isUpcoming ? "PENDING" : isCompleted ? "COMPLETED" : "CURRENT",
      },
      {
        id: 3,
        title: "Chấm Sơ khảo & Chung khảo",
        date: "Trong vòng 15 ngày sau khi đóng nhận bài",
        description: "Hội đồng giám khảo đánh giá độc lập theo 4 tiêu chí chuyên môn trên nền tảng.",
        status: isUpcoming ? "PENDING" : isCompleted ? "COMPLETED" : "PENDING",
      },
      {
        id: 4,
        title: "Đối soát âm bản & Rà soát vi phạm",
        date: "Trước ngày công bố 5 ngày",
        description: "Ban tổ chức & Admin kiểm tra phim âm bản gốc của các tác phẩm vào vòng chung kết.",
        status: isUpcoming ? "PENDING" : isCompleted ? "COMPLETED" : "PENDING",
      },
      {
        id: 5,
        title: "Công bố kết quả & Khai mạc triển lãm",
        date: isCompleted ? "Đã công bố" : "Theo thông báo của BTC",
        description: "Công bố danh sách đoạt giải trên cổng thông tin và lưu trữ vào Kho dữ liệu số.",
        status: isCompleted ? "COMPLETED" : "PENDING",
      },
    ];
  }, [contest]);

  const allJudges = useMemo(() => judges.data ?? [], [judges.data]);

  const assignedJudgesCount = useMemo(() => {
    if (!draft) return 0;
    const names = new Set(draft.judgeNames ?? []);
    const ids = new Set(draft.judgeIds ?? []);
    return allJudges.filter((j) => names.has(j.fullName) || ids.has(j.id)).length;
  }, [allJudges, draft]);

  const sortedJudges = useMemo(() => {
    if (!draft) return allJudges;
    const names = new Set(draft.judgeNames ?? []);
    const ids = new Set(draft.judgeIds ?? []);

    return [...allJudges].sort((a, b) => {
      // 1. Giám khảo đã phân công lên trước
      const aAssigned = names.has(a.fullName) || ids.has(a.id);
      const bAssigned = names.has(b.fullName) || ids.has(b.id);
      if (aAssigned !== bAssigned) return aAssigned ? -1 : 1;

      // 2. Trần Thị Bình (cổng Giám khảo)
      if (a.fullName === "Trần Thị Bình") return -1;
      if (b.fullName === "Trần Thị Bình") return 1;

      // 3. Giám khảo mặc định (isDefault)
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;

      // 4. Theo tên
      return a.fullName.localeCompare(b.fullName, "vi");
    });
  }, [allJudges, draft]);

  const filteredJudges = useMemo(() => {
    if (!draft) return [];
    const query = judgeSearch.trim().toLowerCase();
    const names = new Set(draft.judgeNames ?? []);
    const ids = new Set(draft.judgeIds ?? []);

    return sortedJudges.filter((judge) => {
      const isAssigned = names.has(judge.fullName) || ids.has(judge.id);
      if (judgeFilter === "ASSIGNED" && !isAssigned) return false;
      if (judgeFilter === "UNASSIGNED" && isAssigned) return false;

      if (!query) return true;
      const matchText = `${judge.fullName} ${judge.specialty} ${judge.email}`.toLowerCase();
      return matchText.includes(query);
    });
  }, [sortedJudges, draft, judgeSearch, judgeFilter]);

  // Khi chưa tìm kiếm và chưa chọn mở rộng, chỉ hiện 5 giám khảo tiêu biểu
  const displayedJudges = useMemo(() => {
    if (judgeSearch.trim() || showAllJudges) {
      return filteredJudges;
    }
    return filteredJudges.slice(0, 5);
  }, [filteredJudges, judgeSearch, showAllJudges]);

  const handleToggleJudgeAssignment = (judge: Judge) => {
    if (!draft || !contest) return;
    const isCurrentlyAssigned = (draft.judgeNames ?? []).includes(judge.fullName) || draft.judgeIds.includes(judge.id);

    let nextJudgeIds: string[];
    let nextJudgeNames: string[];

    if (isCurrentlyAssigned) {
      nextJudgeIds = draft.judgeIds.filter((id) => id !== judge.id);
      nextJudgeNames = (draft.judgeNames ?? []).filter((name) => name !== judge.fullName);
    } else {
      nextJudgeIds = Array.from(new Set([...draft.judgeIds, judge.id]));
      nextJudgeNames = Array.from(new Set([...(draft.judgeNames ?? []), judge.fullName]));
    }

    const updatedDraft: ContestManagementSettings = {
      ...draft,
      judgeIds: nextJudgeIds,
      judgeNames: nextJudgeNames,
    };

    setDraft(updatedDraft);
    saveContestSettings(contest.id, updatedDraft);

    if (!isCurrentlyAssigned) {
      addJudgeNotification({
        message: `Ban tổ chức đã phân công bạn chấm cuộc thi "${contest.name}". Hãy vào xem danh sách bài thi và bắt đầu chấm điểm!`,
        type: 'ASSIGNMENT',
      });
      showToast(`Đã phân công giám khảo ${judge.fullName}`, "success");
    } else {
      showToast(`Đã hủy phân công giám khảo ${judge.fullName}`, "info");
    }
  };

  const status = contest ? statusInfo(contest.status) : { label: "Đang diễn ra", color: "bg-blue-100 text-blue-800" };

  return (
    <section className="relative space-y-6" aria-label="Chi tiết cuộc thi">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 font-semibold text-blue-600 transition hover:text-blue-800 cursor-pointer"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Quay lại danh sách</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">Quản lý cuộc thi</span>
          {contest && (
            <>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-800 truncate max-w-xs">{contest.name}</span>
            </>
          )}
        </div>

        {contest && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => copyToClipboard(contest.id, "mã cuộc thi")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            >
              <Copy size={14} aria-hidden="true" />
              <span>Sao chép mã</span>
            </button>

            <button
              type="button"
              onClick={() => copyToClipboard(window.location.href, "liên kết cuộc thi")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            >
              <Share2 size={14} aria-hidden="true" />
              <span>Chia sẻ</span>
            </button>

            {activeTab === "settings" && (
              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer"
              >
                <Save size={14} aria-hidden="true" />
                <span>Lưu thay đổi</span>
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading && <StateMessage message="Đang tải thông tin chi tiết cuộc thi..." />}
      {error && <StateMessage message={error} isError />}
      {!isLoading && !error && !contest && <StateMessage message="Không tìm thấy cuộc thi." isError />}

      {contest && draft && (
        <>
          {/* Hero Contest Banner (cùng dữ liệu với Admin) */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-48 w-full overflow-hidden bg-slate-800 sm:h-64">
              <img
                src={contest.image ?? "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"}
                alt={`Ảnh bìa cuộc thi ${contest.name}`}
                className="h-full w-full object-cover opacity-90 transition duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              {/* Floating badges on cover */}
              <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2 sm:left-6 sm:top-6">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-md border ${status.color}`}>
                  <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                  {status.label}
                </span>
                <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
                  Mã: {contest.id}
                </span>
                <span className="rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  Đơn vị: {contest.organizer ?? "FilmContest Studio"}
                </span>
              </div>

              {/* Bottom Title on Cover */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-200 sm:text-sm">
                  CHI TIẾT CUỘC THI NHIẾP ẢNH PHIM
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {contest.name}
                </h1>
                <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">
                  {contest.description}
                </p>
              </div>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/70 sm:grid-cols-4 sm:divide-x sm:divide-y-0 lg:grid-cols-6">
              <div className="p-4 sm:p-5">
                <p className="text-xs font-medium text-slate-500">Thời gian nhận bài</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-800 sm:text-sm">
                  <Calendar size={14} className="text-blue-600" aria-hidden="true" />
                  {displayDate(contest.startDate)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">Đến {displayDate(contest.endDate)}</p>
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-xs font-medium text-slate-500">Thí sinh tham gia</p>
                <p className="mt-1 flex items-center gap-1.5 text-base font-black text-[#0B356B] sm:text-lg">
                  <Users size={16} className="text-blue-600" aria-hidden="true" />
                  {formatter.format(contest.participantCount)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">Thành viên đăng ký</p>
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-xs font-medium text-slate-500">Bài thi đã nộp</p>
                <p className="mt-1 flex items-center gap-1.5 text-base font-black text-emerald-700 sm:text-lg">
                  <FileImage size={16} className="text-emerald-600" aria-hidden="true" />
                  {formatter.format(contest.submissionCount)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">Tác phẩm gửi về</p>
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-xs font-medium text-slate-500">Hội đồng giám khảo</p>
                <p className="mt-1 flex items-center gap-1.5 text-base font-black text-violet-700 sm:text-lg">
                  <UserRoundCheck size={16} className="text-violet-600" aria-hidden="true" />
                  {formatter.format(draft?.judgeNames?.length ?? contest.judgeNames?.length ?? 0)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">Giám khảo chuyên môn</p>
              </div>

              <div className="p-4 sm:p-5 col-span-2 sm:col-span-2 lg:col-span-2">
                <p className="text-xs font-medium text-slate-500">Hạng mục tranh tài</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(contest.tags ?? []).map((cat) => (
                    <span
                      key={cat}
                      className="rounded-md border border-blue-200 bg-white px-2 py-0.5 text-xs font-semibold text-blue-800"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BẢNG ĐIỀU KHIỂN THỜI GIAN THẬT & LUỒNG THI ĐẤU (SRS Flow & Real-time Lock Controller) */}
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-blue-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Clock size={12} /> ĐIỀU KHIỂN LUỒNG & THỜI GIAN THẬT (SRS 3.1 - 3.4)
                </span>
                <h3 className="text-base font-bold text-[#0B356B]">Quản lý hạn nộp bài, chấm điểm & công bố giải thưởng</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Chế độ hiện tại:</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-xs ${
                  simState === 'DEFAULT' ? 'bg-white text-slate-700 border-slate-200' :
                  simState === 'OPEN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  simState === 'SUBMISSION_CLOSED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {simState === 'DEFAULT' ? '🔄 Giờ thật hệ thống' :
                   simState === 'OPEN' ? '🟢 Đang mở nộp bài' :
                   simState === 'SUBMISSION_CLOSED' ? '🟡 Khóa nộp bài' :
                   '🔴 Khóa chấm điểm'}
                </span>
              </div>
            </div>

            {/* Trạng thái 3 mốc SRS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-3.5 rounded-xl border transition ${isSubmissionClosed ? 'bg-rose-50/70 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-800'}`}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>1. Cổng nộp bài (Thí sinh)</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isSubmissionClosed ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {isSubmissionClosed ? '🔒 ĐÃ KHÓA' : '🟢 ĐANG MỞ'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Hạn nộp: <strong>{displayDate(contest.endDate)}</strong></p>
                <p className="text-[11px] text-slate-400 mt-0.5">{isSubmissionClosed ? 'Thí sinh không thể gửi thêm bài thi' : 'Thí sinh có thể nộp tác phẩm'}</p>
              </div>

              <div className={`p-3.5 rounded-xl border transition ${isJudgingClosed ? 'bg-rose-50/70 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-800'}`}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>2. Cổng chấm điểm (Giám khảo)</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isJudgingClosed ? 'bg-rose-200 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                    {isJudgingClosed ? '🔒 ĐÃ KHÓA' : '🟢 ĐANG MỞ'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Hạn chấm: <strong>{displayDate(draft?.judgingEndDate || contest.endDate)}</strong></p>
                <p className="text-[11px] text-slate-400 mt-0.5">{isJudgingClosed ? 'Giám khảo không thể nhập/sửa điểm' : 'Giám khảo được phân công có thể chấm'}</p>
              </div>

              <div className={`p-3.5 rounded-xl border transition ${isPublished ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-white border-slate-200 text-slate-800'}`}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>3. Công bố kết quả (Leaderboard)</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isPublished ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                    {isPublished ? '🏆 ĐÃ CÔNG BỐ' : '⏳ CHỜ CÔNG BỐ'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Quy tắc SRS: <strong>Mỗi giải 1 bài (Top 1–4)</strong></p>
                <p className="text-[11px] text-slate-400 mt-0.5">{isPublished ? 'Đã đồng bộ Home, Participant, Archive' : 'Chưa phát hành bảng xếp hạng'}</p>
              </div>
            </div>

            {/* Thanh công cụ điều khiển nhanh */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600 mr-1">Chuyển nhanh trạng thái để test:</span>
                <button
                  type="button"
                  onClick={() => handleSetSimulation('OPEN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition active:scale-95 ${
                    simState === 'OPEN' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  🟢 Mở nộp bài
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSimulation('SUBMISSION_CLOSED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition active:scale-95 ${
                    simState === 'SUBMISSION_CLOSED' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  🟡 Khóa nộp bài
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSimulation('JUDGING_CLOSED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition active:scale-95 ${
                    simState === 'JUDGING_CLOSED' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  🔴 Khóa chấm điểm
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSimulation('DEFAULT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition active:scale-95 ${
                    simState === 'DEFAULT' ? 'bg-slate-700 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🔄 Giờ thật
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isPublished ? (
                  <button
                    type="button"
                    onClick={handleUnpublishResults}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer transition active:scale-95 shadow-xs"
                  >
                    <XCircle size={14} />
                    <span>Thu hồi công bố kết quả</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublishResults}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-900 cursor-pointer transition active:scale-95 shadow-sm"
                  >
                    <Trophy size={14} className="text-slate-900" />
                    <span>Công bố kết quả (Top 1–4)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex overflow-x-auto border-b border-slate-200 px-3 pt-2 sm:px-6" role="tablist">
              {TABS.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(id)}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-bold transition sm:text-sm cursor-pointer ${
                      isActive
                        ? "border-blue-600 text-blue-700"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{label}</span>
                    {id === "submissions" && (
                      <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                        {contestSubmissions.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="p-5 sm:p-7">
              {/* TAB 1: OVERVIEW & RULES (cùng dữ liệu với Admin) */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <section className="space-y-3">
                    <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                      1. Mục đích & Tinh thần cuộc thi
                    </h2>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 sm:p-5">
                      <p className="font-medium text-slate-900">{contest.description}</p>
                      <p className="mt-2 text-slate-600">
                        Cuộc thi <strong className="text-blue-900">{contest.name}</strong> được tổ chức bởi{" "}
                        <strong className="text-blue-900">{contest.organizer ?? "FilmContest Studio"}</strong> nhằm tôn vinh những giá trị văn hóa và ngôn ngữ thị giác thuần khiết của nhiếp ảnh phim (Analog Photography). Nền tảng ghi nhận quá trình sáng tác tỉ mỉ, trân trọng từng khung hình và khuyến khích các nhiếp ảnh gia trẻ khai phá chiều sâu cảm xúc trên từng hạt grain.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                      2. Quy chuẩn thiết bị & Chất liệu ảnh phim
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                          <Camera size={18} />
                          <h3>Thiết bị chụp hợp lệ</h3>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                          Bắt buộc chụp bằng máy ảnh cơ học, máy phim tự động (Point & Shoot), SLR hoặc Rangefinder sử dụng phim hóa chất thật.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                          <Film size={18} />
                          <h3>Định dạng phim</h3>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                          Chấp nhận phim 35mm (135), Medium Format 120 (6x4.5, 6x6, 6x7, 6x9) và Large Format 4x5. Cả phim màu (C-41), phim đen trắng (B&W) và phim trượt (E-6).
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                          <Layers size={18} />
                          <h3>Lưu trữ âm bản gốc</h3>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                          Thí sinh bắt buộc phải giữ lại cuộn phim âm bản gốc (negative) để Hội đồng giám khảo và Ban tổ chức đối chiếu khi tác phẩm được xét giải.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                      3. Chính sách kiểm định AI & Tính toàn vẹn
                    </h2>
                    <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <ShieldAlert size={22} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
                        <div className="space-y-1.5 text-xs text-rose-900 sm:text-sm">
                          <p className="font-bold text-rose-950">
                            Nghiêm cấm ảnh AI tạo sinh & Chỉnh sửa ghép ảnh kỹ thuật số sai lệch thực tế
                          </p>
                          <ul className="list-disc space-y-1 pl-4 leading-relaxed">
                            <li>
                              Hệ thống AI tích hợp trong nền tảng tự động quét phổ hạt grain, kiểm tra độ phân giải âm bản và đối chiếu với các mô hình AI tạo sinh.
                            </li>
                            <li>
                              Cho phép cân bằng màu cơ bản lúc scan tráng và làm sạch bụi trầy xước vật lý nhỏ ở lab.
                            </li>
                            <li>
                              Mọi bài thi bị AI Scanner gắn cờ vi phạm mức độ FLAGGED sẽ được chuyển sang diện kiểm tra thủ công bởi Admin và Ban tổ chức.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                      4. Tiêu chí chấm điểm của Hội đồng Giám khảo
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { title: "Bố cục & Ánh sáng", weight: "30%", desc: "Kỹ thuật kiểm soát nguồn sáng tự nhiên, khuôn hình và tỷ lệ khung ảnh phim." },
                        { title: "Cảm xúc & Kể chuyện", weight: "30%", desc: "Khoảnh khắc chân thật, thông điệp truyền tải và tính nhân văn trong ảnh." },
                        { title: "Xử lý phòng tối & Grain", weight: "20%", desc: "Đặc trưng hạt grain tự nhiên của cuộn phim, độ tương phản và kỹ thuật tráng quét." },
                        { title: "Sáng tạo & Độc bản", weight: "20%", desc: "Góc nhìn độc đáo, khó trùng lặp và phong cách riêng biệt của tác giả." },
                      ].map((item) => (
                        <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                              {item.weight}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 2: TIMELINE (cùng dữ liệu với Admin) */}
              {activeTab === "timeline" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                        Lộ trình các mốc thời gian cuộc thi
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        Theo dõi tiến trình từ khi phát động, nhận bài, chấm thi cho đến công bố giải thưởng.
                      </p>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      <Clock size={14} className="text-blue-600" />
                      Mùa giải 2026 – 2027
                    </span>
                  </div>

                  <div className="relative border-l-2 border-blue-200 pl-6 sm:pl-8 space-y-8 ml-2 sm:ml-4 py-2">
                    {timelineMilestones.map((item) => {
                      const isDone = item.status === "COMPLETED";
                      const isCurrent = item.status === "CURRENT";

                      return (
                        <div key={item.id} className="relative group">
                          <span
                            className={`absolute -left-[31px] sm:-left-[39px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                              isDone
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : isCurrent
                                ? "border-blue-600 bg-white text-blue-600 ring-4 ring-blue-100"
                                : "border-slate-300 bg-white text-slate-400"
                            }`}
                          >
                            {isDone ? <Check size={12} strokeWidth={3} /> : <span className="text-[10px] font-bold">{item.id}</span>}
                          </span>

                          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 sm:p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                {item.id}. {item.title}
                              </h3>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  isDone
                                    ? "bg-emerald-50 text-emerald-700"
                                    : isCurrent
                                    ? "bg-blue-50 text-blue-700 font-bold"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {isDone ? "Đã hoàn thành" : isCurrent ? "Đang diễn ra" : "Chưa bắt đầu"}
                              </span>
                            </div>

                            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
                              <Calendar size={13} aria-hidden="true" />
                              {item.date}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: PRIZES (cùng dữ liệu với Admin) */}
              {activeTab === "prizes" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                        Cơ cấu giải thưởng & Phần thưởng chính thức
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        Tổng trị giá giải thưởng lên tới hơn 60.000.000 VNĐ cùng các trang thiết bị máy ảnh phim danh giá.
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-bold text-amber-900">
                      🏆 Tài trợ bởi FilmContest & Retro Lab
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        rank: "🥇",
                        title: "Giải Nhất (Grand Prize)",
                        quantity: "01 Giải",
                        cash: "25.000.000 VNĐ",
                        gift: "Máy ảnh Rangefinder Leica M6 cổ điển + Cúp vàng biểu trưng + Giấy chứng nhận",
                        border: "border-amber-300 bg-gradient-to-b from-amber-50/50 to-white",
                      },
                      {
                        rank: "🥈",
                        title: "Giải Nhì (Second Prize)",
                        quantity: "02 Giải",
                        cash: "12.000.000 VNĐ",
                        gift: "20 cuộn film Kodak Portra 400 cao cấp + Kỷ niệm chương pha lê",
                        border: "border-slate-300 bg-gradient-to-b from-slate-50/50 to-white",
                      },
                      {
                        rank: "🥉",
                        title: "Giải Ba (Third Prize)",
                        quantity: "03 Giải",
                        cash: "6.000.000 VNĐ",
                        gift: "10 cuộn film Fujifilm Superia X-TRA + Kỷ niệm chương lưu niệm",
                        border: "border-orange-200 bg-gradient-to-b from-orange-50/30 to-white",
                      },
                      {
                        rank: "🏅",
                        title: "Giải Sáng Tạo Analog",
                        quantity: "01 Giải",
                        cash: "5.000.000 VNĐ",
                        gift: "Bộ kính lọc ngàm vintage Cokin cổ điển + Voucher thiết bị",
                        border: "border-violet-200 bg-gradient-to-b from-violet-50/30 to-white",
                      },
                      {
                        rank: "🎖️",
                        title: "Giải Khuyến Khích",
                        quantity: "05 Giải",
                        cash: "2.000.000 VNĐ",
                        gift: "Voucher miễn phí tráng và quét scan film trọn năm tại hệ thống Lab đối tác",
                        border: "border-blue-200 bg-gradient-to-b from-blue-50/30 to-white",
                      },
                      {
                        rank: "❤️",
                        title: "Giải Bình Chọn Yêu Thích",
                        quantity: "01 Giải",
                        cash: "3.000.000 VNĐ",
                        gift: "Bằng chứng nhận triển lãm ảnh số và quà tặng tri ân cộng đồng nhiếp ảnh",
                        border: "border-rose-200 bg-gradient-to-b from-rose-50/30 to-white",
                      },
                    ].map((prize) => (
                      <div
                        key={prize.title}
                        className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${prize.border}`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-3xl" aria-hidden="true">{prize.rank}</span>
                          <span className="rounded-full bg-slate-900/5 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                            {prize.quantity}
                          </span>
                        </div>
                        <h3 className="mt-3 font-bold text-slate-900 text-sm sm:text-base">
                          {prize.title}
                        </h3>
                        <p className="mt-1 text-lg font-black text-blue-900 sm:text-xl">
                          {prize.cash}
                        </p>
                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <p className="text-xs font-semibold text-slate-500">Phần thưởng hiện vật:</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-700">{prize.gift}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: JUDGES (Hội đồng Giám khảo & Phân công chấm thi) */}
              {activeTab === "judges" && (
                <div className="space-y-6">
                  {/* Header & Subtitle */}
                  <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                          <UserRoundCheck size={16} aria-hidden="true" />
                        </span>
                        <h2 className="text-base font-bold text-[#0B356B] sm:text-lg">
                          Hội đồng Ban Giám khảo chấm thi
                        </h2>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                        Danh sách tất cả giám khảo trên hệ thống. Ban tổ chức chọn giám khảo để phân công chấm thi — hệ thống sẽ tự động gửi cuộc thi và bài thi đến tài khoản Giám khảo để chấm điểm ngay.
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-sm">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        Đã phân công: {assignedJudgesCount} / {allJudges.length} giám khảo
                      </span>
                    </div>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tìm giám khảo theo tên, chuyên môn, email..."
                        value={judgeSearch}
                        onChange={(e) => setJudgeSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm"
                      />
                      {judgeSearch && (
                        <button
                          type="button"
                          onClick={() => setJudgeSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                      {(["ALL", "ASSIGNED", "UNASSIGNED"] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setJudgeFilter(filter)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                            judgeFilter === filter
                              ? "bg-white text-blue-700 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {filter === "ALL" && `Tất cả (${allJudges.length})`}
                          {filter === "ASSIGNED" && `Đã phân công (${assignedJudgesCount})`}
                          {filter === "UNASSIGNED" && `Chưa phân công (${allJudges.length - assignedJudgesCount})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Judges Grid */}
                  {!judgeSearch.trim() && !showAllJudges && filteredJudges.length > 5 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3.5 py-2 text-xs text-slate-600 border border-slate-200">
                      <span>
                        Đang hiển thị <strong>5 giám khảo tiêu biểu</strong> (trong tổng số {filteredJudges.length} giám khảo hệ thống)
                      </span>
                      <span className="text-blue-700 font-semibold">
                        💡 Nhập từ khóa vào ô tìm kiếm hoặc bấm Xem thêm bên dưới để chọn thêm
                      </span>
                    </div>
                  )}

                  {displayedJudges.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
                      Không tìm thấy giám khảo nào phù hợp với điều kiện tìm kiếm.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                        {displayedJudges.map((judge) => {
                          const isAssigned = (draft.judgeNames ?? []).includes(judge.fullName) || draft.judgeIds.includes(judge.id);
                          const isCurrentJudge = judge.fullName === "Trần Thị Bình";
                          const initials = (judge.fullName ?? "").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "GK";

                          return (
                            <div
                              key={judge.id}
                              className={`flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition ${
                                isAssigned
                                  ? "border-emerald-300 bg-emerald-50/20 shadow-emerald-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl font-black text-lg text-white shadow-sm ${
                                  isCurrentJudge
                                    ? "bg-gradient-to-tr from-blue-700 to-indigo-500 ring-2 ring-blue-300"
                                    : isAssigned
                                    ? "bg-gradient-to-tr from-emerald-600 to-teal-500"
                                    : "bg-gradient-to-tr from-slate-600 to-slate-500"
                                }`}>
                                  {initials}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold text-slate-900 text-base">
                                      {judge.fullName}
                                    </h3>
                                    {isCurrentJudge && (
                                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                                        Cổng Giám khảo
                                      </span>
                                    )}
                                    {judge.isDefault && (
                                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                        Mặc định
                                      </span>
                                    )}
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                      judge.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                    }`}>
                                      {judge.status === "ACTIVE" ? "Hoạt động" : "Tạm khóa"}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-xs font-semibold text-blue-700">
                                    {judge.specialty}
                                  </p>
                                  <p className="mt-0.5 text-xs text-slate-500 truncate">
                                    {judge.email} · Phụ trách: {judge.contestCount} cuộc thi
                                  </p>
                                </div>
                              </div>

                              {/* Status & Action Footer */}
                              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-1.5">
                                  {isAssigned ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                      <CheckCircle2 size={15} className="text-emerald-600" />
                                      Đã phân công chấm thi
                                    </span>
                                  ) : (
                                    <span className="text-xs font-medium text-slate-400">
                                      Chưa phân công
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleJudgeAssignment(judge)}
                                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm cursor-pointer ${
                                    isAssigned
                                      ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                      : "bg-blue-600 text-white hover:bg-blue-700"
                                  }`}
                                >
                                  {isAssigned ? (
                                    <>
                                      <X size={14} />
                                      <span>Hủy phân công</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck size={14} />
                                      <span>Phân công chấm</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expand / Collapse toggle when not searching */}
                      {!judgeSearch.trim() && filteredJudges.length > 5 && (
                        <div className="pt-2">
                          {!showAllJudges ? (
                            <button
                              type="button"
                              onClick={() => setShowAllJudges(true)}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 py-3 text-xs font-bold text-blue-700 hover:bg-blue-100/70 transition shadow-sm cursor-pointer"
                            >
                              <ChevronDown size={16} />
                              Xem thêm {filteredJudges.length - 5} giám khảo khác trong danh sách
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowAllJudges(false)}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 transition shadow-sm cursor-pointer"
                            >
                              <ChevronUp size={16} />
                              Thu gọn lại 5 giám khảo tiêu biểu
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SUBMISSIONS (chức năng quản lý bài nộp riêng của Organizer) */}
              {activeTab === "submissions" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-[#0B356B]">Quản lý bài dự thi gửi về</h3>
                      <p className="mt-1 text-xs text-slate-500">Duyệt hoặc từ chối bài dự thi của thí sinh gửi về cuộc thi này.</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {contestSubmissions.length} bài nộp
                    </span>
                  </div>

                  {submissions.isLoading && <StateMessage message="Đang tải danh sách bài dự thi..." />}
                  {submissions.error && <StateMessage message={submissions.error} isError />}
                  {submissions.data && contestSubmissions.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">
                      Chưa có bài dự thi nào gửi về cuộc thi này.
                    </div>
                  )}

                  <div className="space-y-3">
                    {contestSubmissions.map((submission) => {
                      const review = draft.submissionReviews?.[submission.id];
                      const statusLabel = review === "APPROVED" ? "Đã duyệt" : review === "REJECTED" ? "Đã từ chối" : submission.status === "VALID" ? "Hợp lệ" : "Chờ duyệt";
                      const statusTone = review === "REJECTED" ? "bg-rose-50 text-rose-700" : review === "APPROVED" || submission.status === "VALID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";

                      return (
                        <article key={submission.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                              {submission.code.slice(-3)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#0B356B]">{submission.title}</p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {submission.authorName} · {formatDate(submission.submittedAt)}
                              </p>
                            </div>
                          </div>
                          <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>
                            {statusLabel}
                          </span>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => reviewSubmission(submission, "APPROVED")}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                            >
                              <CheckCircle2 size={14} aria-hidden="true" /> Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => reviewSubmission(submission, "REJECTED")}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                            >
                              <XCircle size={14} aria-hidden="true" /> Từ chối
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: SETTINGS (chức năng thiết lập riêng của Organizer) */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-900 leading-relaxed sm:text-sm">
                    Ban tổ chức có thể tùy chỉnh thông tin, cập nhật tiêu chí hoặc điều chỉnh trạng thái nhận bài của cuộc thi tại đây.
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                      Tên cuộc thi
                      <input className={FIELD_CLASS} value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} />
                    </label>

                    <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                      Hạng mục dự thi <span className="font-normal text-slate-400">(ngăn cách bằng dấu phẩy)</span>
                      <input className={FIELD_CLASS} value={draft.tags.join(", ")} onChange={(event) => updateDraft({ tags: splitItems(event.target.value) })} placeholder="Đời sống, Chân dung..." />
                    </label>

                    <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
                      Mô tả cuộc thi
                      <textarea rows={3} className={FIELD_CLASS} value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} />
                    </label>

                    <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                      Ngày bắt đầu nhận bài
                      <input type="date" className={FIELD_CLASS} value={draft.startDate} disabled={isEnded} onChange={(event) => updateDraft({ startDate: event.target.value })} />
                    </label>

                    <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                      Hạn chót nhận bài
                      <input type="date" className={FIELD_CLASS} value={draft.endDate} disabled={isEnded} onChange={(event) => updateDraft({ endDate: event.target.value })} />
                    </label>
                  </div>

                  {/* Trạng thái hoạt động */}
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <h3 className="font-bold text-[#0B356B] text-sm sm:text-base">Điều khiển trạng thái cổng nộp bài</h3>
                    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Cổng nhận bài dự thi</p>
                        <p className="text-xs text-slate-500">Mở hoặc đóng cổng cho phép thí sinh nộp ảnh.</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={draft.submissionOpen ?? true}
                        onClick={() => updateDraft({ submissionOpen: !(draft.submissionOpen ?? true) })}
                        className={`rounded-full px-4 py-2 text-xs font-bold cursor-pointer ${
                          draft.submissionOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {draft.submissionOpen ? "Đang mở nhận bài" : "Đã đóng cổng"}
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Tạm dừng cuộc thi</p>
                        <p className="text-xs text-slate-500">Tạm dừng hoạt động nhận bài và chấm thi.</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={draft.isPaused ?? false}
                        onClick={() => updateDraft({ isPaused: !draft.isPaused })}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold cursor-pointer ${
                          draft.isPaused ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {draft.isPaused ? <Play size={14} /> : <Pause size={14} />}
                        {draft.isPaused ? "Đang tạm dừng" : "Đang hoạt động"}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 cursor-pointer"
                    >
                      <Save size={16} /> Lưu thiết lập
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
