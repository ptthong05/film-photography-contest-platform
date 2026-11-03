import type { GearItem, UserProfile } from "../types/user";
import { getSession, updateSessionUser } from "../utils/authSession";
import { request, uploadImage } from "./apiClient";
import { authService } from "./authService";

export interface ProfileChanges {
  name: string;
  email: string;
  phone: string;
  bio?: string;
  specialty?: string;
  yearsOfExperience?: number;
  portfolioUrl?: string;
  organizationName?: string;
  avatarUrl?: string;
  gear?: GearItem[];
  address?: string;
  equipment?: string;
  portfolioImages?: string[];
}

/** Hồ sơ của người đang đăng nhập, dùng chung cho mọi role */
export const profileService = {
  getProfile: () => request<UserProfile>("/auth/me/profile"),

  /** Họ tên / email / SĐT là thông tin đăng nhập nên đi qua /auth/me, phần còn lại qua /auth/me/profile */
  saveProfile: async ({ name, email, phone, ...details }: ProfileChanges) => {
    const user = await authService.updateCurrentUser({ name, email, phone: phone.replace(/\s+/g, "") });
    updateSessionUser(user);
    return request<UserProfile>("/auth/me/profile", { method: "PATCH", body: JSON.stringify(details) });
  },

  saveAvatar: async (file: Blob) => {
    const avatarUrl = await uploadImage(file, "avatar.jpg");
    const profile = await request<UserProfile>("/auth/me/profile", { method: "PATCH", body: JSON.stringify({ avatarUrl }) });
    const session = getSession();
    if (session) updateSessionUser({ ...session.user, avatarUrl });
    return profile;
  },

  /** Thay danh sách ảnh portfolio; ảnh mới tải lên trước bằng uploadImage */
  savePortfolio: (portfolioImages: string[]) =>
    request<UserProfile>("/auth/me/profile", { method: "PATCH", body: JSON.stringify({ portfolioImages }) }),

  /** Backend coi chuỗi rỗng là xóa ảnh; null giữ nguyên */
  removeAvatar: async () => {
    const profile = await request<UserProfile>("/auth/me/profile", { method: "PATCH", body: JSON.stringify({ avatarUrl: "" }) });
    const session = getSession();
    if (session) updateSessionUser({ ...session.user, avatarUrl: "" });
    return profile;
  },
};
