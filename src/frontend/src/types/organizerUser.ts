export type AccountStatus = "ACTIVE" | "LOCKED";

export interface Participant {
  id: string;
  fullName: string;
  email: string;
  submissionCount: number;
  registeredAt: string;
  status: AccountStatus;
  contestIds: string[];
}

export interface Judge {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  contestCount: number;
  status: AccountStatus;
  isDefault: boolean;
  /** Chỉ có ngay sau khi tạo tài khoản, để Organizer gửi cho giám khảo */
  temporaryPassword?: string;
}

export interface OrganizerProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  avatarDataUrl?: string | null;
}
