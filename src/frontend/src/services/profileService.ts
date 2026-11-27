import { MOCK_PROFILE } from "../mocks/organizerData";
import type { OrganizerProfile } from "../types/organizerUser";
import { mockRequest } from "./mockClient";
import { authService } from "./authService";

const PROFILE_STORAGE_KEY = "filmcontest-organizer-profile-demo-v1";

export function readOrganizerProfile(): OrganizerProfile {
  try {
    const authUser = authService.getCurrentUser();
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    const value: unknown = raw ? JSON.parse(raw) : null;
    const source = (value && typeof value === "object" && !Array.isArray(value)) ? (value as Record<string, unknown>) : {};

    const storedAvatar = (typeof window !== 'undefined' ? window.localStorage.getItem('organizer_avatar') : null)
      || (typeof source.avatarDataUrl === "string" ? source.avatarDataUrl : null);
    const directAvatar: string | null = authUser?.avatar || authUser?.avatarUrl || storedAvatar || null;

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
    const fallbackAvatar = typeof window !== 'undefined' ? window.localStorage.getItem('organizer_avatar') : null;
    return { ...MOCK_PROFILE, role: "Ban tổ chức (ORGANIZER)", avatarDataUrl: fallbackAvatar };
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
    if (profile.avatarDataUrl) {
      window.localStorage.setItem('organizer_avatar', profile.avatarDataUrl);
    } else {
      window.localStorage.removeItem('organizer_avatar');
    }
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('userNameChanged'));
      window.dispatchEvent(new Event('avatarChanged'));
    }
    return mockRequest(profile, 100);
  },
};
