import type { ApiError } from '../types/api';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api';

/** Spring Security trả 401/403 với body rỗng nên cần message mặc định dễ hiểu */
const AUTH_ERROR_MESSAGES: Record<number, string> = {
  401: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  403: 'Bạn không có quyền thực hiện thao tác này hoặc phiên đăng nhập đã hết hạn',
};

/**
 * Hàm gọi API dùng chung cho mọi service.
 * - Tự gắn base URL, header JSON và access token (nếu đã đăng nhập)
 * - Ném Error với message từ backend nếu request thất bại
 */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (data as ApiError | null)?.message
      ?? AUTH_ERROR_MESSAGES[res.status]
      ?? `Lỗi kết nối máy chủ (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}
