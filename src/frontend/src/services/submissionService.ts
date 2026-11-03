import type { Submission, SubmissionStatus } from "../types/submission";
import { request } from "./apiClient";

type ApiSubmissionStatus = "PENDING" | "VERIFIED" | "REJECTED";

/** Khớp SubmissionResponse của backend */
export interface ApiSubmission {
  aiVerification: { duplicate: boolean; aiGenerated: boolean } | null;
  id: string;
  code: string;
  contestId: string;
  contestTitle: string | null;
  participantId: string;
  authorName: string | null;
  authorEmail: string | null;
  title: string;
  description: string | null;
  category: string | null;
  imageUrls: string[];
  thumbnailUrls: string[];
  negativeUrls: string[];
  metadata: {
    filmBrand: string | null;
    filmStock: string | null;
    iso: number | null;
    camera: string | null;
    lens: string | null;
    filmFormat: string | null;
    frameNumber: string | null;
    shootingLocation: string | null;
    developingLab: string | null;
    scanSpec: string | null;
  } | null;
  status: ApiSubmissionStatus;
  rejectionReason: string | null;
  totalScore: number | null;
  prizeRank: "FIRST" | "SECOND" | "THIRD" | "HONORABLE" | null;
  resultPublished: boolean;
  submittedAt: string;
}

const STATUS_FROM_API: Record<ApiSubmissionStatus, SubmissionStatus> = {
  PENDING: "PENDING",
  VERIFIED: "VALID",
  REJECTED: "REJECTED",
};

const EMPTY = "Chưa khai báo";

export function toSubmission(item: ApiSubmission): Submission {
  const metadata = item.metadata;
  return {
    id: item.id,
    code: item.code,
    title: item.title,
    authorName: item.authorName ?? EMPTY,
    authorEmail: item.authorEmail ?? "",
    participantId: item.participantId,
    contestId: item.contestId,
    contestName: item.contestTitle ?? EMPTY,
    submittedAt: item.submittedAt,
    status: STATUS_FROM_API[item.status],
    rejectionReason: item.rejectionReason ?? "",
    imageUrl: item.imageUrls[0] ?? "",
    category: item.category ?? "",
    description: item.description ?? "",
    metadata: {
      filmStock: metadata?.filmStock ?? EMPTY,
      iso: metadata?.iso?.toString() ?? EMPTY,
      camera: metadata?.camera ?? EMPTY,
      lens: metadata?.lens ?? EMPTY,
      format: metadata?.filmFormat ?? EMPTY,
      rollCode: metadata?.filmBrand ?? EMPTY,
      frame: metadata?.frameNumber ?? EMPTY,
      location: metadata?.shootingLocation ?? EMPTY,
      lab: metadata?.developingLab ?? EMPTY,
      scan: metadata?.scanSpec ?? EMPTY,
      negative: item.negativeUrls.length ? "Có" : "Không có",
    },
  };
}

export const submissionService = {
  getSubmissions: async () => (await request<ApiSubmission[]>("/submissions")).map(toSubmission),
  getSubmissionById: async (id: string) => toSubmission(await request<ApiSubmission>(`/submissions/${id}`)),
  review: async (id: string, status: ApiSubmissionStatus, reason?: string) =>
    toSubmission(await request<ApiSubmission>(`/submissions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    })),
};
