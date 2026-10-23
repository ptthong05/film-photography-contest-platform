import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import type { User } from '../types/user';
import { request } from './apiClient';

export const authService = {
  login: (body: LoginRequest) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  register: (body: RegisterRequest) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  getCurrentUser: () => request<User>('/auth/me'),
};
