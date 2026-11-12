export type ContestStatus = "ONGOING" | "UPCOMING" | "ENDED";

export interface Prize {
  name: string;
  reward: string;
}

export interface Contest {
  id: string;
  name: string;
  title?: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  submissionCount: number;
  status: ContestStatus;
  tags?: string[];
  description?: string;
  prizes?: Prize[];
  judgeNames?: string[];
  organizer?: string;
  image?: string;
}

export interface OverviewStats {
  ongoingContests: number;
  participants: number;
  submissions: number;
  judges: number;
}

export interface ContestDraft {
  name: string;
  organizer?: string;
  image?: string;
  category: string;
  tags?: string[];
  description: string;
  rules?: string;
  criteria: string[];
  maxPhotosPerPerson: number;
  startDate: string;
  endDate: string;
  judgingEndDate?: string;
  resultsDate?: string;
  prizes: Prize[];
  judgeIds: string[] | null; // null = dùng danh sách giám khảo chấm mặc định
}
