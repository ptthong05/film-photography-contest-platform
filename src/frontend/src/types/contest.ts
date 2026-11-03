export type ContestStatus = "ONGOING" | "UPCOMING" | "ENDED";

/** Giai đoạn đầy đủ từ backend; ContestStatus là bản rút gọn cho huy hiệu trên giao diện */
export type ContestStage = "DRAFT" | "UPCOMING" | "ONGOING" | "JUDGING" | "ENDED";

export interface Prize {
  name: string;
  reward: string;
}

export interface Contest {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  submissionCount: number;
  status: ContestStatus;
  stage: ContestStage;
  archived: boolean;
  submissionOpen: boolean;
  paused: boolean;
  acceptingSubmissions: boolean;
  resultsPublished: boolean;
  judgingStartDate: string;
  judgingEndDate: string;
  resultsDate: string;
  rules: string;
  maxPhotosPerPerson: number;
  criteria: string[];
  judgeIds: string[];
  defaultJudgeIds: string[];
  coverUrl?: string;
  tags?: string[];
  description?: string;
  prizes?: Prize[];
  judgeNames?: string[];
  organizerName: string;
}

export interface OverviewStats {
  ongoingContests: number;
  participants: number;
  submissions: number;
  judges: number;
}

export interface ContestDraft {
  name: string;
  category: string;
  description: string;
  criteria: string[];
  maxPhotosPerPerson: number;
  startDate: string;
  endDate: string;
  prizes: Prize[];
  judgeIds: string[] | null; // null = dùng danh sách giám khảo chấm mặc định
}

/** Toàn bộ thông tin có thể chỉnh trong trang quản lý cuộc thi */
export interface ContestSettings {
  name: string;
  description: string;
  tags: string[];
  criteria: string[];
  maxPhotosPerPerson: number;
  rules: string;
  startDate: string;
  endDate: string;
  judgingStartDate: string;
  judgingEndDate: string;
  resultsDate: string;
  prizes: Prize[];
  judgeIds: string[];
  defaultJudgeIds: string[];
  submissionOpen: boolean;
  paused: boolean;
}
