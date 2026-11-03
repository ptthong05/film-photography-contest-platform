export type AwardLevel = "FIRST" | "SECOND" | "THIRD" | "HONORABLE";

export interface ContestResult {
  id: string;
  rank: number;
  title: string;
  authorName: string;
  score: number;
  /** null khi tác phẩm không đoạt giải */
  award: AwardLevel | null;
  awardTitle: string;
  reward: string;
  submissionId: string;
  contestId: string;
  contestName: string;
  isPublished: boolean;
  imageUrl: string;
  category: string;
}
