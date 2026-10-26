export interface ManagedAssignment {
  id: string;
  contestId: string;
  judgeId: string;
  submissionIds: string[];
  reviewedSubmissionIds: string[];
  remindersSent: number;
  updatedAt: string;
}

const STORAGE_KEY = "filmcontest.organizer.assignments.v1";
const SEEDED_KEY = "filmcontest.organizer.assignments-seeded.v1";
const EXTRA_DEMO_KEY = "filmcontest.organizer.assignments-extra-demo-seeded.v1";

export function readManagedAssignments(): ManagedAssignment[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value as ManagedAssignment[] : [];
  } catch {
    return [];
  }
}

export function writeManagedAssignments(assignments: ManagedAssignment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
}

export function seedManagedAssignmentsOnce(seed: ManagedAssignment[]): ManagedAssignment[] | null {
  if (localStorage.getItem(SEEDED_KEY) === "true") return null;
  const current = readManagedAssignments();
  localStorage.setItem(SEEDED_KEY, "true");
  if (current.length) return current;
  if (seed.length) writeManagedAssignments(seed);
  return seed;
}

export function seedAdditionalManagedAssignmentsOnce(seed: ManagedAssignment[]): ManagedAssignment[] | null {
  if (localStorage.getItem(EXTRA_DEMO_KEY) === "true") return null;
  const current = readManagedAssignments();
  const next = [...current];
  for (const assignment of seed) {
    if (!next.some((item) => item.judgeId === assignment.judgeId && item.contestId === assignment.contestId)) next.push(assignment);
  }
  localStorage.setItem(EXTRA_DEMO_KEY, "true");
  if (next.length !== current.length) writeManagedAssignments(next);
  return next;
}
