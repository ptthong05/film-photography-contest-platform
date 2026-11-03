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
import { request } from './apiClient';
import { notificationService } from './notificationService';
import { profileService } from './profileService';
import type { ApiContestResult } from './resultService';

/*
 * Cuộc thi, bài dự thi, phiếu chấm gọi API /judges/me — backend chỉ trả bài được phân công cho giám khảo
 * đang đăng nhập (bài khác trả 404). Hồ sơ dùng /auth/me/profile, thông báo dùng /notifications.
 */


function submissionPath(submissionId: string) {
  return `/judges/me/submissions/${encodeURIComponent(submissionId)}`;
}

export const judgeService = {
  getProfile: async (): Promise<JudgeProfile> => {
    const profile = await profileService.getProfile();
    return {
      id: profile.id,
      fullName: profile.name,
      email: profile.email,
      phone: profile.phone ?? '',
      specialty: profile.specialty ?? '',
      yearsOfExperience: profile.yearsOfExperience ?? 0,
      bio: profile.bio ?? '',
      avatarUrl: profile.avatarUrl ?? '',
    };
  },

  /** Họ tên / email / SĐT là thông tin đăng nhập; chuyên môn lưu vào hồ sơ */
  updateProfile: async (changes: JudgeProfileChanges): Promise<JudgeProfile> => {
    await profileService.saveProfile({
      name: changes.fullName,
      email: changes.email,
      phone: changes.phone,
      specialty: changes.specialty,
      yearsOfExperience: changes.yearsOfExperience,
      bio: changes.bio,
    });
    return judgeService.getProfile();
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

  /** Chưa công bố kết quả → mảng rỗng */
  getContestResults: async (contestId: string): Promise<ContestResultEntry[]> => {
    const results = await request<ApiContestResult[]>(`/contests/${contestId}/results`);
    return results.map((item) => ({
      rank: item.rank,
      submissionTitle: item.submissionTitle,
      authorName: item.authorName ?? '',
      averageScore: item.averageScore,
      award: item.awardTitle,
    }));
  },

  getNotifications: async (): Promise<JudgeNotification[]> => {
    const notifications = await notificationService.getMine();
    return notifications.map((item) => ({
      id: item.id,
      type: item.type as JudgeNotification['type'],
      message: item.message,
      createdAt: item.createdAt,
      isRead: item.isRead,
    }));
  },

  markAllNotificationsRead: () => notificationService.markAllRead(),
};
