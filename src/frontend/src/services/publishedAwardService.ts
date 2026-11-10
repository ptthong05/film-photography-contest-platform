import type { ArchiveItem, ArchivePrize } from "../app/admin/components/DigitalArchiveManagement";
import type { ContestResult, AwardLevel } from "../types/result";
import type { Submission } from "../types/submission";
import type { Contest } from "../types/contest";
import type { PhotographerRankItem } from "../app/home/components/leaderboard/data";
import { LEADERBOARD_AUTHORS } from "../app/home/components/leaderboard/data";
import { getAllJudgeAssignedSubmissions, loadStoredEvaluations } from "./judgeService";

export const PUBLISHED_AWARDS_KEY = "filmcontest.published_awards.v2";
export const ADMIN_ARCHIVES_KEY = "filmcontest.admin_archives.v2";
export const ORGANIZER_ARCHIVES_KEY = "filmcontest.organizer_archives.v2";
export const LEADERBOARD_AUTHORS_KEY = "filmcontest.leaderboard_authors.v2";
export const EXHIBITION_PHOTOS_KEY = "filmcontest.exhibition_photos.v2";
export const PUBLISHED_RESULTS_KEY = "filmcontest.published_results.v2";

export interface PublishedResultItem {
  id: string;
  rank: number;
  title: string;
  authorName: string;
  contestTitle: string;
  contestId: string;
  imageUrl?: string;
  score: number;
  award: AwardLevel;
  awardLabel: string;
  publishedAt: string;
}

export interface PublishedWinningPhoto {
  id: string;
  title: string;
  author: string;
  award: string;
  awardLevel: "FIRST" | "SECOND" | "THIRD" | "HONORABLE";
  image: string;
  views: number;
  likes: number;
  contestTitle: string;
  publishedAt: string;
  score: number;
  filmStock?: string;
  camera?: string;
  lens?: string;
}

export interface StoredOrganizerArchiveItem {
  result: ContestResult;
  contest: Contest;
  submission: Submission;
  year: number;
  imageUrl: string;
}

const DEFAULT_WINNING_PHOTOS: PublishedWinningPhoto[] = [
  {
    id: "p1",
    title: "Khoảnh khắc bình minh",
    author: "Nguyễn Văn A",
    award: "Giải Nhất - Analog Moments 2025",
    awardLevel: "FIRST",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    views: 1420,
    likes: 382,
    contestTitle: "Analog Moments 2025",
    publishedAt: "2025-11-20",
    score: 9.6,
    filmStock: "Kodak Portra 400",
    camera: "Leica M6",
    lens: "Summicron 35mm f/2",
  },
  {
    id: "p2",
    title: "Đường về",
    author: "Trần Thị Bình",
    award: "Giải Nhì - Film & City",
    awardLevel: "SECOND",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    views: 980,
    likes: 245,
    contestTitle: "Film & City",
    publishedAt: "2025-10-15",
    score: 9.2,
    filmStock: "Kodak Gold 200",
    camera: "Canon AE-1",
    lens: "50mm f/1.8",
  },
  {
    id: "p3",
    title: "Nắng cuối ngày",
    author: "Lê Minh Cường",
    award: "Giải Ba - The Vintage Look",
    awardLevel: "THIRD",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    views: 870,
    likes: 210,
    contestTitle: "The Vintage Look",
    publishedAt: "2025-09-30",
    score: 8.9,
    filmStock: "Ilford HP5 Plus",
    camera: "Nikon FM2",
    lens: "35mm f/2.8",
  },
];

/** Đọc danh sách kết quả bài thi đã công bố (Toàn bộ các bài thi đã xếp hạng của cuộc thi) */
export function getPublishedResults(): PublishedResultItem[] {
  try {
    const raw = localStorage.getItem(PUBLISHED_RESULTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const awardLevels: AwardLevel[] = ["FIRST", "SECOND", "THIRD", "HONORABLE"];
        const awardLabels = ["Giải Nhất", "Giải Nhì", "Giải Ba", "Giải Khuyến khích"];

        // Nhóm theo cuộc thi để chuẩn hóa thứ hạng và giải thưởng
        const contestGroups = new Map<string, any[]>();
        for (const item of parsed) {
          const key = item.contestId || item.contestTitle || "default";
          if (!contestGroups.has(key)) contestGroups.set(key, []);
          contestGroups.get(key)!.push(item);
        }

        const normalized: PublishedResultItem[] = [];
        contestGroups.forEach((items) => {
          const sorted = [...items].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
          sorted.forEach((it, idx) => {
            const rank = idx + 1;
            normalized.push({
              ...it,
              rank,
              score: Number(it.score),
              award: idx < 4 ? awardLevels[idx] : "HONORABLE",
              awardLabel: idx < 4 ? awardLabels[idx] : `Hạng #${rank}`,
            });
          });
        });

        return normalized;
      }
    }

    // Nếu chưa khởi tạo PUBLISHED_RESULTS_KEY, kiểm tra xem có cuộc thi nào đã được công bố trước đó không
    const pubContestsRaw = localStorage.getItem("filmcontest.published-contests.v1");
    if (pubContestsRaw) {
      const pubIds: string[] = JSON.parse(pubContestsRaw);
      if (pubIds && pubIds.length > 0) {
        const allSubs = getAllJudgeAssignedSubmissions();
        const evals = loadStoredEvaluations();
        const evalMap = new Map<string, number>();
        evals.forEach((ev) => {
          if (ev.totalScore) evalMap.set(ev.submissionId, ev.totalScore);
        });

        const targetSubs = allSubs.filter((s) =>
          pubIds.includes(s.contestId) || pubIds.includes(s.contestTitle)
        );

        const evaluated = targetSubs
          .filter((s) => evalMap.has(s.id))
          .map((s) => ({
            ...s,
            totalScore: evalMap.get(s.id) || 8.0,
          }))
          .sort((a, b) => b.totalScore - a.totalScore);

        if (evaluated.length > 0) {
          const awardLevels: AwardLevel[] = ["FIRST", "SECOND", "THIRD", "HONORABLE"];
          const awardLabels = ["Giải Nhất", "Giải Nhì", "Giải Ba", "Giải Khuyến khích"];

          const results: PublishedResultItem[] = evaluated.map((sub, idx) => {
            const rank = idx + 1;
            const scoreVal = Number(sub.totalScore || 8.0);
            const scoreNum = Number((scoreVal > 10 ? scoreVal / 10 : scoreVal).toFixed(1));

            return {
              id: sub.id,
              rank,
              title: sub.title,
              authorName: sub.authorName || "Thí sinh",
              contestTitle: sub.contestTitle,
              contestId: sub.contestId,
              imageUrl: sub.thumbnailUrls?.[0] || sub.imageUrls?.[0],
              score: scoreNum,
              award: idx < 4 ? awardLevels[idx] : "HONORABLE",
              awardLabel: idx < 4 ? awardLabels[idx] : `Hạng #${rank}`,
              publishedAt: new Date().toISOString().slice(0, 10),
            };
          });
          savePublishedResults(results);
          return results;
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function savePublishedResults(results: PublishedResultItem[]): void {
  try {
    localStorage.setItem(PUBLISHED_RESULTS_KEY, JSON.stringify(results));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("filmcontest:published-results-updated"));
    }
  } catch (err) {
    console.error("Failed to save published results:", err);
  }
}

/** Rút lại công bố cuộc thi khỏi tất cả nền tảng */
export function unpublishContestFromAllPlatforms(contestId: string, contestTitle?: string): void {
  // 1. Xóa khỏi kết quả công bố
  const currentResults = getPublishedResults().filter(
    (r) => r.contestId !== contestId && r.contestTitle !== contestTitle && r.contestTitle !== contestId
  );
  savePublishedResults(currentResults);

  // 2. Xóa khỏi Admin Archives
  const currentAdmin = getAdminPublishedArchives().filter(
    (a) => !a.id.includes(contestId.slice(0, 4).toUpperCase()) && a.contest !== contestTitle && a.contest !== contestId
  );
  localStorage.setItem(ADMIN_ARCHIVES_KEY, JSON.stringify(currentAdmin));

  // 3. Xóa khỏi Organizer Archives
  const currentOrg = getOrganizerPublishedArchives().filter(
    (o) => o && o.contest && o.contest.id !== contestId && o.contest.name !== contestTitle && o.contest.name !== contestId
  );
  localStorage.setItem(ORGANIZER_ARCHIVES_KEY, JSON.stringify(currentOrg));

  // 4. Xóa khỏi Kho ảnh Home
  const currentHome = getPublishedWinningPhotos().filter(
    (p) => p.contestTitle !== contestTitle && p.contestTitle !== contestId
  );
  localStorage.setItem(EXHIBITION_PHOTOS_KEY, JSON.stringify(currentHome));
}

/** Đọc danh sách tác phẩm đoạt giải hiển thị trên Trang Chủ (Exhibition & Winning Photos) */
export function getPublishedWinningPhotos(): PublishedWinningPhoto[] {
  try {
    const raw = localStorage.getItem(EXHIBITION_PHOTOS_KEY);
    let items: PublishedWinningPhoto[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(items) || items.length === 0) items = [...DEFAULT_WINNING_PHOTOS];

    const published = getPublishedResults();
    if (published.length > 0) {
      const contestMap = new Map<string, PublishedResultItem[]>();
      for (const p of published) {
        const cKey = p.contestId || p.contestTitle;
        if (!contestMap.has(cKey)) contestMap.set(cKey, []);
        contestMap.get(cKey)!.push(p);
      }

      const allSubmissions = getAllJudgeAssignedSubmissions();
      const subMap = new Map<string, any>();
      allSubmissions.forEach((s) => subMap.set(s.id, s));

      const awardTypes = [
        { level: "FIRST" as const, title: "Giải Nhất" },
        { level: "SECOND" as const, title: "Giải Nhì" },
        { level: "THIRD" as const, title: "Giải Ba" },
        { level: "HONORABLE" as const, title: "Giải Khuyến khích" },
      ];
      const todayStr = new Date().toISOString().slice(0, 10);

      const top4Photos: PublishedWinningPhoto[] = [];

      contestMap.forEach((subs) => {
        const top4 = [...subs].sort((a, b) => b.score - a.score).slice(0, 4);

        top4.forEach((p, idx) => {
          const awardInfo = awardTypes[idx] || { level: "HONORABLE" as const, title: `Top ${idx + 1}` };
          const subObj = subMap.get(p.id);
          const photoUrl = p.imageUrl || subObj?.thumbnailUrls?.[0] || subObj?.imageUrls?.[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

          top4Photos.push({
            id: `win-${p.id}`,
            title: p.title,
            author: p.authorName,
            award: `${awardInfo.title} - ${p.contestTitle}`,
            awardLevel: awardInfo.level,
            image: photoUrl,
            views: 1250 - idx * 180,
            likes: 380 - idx * 60,
            contestTitle: p.contestTitle,
            publishedAt: todayStr,
            score: p.score,
            filmStock: subObj?.metadata?.filmStock || "Kodak Portra 400",
            camera: subObj?.metadata?.cameraBody || subObj?.metadata?.camera || "Nikon FM2",
            lens: subObj?.metadata?.lens || "50mm f/1.8",
          });
        });
      });

      const merged = [
        ...top4Photos,
        ...items.filter((it) => !top4Photos.some((t) => t.title === it.title || t.id === it.id)),
      ];
      localStorage.setItem(EXHIBITION_PHOTOS_KEY, JSON.stringify(merged));
      return merged;
    }

    return items;
  } catch {
    return DEFAULT_WINNING_PHOTOS;
  }
}

/** Đọc danh sách kho dữ liệu số đoạt giải của Admin */
export function getAdminPublishedArchives(): ArchiveItem[] {
  try {
    const published = getPublishedResults();
    if (!published || published.length === 0) {
      return [];
    }

    const contestMap = new Map<string, PublishedResultItem[]>();
    for (const p of published) {
      const cKey = p.contestId || p.contestTitle;
      if (!contestMap.has(cKey)) contestMap.set(cKey, []);
      contestMap.get(cKey)!.push(p);
    }

    const allSubmissions = getAllJudgeAssignedSubmissions();
    const subMap = new Map<string, any>();
    allSubmissions.forEach((s) => subMap.set(s.id, s));

    const awardLevels: ArchivePrize[] = ["FIRST", "SECOND", "THIRD", "HONORABLE"];
    const awardLabels = ["Giải Nhất", "Giải Nhì", "Giải Ba", "Giải Khuyến khích"];
    const currentYear = new Date().getFullYear();
    const todayStr = new Date().toISOString().slice(0, 10);

    const top4Admin: ArchiveItem[] = [];

    contestMap.forEach((subs, contestKey) => {
      const top4 = [...subs].sort((a, b) => b.score - a.score).slice(0, 4);

      top4.forEach((p, idx) => {
        const awardLevel = awardLevels[idx] || "HONORABLE";
        const awardLabel = awardLabels[idx] || `Top ${idx + 1}`;
        const subObj = subMap.get(p.id);
        const photoUrl = p.imageUrl || subObj?.thumbnailUrls?.[0] || subObj?.imageUrls?.[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

        top4Admin.push({
          id: `ARC-${(p.contestId || contestKey).slice(0, 4).toUpperCase()}-${String(p.id).slice(-4)}`,
          title: p.title,
          author: p.authorName,
          contest: p.contestTitle,
          year: currentYear,
          prize: awardLevel,
          imageUrl: photoUrl,
          awardedAt: todayStr,
          metadata: {
            filmStock: subObj?.metadata?.filmStock || "Kodak Portra 400",
            iso: Number(subObj?.metadata?.iso) || 400,
            camera: subObj?.metadata?.cameraBody || subObj?.metadata?.camera || "Nikon FM2",
            lens: subObj?.metadata?.lens || "50mm f/1.8",
            filmFormat: subObj?.metadata?.filmFormat || subObj?.metadata?.format || "35mm",
            frameNumber: subObj?.metadata?.frameNumber || `0${idx + 1}`,
            developingLab: subObj?.metadata?.developingLab || "Lab Sài Gòn Analog",
            scanDetails: subObj?.metadata?.scanSpec || "Noritsu HS-1800 · 3000 × 2000 px",
          },
          judgeComment: `Tác phẩm đạt ${awardLabel} với điểm số xuất sắc ${(p.score * 10).toFixed(1)}/100. Kỹ thuật chụp ảnh phim điêu luyện, bố cục và ánh sáng truyền tải trọn vẹn cảm xúc nghệ thuật.`,
        });
      });
    });

    try {
      localStorage.setItem(ADMIN_ARCHIVES_KEY, JSON.stringify(top4Admin));
    } catch {}
    return top4Admin;
  } catch {
    return [];
  }
}

/** Đọc danh sách kho dữ liệu đoạt giải của Organizer */
export function getOrganizerPublishedArchives(): StoredOrganizerArchiveItem[] {
  try {
    const published = getPublishedResults();
    if (!published || published.length === 0) {
      return [];
    }

    const contestMap = new Map<string, PublishedResultItem[]>();
    for (const p of published) {
      const cKey = p.contestId || p.contestTitle;
      if (!contestMap.has(cKey)) contestMap.set(cKey, []);
      contestMap.get(cKey)!.push(p);
    }

    const allSubmissions = getAllJudgeAssignedSubmissions();
    const subMap = new Map<string, any>();
    allSubmissions.forEach((s) => subMap.set(s.id, s));

    const awardLevels: AwardLevel[] = ["FIRST", "SECOND", "THIRD", "HONORABLE"];
    const currentYear = new Date().getFullYear();
    const todayStr = new Date().toISOString().slice(0, 10);

    const top4Archives: StoredOrganizerArchiveItem[] = [];

    contestMap.forEach((subs, contestKey) => {
      // Lấy đúng tối đa 4 bài từ Top 1 đến Top 4: mỗi giải 1 bài, 4 giải 4 bài
      const top4 = [...subs].sort((a, b) => b.score - a.score).slice(0, 4);

      top4.forEach((p, idx) => {
        const awardLevel = awardLevels[idx] || "HONORABLE";
        const subObj = subMap.get(p.id);
        const photoUrl = p.imageUrl || subObj?.thumbnailUrls?.[0] || subObj?.imageUrls?.[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

        top4Archives.push({
          result: {
            id: `res-pub-${p.id}`,
            rank: idx + 1,
            title: p.title || "Tác phẩm đạt giải",
            authorName: p.authorName || "Thí sinh",
            score: Number(p.score != null ? p.score : 8.5),
            award: awardLevel,
          },
          contest: {
            id: p.contestId || contestKey,
            name: p.contestTitle,
            description: "Cuộc thi nhiếp ảnh phim quy mô quốc gia.",
            image: photoUrl,
            startDate: `${currentYear}-01-01`,
            endDate: `${currentYear}-12-31`,
            status: "ENDED",
            tags: ["Đời sống", "Đường phố", "Nghệ thuật"],
            submissionCount: subs.length,
            participantCount: subs.length,
            organizer: "Ban Tổ Chức FilmContest",
            prizes: [
              { name: "Giải Nhất", reward: "20.000.000 VNĐ" },
              { name: "Giải Nhì", reward: "10.000.000 VNĐ" },
              { name: "Giải Ba", reward: "5.000.000 VNĐ" },
              { name: "Giải Khuyến khích", reward: "2.000.000 VNĐ" },
            ],
          },
          submission: {
            id: String(p.id),
            code: `SUB-${String(p.id).slice(-4).toUpperCase()}`,
            title: p.title,
            authorName: p.authorName,
            contestName: p.contestTitle,
            submittedAt: todayStr,
            status: "VALID",
            imageUrl: photoUrl,
            metadata: {
              filmStock: subObj?.metadata?.filmStock || "Kodak Portra 400",
              iso: String(subObj?.metadata?.iso || "400"),
              camera: subObj?.metadata?.cameraBody || subObj?.metadata?.camera || "Nikon FM2",
              lens: subObj?.metadata?.lens || "50mm f/1.8",
              format: subObj?.metadata?.filmFormat || subObj?.metadata?.format || "35mm",
              rollCode: "ROLL-01",
              frame: subObj?.metadata?.frameNumber || `0${idx + 1}`,
              location: subObj?.metadata?.shootingLocation || "Việt Nam",
              lab: subObj?.metadata?.developingLab || "Lab Sài Gòn",
              scan: subObj?.metadata?.scanSpec || "Noritsu 3000x2000",
              negative: "Lưu kho",
            },
          },
          year: currentYear,
          imageUrl: photoUrl,
        });
      });
    });

    try {
      localStorage.setItem(ORGANIZER_ARCHIVES_KEY, JSON.stringify(top4Archives));
    } catch {}
    return top4Archives;
  } catch {
    return [];
  }
}

/** Đọc danh sách Top 10 thí sinh đạt giải / xếp hạng cao nhất */
export function getTop10RankedPhotographers(): PhotographerRankItem[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_AUTHORS_KEY);
    if (!raw) {
      const initial = LEADERBOARD_AUTHORS.slice(0, 10);
      localStorage.setItem(LEADERBOARD_AUTHORS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 10);
    }
    return LEADERBOARD_AUTHORS.slice(0, 10);
  } catch {
    return LEADERBOARD_AUTHORS.slice(0, 10);
  }
}

/**
 * Hàm trung tâm: Công bố kết quả cuộc thi
 * - Lưu 3 tác phẩm Giải Nhất, Giải Nhì, Giải Ba vào Kho Dữ Liệu của Organizer & Admin
 * - Show 3 tác phẩm lên chỗ Kho Ảnh Đạt Giải của Trang Chủ
 * - Hiện 10 thí sinh đạt giải lên Trang Chủ chỗ Bảng Xếp Hạng
 */
export function publishContestResultsToAllPlatforms({
  contestId,
  contestTitle,
  evaluatedSubmissions,
}: {
  contestId: string;
  contestTitle: string;
  evaluatedSubmissions: any[];
}): { top3Winners: any[]; top10Photographers: PhotographerRankItem[] } {
  // 1. Lọc và sắp xếp các bài thi đã có điểm theo thứ tự giảm dần
  const sorted = [...evaluatedSubmissions]
    .filter((sub) => sub.evaluation?.totalScore || sub.totalScore)
    .sort((a, b) => {
      const scoreA = Number(a.evaluation?.totalScore ?? a.totalScore ?? 0);
      const scoreB = Number(b.evaluation?.totalScore ?? b.totalScore ?? 0);
      return scoreB - scoreA;
    });

  const currentYear = new Date().getFullYear();
  const todayStr = new Date().toISOString().slice(0, 10);

  // 1.5. CẬP NHẬT MỤC KẾT QUẢ CỦA ORGANIZER & KHO DỮ LIỆU:
  // Kho dữ liệu (Archive): lấy đúng 4 bài từ Top 1 đến Top 4 tương ứng mỗi giải 1 tác phẩm
  const archiveEligible = sorted.slice(0, 4);
  const awardTypes: Array<{ level: "FIRST" | "SECOND" | "THIRD" | "HONORABLE"; title: string; prizeLabel: string }> = [
    { level: "FIRST", title: "Giải Nhất", prizeLabel: "Giải Nhất (Grand Prize)" },
    { level: "SECOND", title: "Giải Nhì", prizeLabel: "Giải Nhì" },
    { level: "THIRD", title: "Giải Ba", prizeLabel: "Giải Ba" },
    { level: "HONORABLE", title: "Khuyến khích", prizeLabel: "Giải Khuyến khích" },
  ];

  // Tab Kết quả: Lưu TOÀN BỘ kết quả (tất cả các bài trong sorted)
  const allPublishedResults: PublishedResultItem[] = sorted.map((sub, idx) => {
    const rank = idx + 1;
    const scoreVal = Number(sub.evaluation?.totalScore ?? sub.totalScore ?? 8.0);
    const normalizedScore = Number((scoreVal > 10 ? scoreVal / 10 : scoreVal).toFixed(1));
    const photoUrl = sub.imageUrls?.[0] || sub.thumbnailUrls?.[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
    const awardInfo = idx < 4 ? awardTypes[idx] : { level: "HONORABLE" as const, title: `Hạng #${rank}`, prizeLabel: `Hạng #${rank}` };

    return {
      id: sub.id,
      rank,
      title: sub.title,
      authorName: sub.authorName || "Thí sinh",
      contestTitle,
      contestId,
      imageUrl: photoUrl,
      score: normalizedScore,
      award: awardInfo.level,
      awardLabel: awardInfo.title,
      publishedAt: todayStr,
    };
  });

  const otherContestsResults = getPublishedResults().filter(
    (r) => r.contestId !== contestId && r.contestTitle !== contestTitle
  );
  savePublishedResults([...allPublishedResults, ...otherContestsResults]);

  // 2. Chuyển đổi thành ArchiveItem cho Admin (tối đa 4 bài đạt giải)
  const newAdminArchives: ArchiveItem[] = archiveEligible.map((sub, idx) => {
    const awardInfo = awardTypes[idx] || { level: "HONORABLE", title: `Top ${idx + 1}`, prizeLabel: "Đạt giải" };
    const scoreVal = Number(sub.evaluation?.totalScore ?? sub.totalScore ?? 9.0);
    const photoUrl = sub.imageUrls?.[0] || sub.thumbnailUrls?.[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
    const author = sub.authorName || `Thí sinh xuất sắc ${idx + 1}`;

    return {
      id: `ARC-${contestId.slice(0, 4).toUpperCase()}-${String(sub.id).slice(-4)}`,
      title: sub.title,
      author,
      contest: contestTitle,
      year: currentYear,
      prize: awardInfo.level as ArchivePrize,
      imageUrl: photoUrl,
      awardedAt: todayStr,
      metadata: {
        filmStock: sub.metadata?.filmStock || "Kodak Portra 400",
        iso: Number(sub.metadata?.iso) || 400,
        camera: sub.metadata?.cameraBody || sub.metadata?.camera || "Nikon FM2",
        lens: sub.metadata?.lens || "50mm f/1.8",
        filmFormat: sub.metadata?.filmFormat || sub.metadata?.format || "35mm",
        frameNumber: sub.metadata?.frameNumber || sub.metadata?.frame || `0${idx + 1}`,
        developingLab: sub.metadata?.developingLab || sub.metadata?.lab || "Lab Sài Gòn Analog",
        scanDetails: sub.metadata?.scanSpec || sub.metadata?.scan || "Noritsu HS-1800 · 3000 × 2000 px",
      },
      judgeComment: sub.evaluation?.comment || `Tác phẩm đạt ${awardInfo.title} với điểm số xuất sắc ${(scoreVal * 10).toFixed(1)}/100. Kỹ thuật chụp ảnh phim điêu luyện, bố cục và ánh sáng truyền tải trọn vẹn cảm xúc nghệ thuật.`,
    };
  });

  // Lưu vào Admin Archives (Top 4 bài đạt giải của cuộc thi này)
  const existingAdminArchives = getAdminPublishedArchives().filter(
    (item) => item.contest !== contestTitle && item.contest !== contestId
  );
  const mergedAdminArchives = [...newAdminArchives, ...existingAdminArchives];
  try {
    localStorage.setItem(ADMIN_ARCHIVES_KEY, JSON.stringify(mergedAdminArchives));
  } catch (err) {
    console.error("Failed to save admin archives:", err);
  }

  // 3. Chuyển đổi thành ArchiveItem cho Organizer (tối đa 4 bài đạt giải)
  const newOrganizerArchives: StoredOrganizerArchiveItem[] = archiveEligible.map((sub, idx) => {
    const awardInfo = awardTypes[idx] || { level: "HONORABLE", title: `Top ${idx + 1}`, prizeLabel: "Đạt giải" };
    const scoreVal = Number(sub.evaluation?.totalScore ?? sub.totalScore ?? 9.0);
    const photoUrl = sub.imageUrls?.[0] || sub.thumbnailUrls?.[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
    const author = sub.authorName || `Thí sinh xuất sắc ${idx + 1}`;

    const result: ContestResult = {
      id: `res-pub-${sub.id}`,
      rank: idx + 1,
      title: sub.title,
      authorName: author,
      score: Number((scoreVal * (scoreVal <= 10 ? 1 : 0.1)).toFixed(1)),
      award: awardInfo.level,
    };

    const contestObj: Contest = {
      id: contestId,
      name: contestTitle,
      description: "Cuộc thi nhiếp ảnh phim quy mô quốc gia.",
      image: photoUrl,
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
      status: "ENDED",
      tags: ["Đời sống", "Đường phố", "Nghệ thuật"],
      submissionCount: evaluatedSubmissions.length || 24,
      participantCount: evaluatedSubmissions.length || 18,
      organizer: "Ban Tổ Chức FilmContest",
      prizes: [
        { name: "Giải Nhất", reward: "20.000.000 VNĐ" },
        { name: "Giải Nhì", reward: "10.000.000 VNĐ" },
        { name: "Giải Ba", reward: "5.000.000 VNĐ" },
        { name: "Giải Khuyến khích", reward: "2.000.000 VNĐ" },
      ],
    };

    const submissionObj: Submission = {
      id: sub.id,
      code: `SUB-${sub.id.slice(-4).toUpperCase()}`,
      title: sub.title,
      authorName: author,
      contestName: contestTitle,
      submittedAt: sub.submittedAt || todayStr,
      status: "VALID",
      imageUrl: photoUrl,
      metadata: {
        filmStock: sub.metadata?.filmStock || "Kodak Portra 400",
        iso: String(sub.metadata?.iso || "400"),
        camera: sub.metadata?.cameraBody || sub.metadata?.camera || "Nikon FM2",
        lens: sub.metadata?.lens || "50mm f/1.8",
        format: sub.metadata?.filmFormat || sub.metadata?.format || "35mm",
        rollCode: "ROLL-01",
        frame: sub.metadata?.frameNumber || `0${idx + 1}`,
        location: sub.metadata?.shootingLocation || "Việt Nam",
        lab: sub.metadata?.developingLab || "Lab Sài Gòn",
        scan: sub.metadata?.scanSpec || "Noritsu 3000x2000",
        negative: "Lưu kho",
      },
    };

    return {
      result,
      contest: contestObj,
      submission: submissionObj,
      year: currentYear,
      imageUrl: photoUrl,
    };
  });

  const existingOrgArchives = getOrganizerPublishedArchives().filter(
    (item) => item.contest.name !== contestTitle && item.contest.id !== contestId
  );
  const mergedOrgArchives = [...newOrganizerArchives, ...existingOrgArchives];
  try {
    localStorage.setItem(ORGANIZER_ARCHIVES_KEY, JSON.stringify(mergedOrgArchives));
  } catch (err) {
    console.error("Failed to save organizer archives:", err);
  }

  // 4. Cập nhật Kho Ảnh Đạt Giải của Trang Chủ (Exhibition & Winning Photos) - tối đa 4 tác phẩm
  const newExhibitionPhotos: PublishedWinningPhoto[] = archiveEligible.map((sub, idx) => {
    const awardInfo = awardTypes[idx] || { level: "HONORABLE", title: `Top ${idx + 1}`, prizeLabel: "Đạt giải" };
    const scoreVal = Number(sub.evaluation?.totalScore ?? sub.totalScore ?? 9.0);
    const photoUrl = sub.imageUrls?.[0] || sub.thumbnailUrls?.[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
    const author = sub.authorName || `Thí sinh xuất sắc ${idx + 1}`;

    return {
      id: `win-${sub.id}`,
      title: sub.title,
      author,
      award: `${awardInfo.title} - ${contestTitle}`,
      awardLevel: awardInfo.level,
      image: photoUrl,
      views: 1250 - idx * 180,
      likes: 380 - idx * 60,
      contestTitle,
      publishedAt: todayStr,
      score: Number((scoreVal * (scoreVal <= 10 ? 1 : 0.1)).toFixed(1)),
      filmStock: sub.metadata?.filmStock || "Kodak Portra 400",
      camera: sub.metadata?.cameraBody || sub.metadata?.camera || "Nikon FM2",
      lens: sub.metadata?.lens || "50mm f/1.8",
    };
  });

  const existingWinningPhotos = getPublishedWinningPhotos();
  const mergedWinningPhotos = [
    ...newExhibitionPhotos,
    ...existingWinningPhotos.filter((p) => !newExhibitionPhotos.some((n) => n.id === p.id || n.title === p.title)),
  ];
  try {
    localStorage.setItem(EXHIBITION_PHOTOS_KEY, JSON.stringify(mergedWinningPhotos));
  } catch (err) {
    console.error("Failed to save winning photos:", err);
  }

  // 5. Cập nhật Bảng Xếp Hạng Top 10 Thí Sinh Đạt Giải trên Trang Chủ
  const currentLeaderboard = getTop10RankedPhotographers();
  const authorAvatarPool = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  ];

  // Tạo danh sách thí sinh từ top vừa đoạt giải (tối đa 4 người đạt giải)
  const updatedContestants: PhotographerRankItem[] = archiveEligible.map((sub, idx) => {
    const authorName = sub.authorName || `Thí sinh ${idx + 1}`;
    // Kiểm tra xem thí sinh đã có trong bảng xếp hạng chưa
    const existing = currentLeaderboard.find((a) => a.name.toLowerCase() === authorName.toLowerCase());
    const isGold = idx === 0;
    const isSilver = idx === 1;
    const isBronze = idx === 2;

    const goldCount = (existing?.gold ?? 0) + (isGold ? 1 : 0);
    const silverCount = (existing?.silver ?? 0) + (isSilver ? 1 : 0);
    const bronzeCount = (existing?.bronze ?? 0) + (isBronze ? 1 : 0);
    const submissionCount = (existing?.submissionCount ?? 0) + 1;
    const totalPoints = (existing?.totalPoints ?? 0) + (isGold ? 500 : isSilver ? 350 : isBronze ? 250 : 150);

    return {
      rank: idx + 1,
      id: existing?.id || `user-pub-${sub.id}`,
      name: authorName,
      avatar: existing?.avatar || authorAvatarPool[idx % authorAvatarPool.length],
      submissionCount,
      gold: goldCount,
      silver: silverCount,
      bronze: bronzeCount,
      totalPoints,
      year: String(currentYear),
      contestId,
      badge: isGold ? "Quán quân mùa thi" : isSilver ? "Á quân mùa thi" : isBronze ? "Quý quân mùa thi" : "Khuyến khích",
    };
  });

  // Ghép các thí sinh còn lại từ leaderboard cũ để đủ đúng 10 người
  const remaining = currentLeaderboard.filter(
    (a) => !updatedContestants.some((u) => u.name.toLowerCase() === a.name.toLowerCase())
  );

  // Sắp xếp lại theo điểm tổng và phân thứ hạng 1..10
  const full10List = [...updatedContestants, ...remaining]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  try {
    localStorage.setItem(LEADERBOARD_AUTHORS_KEY, JSON.stringify(full10List));
  } catch (err) {
    console.error("Failed to save leaderboard authors:", err);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("filmcontest:published-results-updated"));
  }

  return {
    top3Winners: archiveEligible,
    top10Photographers: full10List,
  };
}
