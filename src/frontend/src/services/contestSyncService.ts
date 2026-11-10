import type { Contest, ContestDraft, Prize } from "../types/contest";
import type { Submission } from "../types/submission";
import type { AssignedSubmission, Evaluation } from "../types/judge";
import { MOCK_CONTESTS, MOCK_JUDGES } from "../mocks/organizerData";
import { getAllJudgeAssignedSubmissions, loadStoredEvaluations } from "./judgeService";
import {
  getOrganizerContestCopies,
  isOrganizerContestDeleted,
  readContestSettings,
  saveContestSettings,
  withContestSettings,
} from "../app/organizer/components/contestManagementStorage";

export const SHARED_CONTESTS_KEY = "filmcontest_shared_contests_v2";
export const PARTICIPANT_ENTRIES_KEY = "participant_entries";
export const REGISTERED_CONTESTS_KEY = "participant_registered_contests";
export const TIME_SIMULATION_KEY = "filmcontest_time_simulation_v2";

export interface SystemTimeSimulation {
  // Map contestId -> override status: 'OPEN' | 'SUBMISSION_CLOSED' | 'JUDGING_CLOSED' | 'DEFAULT'
  [contestId: string]: 'OPEN' | 'SUBMISSION_CLOSED' | 'JUDGING_CLOSED' | 'DEFAULT';
}

export function readTimeSimulation(): SystemTimeSimulation {
  try {
    const raw = localStorage.getItem(TIME_SIMULATION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setContestTimeSimulation(contestId: string, status: 'OPEN' | 'SUBMISSION_CLOSED' | 'JUDGING_CLOSED' | 'DEFAULT'): void {
  const current = readTimeSimulation();
  if (status === 'DEFAULT') {
    delete current[contestId];
  } else {
    current[contestId] = status;
  }
  localStorage.setItem(TIME_SIMULATION_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('filmcontest:contests-updated'));
  window.dispatchEvent(new Event('storage'));
}

/** Đọc các cuộc thi do Organizer tạo thêm */
export function getStoredCreatedContests(): Contest[] {
  try {
    const raw = localStorage.getItem(SHARED_CONTESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Lưu danh sách cuộc thi tạo thêm */
export function saveCreatedContests(contests: Contest[]): void {
  localStorage.setItem(SHARED_CONTESTS_KEY, JSON.stringify(contests));
  window.dispatchEvent(new Event('filmcontest:contests-updated'));
  window.dispatchEvent(new Event('storage'));
}

/**
 * ĐỌC TẤT CẢ CUỘC THI THỐNG NHẤT CHO TOÀN BỘ CỔNG (Home, Admin, Organizer, Participant, Judge)
 */
export function getAllUnifiedContests(): Contest[] {
  const created = getStoredCreatedContests();
  const copies = getOrganizerContestCopies();
  const rawMerged: Contest[] = [...created, ...copies, ...MOCK_CONTESTS];

  const map = new Map<string, Contest>();
  for (const c of rawMerged) {
    if (isOrganizerContestDeleted(c.id)) continue;
    if (!map.has(c.id)) {
      map.set(c.id, withContestSettings(c));
    }
  }

  const sim = readTimeSimulation();

  return Array.from(map.values()).map((c) => {
    const simState = sim[c.id];
    let status = c.status;
    if (simState === 'SUBMISSION_CLOSED') {
      status = 'ONGOING'; // hoặc SCORING
    } else if (simState === 'JUDGING_CLOSED') {
      status = 'ENDED';
    }

    const safeName = c.name || (c as any).title || "Cuộc thi nhiếp ảnh phim";

    return {
      ...c,
      id: c.id || `CT-${Math.random().toString(36).slice(2, 7)}`,
      name: safeName,
      status: status || 'ONGOING',
      startDate: c.startDate || '2026-06-01',
      endDate: c.endDate || '2026-11-30',
      participantCount: Number(c.participantCount || 0),
      submissionCount: Number(c.submissionCount || 0),
      tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : ["Nhiếp ảnh phim"],
      judgeNames: Array.isArray(c.judgeNames) ? c.judgeNames : ["Lê Minh Cường", "Trần Thị Bình"],
    };
  });
}

/**
 * KIỂM TRA HẾT HẠN NỘP BÀI (DEADLINE FOR PARTICIPANT)
 */
export function isSubmissionDeadlinePassed(contest: { id: string; endDate?: string }): boolean {
  const sim = readTimeSimulation();
  if (sim[contest.id] === 'SUBMISSION_CLOSED' || sim[contest.id] === 'JUDGING_CLOSED') {
    return true;
  }
  if (sim[contest.id] === 'OPEN') {
    return false;
  }

  if (!contest.endDate) return false;
  // Parse date: nếu chỉ có YYYY-MM-DD thì tính đến 23:59:59 của ngày đó
  const endStr = contest.endDate.includes('T') || contest.endDate.includes(':')
    ? contest.endDate
    : `${contest.endDate}T23:59:59`;
  const endTime = new Date(endStr).getTime();
  if (Number.isNaN(endTime)) return false;
  return Date.now() > endTime;
}

/**
 * KIỂM TRA HẾT HẠN CHẤM BÀI (DEADLINE FOR JUDGE)
 */
export function isJudgingDeadlinePassed(contest: { id: string; judgingEndDate?: string; endDate?: string }): boolean {
  const sim = readTimeSimulation();
  if (sim[contest.id] === 'JUDGING_CLOSED') {
    return true;
  }
  if (sim[contest.id] === 'OPEN' || sim[contest.id] === 'SUBMISSION_CLOSED') {
    return false;
  }

  const deadlineStr = contest.judgingEndDate || contest.endDate;
  if (!deadlineStr) return false;
  const endStr = deadlineStr.includes('T') || deadlineStr.includes(':')
    ? deadlineStr
    : `${deadlineStr}T23:59:59`;
  const endTime = new Date(endStr).getTime();
  if (Number.isNaN(endTime)) return false;
  return Date.now() > endTime;
}

/**
 * TẠO CUỘC THI MỚI TỪ ORGANIZER
 * -> Ngay lập tức hiện ở Home, Admin, Participant, Judge
 */
export function createNewUnifiedContest(draft: ContestDraft, judgeIds: string[]): Contest {
  const newId = `CT-2026-${Date.now().toString().slice(-4)}`;
  const judgeList = MOCK_JUDGES.filter((j) => judgeIds.includes(j.id)).map((j) => j.fullName);

  const newContest: Contest = {
    id: newId,
    name: draft.name.trim(),
    organizer: draft.organizer?.trim() || "FilmContest Studio",
    image: draft.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    startDate: draft.startDate || new Date().toISOString().slice(0, 10),
    endDate: draft.endDate || "2026-11-30",
    participantCount: 0,
    submissionCount: 0,
    status: "ONGOING",
    tags: draft.tags && draft.tags.length > 0 ? draft.tags : [draft.category || "Nhiếp ảnh phim"],
    description: draft.description.trim() || "Cuộc thi nhiếp ảnh phim analog quy mô lớn với nhiều giải thưởng giá trị.",
    prizes: draft.prizes && draft.prizes.length > 0 ? draft.prizes : [
      { name: "Giải Nhất (Grand Prize)", reward: "25.000.000 VNĐ + Leica M6" },
      { name: "Giải Nhì", reward: "12.000.000 VNĐ + 20 cuộn film" },
      { name: "Giải Ba", reward: "6.000.000 VNĐ + 10 cuộn film" },
      { name: "Giải Khuyến Khích", reward: "2.000.000 VNĐ + Voucher Lab" },
    ],
    judgeNames: judgeList.length > 0 ? judgeList : ["Lê Minh Cường", "Đỗ Thị Hương"],
  };

  // 1. Lưu cài đặt chi tiết cho cuộc thi
  saveContestSettings(newId, {
    name: newContest.name,
    description: newContest.description || "",
    tags: newContest.tags || [],
    criteria: draft.criteria && draft.criteria.length > 0 ? draft.criteria : ["Bố cục & Ánh sáng", "Cảm xúc & Kể chuyện", "Xử lý Grain & Lab", "Sáng tạo"],
    maxPhotosPerPerson: draft.maxPhotosPerPerson || 3,
    rules: draft.rules || "Bắt buộc sử dụng ảnh chụp phim thật, giữ lại âm bản đối chiếu.",
    startDate: newContest.startDate,
    endDate: newContest.endDate,
    judgingStartDate: draft.startDate || newContest.startDate,
    judgingEndDate: draft.judgingEndDate || "2026-12-10",
    resultsDate: draft.resultsDate || "2026-12-15",
    prizes: newContest.prizes || [],
    judgeIds,
    defaultJudgeIds: judgeIds,
    judgeNames: judgeList,
    lifecycleStatus: "ONGOING",
    submissionOpen: true,
    isPaused: false,
    resultsPublished: false,
    submissionReviews: {},
  });

  // 2. Lưu vào danh sách cuộc thi dùng chung
  const current = getStoredCreatedContests();
  current.unshift(newContest);
  saveCreatedContests(current);

  return newContest;
}

/**
 * ĐỌC TẤT CẢ BÀI DỰ THI ĐỒNG BỘ CHO TOÀN BỘ HỆ THỐNG
 * (Kết hợp bài nộp của Participant + Mẫu kiểm thử + Đã phân công)
 */
export function getAllUnifiedSubmissions(): any[] {
  const map = new Map<string, any>();

  // 1. Bài nộp từ Participant (SubmitEntryForm.tsx)
  try {
    const raw = localStorage.getItem(PARTICIPANT_ENTRIES_KEY);
    if (raw) {
      const participantEntries: any[] = JSON.parse(raw);
      for (const p of participantEntries) {
        if (!p || !p.id) continue;
        const normStatus = p.status === 'Hợp lệ' || p.status === 'Đã duyệt'
          ? 'APPROVED'
          : p.status === 'Từ chối'
          ? 'REJECTED'
          : 'PENDING';

        map.set(p.id, {
          id: p.id,
          code: p.code || (p.id.toUpperCase().startsWith('SUB') ? p.id.toUpperCase() : `SUB-${p.id.slice(-6).toUpperCase()}`),
          title: p.title || 'Tác phẩm phim',
          authorName: p.authorName || 'Hồ Thanh Bình (Thí sinh)',
          contestId: p.contestId || 'CT-2026-001',
          contestName: p.contestName || p.contestTitle || 'Analog Moments 2026',
          contestTitle: p.contestTitle || p.contestName || 'Analog Moments 2026',
          submittedAt: p.submittedAt || new Date().toISOString().slice(0, 10),
          createdAt: p.createdAt || p.submittedAt || new Date().toISOString(),
          status: normStatus === 'APPROVED' ? 'VALID' : 'PENDING',
          reviewStatus: normStatus,
          imageUrl: p.photoUrl || p.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
          imageUrls: [p.photoUrl || p.imageUrl],
          thumbnailUrls: [p.photoUrl || p.imageUrl],
          category: p.category || 'Đời sống',
          description: p.description || 'Tác phẩm ảnh phim tham dự cuộc thi.',
          metadata: {
            filmStock: p.filmBrand || p.metadata?.filmStock || 'Kodak Portra 400',
            iso: String(p.iso || p.metadata?.iso || '400'),
            camera: p.cameraBody || p.metadata?.camera || 'Nikon FM2',
            cameraBody: p.cameraBody || p.metadata?.cameraBody || 'Nikon FM2',
            lens: p.lens || p.metadata?.lens || '50mm f/1.8',
            format: p.filmFormat || p.metadata?.format || '35mm',
            filmFormat: p.filmFormat || p.metadata?.filmFormat || '35mm',
            rollCode: p.filmRoll || 'ROLL-2026-01',
            frame: String(p.frameNumber || p.metadata?.frame || '01'),
            frameNumber: String(p.frameNumber || p.metadata?.frameNumber || '01'),
            location: p.shootingLocation || p.location || 'Việt Nam',
            shootingLocation: p.shootingLocation || p.location || 'Việt Nam',
            lab: p.developingLab || p.lab || 'Lab Sài Gòn',
            developingLab: p.developingLab || p.lab || 'Lab Sài Gòn',
            scan: p.scanningSpecs || p.scan || 'Noritsu HS-1800',
            scanSpec: p.scanningSpecs || p.scanSpec || 'Noritsu HS-1800',
            negative: p.negativeContactSheet || 'Có lưu âm bản gốc',
          },
          // THÔNG TIN KIỂM ĐỊNH AI THEO SRS FR-013, FR-014, FR-015
          aiAnalysis: {
            similarityScore: p.similarityScore || '0.8% (Độc bản)',
            similarityFlag: false,
            isAiGenerated: false,
            aiConfidence: '0.3% (Ảnh phim cơ học thật 99.7%)',
            autoKeywords: ['#analog', '#filmphotography', '#grain', '#classic'],
            verifiedAt: p.submittedAt || new Date().toISOString().slice(0, 10),
          },
        });
      }
    }
  } catch (err) {
    console.error("Error reading participant entries:", err);
  }

  // 2. Các bài thi từ Judge Service (sb-01, sb-02...)
  const judgeSubs = getAllJudgeAssignedSubmissions();
  for (const js of judgeSubs) {
    if (!map.has(js.id)) {
      map.set(js.id, {
        id: js.id,
        code: `SUB-${js.id.slice(-4).toUpperCase()}`,
        title: js.title,
        authorName: js.authorName || "Thí sinh",
        contestId: js.contestId,
        contestName: js.contestTitle,
        contestTitle: js.contestTitle,
        submittedAt: js.submittedAt,
        status: "VALID",
        reviewStatus: "APPROVED",
        imageUrl: js.thumbnailUrls?.[0] || js.imageUrls?.[0],
        imageUrls: js.imageUrls,
        thumbnailUrls: js.thumbnailUrls,
        category: js.category || "Nghệ thuật",
        description: js.description || "Tác phẩm dự thi nhiếp ảnh phim.",
        metadata: {
          filmStock: js.metadata?.filmStock || "Kodak Portra 400",
          iso: String(js.metadata?.iso || "400"),
          camera: js.metadata?.cameraBody || "Nikon FM2",
          cameraBody: js.metadata?.cameraBody || "Nikon FM2",
          lens: js.metadata?.lens || "50mm f/1.8",
          format: js.metadata?.filmFormat || "35mm",
          filmFormat: js.metadata?.filmFormat || "35mm",
          rollCode: "ROLL-01",
          frame: String(js.metadata?.frameNumber || "01"),
          frameNumber: String(js.metadata?.frameNumber || "01"),
          location: js.metadata?.shootingLocation || "Việt Nam",
          shootingLocation: js.metadata?.shootingLocation || "Việt Nam",
          lab: js.metadata?.developingLab || "Lab Sài Gòn",
          developingLab: js.metadata?.developingLab || "Lab Sài Gòn",
          scan: js.metadata?.scanSpec || "Noritsu 3000x2000",
          scanSpec: js.metadata?.scanSpec || "Noritsu 3000x2000",
          negative: "Lưu kho",
        },
        aiAnalysis: {
          similarityScore: '1.2% (Độc bản)',
          similarityFlag: false,
          isAiGenerated: false,
          aiConfidence: '0.1% (Ảnh phim hóa chất chuẩn)',
          autoKeywords: ['#film', '#classic', '#noritsu'],
          verifiedAt: js.submittedAt,
        },
      });
    }
  }

  return Array.from(map.values());
}

/**
 * CẬP NHẬT TRẠNG THÁI DUYỆT BÀI THI TỪ ORGANIZER
 */
export function updateSubmissionReviewStatus(
  submissionId: string,
  newStatus: 'APPROVED' | 'REJECTED' | 'PENDING'
): void {
  try {
    const raw = localStorage.getItem(PARTICIPANT_ENTRIES_KEY);
    if (raw) {
      const list: any[] = JSON.parse(raw);
      const found = list.find((item) => item.id === submissionId);
      if (found) {
        found.status = newStatus === 'APPROVED' ? 'Đã duyệt' : newStatus === 'REJECTED' ? 'Từ chối' : 'Đang chờ duyệt';
        localStorage.setItem(PARTICIPANT_ENTRIES_KEY, JSON.stringify(list));
      }
    }
  } catch {}
  window.dispatchEvent(new Event('filmcontest:submissions-updated'));
  window.dispatchEvent(new Event('entrySubmitted'));
  window.dispatchEvent(new Event('assignmentChanged'));
  window.dispatchEvent(new Event('storage'));
}
