import type { ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api';

/**
 * Hàm gọi API dùng chung cho mọi service.
 * - Tự gắn base URL và header JSON
 * - Ném Error với message từ backend nếu request thất bại
 */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

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
