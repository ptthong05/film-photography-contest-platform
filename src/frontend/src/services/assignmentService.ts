import type { Assignment } from "../types/assignment";
import { request } from "./apiClient";

interface ApiAssignment {
  id: string;
  contestId: string;
  contestTitle: string | null;
  judgeId: string;
  judgeName: string | null;
  submissionIds: string[];
  reviewedSubmissionIds: string[];
  remindersSent: number;
  deadline: string | null;
  updatedAt: string;
}

function toAssignment(item: ApiAssignment): Assignment {
  return {
    id: item.id,
    contestId: item.contestId,
    contestName: item.contestTitle ?? "",
    judgeId: item.judgeId,
    judgeName: item.judgeName ?? "",
    submissionIds: item.submissionIds,
    reviewedSubmissionIds: item.reviewedSubmissionIds,
    remindersSent: item.remindersSent,
    deadline: item.deadline ?? "",
    updatedAt: item.updatedAt,
  };
}

export const assignmentService = {
  getAssignments: async () => (await request<ApiAssignment[]>("/assignments")).map(toAssignment),
  assign: async (contestId: string, judgeId: string, submissionIds: string[]) => toAssignment(await request<ApiAssignment>("/assignments", {
    method: "POST",
    body: JSON.stringify({ contestId, judgeId, submissionIds }),
  })),
  reassign: async (id: string, judgeId: string) => toAssignment(await request<ApiAssignment>(`/assignments/${id}/judge`, {
    method: "PUT",
    body: JSON.stringify({ judgeId }),
  })),
  remind: async (id: string) => toAssignment(await request<ApiAssignment>(`/assignments/${id}/remind`, { method: "POST" })),
  revoke: (id: string) => request<void>(`/assignments/${id}`, { method: "DELETE" }),
};
