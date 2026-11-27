import type { JudgingCriterion, JudgingRound } from './judge';

/** Hạng giải, khớp enum PrizeRank của backend */
export type PrizeRank = 'FIRST' | 'SECOND' | 'THIRD' | 'HONORABLE';

export const PRIZE_LABELS: Record<PrizeRank, string> = {
  FIRST: 'Giải Nhất',
  SECOND: 'Giải Nhì',
  THIRD: 'Giải Ba',
  HONORABLE: 'Giải Khuyến khích',
};

/** Phân công giám khảo theo vòng (AssignmentResponse) */
export interface JudgeAssignmentRecord {
  id: string;
  contestId: string;
  contestTitle: string | null;
  roundId: string;
  judgeId: string;
  judgeName: string | null;
  judgeEmail: string | null;
  judgeSpecialty: string | null;
  submissionIds: string[];
  reviewedSubmissionIds: string[];
  remindersSent: number;
  /** yyyy-MM-dd, ngày kết thúc của vòng */
  deadline: string | null;
  updatedAt: string;
}

export interface SubmissionSummary {
  id: string;
  code: string;
  title: string;
  category: string | null;
  imageUrl: string | null;
  submittedAt: string;
  filmStock: string | null;
  camera: string | null;
}

export interface AssignmentSetup {
  contestId: string;
  contestTitle: string;
  rounds: JudgingRound[];
  criteria: JudgingCriterion[];
  submissions: SubmissionSummary[];
}

export interface CriterionDraft {
  name: string;
  description: string;
  maxScore: number;
  weight: number;
}

export interface JudgeScore {
  judgeId: string;
  judgeName: string | null;
  totalScore: number;
  comment: string | null;
  recommendNextRound: boolean;
  finalizedAt: string | null;
}

export interface ScoringEntry {
  submission: SubmissionSummary;
  authorName: string | null;
  roundId: string | null;
  roundName: string | null;
  assignedJudgeCount: number;
  finalizedCount: number;
  averageScore: number | null;
  judgeScores: JudgeScore[];
  ranking: number | null;
  prizeRank: PrizeRank | null;
}

export interface ContestScoring {
  contestId: string;
  contestTitle: string;
  published: boolean;
  publishedAt: string | null;
  entries: ScoringEntry[];
}

export interface PublishedResult {
  ranking: number;
  submissionId: string;
  code: string;
  title: string;
  authorName: string | null;
  category: string | null;
  imageUrl: string | null;
  averageScore: number;
  prizeRank: PrizeRank | null;
  publishedAt: string;
}
