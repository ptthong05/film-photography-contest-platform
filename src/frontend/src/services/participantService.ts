import { request } from './apiClient';
import type { ApiContest } from './contestService';
import type { ApiContestResult } from './resultService';
import type { ApiSubmission } from './submissionService';
import { formatDate } from '../utils/formatDate';

const DEFAULT_BANNER = '/ai-banner-bg.jpg';
const NOT_SET = 'Chưa công bố';

export type ContestDisplayStatus = 'Đang diễn ra' | 'Sắp diễn ra' | 'Đang chấm' | 'Đã kết thúc';

/** Dữ liệu cuộc thi theo cách các tab Participant hiển thị */
export interface ContestItem {
  id: string;
  title: string;
  category: string;
  /** Tên của khoảng thời gian trong dateRange: nhận bài hoặc chấm bài */
  dateLabel: string;
  dateRange: string;
  participantsCount: number;
  bannerUrl: string;
  status: ContestDisplayStatus;
  /** Cuộc thi đang mở cổng nhận bài, dùng cho form nộp ảnh */
  acceptingSubmissions: boolean;
  /** Còn cho đăng ký, cùng điều kiện với RegistrationService ở backend */
  registrationOpen: boolean;
  categories: string[];
  maxPhotos: number;
  description: string;
  rules: string[];
  prizes: { first: string; second: string; third: string; consolation: string };
  technicalRequirements: string;
  judgingCriteria: string[];
}

export interface EntryDetail {
  id: string;
  contestId: string;
  contestTitle?: string;
  title: string;
  description: string;
  photoUrl: string;
  submittedAt: string;
  status: 'Đang chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Đã chấm' | string;
  rejectReason?: string;
  category?: string;
  score?: number;
  prizeRank?: string | null;
  filmBrand?: string;
  filmStock?: string;
  iso?: number | string;
  cameraBody?: string;
  lens?: string;
  filmFormat?: string;
  frameNumber?: string;
  shootingLocation?: string;
  developingLab?: string;
  scanningSpecs?: string;
}

export interface EntryFields {
  contestId: string;
  title: string;
  description: string;
  category?: string;
  filmBrand?: string;
  filmStock?: string;
  iso?: string | number;
  cameraBody?: string;
  lens?: string;
  filmFormat?: string;
  frameNumber?: string;
  shootingLocation?: string;
  developingLab?: string;
  scanningSpecs?: string;
}

export interface FilmRoll {
  id: string;
  code: string;
  name: string;
  brand: string;
  iso: number;
  format: string;
  cameraBody: string;
  totalFrames: number;
  usedFrameNumbers: number[];
}

export type FilmRollInput = Omit<FilmRoll, 'id' | 'code'>;

export interface Registration {
  id: string;
  contestId: string;
  contestTitle: string;
  status: string;
  registeredAt: string;
}

function toDisplayStatus(status: ApiContest['status']): ContestDisplayStatus {
  if (status === 'ENDED') return 'Đã kết thúc';
  if (status === 'JUDGING') return 'Đang chấm';
  return status === 'ONGOING' ? 'Đang diễn ra' : 'Sắp diễn ra';
}

export function toContestItem(item: ApiContest): ContestItem {
  // Cuộc thi chưa có lịch nhận bài thì hiển thị lịch chấm, kèm nhãn để không nhầm là hạn đăng ký
  const hasSubmissionDates = Boolean(item.submissionStart && item.submissionEnd);
  const start = hasSubmissionDates ? item.submissionStart : item.judgingStart;
  const end = hasSubmissionDates ? item.submissionEnd : item.judgingEnd;
  return {
    id: item.id,
    title: item.title,
    category: item.categories.join(' • '),
    dateLabel: !start || !end ? 'Thời gian' : hasSubmissionDates ? 'Nhận bài' : 'Chấm bài',
    dateRange: start && end ? `${formatDate(start)} - ${formatDate(end)}` : 'Chưa cập nhật',
    participantsCount: item.participantCount,
    bannerUrl: item.coverUrl || DEFAULT_BANNER,
    status: toDisplayStatus(item.status),
    acceptingSubmissions: item.acceptingSubmissions,
    registrationOpen: item.status === 'UPCOMING' || item.status === 'ONGOING',
    categories: item.categories,
    maxPhotos: item.maxPhotosPerParticipant,
    description: item.description ?? '',
    rules: (item.regulations ?? '').split('\n').map((line) => line.trim()).filter(Boolean),
    prizes: {
      first: item.prizes[0]?.reward || item.prizes[0]?.name || NOT_SET,
      second: item.prizes[1]?.reward || item.prizes[1]?.name || NOT_SET,
      third: item.prizes[2]?.reward || item.prizes[2]?.name || NOT_SET,
      consolation: item.prizes[3]?.reward || item.prizes[3]?.name || NOT_SET,
    },
    technicalRequirements: `Tối đa ${item.maxPhotosPerParticipant} ảnh mỗi thí sinh. Ảnh scan định dạng JPEG, PNG, WEBP hoặc TIFF.`,
    judgingCriteria: item.criteria.map((criterion) => criterion.name),
  };
}

function toEntryStatus(item: ApiSubmission): string {
  if (item.status === 'PENDING') return 'Đang chờ duyệt';
  if (item.status === 'REJECTED') return 'Từ chối';
  return item.resultPublished && item.totalScore !== null ? 'Đã chấm' : 'Đã duyệt';
}

export function toEntry(item: ApiSubmission): EntryDetail {
  const metadata = item.metadata;
  return {
    id: item.id,
    contestId: item.contestId,
    contestTitle: item.contestTitle ?? undefined,
    title: item.title,
    description: item.description ?? '',
    photoUrl: item.imageUrls[0] ?? '',
    submittedAt: formatDate(item.submittedAt),
    status: toEntryStatus(item),
    rejectReason: item.rejectionReason ?? undefined,
    category: item.category ?? undefined,
    // Điểm chỉ lộ cho thí sinh sau khi công bố kết quả
    score: item.resultPublished ? item.totalScore ?? undefined : undefined,
    prizeRank: item.resultPublished ? item.prizeRank : null,
    filmBrand: metadata?.filmBrand ?? undefined,
    filmStock: metadata?.filmStock ?? undefined,
    iso: metadata?.iso ?? undefined,
    cameraBody: metadata?.camera ?? undefined,
    lens: metadata?.lens ?? undefined,
    filmFormat: metadata?.filmFormat ?? undefined,
    frameNumber: metadata?.frameNumber ?? undefined,
    shootingLocation: metadata?.shootingLocation ?? undefined,
    developingLab: metadata?.developingLab ?? undefined,
    scanningSpecs: metadata?.scanSpec ?? undefined,
  };
}

function toFormData(fields: EntryFields, file?: Blob, fileName?: string): FormData {
  const form = new FormData();
  const values: Record<string, string | number | undefined> = {
    contestId: fields.contestId,
    title: fields.title,
    description: fields.description,
    category: fields.category,
    filmBrand: fields.filmBrand,
    filmStock: fields.filmStock,
    // Backend nhận ISO dạng số, bỏ các ký tự khác như "ISO 400"
    iso: fields.iso === undefined ? undefined : String(fields.iso).replace(/\D/g, ''),
    camera: fields.cameraBody,
    lens: fields.lens,
    format: fields.filmFormat,
    frameNumber: fields.frameNumber,
    shootingLocation: fields.shootingLocation,
    developingLab: fields.developingLab,
    scanningSpecs: fields.scanningSpecs,
  };
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') form.set(key, String(value));
  });
  if (file) form.set('file', file, fileName ?? 'photo.jpg');
  return form;
}

export const participantService = {
  getContests: async () => (await request<ApiContest[]>('/contests')).map(toContestItem),

  getRegistrations: () => request<Registration[]>('/registrations/mine'),
  register: (contestId: string) => request<Registration>(`/contests/${contestId}/registrations`, { method: 'POST' }),
  cancelRegistration: (contestId: string) => request<void>(`/contests/${contestId}/registrations`, { method: 'DELETE' }),

  getEntries: async () => (await request<ApiSubmission[]>('/submissions/mine')).map(toEntry),
  submitEntry: async (fields: EntryFields, file: Blob, fileName: string) =>
    toEntry(await request<ApiSubmission>('/submissions', { method: 'POST', body: toFormData(fields, file, fileName) })),
  updateEntry: async (id: string, fields: EntryFields) =>
    toEntry(await request<ApiSubmission>(`/submissions/${id}`, { method: 'PUT', body: toFormData(fields) })),
  deleteEntry: (id: string) => request<void>(`/submissions/${id}`, { method: 'DELETE' }),

  getContestResults: (contestId: string) => request<ApiContestResult[]>(`/contests/${contestId}/results`),

  getFilmRolls: () => request<FilmRoll[]>('/film-rolls'),
  createFilmRoll: (roll: FilmRollInput) => request<FilmRoll>('/film-rolls', { method: 'POST', body: JSON.stringify(roll) }),
  updateFilmRoll: (id: string, roll: FilmRollInput) =>
    request<FilmRoll>(`/film-rolls/${id}`, { method: 'PUT', body: JSON.stringify(roll) }),
  deleteFilmRoll: (id: string) => request<void>(`/film-rolls/${id}`, { method: 'DELETE' }),
};
