export type AccountStatus = "ACTIVE" | "LOCKED";

export interface Participant {
  id: string;
  fullName: string;
  email: string;
  submissionCount: number;
  registeredAt: string;
  status: AccountStatus;
  recentSubmissions?: { id: string; title: string; contestName: string; submittedAt: string; status: "VALID" | "PENDING" }[];
}

export interface Judge {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  contestCount: number;
  status: AccountStatus;
  isDefault: boolean;
}

export interface OrganizerProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  avatarDataUrl?: string | null;
}
