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
  JudgingCriterion,
} from '../types/judge';
import { calculateWeightedScore } from '../utils/calculateScore';
import { MOCK_CONTESTS } from '../mocks/organizerData';
import { isJudgingDeadlinePassed } from './contestSyncService';
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
 * Backend chưa có module judging nên service tạm dùng dữ liệu mẫu trong bộ nhớ kết hợp localStorage.
 * Cho phép phân công từ Organizer đồng bộ sang Judge theo thời gian thực.
 */

const MOCK_LATENCY_MS = 250;
const JUDGE_NOTIFS_STORAGE_KEY = 'filmcontest.judge.notifications.v1';
const JUDGE_PROFILE_STORAGE_KEY = 'judge_profile';
const JUDGE_EVALUATIONS_STORAGE_KEY = 'filmcontest.judge.evaluations.v1';

interface ContestSettingRecord {
  judgeNames?: string[];
  criteria?: string[];
}

interface AssignmentRecord {
  contestId?: string;
  judgeId?: string;
  submissionIds?: string[];
}

interface PublishedResultRecord {
  contestId?: string;
  contestTitle?: string;
  title: string;
  authorName?: string;
  score: number;
  awardLabel?: string;
}

interface ParticipantEntryRecord {
  id: string;
  contestId?: string;
  contestTitle?: string;
  contestName?: string;
  status?: string;
  photoUrl?: string;
  imageUrl?: string;
  title?: string;
  authorName?: string;
  category?: string;
  description?: string;
  submittedAt?: string;
  filmBrand?: string;
  iso?: number | string;
  cameraBody?: string;
  lens?: string;
  filmFormat?: string;
  frameNumber?: string | number;
  shootingLocation?: string;
  location?: string;
  developingLab?: string;
  lab?: string;
  scanningSpecs?: string;
  scanSpec?: string;
  metadata?: {
    filmStock?: string;
    iso?: number | string;
    cameraBody?: string;
    lens?: string;
    filmFormat?: string;
    frameNumber?: string | number;
  };
}

export function loadStoredEvaluations(): Evaluation[] {
  try {
    const raw = localStorage.getItem(JUDGE_EVALUATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map<string, Evaluation>();
        for (const item of mockEvaluations) map.set(item.submissionId, item);
        for (const item of parsed) map.set(item.submissionId, item);
        return Array.from(map.values());
      }
    }
  } catch {}
  return [...mockEvaluations];
}

export function saveStoredEvaluations(evaluations: Evaluation[]) {
  try {
    localStorage.setItem(JUDGE_EVALUATIONS_STORAGE_KEY, JSON.stringify(evaluations));
  } catch {}
}

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

function loadStoredProfile(): JudgeProfile {
  try {
    let directAvatar: string | null = null;
    const storedAvatar = localStorage.getItem('judge_avatar');
    if (storedAvatar && storedAvatar.startsWith('data:image/')) {
      directAvatar = storedAvatar;
    }
    const raw = localStorage.getItem(JUDGE_PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...mockProfile,
        ...parsed,
        avatarUrl: directAvatar || parsed.avatarUrl || mockProfile.avatarUrl,
      };
    }
    if (directAvatar) {
      return { ...mockProfile, avatarUrl: directAvatar };
    }
  } catch {
    // fallback to mockProfile
  }
  return mockProfile;
}

function loadStoredNotifications(): JudgeNotification[] {
  try {
    const raw = localStorage.getItem(JUDGE_NOTIFS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...mockNotifications];
}

export function addJudgeNotification(notif: { message: string; type?: JudgeNotification['type'] }) {
  const item: JudgeNotification = {
    id: `nt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: notif.type ?? 'ASSIGNMENT',
    message: notif.message,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  mockNotifications.unshift(item);
  try {
    const list = loadStoredNotifications();
    list.unshift(item);
    localStorage.setItem(JUDGE_NOTIFS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function findEvaluation(submissionId: string) {
  const all = loadStoredEvaluations();
  return all.find((item) => item.submissionId === submissionId);
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

function generateSubmissionsForContest(contestId: string, contestTitle: string, roundId: string, roundName: string): (typeof mockSubmissions)[number][] {
  return [
    {
      id: `sb-${contestId}-1`,
      contestId,
      contestTitle,
      roundId,
      roundName,
      title: 'Khoảnh khắc ban mai',
      authorName: 'Nguyễn Minh Trí',
      category: 'Đời sống',
      description: 'Ghi lại nhịp sống đầu ngày với ánh sáng tự nhiên dịu nhẹ.',
      submittedAt: '2026-09-15',
      imageUrls: ['https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80'],
      thumbnailUrls: ['https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80'],
      negativeUrls: ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=360&q=80'],
      contactSheetUrl: null,
      metadata: {
        filmStock: 'Kodak Portra 400',
        iso: 400,
        cameraBody: 'Canon AE-1',
        lens: '50mm f/1.8',
        filmFormat: '35mm',
        frameNumber: '14',
        shootingDate: '2026-09-10',
        shootingLocation: 'Hà Nội',
        developingLab: 'Lab Hà Nội',
        scanSpec: 'Noritsu HS-1800',
      },
    },
    {
      id: `sb-${contestId}-2`,
      contestId,
      contestTitle,
      roundId,
      roundName,
      title: 'Hơi thở phố thị',
      authorName: 'Lê Hoàng Nam',
      category: 'Đường phố',
      description: 'Góc phố cổ kính dưới bóng râm chiều tà.',
      submittedAt: '2026-09-18',
      imageUrls: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'],
      thumbnailUrls: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80'],
      negativeUrls: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=360&q=80'],
      contactSheetUrl: null,
      metadata: {
        filmStock: 'Ilford HP5 Plus',
        iso: 400,
        cameraBody: 'Nikon FM2',
        lens: '35mm f/2',
        filmFormat: '35mm',
        frameNumber: '22',
        shootingDate: '2026-09-12',
        shootingLocation: 'TP. Hồ Chí Minh',
        developingLab: 'Lab Sài Gòn',
        scanSpec: 'Fuji Frontier SP-3000',
      },
    },
    {
      id: `sb-${contestId}-3`,
      contestId,
      contestTitle,
      roundId,
      roundName,
      title: 'Ký ức thời gian',
      authorName: 'Phạm Thu Trang',
      category: 'Nghệ thuật',
      description: 'Vẻ đẹp tĩnh lặng của không gian xưa cũ qua lăng kính analog.',
      submittedAt: '2026-09-20',
      imageUrls: ['https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80'],
      thumbnailUrls: ['https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80'],
      negativeUrls: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=360&q=80'],
      contactSheetUrl: null,
      metadata: {
        filmStock: 'Fujifilm C200',
        iso: 200,
        cameraBody: 'Olympus OM-1',
        lens: '50mm f/1.4',
        filmFormat: '35mm',
        frameNumber: '08',
        shootingDate: '2026-09-14',
        shootingLocation: 'Huế',
        developingLab: 'Lab Miền Trung',
        scanSpec: 'Noritsu HS-1800',
      },
    },
  ];
}

function getAssignedContestsForJudge(): JudgeContest[] {
  const currentProfile = loadStoredProfile();
  const judgeFullName = currentProfile.fullName || 'Trần Thị Bình';

  const allOrganizerContests = [...MOCK_CONTESTS];
  try {
    const rawCopies = localStorage.getItem("filmcontest.organizer.contest-list.v1");
    if (rawCopies) {
      const parsed = JSON.parse(rawCopies);
      if (Array.isArray(parsed?.copies)) {
        allOrganizerContests.push(...parsed.copies);
      }
    }
  } catch {}

  let settingsMap: Record<string, ContestSettingRecord> = {};
  try {
    const rawSettings = localStorage.getItem("filmcontest.organizer.contest-settings.v1");
    if (rawSettings) settingsMap = JSON.parse(rawSettings);
  } catch {}

  const result: JudgeContest[] = [];

  for (const oc of allOrganizerContests) {
    const setting = settingsMap[oc.id];
    const judgeNames: string[] = setting?.judgeNames ?? oc.judgeNames ?? [];
    let isAssigned = judgeNames.includes(judgeFullName);

    if (!isAssigned) {
      try {
        const rawAsg = localStorage.getItem("filmcontest.organizer.assignments.v1");
        if (rawAsg) {
          const asgList: AssignmentRecord[] = JSON.parse(rawAsg);
          isAssigned = asgList.some((a) =>
            a.contestId === oc.id &&
            (a.judgeId === currentProfile.id || a.judgeId === 'j-binh' || a.judgeId === 'judge-01' || a.judgeId?.toLowerCase().includes('binh'))
          );
        }
      } catch {}
    }

    if (!isAssigned) continue;

    let isPub = oc.status === 'ENDED';
    try {
      const pubContestsRaw = localStorage.getItem("filmcontest.published-contests.v1");
      if (pubContestsRaw) {
        const pubIds = JSON.parse(pubContestsRaw);
        if (Array.isArray(pubIds) && (pubIds.includes(oc.id) || pubIds.includes(oc.name))) {
          isPub = true;
        }
      }
      const rawRes = localStorage.getItem('filmcontest.published_results.v2');
      if (rawRes) {
        const parsedRes: PublishedResultRecord[] = JSON.parse(rawRes);
        if (Array.isArray(parsedRes) && parsedRes.some((p) => p.contestId === oc.id || p.contestTitle === oc.name)) {
          isPub = true;
        }
      }
    } catch {}

    const contestStatus: JudgeContest['status'] = isPub ? 'COMPLETED' : 'JUDGING';

    const matchedMock = mockContests.find((mc) => mc.id === oc.id || mc.title.toLowerCase() === oc.name.toLowerCase());
    if (matchedMock) {
      const base = { ...matchedMock, status: contestStatus, isResultPublished: isPub };
      result.push(buildContest(base));
    } else {
      const settingCriteria = setting?.criteria;
      const criteria: JudgingCriterion[] = (settingCriteria && Array.isArray(settingCriteria) && settingCriteria.length > 0)
        ? settingCriteria.map((c: string, idx: number) => ({
            id: `cr-gen-${idx}`,
            name: c,
            description: `Tiêu chí đánh giá chuyên môn: ${c}`,
            maxScore: 10,
            weight: Math.round(100 / settingCriteria.length),
          }))
        : [
            { id: 'cr-1', name: 'Bố cục & Ánh sáng', description: 'Đường dẫn, cân bằng khung hình và kiểm soát ánh sáng', maxScore: 10, weight: 30 },
            { id: 'cr-2', name: 'Cảm xúc & Kể chuyện', description: 'Nội dung, thông điệp và cảm xúc của bức ảnh', maxScore: 10, weight: 30 },
            { id: 'cr-3', name: 'Xử lý phòng tối & Grain', description: 'Đặc trưng hạt phim, dải tông và kỹ thuật tráng scan', maxScore: 10, weight: 20 },
            { id: 'cr-4', name: 'Sáng tạo & Độc bản', description: 'Góc nhìn mới lạ, tính nguyên bản của nhiếp ảnh phim', maxScore: 10, weight: 20 },
          ];

      const synthesized = {
        id: oc.id,
        title: oc.name,
        coverUrl: oc.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
        startDate: oc.startDate,
        endDate: oc.endDate,
        status: (isPub ? 'COMPLETED' : 'JUDGING') as JudgeContest['status'],
        currentRound: {
          id: `rd-${oc.id}`,
          name: isPub ? 'Vòng chung khảo (Đã kết thúc)' : 'Vòng chấm điểm chuyên môn',
          order: 1,
          startDate: oc.startDate,
          endDate: oc.endDate || '2026-12-31',
        },
        criteria,
        isResultPublished: isPub,
      };
      result.push(buildContest(synthesized));
    }
  }

  for (const mc of mockContests) {
    if (!result.some((r) => r.id === mc.id || r.title.toLowerCase() === mc.title.toLowerCase())) {
      const matchingOc = allOrganizerContests.find((oc) => oc.name.toLowerCase() === mc.title.toLowerCase());
      if (matchingOc) {
        const setting = settingsMap[matchingOc.id];
        const judgeNames: string[] = setting?.judgeNames ?? matchingOc.judgeNames ?? [];
        if (!judgeNames.includes(judgeFullName)) {
          continue;
        }
      }
      result.push(buildContest(mc));
    }
  }

  return result;
}

export function getAllJudgeAssignedSubmissions(): AssignedSubmission[] {
  return getAllAssignedSubmissions();
}

export function getAllJudgeAssignedContests(): JudgeContest[] {
  return getAssignedContestsForJudge();
}

function getAllAssignedSubmissions(): AssignedSubmission[] {
  const contests = getAssignedContestsForJudge();
  const contestIds = new Set(contests.map((c) => c.id));
  const contestTitles = new Set(contests.map((c) => c.title.toLowerCase()));

  // Đọc các bài được phân công cụ thể qua ManagedAssignments
  const directlyAssignedSubIds = new Set<string>();
  const currentProfile = loadStoredProfile();
  try {
    const rawAsg = localStorage.getItem("filmcontest.organizer.assignments.v1");
    if (rawAsg) {
      const asgList: AssignmentRecord[] = JSON.parse(rawAsg);
      for (const a of asgList) {
        if (a.judgeId === currentProfile.id || a.judgeId === 'j-binh' || a.judgeId === 'judge-01' || a.judgeId?.toLowerCase().includes('binh')) {
          if (Array.isArray(a.submissionIds)) {
            a.submissionIds.forEach((id: string) => directlyAssignedSubIds.add(id));
          }
        }
      }
    }
  } catch {}

  const result: AssignedSubmission[] = [];

  // 1. Đọc các bài nộp phát sinh từ thí sinh qua participant_entries
  try {
    const raw = localStorage.getItem('participant_entries');
    if (raw) {
      const pEntries: ParticipantEntryRecord[] = JSON.parse(raw);
      for (const p of pEntries) {
        if (!p || !p.id) continue;
        const matchesContest = contestIds.has(p.contestId ?? '') || contestTitles.has((p.contestTitle || p.contestName || '').toLowerCase());
        const isDirectlyAssigned = directlyAssignedSubIds.has(p.id);
        const isApproved = p.status === 'Đã duyệt' || p.status === 'Hợp lệ';

        // Bài nộp được hiển thị cho Giám khảo nếu:
        // - Thuộc cuộc thi được phân công VÀ đã được duyệt
        // - HOẶC được phân công trực tiếp trong ManagedAssignments
        if ((matchesContest && isApproved) || isDirectlyAssigned) {
          const photoUrl = p.photoUrl || p.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80';
          const pSub: (typeof mockSubmissions)[number] = {
            id: p.id,
            contestId: p.contestId || 'CT-2026-001',
            contestTitle: p.contestTitle || p.contestName || 'Cuộc thi nhiếp ảnh phim',
            roundId: `rd-${p.contestId || 'round'}`,
            roundName: 'Vòng chấm điểm chuyên môn',
            title: p.title || 'Tác phẩm phim',
            authorName: p.authorName || 'Hồ Thanh Bình (Thí sinh)',
            category: p.category || 'Đời sống',
            description: p.description || 'Tác phẩm ảnh phim do thí sinh gửi dự thi.',
            submittedAt: p.submittedAt || new Date().toISOString().slice(0, 10),
            imageUrls: [photoUrl],
            thumbnailUrls: [photoUrl],
            negativeUrls: [photoUrl],
            contactSheetUrl: null,
            metadata: {
              filmStock: p.filmBrand || p.metadata?.filmStock || 'Kodak Portra 400',
              iso: Number(p.iso || p.metadata?.iso || 400),
              cameraBody: p.cameraBody || p.metadata?.cameraBody || 'Canon AE-1',
              lens: p.lens || p.metadata?.lens || '50mm f/1.8',
              filmFormat: p.filmFormat || p.metadata?.filmFormat || '35mm',
              frameNumber: String(p.frameNumber || p.metadata?.frameNumber || '01'),
              shootingDate: p.submittedAt || '2026-09-10',
              shootingLocation: p.shootingLocation || p.location || 'Việt Nam',
              developingLab: p.developingLab || p.lab || 'Lab Sài Gòn',
              scanSpec: p.scanningSpecs || p.scanSpec || 'Noritsu HS-1800',
            },
          };
          if (!result.some((r) => r.id === p.id)) {
            result.push(buildSubmission(pSub));
          }
        }
      }
    }
  } catch (err) {
    console.error('Error reading participant entries for judge:', err);
  }

  // 2. Thêm các bài mock submissions thuộc cuộc thi được phân công
  for (const sub of mockSubmissions) {
    if (contestIds.has(sub.contestId) || contestTitles.has(sub.contestTitle.toLowerCase()) || directlyAssignedSubIds.has(sub.id)) {
      if (!result.some((r) => r.id === sub.id)) {
        result.push(buildSubmission(sub));
      }
    }
  }

  // 3. Fallback sinh dữ liệu mẫu nếu cuộc thi chưa có bài thi nào
  for (const c of contests) {
    const hasSubmissions = result.some((s) => s.contestId === c.id || s.contestTitle.toLowerCase() === c.title.toLowerCase());
    if (!hasSubmissions) {
      const demoSubs = generateSubmissionsForContest(c.id, c.title, c.currentRound.id, c.currentRound.name);
      for (const d of demoSubs) {
        if (!mockSubmissions.some((m) => m.id === d.id)) {
          mockSubmissions.push(d);
        }
        if (!result.some((r) => r.id === d.id)) {
          result.push(buildSubmission(d));
        }
      }
    }
  }

  // Ưu tiên sắp xếp bài nộp mới nhất lên đầu tiên
  result.sort((a, b) => {
    const numA = Number(a.id.replace(/\D/g, "")) || 0;
    const numB = Number(b.id.replace(/\D/g, "")) || 0;
    if (numA > 1000000000 || numB > 1000000000) return numB - numA;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  return result;
}

export const judgeService = {
  /** GET /judges/me */
  getProfile: (): Promise<JudgeProfile> => {
    const current = loadStoredProfile();
    Object.assign(mockProfile, current);
    return respond(mockProfile);
  },

  /** PATCH /judges/me — email do Admin quản lý nên không cho sửa */
  updateProfile: (changes: Partial<JudgeProfile>): Promise<JudgeProfile> => {
    Object.assign(mockProfile, changes);
    try {
      localStorage.setItem(JUDGE_PROFILE_STORAGE_KEY, JSON.stringify(mockProfile));
    } catch {
      // ignore storage error
    }
    return respond(mockProfile);
  },

  /** GET /judges/me/evaluations */
  getEvaluations: (): Promise<Evaluation[]> => respond(mockEvaluations),

  /** GET /judges/me/stats */
  getStats: (): Promise<JudgeStats> => {
    const contests = getAssignedContestsForJudge();
    const submissions = getAllAssignedSubmissions();
    return respond({
      assignedContests: contests.filter((item) => item.status !== 'COMPLETED').length,
      pendingSubmissions: submissions.filter((item) => item.evaluationStatus !== 'FINALIZED').length,
      evaluatedSubmissions: submissions.filter((item) => item.evaluationStatus === 'FINALIZED').length,
      awaitingNextRound: mockEvaluations.filter((item) => item.status === 'FINALIZED' && item.recommendNextRound).length,
    });
  },

  /** GET /judges/me/contests */
  getContests: (): Promise<JudgeContest[]> => respond(getAssignedContestsForJudge()),

  /** GET /judges/me/submissions — chỉ trả các bài thuộc phạm vi được phân công (BR-006) */
  getAssignedSubmissions: (): Promise<AssignedSubmission[]> => respond(getAllAssignedSubmissions()),

  /** GET /judges/me/submissions/{submissionId} */
  getSubmission: (submissionId: string): Promise<AssignedSubmission> => {
    const all = getAllAssignedSubmissions();
    const submission = all.find((item) => item.id === submissionId);
    return submission ? respond(submission) : fail('Không tìm thấy bài dự thi được phân công');
  },

  /** GET /judges/me/submissions/{submissionId}/evaluation */
  getEvaluation: (submissionId: string): Promise<Evaluation | null> => respond(findEvaluation(submissionId) ?? null),

  /**
   * PUT /judges/me/submissions/{submissionId}/evaluation
   * Phiếu đã gửi chính thức thì bị khóa — backend trả 409.
   */
  saveEvaluation: (submissionId: string, request: EvaluationRequest): Promise<Evaluation> => {
    const all = getAllAssignedSubmissions();
    const submission = all.find((item) => item.id === submissionId);
    const contests = getAssignedContestsForJudge();
    const contest = contests.find((item) => item.id === submission?.contestId || item.title.toLowerCase() === submission?.contestTitle.toLowerCase());
    if (!submission || !contest) {
      return fail('Không tìm thấy bài dự thi được phân công');
    }

    // Kiểm tra thời hạn chấm điểm (Set giờ thật / Hạn chót chấm)
    if (isJudgingDeadlinePassed({ id: contest.id, judgingEndDate: contest.currentRound?.endDate || contest.endDate })) {
      return fail('Đã hết thời hạn chấm điểm cho cuộc thi này. Cổng chấm điểm của Giám khảo đã khóa theo quy định.');
    }

    const deadline = contest.currentRound?.endDate ? new Date(contest.currentRound.endDate) : null;
    if (deadline) {
      if (contest.currentRound.endDate.length <= 10) deadline.setHours(23, 59, 59, 999);
      if (new Date().getTime() > deadline.getTime()) {
        return fail('Đã hết thời hạn chấm điểm cho vòng thi này. Cổng chấm điểm đã đóng.');
      }
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
    const evaluations = loadStoredEvaluations();
    const existingIndex = evaluations.findIndex((item) => item.submissionId === submissionId);
    if (existingIndex >= 0) {
      evaluations[existingIndex] = evaluation;
    } else {
      evaluations.push(evaluation);
    }
    saveStoredEvaluations(evaluations);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('filmcontest:judging-updated'));
      window.dispatchEvent(new Event('storage'));
    }

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
    const all = getAllAssignedSubmissions();
    const submission = all.find((item) => item.id === submissionId);
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

  /** GET /contests/{contestId}/results — chỉ có dữ liệu khi Organizer đã công bố (BR-008), mỗi giải 1 bài, đúng 4 giải 4 bài */
  getContestResults: (contestId: string): Promise<ContestResultEntry[]> => {
    try {
      const raw = localStorage.getItem('filmcontest.published_results.v2');
      if (raw) {
        const parsed: PublishedResultRecord[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const contestMatches = parsed.filter(
            (p) => p.contestId === contestId || p.contestTitle?.toLowerCase() === contestId.toLowerCase()
          );
          if (contestMatches.length > 0) {
            const top4 = [...contestMatches].sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0)).slice(0, 4);
            const awardLabels = ['Giải Nhất', 'Giải Nhì', 'Giải Ba', 'Giải Khuyến khích'];
            const entries: ContestResultEntry[] = top4.map((item, idx) => ({
              rank: idx + 1,
              submissionTitle: item.title || 'Tác phẩm',
              authorName: item.authorName || 'Thí sinh',
              averageScore: Number(item.score ?? 0),
              award: item.awardLabel || awardLabels[idx] || `Giải ${idx + 1}`,
            }));
            return respond(entries);
          }
        }
      }
    } catch {}

    const fallback = mockResults[contestId];
    if (fallback && fallback.length > 0) {
      const top4Fallback = fallback.slice(0, 4).map((f, idx) => ({
        ...f,
        rank: idx + 1,
        award: f.award || (idx === 0 ? 'Giải Nhất' : idx === 1 ? 'Giải Nhì' : idx === 2 ? 'Giải Ba' : 'Giải Khuyến khích'),
      }));
      return respond(top4Fallback);
    }

    return respond([]);
  },

  /** GET /notifications */
  getNotifications: (): Promise<JudgeNotification[]> => respond(loadStoredNotifications()),

  /** PATCH /notifications/read-all */
  markAllNotificationsRead: (): Promise<void> => {
    const list = loadStoredNotifications();
    list.forEach((item) => {
      item.isRead = true;
    });
    mockNotifications.forEach((item) => {
      item.isRead = true;
    });
    try {
      localStorage.setItem(JUDGE_NOTIFS_STORAGE_KEY, JSON.stringify(list));
    } catch {}
    return respond(undefined);
  },
};
