import type { Judge } from "../../../types/organizerUser";

const STORAGE_KEY = "filmcontest.organizer.extra-judges.v1";
const SEED_KEY = "filmcontest.organizer.extra-judges-seeded.v1";

export const SAMPLE_ORGANIZER_JUDGES: Judge[] = [
  { id: "org-judge-film-01", fullName: "Bùi Minh Khoa", email: "khoa.bm@filmcontest.vn", specialty: "Nhiếp ảnh phim", contestCount: 1, status: "ACTIVE", isDefault: true },
  { id: "org-judge-portrait-02", fullName: "Nguyễn Thảo Vy", email: "vy.nt@filmcontest.vn", specialty: "Nhiếp ảnh chân dung", contestCount: 1, status: "ACTIVE", isDefault: false },
  { id: "org-judge-street-03", fullName: "Võ Thành Đạt", email: "dat.vt@filmcontest.vn", specialty: "Nhiếp ảnh đường phố", contestCount: 1, status: "ACTIVE", isDefault: false },
];

export function readOrganizerOnlyJudges(): Judge[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed as Judge[] : [];
  } catch {
    return [];
  }
}

export function seedOrganizerJudgesOnce(): Judge[] {
  const saved = readOrganizerOnlyJudges();
  if (localStorage.getItem(SEED_KEY) === "true") return saved;
  const merged = [...saved];
  for (const judge of SAMPLE_ORGANIZER_JUDGES) {
    if (!merged.some((item) => item.id === judge.id)) merged.push(judge);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  localStorage.setItem(SEED_KEY, "true");
  return merged;
}

export function saveOrganizerOnlyJudge(judge: Judge): Judge[] {
  const judges = readOrganizerOnlyJudges();
  const merged = [judge, ...judges.filter((item) => item.id !== judge.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function updateOrganizerOnlyJudge(id: string, changes: Partial<Judge>): Judge[] {
  const judges = readOrganizerOnlyJudges().map((judge) => judge.id === id ? { ...judge, ...changes } : judge);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(judges));
  return judges;
}
