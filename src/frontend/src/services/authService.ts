import { unifiedUserService } from './unifiedUserService';

export type UserRole = 'ADMIN' | 'ORGANIZER' | 'JUDGE' | 'PARTICIPANT';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  mustChangePassword?: boolean;
}

export const AUTH_USER_KEY = 'filmcontest_auth_user';
export const AUTH_TOKEN_KEY = 'filmcontest_access_token';
export const AUTH_REFRESH_TOKEN_KEY = 'filmcontest_refresh_token';

const BACKEND_BASE_URL = 'http://localhost:8081';

/**
 * Kiểm tra mật khẩu mạnh theo yêu cầu:
 * - Ít nhất 8 ký tự
 * - Ký tự đầu tiên phải viết hoa
 * - Có chứa chữ cái thường
 * - Có chứa chữ số
 * - Có chứa ký tự đặc biệt
 */
export function validateStrongPassword(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  if (!/^[A-Z]/.test(password)) {
    return { isValid: false, error: 'Ký tự đầu tiên của mật khẩu phải là chữ viết hoa' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Mật khẩu phải chứa ít nhất một chữ cái thường' };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Mật khẩu phải chứa ít nhất một chữ số' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
    return { isValid: false, error: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%...)' };
  }
  return { isValid: true };
}

export const authService = {
  /** Lấy thông tin người dùng hiện tại đang đăng nhập */
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  /** Lấy access token */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /** Lưu phiên đăng nhập */
  saveSession(user: AuthUser, accessToken?: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      if (accessToken) localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
      window.dispatchEvent(new CustomEvent('authChanged', { detail: user }));
    } catch (e) {
      console.error('Lỗi khi lưu phiên đăng nhập:', e);
    }
  },

  /** Đăng xuất người dùng */
  logout(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
      localStorage.removeItem('film_contest_active_portal');
      window.dispatchEvent(new CustomEvent('authChanged', { detail: null }));
    } catch (e) {
      console.error('Lỗi khi đăng xuất:', e);
    }
  },

  /**
   * Đăng ký tài khoản mới:
   * Mặc định vai trò luôn là Thí sinh (PARTICIPANT).
   */
  async register(data: { name: string; email: string; phone?: string; password: string }): Promise<AuthUser> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone?.trim() || '';
    const cleanName = data.name.trim();

    // 1. Thử gọi API Backend đăng ký vào CSDL
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          password: data.password,
          role: 'PARTICIPANT',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const resData = await response.json();
        const newUser: AuthUser = {
          id: String(resData.user?.id || Date.now()),
          fullName: resData.user?.name || cleanName,
          email: resData.user?.email || cleanEmail,
          phone: cleanPhone,
          role: 'PARTICIPANT',
          status: 'ACTIVE',
        };
        // Đồng bộ vào local storage
        unifiedUserService.addUser({
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: 'PARTICIPANT',
          status: 'ACTIVE',
          contestCount: 0,
          joinedAt: new Date().toISOString().split('T')[0],
        });
        return newUser;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Email hoặc số điện thoại này đã được sử dụng!');
      }
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.includes('fetch') && err.message !== 'The user aborted a request.') {
        throw err;
      }
    }

    // 2. Fallback nếu Backend chưa mở: Lưu tài khoản Thí sinh vào storage nội bộ
    const allUsers = unifiedUserService.getAllUsers();
    const emailExists = allUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    const phoneExists = Boolean(cleanPhone && allUsers.some((u) => u.id === cleanPhone || (u as unknown as Record<string, unknown>).phone === cleanPhone));

    if (emailExists && phoneExists) {
      throw new Error('Cả email và số điện thoại này đều đã được đăng ký trong hệ thống!');
    }
    if (emailExists) {
      throw new Error('Email này đã được sử dụng!');
    }
    if (phoneExists) {
      throw new Error('Số điện thoại này đã được sử dụng!');
    }

    const localUser: AuthUser = {
      id: `u-${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: 'PARTICIPANT',
      status: 'ACTIVE',
      avatar: null,
      avatarUrl: null,
    };

    unifiedUserService.addUser({
      id: localUser.id,
      fullName: localUser.fullName,
      email: localUser.email,
      role: 'PARTICIPANT',
      status: 'ACTIVE',
      contestCount: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    });

    return localUser;
  },

  /**
   * Đăng nhập: Gửi request trực tiếp đến backend API lấy dữ liệu từ CSDL.
   * Nếu backend chưa mở, fallback kiểm tra danh sách tài khoản đã đăng ký trong hệ thống.
   */
  async login(identifier: string, password?: string): Promise<AuthUser> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPassword = password?.trim() || '';

    // 1. Thử gửi đến Backend CSDL
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanId,
          identifier: cleanId,
          password: cleanPassword,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const authUser: AuthUser = {
          id: String(data.user?.id || Date.now()),
          fullName: data.user?.name || cleanId,
          email: data.user?.email || cleanId,
          phone: data.user?.phone || '',
          role: (data.user?.role as UserRole) || 'PARTICIPANT',
          status: data.user?.status || 'ACTIVE',
          avatar: data.user?.avatar || data.user?.avatarUrl || null,
          avatarUrl: data.user?.avatar || data.user?.avatarUrl || null,
          mustChangePassword: Boolean(data.user?.mustChangePassword),
        };
        this.saveSession(authUser, data.accessToken, data.refreshToken);
        return authUser;
      }

      if (response.status === 400 || response.status === 401) {
        throw new Error('Đăng nhập không hợp lệ');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Đăng nhập không hợp lệ') {
        throw err;
      }
    }

    // 2. Fallback kiểm tra trong CSDL cục bộ (unified users)
    const allUsers = unifiedUserService.getAllUsers();
    const matched = allUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.id.toLowerCase() === cleanId ||
        (u.fullName && u.fullName.toLowerCase() === cleanId)
    );

    if (matched) {
      if (matched.status === 'LOCKED') {
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên!');
      }

      const authUser: AuthUser = {
        id: matched.id,
        fullName: matched.fullName,
        email: matched.email,
        role: matched.role,
        status: matched.status,
        mustChangePassword: (matched.role === 'JUDGE' || matched.role === 'ORGANIZER') && !localStorage.getItem(`pwd_changed_${matched.id}`),
      };

      this.saveSession(authUser, `token-${matched.id}`);
      return authUser;
    }

    throw new Error('Đăng nhập không hợp lệ');
  },

  /** Kiểm tra quyền của người dùng hiện tại */
  hasRole(...roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  },

  /**
   * Đổi mật khẩu:
   * Kiểm tra mật khẩu cũ trong CSDL, nếu khớp thì lưu mật khẩu mới.
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Vui lòng đăng nhập để thực hiện đổi mật khẩu.');

    const validation = validateStrongPassword(newPassword);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Mật khẩu mới không đáp ứng tiêu chuẩn an toàn.');
    }

    if (oldPassword === newPassword) {
      throw new Error('Mật khẩu mới không được trùng với mật khẩu cũ.');
    }

    try {
      const token = this.getToken();
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          identifier: user.email || user.phone || user.id,
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Mật khẩu hiện tại không chính xác!');
      }

      // Đổi mật khẩu thành công: Cập nhật trạng thái mustChangePassword = false
      user.mustChangePassword = false;
      localStorage.setItem(`pwd_changed_${user.id}`, 'true');
      this.saveSession(user, this.getToken() || undefined);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Nếu lỗi kết nối backend, thông báo lỗi rõ ràng
        if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
          throw new Error('Không thể kết nối đến máy chủ MySQL/Backend. Vui lòng kiểm tra lại dịch vụ.');
        }
        throw err;
      }
      throw new Error('Có lỗi xảy ra khi đổi mật khẩu.');
    }
  },

  /**
   * Cập nhật thông tin hồ sơ người dùng:
   * CHỈ CHO PHÉP THAY ĐỔI HỌ VÀ TÊN.
   * Email, Số điện thoại và Chức vụ (role) được giữ nguyên tuyệt đối, không thể thay đổi.
   */
  async updateProfile(data: { fullName?: string; phone?: string; avatar?: string | null }): Promise<AuthUser> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Vui lòng đăng nhập để thực hiện cập nhật hồ sơ.');

    const updatedUser: AuthUser = {
      ...user,
      fullName: data.fullName !== undefined ? data.fullName.trim() : user.fullName,
      // Email, Số điện thoại và Role giữ nguyên tuyệt đối
      role: user.role,
      email: user.email,
      phone: user.phone,
    };

    // 1. Gửi lên Backend để cập nhật trong CSDL MySQL thật
    try {
      const token = this.getToken();
      await fetch(`${BACKEND_BASE_URL}/api/auth/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          identifier: user.email || user.phone || user.id,
          name: updatedUser.fullName,
        }),
      });
    } catch {
      // Backend offline thì tiếp tục lưu đồng bộ phiên cục bộ
    }

    // 2. Cập nhật vào Storage người dùng
    this.saveSession(updatedUser, this.getToken() || undefined);

    // Đồng bộ vào unifiedUserService
    unifiedUserService.updateUser(updatedUser.id, {
      fullName: updatedUser.fullName,
      email: updatedUser.email,
    });

    return updatedUser;
  },
};
