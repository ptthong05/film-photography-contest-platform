import type {
  AssignedSubmission,
  ContestResultEntry,
  Evaluation,
  EvaluationHistoryItem,
  EvaluationRequest,
  JudgeContest,
  JudgeNotification,
  JudgeProfile,
  JudgeStats,
} from '../types/judge';
import { calculateWeightedScore } from '../utils/calculateScore';
import {
  mockContests,
  mockEvaluations,
  mockNotifications,
  mockPreviousRoundHistory,
  mockProfile,
  mockResults,
  mockSubmissions,
} from './judgeMockData';

/*
 * Backend chưa có module judging nên service tạm dùng dữ liệu mẫu trong bộ nhớ.
 * Mỗi hàm ghi endpoint dự kiến; khi backend xong chỉ cần thay thân hàm bằng request() của apiClient,
 * component không phải sửa.
 */

const MOCK_LATENCY_MS = 250;

function respond<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), MOCK_LATENCY_MS);
  });
}

function fail(message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), MOCK_LATENCY_MS);
  });
}

function findEvaluation(submissionId: string) {
  return mockEvaluations.find((item) => item.submissionId === submissionId);
}

function buildSubmission(base: (typeof mockSubmissions)[number]): AssignedSubmission {
  const evaluation = findEvaluation(base.id);
  return {
    ...base,
    evaluationStatus: evaluation?.status ?? 'NOT_STARTED',
    totalScore: evaluation?.status === 'FINALIZED' ? evaluation.totalScore : null,
    evaluatedAt: evaluation?.status === 'FINALIZED' ? evaluation.updatedAt : null,
  };
}

function buildContest(base: (typeof mockContests)[number]): JudgeContest {
  const submissions = mockSubmissions.filter((item) => item.contestId === base.id);
  const evaluatedCount = submissions.filter((item) => findEvaluation(item.id)?.status === 'FINALIZED').length;
  return { ...base, assignedCount: submissions.length, evaluatedCount };
}

export const judgeService = {
  /** GET /judges/me */
  getProfile: (): Promise<JudgeProfile> => respond(mockProfile),

  /** PATCH /judges/me — email do Admin quản lý nên không cho sửa */
  updateProfile: (changes: Pick<JudgeProfile, 'phone' | 'specialty' | 'bio'>): Promise<JudgeProfile> => {
    Object.assign(mockProfile, changes);
    return respond(mockProfile);
  },

  /** GET /judges/me/evaluations */
  getEvaluations: (): Promise<Evaluation[]> => respond(mockEvaluations),

  /** GET /judges/me/stats */
  getStats: (): Promise<JudgeStats> => {
    const contests = mockContests.map(buildContest);
    const submissions = mockSubmissions.map(buildSubmission);
    return respond({
      assignedContests: contests.filter((item) => item.status !== 'COMPLETED').length,
      pendingSubmissions: submissions.filter((item) => item.evaluationStatus !== 'FINALIZED').length,
      evaluatedSubmissions: submissions.filter((item) => item.evaluationStatus === 'FINALIZED').length,
      awaitingNextRound: mockEvaluations.filter((item) => item.status === 'FINALIZED' && item.recommendNextRound).length,
    });
  },

  /** GET /judges/me/contests */
  getContests: (): Promise<JudgeContest[]> => respond(mockContests.map(buildContest)),

  /** GET /judges/me/submissions — chỉ trả các bài thuộc phạm vi được phân công (BR-006) */
  getAssignedSubmissions: (): Promise<AssignedSubmission[]> => respond(mockSubmissions.map(buildSubmission)),

  /** GET /judges/me/submissions/{submissionId} */
  getSubmission: (submissionId: string): Promise<AssignedSubmission> => {
    const submission = mockSubmissions.find((item) => item.id === submissionId);
    return submission ? respond(buildSubmission(submission)) : fail('Không tìm thấy bài dự thi được phân công');
  },

  /** GET /judges/me/submissions/{submissionId}/evaluation */
  getEvaluation: (submissionId: string): Promise<Evaluation | null> => respond(findEvaluation(submissionId) ?? null),

  /**
   * PUT /judges/me/submissions/{submissionId}/evaluation
   * Phiếu đã gửi chính thức thì bị khóa — backend trả 409.
   */
  saveEvaluation: (submissionId: string, request: EvaluationRequest): Promise<Evaluation> => {
    const submission = mockSubmissions.find((item) => item.id === submissionId);
    const contest = mockContests.find((item) => item.id === submission?.contestId);
    if (!submission || !contest) {
      return fail('Không tìm thấy bài dự thi được phân công');
    }

    const existing = findEvaluation(submissionId);
    if (existing?.status === 'FINALIZED') {
      return fail('Phiếu chấm đã được gửi chính thức, không thể chỉnh sửa');
    }

    const totalScore = calculateWeightedScore(contest.criteria, request.scores);
    if (request.isFinal && (totalScore === null || request.comment.trim() === '')) {
      return fail('Vui lòng chấm đủ tất cả tiêu chí và nhập nhận xét trước khi gửi');
    }

    const evaluation: Evaluation = {
      submissionId,
      roundId: submission.roundId,
      scores: request.scores,
      comment: request.comment,
      recommendNextRound: request.recommendNextRound,
      status: request.isFinal ? 'FINALIZED' : 'DRAFT',
      totalScore: request.isFinal ? totalScore : null,
      updatedAt: new Date().toISOString(),
    };
    if (existing) {
      Object.assign(existing, evaluation);
    } else {
      mockEvaluations.push(evaluation);
    }
    return respond(evaluation);
  },

  /** GET /judges/me/submissions/{submissionId}/evaluation-history */
  getEvaluationHistory: (submissionId: string): Promise<EvaluationHistoryItem[]> => {
    const history = [...(mockPreviousRoundHistory[submissionId] ?? [])];
    const current = findEvaluation(submissionId);
    const submission = mockSubmissions.find((item) => item.id === submissionId);
    if (current?.status === 'FINALIZED' && current.totalScore !== null && current.updatedAt && submission) {
      history.push({
        roundName: submission.roundName,
        totalScore: current.totalScore,
        comment: current.comment,
        recommendNextRound: current.recommendNextRound,
        evaluatedAt: current.updatedAt,
      });
    }
    return respond(history);
  },

  /** GET /contests/{contestId}/results — chỉ có dữ liệu khi Organizer đã công bố (BR-008) */
  getContestResults: (contestId: string): Promise<ContestResultEntry[]> => respond(mockResults[contestId] ?? []),

  /** GET /notifications */
  getNotifications: (): Promise<JudgeNotification[]> => respond(mockNotifications),

  /** PATCH /notifications/read-all */
  markAllNotificationsRead: (): Promise<void> => {
    mockNotifications.forEach((item) => {
      item.isRead = true;
    });
    return respond(undefined);
  },
};
