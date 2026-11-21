import { MOCK_PROFILE } from "../mocks/organizerData";
import type { OrganizerProfile } from "../types/organizerUser";
import { mockRequest } from "./mockClient";
import { authService } from "./authService";

const PROFILE_STORAGE_KEY = "filmcontest-organizer-profile-demo-v1";

export function readOrganizerProfile(): OrganizerProfile {
  try {
    const authUser = authService.getCurrentUser();
    // Ban đầu khi đăng nhập vào mặc định không có avatar
    const directAvatar: string | null = authUser?.avatar || authUser?.avatarUrl || null;

    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    const value: unknown = raw ? JSON.parse(raw) : null;
    const source = (value && typeof value === "object" && !Array.isArray(value)) ? (value as Record<string, unknown>) : {};

    return {
      fullName: authUser?.fullName || (typeof source.fullName === "string" ? source.fullName.slice(0, 80) : MOCK_PROFILE.fullName),
      email: authUser?.email || (typeof source.email === "string" ? source.email.slice(0, 120) : MOCK_PROFILE.email),
      phone: (authUser?.phone !== undefined && authUser?.phone !== null && authUser.phone !== '')
        ? authUser.phone
        : (typeof source.phone === "string" ? source.phone.slice(0, 24) : MOCK_PROFILE.phone),
      role: "Ban tổ chức (ORGANIZER)",
      bio: typeof source.bio === "string" ? source.bio.slice(0, 500) : MOCK_PROFILE.bio,
      avatarDataUrl: directAvatar,
    };
  } catch {
    return { ...MOCK_PROFILE, role: "Ban tổ chức (ORGANIZER)", avatarDataUrl: null };
  }
}

export const profileService = {
  getProfile: () => mockRequest(readOrganizerProfile()),
  saveProfile: async (profile: OrganizerProfile) => {
    try {
      await authService.updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        avatar: profile.avatarDataUrl,
      });
    } catch {}
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return mockRequest(profile, 100);
  },
};
