import type { User } from '../../../types/user';

/**
 * Kiểu dữ liệu UI cho màn quản lý người dùng của Admin, map từ UserResponse của backend qua toAdminUser().
 */
export type UserRole = 'ADMIN' | 'ORGANIZER' | 'JUDGE' | 'PARTICIPANT';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  /** Backend chưa thống kê số cuộc thi tham gia → null, bảng hiển thị "—" */
  contestCount: number | null;
  status: UserStatus;
  joinedAt: string; // yyyy-MM-dd, rỗng nếu backend không có createdAt
}

/** password chỉ bắt buộc khi tạo; để trống khi sửa = giữ mật khẩu cũ */
export type UserDraft = Pick<AdminUser, 'fullName' | 'email' | 'phone' | 'role' | 'status'> & { password: string };

export function toAdminUser(user: User): AdminUser {
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
    contestCount: null,
    status: user.status,
    joinedAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('sv-SE') : '',
  };
}

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
