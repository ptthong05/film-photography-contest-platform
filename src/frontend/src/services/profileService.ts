import { MOCK_PROFILE } from "../mocks/organizerData";
import type { OrganizerProfile } from "../types/organizerUser";
import { mockRequest } from "./mockClient";

const PROFILE_STORAGE_KEY = "filmcontest-organizer-profile-demo-v1";

export function readOrganizerProfile(): OrganizerProfile {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { ...MOCK_PROFILE };
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return { ...MOCK_PROFILE };
    const source = value as Record<string, unknown>;
    return {
      fullName: typeof source.fullName === "string" ? source.fullName.slice(0, 80) : MOCK_PROFILE.fullName,
      email: typeof source.email === "string" ? source.email.slice(0, 120) : MOCK_PROFILE.email,
      phone: typeof source.phone === "string" ? source.phone.slice(0, 24) : MOCK_PROFILE.phone,
      role: MOCK_PROFILE.role,
      bio: typeof source.bio === "string" ? source.bio.slice(0, 500) : MOCK_PROFILE.bio,
      avatarDataUrl: typeof source.avatarDataUrl === "string" && source.avatarDataUrl.length < 1_500_000 &&
        /^data:image\/(?:jpeg|png|webp);base64,/i.test(source.avatarDataUrl) ? source.avatarDataUrl : null,
    };
  } catch {
    return { ...MOCK_PROFILE };
  }
}

export const profileService = {
  getProfile: () => mockRequest(readOrganizerProfile()),
  saveProfile: (profile: OrganizerProfile) => {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return mockRequest(profile, 100);
  },
};
