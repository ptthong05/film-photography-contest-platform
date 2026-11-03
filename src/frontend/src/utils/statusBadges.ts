import type { BadgeTone } from "../types/badge";
import type { ContestStatus } from "../types/contest";
import type { SubmissionStatus } from "../types/submission";
import type { AccountStatus } from "../types/organizerUser";
import type { ContestDisplayStatus } from "../services/participantService";

interface BadgeConfig {
  label: string;
  tone: BadgeTone;
}

export const CONTEST_STATUS: Record<ContestStatus, BadgeConfig> = {
  ONGOING: { label: "Đang diễn ra", tone: "success" },
  UPCOMING: { label: "Sắp diễn ra", tone: "info" },
  ENDED: { label: "Đã kết thúc", tone: "danger" },
};

/** Màu nhãn trạng thái cuộc thi ở cổng thí sinh */
export const PARTICIPANT_CONTEST_BADGE: Record<ContestDisplayStatus, string> = {
  "Đang diễn ra": "bg-emerald-500",
  "Sắp diễn ra": "bg-blue-500",
  "Đang chấm": "bg-amber-500",
  "Đã kết thúc": "bg-slate-500",
};

export const ACCOUNT_STATUS: Record<AccountStatus, BadgeConfig> = {
  ACTIVE: { label: "Đang hoạt động", tone: "success" },
  LOCKED: { label: "Tạm khóa", tone: "danger" },
};

export const SUBMISSION_STATUS: Record<SubmissionStatus, BadgeConfig> = {
  VALID: { label: "Hợp lệ", tone: "success" },
  PENDING: { label: "Chờ xác minh", tone: "warning" },
  REJECTED: { label: "Đã từ chối", tone: "danger" },
};
