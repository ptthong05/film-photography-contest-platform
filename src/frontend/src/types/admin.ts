import type { Role } from './user';

/** Khớp với ActivityLogResponse của backend */
export interface AppLog {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: Role | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  createdAt: string;
}
