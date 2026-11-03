import type { Contest, ContestDraft, ContestSettings, ContestStage, ContestStatus, OverviewStats, Prize } from "../types/contest";
import { request } from "./apiClient";
import { reportService } from "./reportService";

/** Khớp ContestResponse của backend */
export interface ApiContest {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  categories: string[];
  status: ContestStage;
  archived: boolean;
  submissionOpen: boolean;
  paused: boolean;
  acceptingSubmissions: boolean;
  resultsPublished: boolean;
  submissionStart: string | null;
  submissionEnd: string | null;
  judgingStart: string | null;
  judgingEnd: string | null;
  resultDate: string | null;
  maxPhotosPerParticipant: number;
  anonymousJudging: boolean;
  criteria: { id: string; name: string; maxScore: number; weight: number }[];
  prizes: Prize[];
  regulations: string | null;
  organizerName: string | null;
  judgeIds: string[];
  defaultJudgeIds: string[];
  judgeNames: string[];
  participantCount: number;
  submissionCount: number;
}

/** Đang chấm vẫn hiển thị là "Đang diễn ra"; bản nháp hiển thị như "Sắp diễn ra" */
function toBadgeStatus(stage: ContestStage): ContestStatus {
  if (stage === "ENDED") return "ENDED";
  return stage === "ONGOING" || stage === "JUDGING" ? "ONGOING" : "UPCOMING";
}

export function toContest(item: ApiContest): Contest {
  return {
    id: item.id,
    name: item.title,
    startDate: item.submissionStart ?? item.judgingStart ?? "",
    endDate: item.submissionEnd ?? item.judgingEnd ?? "",
    participantCount: item.participantCount,
    submissionCount: item.submissionCount,
    status: toBadgeStatus(item.status),
    stage: item.status,
    archived: item.archived,
    submissionOpen: item.submissionOpen,
    paused: item.paused,
    acceptingSubmissions: item.acceptingSubmissions,
    resultsPublished: item.resultsPublished,
    judgingStartDate: item.judgingStart ?? "",
    judgingEndDate: item.judgingEnd ?? "",
    resultsDate: item.resultDate ?? "",
    rules: item.regulations ?? "",
    maxPhotosPerPerson: item.maxPhotosPerParticipant,
    criteria: item.criteria.map((criterion) => criterion.name),
    judgeIds: item.judgeIds,
    defaultJudgeIds: item.defaultJudgeIds,
    coverUrl: item.coverUrl ?? undefined,
    tags: item.categories,
    description: item.description ?? undefined,
    prizes: item.prizes,
    judgeNames: item.judgeNames,
    organizerName: item.organizerName ?? "",
  };
}

function toRequestBody(settings: ContestSettings) {
  return {
    title: settings.name,
    description: settings.description,
    categories: settings.tags,
    criteria: settings.criteria,
    maxPhotosPerParticipant: settings.maxPhotosPerPerson,
    regulations: settings.rules,
    submissionStart: settings.startDate || null,
    submissionEnd: settings.endDate || null,
    judgingStart: settings.judgingStartDate || null,
    judgingEnd: settings.judgingEndDate || null,
    resultDate: settings.resultsDate || null,
    prizes: settings.prizes,
    judgeIds: settings.judgeIds,
    defaultJudgeIds: settings.defaultJudgeIds,
    submissionOpen: settings.submissionOpen,
    paused: settings.paused,
  };
}

const fetchManaged = async () => (await request<ApiContest[]>("/contests/managed")).map(toContest);

// Quyền sửa do backend kiểm tra: Organizer chỉ quản lý cuộc thi của mình, Admin quản lý tất cả
export const contestService = {
  getContests: fetchManaged,
  getPublicContests: () => request<ApiContest[]>("/contests"),
  getOverviewStats: async (): Promise<OverviewStats> => {
    const report = await reportService.getReport();
    return {
      ongoingContests: report.ongoingContests,
      participants: report.participants,
      submissions: report.submissions,
      judges: report.judges,
    };
  },
  getContestById: async (id: string) => toContest(await request<ApiContest>(`/contests/${id}`)),
  createContest: async (draft: ContestDraft, judgeIds: string[]) => toContest(await request<ApiContest>("/contests", {
    method: "POST",
    body: JSON.stringify({
      title: draft.name,
      description: draft.description,
      categories: [draft.category],
      criteria: draft.criteria,
      maxPhotosPerParticipant: draft.maxPhotosPerPerson,
      submissionStart: draft.startDate,
      submissionEnd: draft.endDate,
      judgingStart: draft.endDate,
      prizes: draft.prizes,
      judgeIds,
    }),
  })),
  updateContest: async (id: string, settings: ContestSettings) => toContest(await request<ApiContest>(`/contests/${id}`, {
    method: "PUT",
    body: JSON.stringify(toRequestBody(settings)),
  })),
  endContest: async (id: string) => toContest(await request<ApiContest>(`/contests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "ENDED" }),
  })),
  setArchived: async (id: string, archived: boolean) =>
    toContest(await request<ApiContest>(`/contests/${id}/archive?archived=${archived}`, { method: "PATCH" })),
  duplicateContest: async (id: string) => toContest(await request<ApiContest>(`/contests/${id}/duplicate`, { method: "POST" })),
  deleteContest: (id: string) => request<void>(`/contests/${id}`, { method: "DELETE" }),
  publishResults: (id: string) => request<unknown>(`/contests/${id}/results/publish`, { method: "POST" }),
  unpublishResults: (id: string) => request<void>(`/contests/${id}/results/publish`, { method: "DELETE" }),
};
