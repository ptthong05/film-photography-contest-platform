import type {
  AssignedSubmission,
  AwardArchiveItem,
  ContestResultEntry,
  Evaluation,
  EvaluationHistoryItem,
  EvaluationRequest,
  FilmMetadata,
  JudgeContest,
  JudgeNotification,
  JudgeProfile,
  JudgeProfileUpdate,
  JudgeStats,
  JudgingCriterion,
} from '../types/judge';
import { PRIZE_LABELS, type PublishedResult } from '../types/judgingAdmin';
import { MOCK_CONTESTS } from '../mocks/organizerData';
import { request } from './apiClient';
import { authService } from './authService';
import {
  mockContests,
  mockEvaluations,
  mockProfile,
  mockSubmissions,
} from './judgeMockData';

/*
 * Chấm thi (cuộc thi, bài được phân công, phiếu chấm, lịch sử), hồ sơ và thông báo gọi backend /api/judge/me/**.
 * Các hàm export dùng localStorage bên dưới (loadStoredEvaluations, getAllJudgeAssignedSubmissions...)
 * được giữ nguyên cho trang Ban tổ chức đến khi phía đó nối API phân công.
 */

const MISSING_VALUE = '—';
const DEFAULT_COVER_URL = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80';

/** Metadata theo entity FilmMetadata của backend (tv3); mọi trường có thể null vì chưa bắt buộc khi nộp */
interface ApiFilmMetadata {
  filmBrand?: string | null;
  filmStock?: string | null;
  iso?: number | null;
  camera?: string | null;
  lens?: string | null;
  filmFormat?: string | null;
  frameNumber?: string | null;
  shootingDate?: string | null;
  shootingLocation?: string | null;
  developingLab?: string | null;
  scanSpec?: string | null;
}

type ApiAssignedSubmission = Omit<AssignedSubmission, 'metadata'> & { metadata: ApiFilmMetadata | null };
type ApiAwardArchiveItem = Omit<AwardArchiveItem, 'metadata'> & { metadata: ApiFilmMetadata | null };
type ApiJudgeContest = Omit<JudgeContest, 'coverUrl'> & { coverUrl: string | null };

function textOrMissing(value?: string | null): string {
  return value && value.trim() ? value.trim() : MISSING_VALUE;
}

/** Ghép hãng + loại phim ("Kodak" + "Portra 400"), tránh lặp khi loại phim đã chứa tên hãng */
function toFilmStock(brand?: string | null, stock?: string | null): string {
  const cleanBrand = brand?.trim() ?? '';
  const cleanStock = stock?.trim() ?? '';
  if (cleanBrand && cleanStock && !cleanStock.toLowerCase().startsWith(cleanBrand.toLowerCase())) {
    return `${cleanBrand} ${cleanStock}`;
  }
  return textOrMissing(cleanStock || cleanBrand);
}

function toFilmMetadata(metadata: ApiFilmMetadata | null): FilmMetadata {
  const source = metadata ?? {};
  return {
    filmStock: toFilmStock(source.filmBrand, source.filmStock),
    iso: source.iso ?? null,
    cameraBody: textOrMissing(source.camera),
    lens: textOrMissing(source.lens),
    filmFormat: textOrMissing(source.filmFormat),
    frameNumber: textOrMissing(source.frameNumber),
    shootingDate: textOrMissing(source.shootingDate),
    shootingLocation: textOrMissing(source.shootingLocation),
    developingLab: textOrMissing(source.developingLab),
    scanSpec: textOrMissing(source.scanSpec),
  };
}

function toAssignedSubmission(item: ApiAssignedSubmission): AssignedSubmission {
  return { ...item, metadata: toFilmMetadata(item.metadata) };
}

function toJudgeContest(item: ApiJudgeContest): JudgeContest {
  return { ...item, coverUrl: item.coverUrl || DEFAULT_COVER_URL };
}

/** Chuông ở header và trang Tin nhắn cùng tải lại sau khi đánh dấu đã đọc */
function notifyNotificationsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('filmcontest:judge-notifications-changed'));
  }
}

/** Báo cho các màn hình đang mở (danh sách bài, trang chấm) tải lại sau khi lưu phiếu */
function notifyJudgingUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('filmcontest:judging-updated'));
  }
}
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

function loadStoredProfile(): JudgeProfile {
  try {
    const authUser = authService.getCurrentUser();
    const raw = localStorage.getItem(JUDGE_PROFILE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const storedAvatar = (typeof window !== 'undefined' ? localStorage.getItem('judge_avatar') : null)
      || (typeof parsed.avatarUrl === 'string' && parsed.avatarUrl ? parsed.avatarUrl : null);
    const directAvatar: string | null = authUser?.avatar || authUser?.avatarUrl || storedAvatar || null;

    return {
      ...mockProfile,
      ...parsed,
      fullName: authUser?.fullName || parsed.fullName || mockProfile.fullName,
      email: authUser?.email || parsed.email || mockProfile.email,
      phone: (authUser?.phone !== undefined && authUser?.phone !== null && authUser.phone !== '')
        ? authUser.phone
        : (parsed.phone || mockProfile.phone),
      avatarUrl: directAvatar || '',
    };
  } catch {
    // fallback to mockProfile
  }
  const fallback = typeof window !== 'undefined' ? localStorage.getItem('judge_avatar') || '' : '';
  return { ...mockProfile, avatarUrl: fallback };
}

/**
 * Hồ sơ đã lưu trên server; các key cũ dùng chung cho mọi giám khảo trên cùng trình duyệt
 * nên phải xoá để không hiện tên/ảnh của người đăng nhập trước.
 */
function clearLegacyProfileStorage() {
  try {
    localStorage.removeItem(JUDGE_PROFILE_STORAGE_KEY);
    localStorage.removeItem('judge_avatar');
    localStorage.removeItem('judge_user_name');
  } catch {
    // Trình duyệt chặn storage thì bỏ qua, dữ liệu hồ sơ vẫn lấy từ server
  }
}

/** Cập nhật phiên đăng nhập để header, sidebar và các portal khác thấy tên/ảnh mới */
function syncAuthSession(profile: JudgeProfile) {
  const user = authService.getCurrentUser();
  if (!user || user.id !== profile.id) return;
  authService.saveSession({
    ...user,
    fullName: profile.fullName,
    avatar: profile.avatarUrl || null,
    avatarUrl: profile.avatarUrl || null,
  });
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
  /** GET /judge/me/profile */
  getProfile: async (): Promise<JudgeProfile> => {
    const profile = await request<JudgeProfile>('/judge/me/profile');
    clearLegacyProfileStorage();
    return profile;
  },

  /** PUT /judge/me/profile — email, số điện thoại và vai trò do hệ thống quản lý nên không gửi lên */
  updateProfile: async (changes: JudgeProfileUpdate): Promise<JudgeProfile> => {
    const profile = await request<JudgeProfile>('/judge/me/profile', {
      method: 'PUT',
      body: JSON.stringify(changes),
    });
    syncAuthSession(profile);
    return profile;
  },

  /** GET /judge/me/evaluations — toàn bộ phiếu chấm của giám khảo đang đăng nhập */
  getEvaluations: (): Promise<Evaluation[]> => request<Evaluation[]>('/judge/me/evaluations'),

  /** Tổng hợp từ 3 API chấm thi; backend chưa có endpoint thống kê riêng */
  getStats: async (): Promise<JudgeStats> => {
    const [contests, submissions, evaluations] = await Promise.all([
      judgeService.getContests(),
      judgeService.getAssignedSubmissions(),
      judgeService.getEvaluations(),
    ]);
    return {
      assignedContests: contests.filter((item) => item.status !== 'COMPLETED').length,
      pendingSubmissions: submissions.filter((item) => item.evaluationStatus !== 'FINALIZED').length,
      evaluatedSubmissions: submissions.filter((item) => item.evaluationStatus === 'FINALIZED').length,
      awaitingNextRound: evaluations.filter((item) => item.status === 'FINALIZED' && item.recommendNextRound).length,
    };
  },

  /** GET /judge/me/contests */
  getContests: async (): Promise<JudgeContest[]> => {
    const contests = await request<ApiJudgeContest[]>('/judge/me/contests');
    return contests.map(toJudgeContest);
  },

  /** GET /judge/me/submissions — backend chỉ trả các bài thuộc phạm vi được phân công (BR-006) */
  getAssignedSubmissions: async (): Promise<AssignedSubmission[]> => {
    const submissions = await request<ApiAssignedSubmission[]>('/judge/me/submissions');
    return submissions.map(toAssignedSubmission);
  },

  /** GET /judge/me/submissions/{submissionId} — bài ngoài phạm vi trả 404 */
  getSubmission: async (submissionId: string): Promise<AssignedSubmission> => {
    const submission = await request<ApiAssignedSubmission>(
      `/judge/me/submissions/${encodeURIComponent(submissionId)}`,
    );
    return toAssignedSubmission(submission);
  },

  /** GET /judge/me/submissions/{submissionId}/evaluation — chưa chấm thì backend trả body rỗng (null) */
  getEvaluation: (submissionId: string): Promise<Evaluation | null> =>
    request<Evaluation | null>(`/judge/me/submissions/${encodeURIComponent(submissionId)}/evaluation`),

  /**
   * PUT /judge/me/submissions/{submissionId}/evaluation
   * Backend kiểm tra điểm theo tiêu chí, hạn chấm của vòng; phiếu đã gửi chính thức bị khóa (409).
   */
  saveEvaluation: async (submissionId: string, body: EvaluationRequest): Promise<Evaluation> => {
    const evaluation = await request<Evaluation>(
      `/judge/me/submissions/${encodeURIComponent(submissionId)}/evaluation`,
      { method: 'PUT', body: JSON.stringify(body) },
    );
    notifyJudgingUpdated();
    return evaluation;
  },

  /** GET /judge/me/submissions/{submissionId}/evaluation-history — các phiếu đã chốt qua từng vòng */
  getEvaluationHistory: (submissionId: string): Promise<EvaluationHistoryItem[]> =>
    request<EvaluationHistoryItem[]>(
      `/judge/me/submissions/${encodeURIComponent(submissionId)}/evaluation-history`,
    ),

  /** GET /contests/{contestId}/results — rỗng khi Ban tổ chức chưa công bố (BR-008) */
  getContestResults: async (contestId: string): Promise<ContestResultEntry[]> => {
    const results = await request<PublishedResult[]>(`/contests/${encodeURIComponent(contestId)}/results`);
    return results.map((item) => ({
      rank: item.ranking,
      submissionTitle: item.title,
      authorName: item.authorName ?? 'Thí sinh',
      averageScore: item.averageScore,
      award: item.prizeRank ? PRIZE_LABELS[item.prizeRank] : null,
    }));
  },

  /** GET /results/awards — Kho dữ liệu: tác phẩm đạt giải, năm mới nhất trước */
  getAwardArchive: async (): Promise<AwardArchiveItem[]> => {
    const items = await request<ApiAwardArchiveItem[]>('/results/awards');
    return items.map((item) => ({ ...item, metadata: toFilmMetadata(item.metadata) }));
  },

  /** GET /judge/me/notifications — 50 thông báo mới nhất, mới nhất trước */
  getNotifications: (): Promise<JudgeNotification[]> => request<JudgeNotification[]>('/judge/me/notifications'),

  /** PATCH /judge/me/notifications/read-all */
  markAllNotificationsRead: async (): Promise<void> => {
    await request<void>('/judge/me/notifications/read-all', { method: 'PATCH' });
    notifyNotificationsChanged();
  },

  /** PATCH /judge/me/notifications/{id}/read */
  markNotificationRead: async (notificationId: string): Promise<void> => {
    await request<JudgeNotification>(
      `/judge/me/notifications/${encodeURIComponent(notificationId)}/read`,
      { method: 'PATCH' },
    );
    notifyNotificationsChanged();
  },
};
