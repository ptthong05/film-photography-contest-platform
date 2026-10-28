import type {
  AssignedSubmission,
  ContestResultEntry,
  Evaluation,
  EvaluationHistoryItem,
  EvaluationRequest,
  JudgeContest,
  JudgeNotification,
  JudgeProfile,
  JudgeProfileChanges,
  JudgeStats,
} from '../types/judge';
import { getSession, updateSessionUser } from '../utils/authSession';
import { request } from './apiClient';
import { authService } from './authService';
import { mockNotifications, mockProfile } from './judgeMockData';

/*
 * Cuộc thi, bài dự thi, phiếu chấm gọi API /judges/me — backend chỉ trả bài được phân công cho giám khảo
 * đang đăng nhập (bài khác trả 404). Hồ sơ chuyên môn, thông báo, kết quả chung cuộc: backend chưa có module
 * nên tạm dùng dữ liệu mẫu trong bộ nhớ.
 */

const MOCK_LATENCY_MS = 250;

function respond<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), MOCK_LATENCY_MS);
  });
}

/** Họ tên, email, SĐT là thông tin tài khoản đăng nhập nên lấy từ phiên hiện tại; chưa đăng nhập thì dùng dữ liệu mẫu. */
function withAccountInfo(profile: JudgeProfile): JudgeProfile {
  const user = getSession()?.user;
  if (!user) {
    return profile;
  }
  return { ...profile, fullName: user.name, email: user.email, phone: user.phone ?? '' };
}

function submissionPath(submissionId: string) {
  return `/judges/me/submissions/${encodeURIComponent(submissionId)}`;
}

export const judgeService = {
  /** GET /judges/me (chưa có API — dữ liệu mẫu + thông tin tài khoản thật) */
  getProfile: (): Promise<JudgeProfile> => respond(withAccountInfo(mockProfile)),

  /**
   * Họ tên/email/SĐT lưu vào tài khoản qua PUT /auth/me để đăng nhập được bằng thông tin mới.
   * Các trường còn lại: PATCH /judges/me (backend chưa có nên tạm lưu vào dữ liệu mẫu).
   */
  updateProfile: async (changes: JudgeProfileChanges): Promise<JudgeProfile> => {
    if (getSession()) {
      const user = await authService.updateCurrentUser({ name: changes.fullName, email: changes.email, phone: changes.phone });
      updateSessionUser(user);
    }
    Object.assign(mockProfile, changes);
    return respond(withAccountInfo(mockProfile));
  },

  getEvaluations: () => request<Evaluation[]>('/judges/me/evaluations'),

  /** Tính từ dữ liệu thật thay vì gọi riêng GET /judges/me/stats để số liệu luôn khớp các trang khác */
  getStats: async (): Promise<JudgeStats> => {
    const [contests, submissions, evaluations] = await Promise.all([
      judgeService.getContests(),
      judgeService.getAssignedSubmissions(),
      judgeService.getEvaluations(),
    ]);
    return {
      assignedContests: contests.length,
      pendingSubmissions: submissions.filter((item) => item.evaluationStatus !== 'FINALIZED').length,
      evaluatedSubmissions: submissions.filter((item) => item.evaluationStatus === 'FINALIZED').length,
      awaitingNextRound: evaluations.filter((item) => item.status === 'FINALIZED' && item.recommendNextRound).length,
    };
  },

  getContests: () => request<JudgeContest[]>('/judges/me/contests'),

  /** Chỉ các bài thuộc phạm vi được phân công (BR-006) */
  getAssignedSubmissions: () => request<AssignedSubmission[]>('/judges/me/submissions'),

  getSubmission: (submissionId: string) => request<AssignedSubmission>(submissionPath(submissionId)),

  /** null khi chưa chấm (backend trả body rỗng) */
  getEvaluation: (submissionId: string) => request<Evaluation | null>(`${submissionPath(submissionId)}/evaluation`),

  /** Phiếu đã gửi chính thức thì bị khóa — backend trả 409 */
  saveEvaluation: (submissionId: string, body: EvaluationRequest) =>
    request<Evaluation>(`${submissionPath(submissionId)}/evaluation`, { method: 'PUT', body: JSON.stringify(body) }),

  getEvaluationHistory: (submissionId: string) =>
    request<EvaluationHistoryItem[]>(`${submissionPath(submissionId)}/evaluation-history`),

  /** GET /contests/{contestId}/results — backend chưa có module kết quả nên trả rỗng (BR-008) */
  getContestResults: (contestId: string): Promise<ContestResultEntry[]> => {
    void contestId;
    return respond([]);
  },

  /** GET /notifications (chưa có API — dữ liệu mẫu) */
  getNotifications: (): Promise<JudgeNotification[]> => respond(mockNotifications),

  /** PATCH /notifications/read-all (chưa có API — dữ liệu mẫu) */
  markAllNotificationsRead: (): Promise<void> => {
    mockNotifications.forEach((item) => {
      item.isRead = true;
    });
    return respond(undefined);
  },
};
