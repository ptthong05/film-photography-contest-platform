export type AccountStatus = "ACTIVE" | "LOCKED";

export interface Participant {
  id: string;
  fullName: string;
  email: string;
  submissionCount: number;
  registeredAt: string;
  status: AccountStatus;
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
}
