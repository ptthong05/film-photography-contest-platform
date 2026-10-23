/** Khớp với enum com.example.backend.enums.Role */
export type Role = 'ADMIN' | 'ORGANIZER' | 'JUDGE' | 'PARTICIPANT';

/** Khớp với enum com.example.backend.enums.UserStatus */
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED';

/** Khớp với UserResponse của backend */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
}

/** Khớp với UserRequest của backend. password để trống khi sửa = giữ mật khẩu cũ. */
export interface UserRequest {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
}
