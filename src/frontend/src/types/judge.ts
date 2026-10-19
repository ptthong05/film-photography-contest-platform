/** Trạng thái phiếu chấm của 1 giám khảo cho 1 bài dự thi trong 1 vòng. */
export type EvaluationStatus = 'NOT_STARTED' | 'DRAFT' | 'FINALIZED';

/** Tiến độ chấm của giám khảo trong 1 cuộc thi. */
export type JudgeContestStatus = 'NOT_STARTED' | 'JUDGING' | 'COMPLETED';

export type JudgeNotificationType = 'ASSIGNMENT' | 'DEADLINE' | 'NEW_SUBMISSION' | 'CRITERIA_UPDATE';

export interface JudgingCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  /** Trọng số theo %, tổng các tiêu chí của 1 vòng = 100 */
  weight: number;
}

export interface JudgingRound {
  id: string;
  name: string;
  order: number;
  startDate: string;
  endDate: string;
}

export interface JudgeContest {
  id: string;
  title: string;
  coverUrl: string;
  startDate: string;
  endDate: string;
  status: JudgeContestStatus;
  currentRound: JudgingRound;
  criteria: JudgingCriterion[];
  assignedCount: number;
  evaluatedCount: number;
  isResultPublished: boolean;
}

/** Metadata kỹ thuật bắt buộc của ảnh phim (SRS 4.1), snapshot tại thời điểm nộp. */
export interface FilmMetadata {
  filmStock: string;
  iso: number;
  cameraBody: string;
  lens: string;
  filmFormat: string;
  frameNumber: string;
  shootingDate: string;
  shootingLocation: string;
  developingLab: string;
  scanSpec: string;
}

export interface AssignedSubmission {
  id: string;
  contestId: string;
  contestTitle: string;
  roundId: string;
  roundName: string;
  title: string;
  /** null khi cuộc thi bật chấm ẩn danh — backend không trả tên tác giả */
  authorName: string | null;
  category: string;
  description: string;
  submittedAt: string;
  imageUrls: string[];
  /** Ảnh thu nhỏ cùng thứ tự với imageUrls — tránh tải bản scan dung lượng lớn cho danh sách */
  thumbnailUrls: string[];
  negativeUrls: string[];
  contactSheetUrl: string | null;
  metadata: FilmMetadata;
  evaluationStatus: EvaluationStatus;
  totalScore: number | null;
  evaluatedAt: string | null;
}

export interface CriterionScore {
  criterionId: string;
  score: number;
}

export interface Evaluation {
  submissionId: string;
  roundId: string;
  scores: CriterionScore[];
  comment: string;
  recommendNextRound: boolean;
  status: EvaluationStatus;
  totalScore: number | null;
  updatedAt: string | null;
}

export interface EvaluationRequest {
  scores: CriterionScore[];
  comment: string;
  recommendNextRound: boolean;
  /** true = gửi chính thức (khóa phiếu), false = lưu nháp */
  isFinal: boolean;
}

export interface EvaluationHistoryItem {
  roundName: string;
  totalScore: number;
  comment: string;
  recommendNextRound: boolean;
  evaluatedAt: string;
}

export interface JudgeNotification {
  id: string;
  type: JudgeNotificationType;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface JudgeStats {
  assignedContests: number;
  pendingSubmissions: number;
  evaluatedSubmissions: number;
  awaitingNextRound: number;
}

export interface JudgeProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  yearsOfExperience: number;
  bio: string;
  /** Rỗng khi giám khảo chưa tải ảnh đại diện — UI hiển thị chữ cái đầu tên */
  avatarUrl: string;
}

export interface ContestResultEntry {
  rank: number;
  submissionTitle: string;
  authorName: string;
  averageScore: number;
  award: string | null;
}

export type JudgeView = 'OVERVIEW' | 'CONTESTS' | 'ASSIGNED' | 'SCORING' | 'RESULTS' | 'MESSAGES' | 'PROFILE';
