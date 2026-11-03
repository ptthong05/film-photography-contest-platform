import type { AwardLevel, ContestResult } from "../types/result";
import { request } from "./apiClient";

/** Khớp ContestResultResponse của backend */
export interface ApiContestResult {
  id: string;
  rank: number;
  submissionId: string;
  submissionTitle: string;
  authorName: string | null;
  averageScore: number;
  award: AwardLevel | null;
  awardTitle: string | null;
  reward: string | null;
  contestId: string;
  contestTitle: string;
  published: boolean;
  imageUrl: string | null;
  category: string | null;
}

function toResult(item: ApiContestResult): ContestResult {
  return {
    id: `${item.contestId}-${item.id}`,
    rank: item.rank,
    title: item.submissionTitle,
    authorName: item.authorName ?? "",
    score: item.averageScore,
    award: item.award,
    awardTitle: item.awardTitle ?? "",
    reward: item.reward ?? "",
    submissionId: item.submissionId,
    contestId: item.contestId,
    contestName: item.contestTitle,
    isPublished: item.published,
    imageUrl: item.imageUrl ?? "",
    category: item.category ?? "",
  };
}

export const resultService = {
  /** Mọi cuộc thi đang quản lý, gồm cả bản xem trước chưa công bố */
  getResults: async () => (await request<ApiContestResult[]>("/contests/managed/results")).map(toResult),
  /** Công khai: cuộc thi chưa công bố trả mảng rỗng */
  getContestResults: async (contestId: string) =>
    (await request<ApiContestResult[]>(`/contests/${contestId}/results`)).map(toResult),
};
