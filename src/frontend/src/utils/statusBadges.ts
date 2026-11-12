import type { BadgeTone } from "../types/badge";
import type { ContestStatus } from "../types/contest";
import type { SubmissionStatus } from "../types/submission";
import type { AccountStatus } from "../types/organizerUser";

interface BadgeConfig {
  label: string;
  tone: BadgeTone;
}

export const CONTEST_STATUS: Record<ContestStatus, BadgeConfig> = {
  ONGOING: { label: "Đang diễn ra", tone: "success" },
  UPCOMING: { label: "Sắp diễn ra", tone: "info" },
  ENDED: { label: "Đã kết thúc", tone: "danger" },
};

export const ACCOUNT_STATUS: Record<AccountStatus, BadgeConfig> = {
  ACTIVE: { label: "Đang hoạt động", tone: "success" },
  LOCKED: { label: "Tạm khóa", tone: "danger" },
};

export const SUBMISSION_STATUS: Record<SubmissionStatus, BadgeConfig> = {
  VALID: { label: "Hợp lệ", tone: "success" },
  PENDING: { label: "Chờ xác minh", tone: "warning" },
};
