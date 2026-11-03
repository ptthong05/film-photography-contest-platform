export interface Assignment {
  id: string;
  contestId: string;
  contestName: string;
  judgeId: string;
  judgeName: string;
  submissionIds: string[];
  reviewedSubmissionIds: string[];
  remindersSent: number;
  deadline: string;
  updatedAt: string;
}
