import type { User } from './user';

/** Khớp với LoginRequest của backend. identifier là email hoặc số điện thoại. */
export interface LoginRequest {
  identifier: string;
  password: string;
}

/** Khớp với RegisterRequest của backend. Tự đăng ký luôn là Thí sinh. */
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/** Khớp với AuthResponse của backend */
export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}
