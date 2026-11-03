import type { AppNotification } from '../types/notification';
import { request } from './apiClient';

/** Thông báo của người đang đăng nhập, dùng chung mọi role */
export const notificationService = {
  getMine: () => request<AppNotification[]>('/notifications'),
  markAllRead: () => request<void>('/notifications/read-all', { method: 'PATCH' }),
  markRead: (id: string) => request<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' }),
};
