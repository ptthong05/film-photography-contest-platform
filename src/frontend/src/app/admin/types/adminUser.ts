/**
 * Kiểu dữ liệu UI dành riêng cho Admin (bản mẫu).
 * Chưa phải DTO chính thức của API Java Spring Boot.
 */
export type UserRole = 'ADMIN' | 'ORGANIZER' | 'JUDGE' | 'PARTICIPANT';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  contestCount: number;
  status: UserStatus;
  joinedAt: string; // yyyy-MM-dd
}

export type UserDraft = Pick<AdminUser, 'fullName' | 'email' | 'role' | 'status'>;

export const ROLE_INFO: Record<UserRole, { label: string; classes: string }> = {
  ADMIN: { label: 'Admin', classes: 'bg-violet-100 text-violet-700' },
  ORGANIZER: { label: 'Organizer', classes: 'bg-emerald-100 text-emerald-700' },
  JUDGE: { label: 'Judge', classes: 'bg-amber-100 text-amber-700' },
  PARTICIPANT: { label: 'Participant', classes: 'bg-blue-100 text-blue-700' },
};

export const STATUS_INFO: Record<UserStatus, { label: string; classes: string }> = {
  ACTIVE: { label: 'Hoạt động', classes: 'bg-emerald-100 text-emerald-700' },
  SUSPENDED: { label: 'Tạm khóa', classes: 'bg-amber-100 text-amber-800' },
  LOCKED: { label: 'Bị khóa', classes: 'bg-rose-100 text-rose-700' },
};
