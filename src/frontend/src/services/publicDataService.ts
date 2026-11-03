import type { AuthorAward, AuthorProfile } from '../app/home/components/authors/data';
import type { ContestDetailData } from '../app/home/components/contests/data';
import type { PhotographerRankItem, PhotoRankItem } from '../app/home/components/leaderboard/data';
import type { PhotoDetailItem } from '../app/home/components/photosHighlight/data';
import { request } from './apiClient';
import type { ApiContest } from './contestService';
import { formatDate } from '../utils/formatDate';

const NOT_DECLARED = 'Chưa khai báo';
const DEFAULT_IMAGE = '/ai-banner-bg.jpg';

const AWARD_LABEL: Record<string, string> = {
  FIRST: 'Giải Nhất',
  SECOND: 'Giải Nhì',
  THIRD: 'Giải Ba',
  HONORABLE: 'Giải Khuyến khích',
};
const AWARD_ICON: Record<string, string> = { FIRST: '🥇', SECOND: '🥈', THIRD: '🥉', HONORABLE: '🎖️' };
const AWARD_TYPE: Record<string, PhotoRankItem['awardType']> = { FIRST: 'first', SECOND: 'second', THIRD: 'third', HONORABLE: 'other' };
const AWARD_POINTS: Record<string, number> = { FIRST: 100, SECOND: 70, THIRD: 50, HONORABLE: 20 };

interface ApiArchiveEntry {
  id: string;
  submissionId: string;
  contestId: string;
  contestTitle: string;
  year: number;
  participantId: string;
  authorName: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  prizeRank: string;
  totalScore: number | null;
  metadata: {
    filmStock: string | null;
    iso: number | null;
    camera: string | null;
    lens: string | null;
    shootingDate: string | null;
    shootingLocation: string | null;
    developingLab: string | null;
  } | null;
}

interface ApiLeaderboardEntry {
  rank: number;
  participantId: string;
  name: string;
  avatarUrl: string | null;
  submissionCount: number;
  awardCount: number;
  firstPrizeCount: number;
  averageScore: number;
}

export interface PublicStats {
  contests: number;
  ongoingContests: number;
  participants: number;
  submissions: number;
  judges: number;
  awards: number;
}

export interface PublicData {
  contests: ContestDetailData[];
  photos: Record<string, PhotoDetailItem>;
  rankedAuthors: PhotographerRankItem[];
  rankedPhotos: PhotoRankItem[];
  authors: Record<string, AuthorProfile>;
}

function toContestDetail(item: ApiContest): ContestDetailData {
  const start = item.submissionStart ?? item.judgingStart;
  const end = item.submissionEnd ?? item.judgingEnd;
  const isEnded = item.status === 'ENDED';
  const isActive = item.status === 'ONGOING' || item.status === 'JUDGING';
  const timeline = [
    { title: 'Bắt đầu nhận bài', date: item.submissionStart },
    { title: 'Hạn cuối nhận bài', date: item.submissionEnd },
    { title: 'Chấm điểm', date: item.judgingStart },
    { title: 'Công bố kết quả', date: item.resultDate },
  ].filter((step): step is { title: string; date: string } => Boolean(step.date));
  return {
    id: item.id,
    title: item.title,
    status: isEnded ? 'ended' : isActive ? 'active' : 'upcoming',
    statusLabel: isEnded ? 'Đã kết thúc' : isActive ? 'Đang diễn ra' : 'Sắp diễn ra',
    image: item.coverUrl || DEFAULT_IMAGE,
    startDate: start ? formatDate(start) : 'Chưa cập nhật',
    endDate: end ? formatDate(end) : 'Chưa cập nhật',
    participantsCount: item.participantCount,
    categories: item.categories,
    description: item.description ?? '',
    prizePool: item.prizes[0]?.reward || item.prizes[0]?.name || '',
    organizer: item.organizerName ? { name: item.organizerName, avatar: DEFAULT_IMAGE, role: 'Ban tổ chức' } : undefined,
    judges: item.anonymousJudging ? [] : item.judgeNames.map((name) => ({ name, avatar: DEFAULT_IMAGE, title: 'Giám khảo' })),
    timeline: timeline.map((step) => ({ title: step.title, date: formatDate(step.date) })),
    rules: (item.regulations ?? '').split('\n').map((line) => line.trim()).filter(Boolean),
    prizes: item.prizes.map((prize, index) => ({
      rank: ['🥇', '🥈', '🥉'][index] ?? '🎖️',
      name: prize.name,
      reward: prize.reward,
    })),
    faqs: [],
    pastPhotos: [],
  };
}

function toPhoto(entry: ApiArchiveEntry): PhotoDetailItem {
  const metadata = entry.metadata;
  return {
    id: entry.submissionId,
    title: entry.title,
    author: entry.authorName,
    image: entry.imageUrl || DEFAULT_IMAGE,
    award: `${AWARD_LABEL[entry.prizeRank] ?? ''} - ${entry.contestTitle}`,
    contestId: entry.contestId,
    contestName: entry.contestTitle,
    filmStock: metadata?.filmStock ?? NOT_DECLARED,
    camera: metadata?.camera ?? NOT_DECLARED,
    lens: metadata?.lens ?? NOT_DECLARED,
    shutterSpeed: NOT_DECLARED,
    aperture: NOT_DECLARED,
    iso: metadata?.iso?.toString() ?? NOT_DECLARED,
    lab: metadata?.developingLab ?? NOT_DECLARED,
    location: metadata?.shootingLocation ?? NOT_DECLARED,
    dateTaken: metadata?.shootingDate ? formatDate(metadata.shootingDate) : NOT_DECLARED,
    story: entry.description ?? '',
    views: 0,
    likes: 0,
    year: String(entry.year),
  };
}

function toRankedPhoto(entry: ApiArchiveEntry, index: number): PhotoRankItem {
  const score = entry.totalScore ?? 0;
  return {
    rank: index + 1,
    id: entry.submissionId,
    title: entry.title,
    image: entry.imageUrl || DEFAULT_IMAGE,
    authorName: entry.authorName,
    authorAvatar: entry.imageUrl || DEFAULT_IMAGE,
    contestName: entry.contestTitle,
    award: AWARD_LABEL[entry.prizeRank] ?? '',
    awardType: AWARD_TYPE[entry.prizeRank] ?? 'other',
    likesCount: 0,
    judgeScore: score,
    totalPoints: Math.round(score * 10),
    camera: entry.metadata?.camera ?? NOT_DECLARED,
    filmStock: entry.metadata?.filmStock ?? NOT_DECLARED,
    year: String(entry.year),
    contestId: entry.contestId,
  };
}

function toAuthors(archive: ApiArchiveEntry[], leaderboard: ApiLeaderboardEntry[]): Record<string, AuthorProfile> {
  const authors: Record<string, AuthorProfile> = {};
  for (const ranked of leaderboard) {
    const entries = archive.filter((item) => item.participantId === ranked.participantId);
    const contestIds = [...new Set(entries.map((item) => item.contestId))];
    const awards: AuthorAward[] = entries.map((item) => ({
      id: item.id,
      title: AWARD_LABEL[item.prizeRank] ?? '',
      contestId: item.contestId,
      contestName: item.contestTitle,
      year: String(item.year),
      rank: AWARD_LABEL[item.prizeRank] ?? '',
      rankIcon: AWARD_ICON[item.prizeRank] ?? '🎖️',
      photoTitle: item.title,
      photoImage: item.imageUrl || DEFAULT_IMAGE,
      prizeReward: '',
    }));
    authors[ranked.name] = {
      id: ranked.participantId,
      name: ranked.name,
      avatar: ranked.avatarUrl || entries[0]?.imageUrl || DEFAULT_IMAGE,
      coverImage: entries[0]?.imageUrl || DEFAULT_IMAGE,
      headline: 'Nhiếp ảnh gia phim',
      bio: '',
      location: '',
      joinedYear: '',
      favoriteGear: [...new Set(entries.map((item) => item.metadata?.camera).filter((value): value is string => Boolean(value)))],
      favoriteFilms: [...new Set(entries.map((item) => item.metadata?.filmStock).filter((value): value is string => Boolean(value)))],
      awardsCount: ranked.awardCount,
      contestsCount: contestIds.length,
      photosCount: ranked.submissionCount,
      totalLikes: 0,
      awards,
      contests: contestIds.map((contestId) => {
        const items = entries.filter((item) => item.contestId === contestId);
        return {
          id: contestId,
          title: items[0].contestTitle,
          year: String(items[0].year),
          status: 'Đã hoàn thành',
          role: 'Thí sinh',
          awardReceived: AWARD_LABEL[items[0].prizeRank],
          entryCount: items.length,
        };
      }),
      works: entries.map((item) => ({
        id: item.submissionId,
        title: item.title,
        image: item.imageUrl || DEFAULT_IMAGE,
        contestName: item.contestTitle,
        award: AWARD_LABEL[item.prizeRank],
        camera: item.metadata?.camera ?? NOT_DECLARED,
        filmStock: item.metadata?.filmStock ?? NOT_DECLARED,
        likes: 0,
      })),
    };
  }
  return authors;
}

/** Toàn bộ dữ liệu trang công khai đều lấy từ DB; không cần đăng nhập. */
export const publicDataService = {
  getStats: () => request<PublicStats>('/public/stats'),
  getContests: async () => (await request<ApiContest[]>('/contests')).map(toContestDetail),
  getData: async (): Promise<PublicData> => {
    const [contests, archive, leaderboard] = await Promise.all([
      request<ApiContest[]>('/contests'),
      request<ApiArchiveEntry[]>('/archive'),
      request<ApiLeaderboardEntry[]>('/public/leaderboard'),
    ]);
    const orderedArchive = [...archive].sort((a, b) => (AWARD_POINTS[b.prizeRank] ?? 0) - (AWARD_POINTS[a.prizeRank] ?? 0));
    return {
      contests: contests.map(toContestDetail),
      photos: Object.fromEntries(archive.map((entry) => [entry.submissionId, toPhoto(entry)])),
      rankedPhotos: orderedArchive.map(toRankedPhoto),
      rankedAuthors: leaderboard.map((item) => {
        const entries = archive.filter((entry) => entry.participantId === item.participantId);
        const count = (rank: string) => entries.filter((entry) => entry.prizeRank === rank).length;
        return {
          rank: item.rank,
          id: item.participantId,
          name: item.name,
          avatar: item.avatarUrl || entries[0]?.imageUrl || DEFAULT_IMAGE,
          submissionCount: item.submissionCount,
          gold: count('FIRST'),
          silver: count('SECOND'),
          bronze: count('THIRD'),
          totalPoints: entries.reduce((sum, entry) => sum + (AWARD_POINTS[entry.prizeRank] ?? 0), 0),
        };
      }),
      authors: toAuthors(archive, leaderboard),
    };
  },
};
