import type { AuthResponse } from '../types/auth';
import type { User } from '../types/user';

/**
 * Lưu phiên đăng nhập (token + user). "Ghi nhớ đăng nhập" → localStorage, không thì sessionStorage (mất khi đóng tab).
 * Có cơ chế subscribe để mọi component (Navbar, trang gốc...) cập nhật ngay khi đăng nhập / đăng xuất.
 */

const STORAGE_KEY = 'film_contest_auth_session';

export type AuthSession = AuthResponse;

type Listener = () => void;

const listeners = new Set<Listener>();
let cachedSession: AuthSession | null | undefined;

function getStorages(): Storage[] {
  try {
    return [window.localStorage, window.sessionStorage];
  } catch {
    // Trình duyệt chặn storage (chế độ riêng tư...) → vẫn đăng nhập được trong phiên hiện tại, chỉ không nhớ
    return [];
  }
}

function readStoredSession(): AuthSession | null {
  for (const storage of getStorages()) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) continue;
      const session = JSON.parse(raw) as AuthSession;
      if (new Date(session.expiresAt).getTime() > Date.now()) return session;
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Dữ liệu hỏng thì coi như chưa đăng nhập
    }
  }
  return null;
}

function writeSession(session: AuthSession | null, remember: boolean) {
  cachedSession = session;
  const [local, temporary] = getStorages();
  try {
    local?.removeItem(STORAGE_KEY);
    temporary?.removeItem(STORAGE_KEY);
    if (session) (remember ? local : temporary)?.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Không ghi được thì phiên vẫn nằm trong bộ nhớ
  }
  listeners.forEach((listener) => listener());
}

function isRemembered(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function getSession(): AuthSession | null {
  if (cachedSession === undefined) cachedSession = readStoredSession();
  return cachedSession;
}

export function saveSession(response: AuthResponse, remember: boolean) {
  writeSession(response, remember);
}

/** Cập nhật thông tin user (vd. sau khi gọi /auth/me) mà giữ nguyên token. */
export function updateSessionUser(user: User) {
  const session = getSession();
  if (session) writeSession({ ...session, user }, isRemembered());
}

export function clearSession() {
  writeSession(null, false);
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
