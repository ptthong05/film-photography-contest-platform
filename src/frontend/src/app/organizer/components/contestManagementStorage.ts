import type { Contest, ContestStatus, Prize } from "../../../types/contest";

export interface ContestManagementSettings {
  name: string;
  description: string;
  tags: string[];
  criteria: string[];
  maxPhotosPerPerson: number;
  rules: string;
  startDate: string;
  endDate: string;
  judgingStartDate: string;
  judgingEndDate: string;
  resultsDate: string;
  prizes: Prize[];
  judgeIds: string[];
  defaultJudgeIds: string[];
  judgeNames?: string[];
  lifecycleStatus?: ContestStatus;
  submissionOpen?: boolean;
  isPaused?: boolean;
  resultsPublished?: boolean;
  submissionReviews?: Record<string, "APPROVED" | "REJECTED">;
}

const STORAGE_KEY = "filmcontest.organizer.contest-settings.v1";
const COLLECTION_KEY = "filmcontest.organizer.contest-list.v1";
const SUBMISSION_REVIEW_KEY = "filmcontest.organizer.submission-reviews.v1";

type SettingsMap = Record<string, ContestManagementSettings>;
interface ContestCollectionState { archivedIds: string[]; deletedIds: string[]; copies: Contest[] }

function readSettingsMap(): SettingsMap {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as SettingsMap : {};
  } catch {
    return {};
  }
}

function readCollectionState(): ContestCollectionState {
  try {
    const stored = localStorage.getItem(COLLECTION_KEY);
    if (!stored) return { archivedIds: [], deletedIds: [], copies: [] };
    const parsed = JSON.parse(stored) as Partial<ContestCollectionState>;
    return {
      archivedIds: Array.isArray(parsed.archivedIds) ? parsed.archivedIds : [],
      deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
      copies: Array.isArray(parsed.copies) ? parsed.copies : [],
    };
  } catch {
    return { archivedIds: [], deletedIds: [], copies: [] };
  }
}

function writeCollectionState(state: ContestCollectionState): void {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(state));
}

export function getOrganizerContestCopies(): Contest[] {
  return readCollectionState().copies;
}

export function getOrganizerContestCopy(contestId: string): Contest | undefined {
  return readCollectionState().copies.find((contest) => contest.id === contestId);
}

export function isOrganizerContestArchived(contestId: string): boolean {
  return readCollectionState().archivedIds.includes(contestId);
}

export function isOrganizerContestDeleted(contestId: string): boolean {
  return readCollectionState().deletedIds.includes(contestId);
}

export function duplicateOrganizerContest(contest: Contest): Contest {
  const state = readCollectionState();
  const copy: Contest = {
    ...contest,
    id: `copy-${Date.now()}`,
    name: `${contest.name} (Bản sao)`,
    status: "UPCOMING",
    participantCount: 0,
    submissionCount: 0,
    judgeNames: [],
    prizes: contest.prizes?.map((prize) => ({ ...prize })),
    tags: [...(contest.tags ?? [])],
  };
  state.copies.unshift(copy);
  writeCollectionState(state);
  return copy;
}

export function archiveOrganizerContest(contestId: string): void {
  const state = readCollectionState();
  if (!state.archivedIds.includes(contestId)) state.archivedIds.push(contestId);
  writeCollectionState(state);
}

export function restoreOrganizerContest(contestId: string): void {
  const state = readCollectionState();
  state.archivedIds = state.archivedIds.filter((id) => id !== contestId);
  writeCollectionState(state);
}

export function deleteOrganizerContest(contestId: string): void {
  const state = readCollectionState();
  if (!state.deletedIds.includes(contestId)) state.deletedIds.push(contestId);
  state.copies = state.copies.filter((contest) => contest.id !== contestId);
  const settings = readSettingsMap();
  delete settings[contestId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  writeCollectionState(state);
}

export function readContestSettings(contestId: string): ContestManagementSettings | undefined {
  const settings = readSettingsMap()[contestId];
  if (!settings) return undefined;
  return { ...settings, submissionReviews: { ...(settings.submissionReviews ?? {}), ...(readSubmissionReviews()[contestId] ?? {}) } };
}

export function saveContestSettings(contestId: string, settings: ContestManagementSettings): void {
  const settingsMap = readSettingsMap();
  settingsMap[contestId] = settings;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsMap));
}

type SubmissionReviewMap = Record<string, Record<string, "APPROVED" | "REJECTED">>;

function readSubmissionReviews(): SubmissionReviewMap {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SUBMISSION_REVIEW_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as SubmissionReviewMap : {};
  } catch {
    return {};
  }
}

export function readContestSubmissionReview(contestId: string, submissionId: string): "APPROVED" | "REJECTED" | undefined {
  return readSubmissionReviews()[contestId]?.[submissionId] ?? readContestSettings(contestId)?.submissionReviews?.[submissionId];
}

export function readContestSubmissionReviews(contestId: string): Record<string, "APPROVED" | "REJECTED"> {
  return { ...(readContestSettings(contestId)?.submissionReviews ?? {}), ...(readSubmissionReviews()[contestId] ?? {}) };
}

export function saveContestSubmissionReview(contestId: string, submissionId: string, status: "APPROVED" | "REJECTED" | null): void {
  const reviewMap = readSubmissionReviews();
  reviewMap[contestId] = { ...(reviewMap[contestId] ?? {}) };
  if (status) reviewMap[contestId][submissionId] = status;
  else delete reviewMap[contestId][submissionId];
  localStorage.setItem(SUBMISSION_REVIEW_KEY, JSON.stringify(reviewMap));

  const settingsMap = readSettingsMap();
  const settings = settingsMap[contestId];
  if (!settings) return;
  const submissionReviews = { ...(settings.submissionReviews ?? {}) };
  if (status) submissionReviews[submissionId] = status;
  else delete submissionReviews[submissionId];
  settingsMap[contestId] = { ...settings, submissionReviews };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsMap));
}

export function withContestSettings(contest: Contest): Contest {
  const settings = readContestSettings(contest.id);
  if (!settings) return contest;
  return {
    ...contest,
    judgeNames: settings.judgeNames ?? contest.judgeNames,
    status: settings.lifecycleStatus ?? contest.status,
    name: settings.name,
    description: settings.description,
    tags: settings.tags,
    startDate: settings.startDate,
    endDate: settings.endDate,
    prizes: settings.prizes,
  };
}
