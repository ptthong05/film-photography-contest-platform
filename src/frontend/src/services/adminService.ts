import type { AppLog } from '../types/admin';
import { request } from './apiClient';

/** Nhật ký và cấu hình hệ thống; backend chỉ cho role ADMIN */
export const adminService = {
  getLogs: () => request<AppLog[]>('/admin/logs'),
  getSetting: <T>(key: string) => request<T>(`/admin/settings/${key}`),
  saveSetting: <T>(key: string, value: T) =>
    request<T>(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify(value) }),
};
