export type AwardLevel = "FIRST" | "SECOND" | "THIRD" | "HONORABLE";

export interface ContestResult {
  id: string;
  rank: number;
  title: string;
  authorName: string;
  score: number;
  award: AwardLevel;
}
