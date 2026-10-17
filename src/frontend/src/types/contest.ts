export type ContestStatus = "ONGOING" | "UPCOMING" | "ENDED";

export interface Contest {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  submissionCount: number;
  status: ContestStatus;
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
  slogan: string;
}
