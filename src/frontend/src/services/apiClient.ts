import type { ApiError } from '../types/api';
import { clearSession, getSession } from '../utils/authSession';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api';

/**
 * Hàm gọi API dùng chung cho mọi service.
 * - Tự gắn base URL, header JSON và token đăng nhập (Authorization: Bearer ...)
 * - Ném Error với message từ backend nếu request thất bại
 */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getSession();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  });

  // Token hết hạn hoặc tài khoản vừa bị khóa → đăng xuất để giao diện quay về trạng thái chưa đăng nhập
  if (res.status === 401 && session) {
    clearSession();
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (data as ApiError | null)?.message ?? `Lỗi kết nối máy chủ (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}
