import type { User, UserRequest } from '../types/user';
import { request } from './apiClient';

/** File mẫu: mỗi resource backend tương ứng 1 service. */
export const userService = {
  getAll: () => request<User[]>('/users'),

  getById: (id: string) => request<User>(`/users/${id}`),

  create: (body: UserRequest) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: UserRequest) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
};
