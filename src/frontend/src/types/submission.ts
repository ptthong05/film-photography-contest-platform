export type SubmissionStatus = "VALID" | "SUSPECT_AI" | "PENDING";

export interface Submission {
  id: string;
  title: string;
  authorName: string;
  contestName: string;
  submittedAt: string;
  status: SubmissionStatus;
}
