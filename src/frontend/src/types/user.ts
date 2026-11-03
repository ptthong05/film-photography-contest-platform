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

/** Khớp với GearItem của backend */
export interface GearItem {
  type: 'CAMERA' | 'LENS' | 'FILM_STOCK';
  name: string;
}

/** Khớp với ProfileResponse của backend */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  avatarUrl: string | null;
  bio: string | null;
  portfolioUrl: string | null;
  specialty: string | null;
  yearsOfExperience: number | null;
  organizationName: string | null;
  gear: GearItem[];
  address: string | null;
  equipment: string | null;
  portfolioImages: string[];
  createdAt: string | null;
}

/** Khớp với UserRequest của backend. password để trống khi sửa = giữ mật khẩu cũ. */
export interface UserRequest {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
}

/** Khớp với UpdateAccountRequest của backend: người dùng tự sửa, email/SĐT mới dùng để đăng nhập. */
export interface UpdateAccountRequest {
  name: string;
  email: string;
  phone: string;
}
