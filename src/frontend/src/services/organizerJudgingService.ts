import type { Contest, ContestStatus } from '../types/contest';
import type { JudgingCriterion } from '../types/judge';
import type {
  AssignmentSetup,
  ContestScoring,
  CriterionDraft,
  JudgeAssignmentRecord,
  PrizeRank,
  PublishedResult,
  SubmissionSummary,
} from '../types/judgingAdmin';
import type { Judge } from '../types/organizerUser';
import type { Submission } from '../types/submission';
import { request } from './apiClient';

/*
 * API chấm thi phía Ban tổ chức: phân công, tiêu chí, tổng hợp điểm và công bố kết quả (backend TV04).
 * Dữ liệu được đổi sang kiểu Contest / Judge / Submission sẵn có để giữ nguyên giao diện.
 */

/** ContestResponse của backend (tv2) */
interface ApiContest {
  id: number;
  title: string;
  description: string | null;
  bannerUrl: string | null;
  organizer: string | null;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
}

/** UserResponse của backend */
interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'JUDGE' | 'PARTICIPANT';
  status: string;
}

const CONTEST_STATUS: Record<ApiContest['status'], ContestStatus> = {
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ONGOING',
  ENDED: 'ENDED',
};
const MISSING_VALUE = '—';

function toContest(item: ApiContest): Contest {
  return {
    id: String(item.id),
    name: item.title,
    title: item.title,
    startDate: item.startDate,
    endDate: item.endDate,
    // Backend chưa trả số liệu tổng hợp theo cuộc thi
    participantCount: 0,
    submissionCount: 0,
    status: CONTEST_STATUS[item.status] ?? 'UPCOMING',
    description: item.description ?? undefined,
    organizer: item.organizer ?? undefined,
    image: item.bannerUrl ?? undefined,
  };
}

function toJudge(user: ApiUser): Judge {
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    // User chưa có trường chuyên môn
    specialty: 'Giám khảo',
    contestCount: 0,
    status: user.status === 'ACTIVE' ? 'ACTIVE' : 'LOCKED',
    isDefault: false,
  };
}

/** Đổi bài rút gọn của backend sang kiểu Submission mà các màn hình Ban tổ chức đang dùng */
export function toSubmission(item: SubmissionSummary, contest: { id: string; name: string }): Submission {
  return {
    id: item.id,
    code: item.code,
    title: item.title,
    // Tên thí sinh không gửi kèm khi phân công để tránh lộ danh tính cho khâu chấm
    authorName: MISSING_VALUE,
    contestId: contest.id,
    contestName: contest.name,
    submittedAt: item.submittedAt,
    status: 'VALID',
    category: item.category ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
    metadata: {
      filmStock: item.filmStock ?? MISSING_VALUE,
      iso: MISSING_VALUE,
      camera: item.camera ?? MISSING_VALUE,
      lens: MISSING_VALUE,
      format: MISSING_VALUE,
      rollCode: MISSING_VALUE,
      frame: MISSING_VALUE,
      location: MISSING_VALUE,
      lab: MISSING_VALUE,
      scan: MISSING_VALUE,
      negative: MISSING_VALUE,
    },
  };
}

function contestPath(contestId: string, suffix: string): string {
  return `/contests/${encodeURIComponent(contestId)}${suffix}`;
}

export const organizerJudgingService = {
  getContests: async (): Promise<Contest[]> => (await request<ApiContest[]>('/contests')).map(toContest),

  getJudges: async (): Promise<Judge[]> =>
    (await request<ApiUser[]>('/users')).filter((user) => user.role === 'JUDGE').map(toJudge),

  getAssignments: (): Promise<JudgeAssignmentRecord[]> => request<JudgeAssignmentRecord[]>('/assignments'),

  getSetup: (contestId: string): Promise<AssignmentSetup> =>
    request<AssignmentSetup>(`/assignments/setup?contestId=${encodeURIComponent(contestId)}`),

  /** deadline (yyyy-MM-dd): tạo vòng chấm nếu cuộc thi chưa có, hoặc dời ngày kết thúc của vòng */
  assign: (body: { contestId: string; judgeId: string; submissionIds: string[]; deadline?: string }) =>
    request<JudgeAssignmentRecord>('/assignments', { method: 'POST', body: JSON.stringify(body) }),

  reassign: (assignmentId: string, judgeId: string) =>
    request<JudgeAssignmentRecord>(`/assignments/${encodeURIComponent(assignmentId)}/judge`, {
      method: 'PUT',
      body: JSON.stringify({ judgeId }),
    }),

  remind: (assignmentId: string) =>
    request<JudgeAssignmentRecord>(`/assignments/${encodeURIComponent(assignmentId)}/remind`, { method: 'POST' }),

  revoke: (assignmentId: string) =>
    request<void>(`/assignments/${encodeURIComponent(assignmentId)}`, { method: 'DELETE' }),

  saveCriteria: (contestId: string, criteria: CriterionDraft[]) =>
    request<JudgingCriterion[]>(contestPath(contestId, '/criteria'), {
      method: 'PUT',
      body: JSON.stringify({ criteria }),
    }),

  getScoring: (contestId: string) => request<ContestScoring>(contestPath(contestId, '/scoring')),

  publish: (contestId: string, awards: { submissionId: string; prizeRank: PrizeRank }[]) =>
    request<ContestScoring>(contestPath(contestId, '/results'), {
      method: 'POST',
      body: JSON.stringify({ awards }),
    }),

  unpublish: (contestId: string) => request<void>(contestPath(contestId, '/results'), { method: 'DELETE' }),

  getResults: (contestId: string) => request<PublishedResult[]>(contestPath(contestId, '/results')),
};
