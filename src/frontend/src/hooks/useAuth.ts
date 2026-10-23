import { useSyncExternalStore } from 'react';
import { getSession, subscribeSession } from '../utils/authSession';

/** Người dùng đang đăng nhập; tự render lại khi đăng nhập / đăng xuất ở bất kỳ đâu. */
export function useAuth() {
  const session = useSyncExternalStore(subscribeSession, getSession);
  return {
    user: session?.user ?? null,
    isAuthenticated: session !== null,
  };
}
