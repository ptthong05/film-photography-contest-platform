export type ContestStatus = "ONGOING" | "UPCOMING" | "ENDED";

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
  tags?: string[];
  description?: string;
  prizes?: Prize[];
  judgeNames?: string[];
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
