import type { Contest, OverviewStats } from "../types/contest";
import type { Judge, OrganizerProfile, Participant } from "../types/organizerUser";
import type { Assignment } from "../types/assignment";
import type { ContestResult } from "../types/result";
import type { ReportItem } from "../types/report";
import type { FilmMetadata, Submission } from "../types/submission";

export const MOCK_OVERVIEW_STATS: OverviewStats = {
  ongoingContests: 5,
  participants: 1248,
  submissions: 3642,
  judges: 28,
};

export const MOCK_CONTESTS: Contest[] = [
  { id: "c1", name: "Analog Moments 2025", startDate: "2025-06-01", endDate: "2025-09-30", participantCount: 342, submissionCount: 1025, status: "ONGOING", tags: ["Phong cảnh", "Chân dung", "Đời sống"], description: "Cuộc thi nhiếp ảnh phim quy mô toàn quốc dành cho cộng đồng yêu thích nhiếp ảnh cơ học truyền thống.", prizes: [{ name: "Giải Nhất", reward: "10.000.000đ" }, { name: "Giải Nhì", reward: "5.000.000đ" }, { name: "Giải Ba", reward: "2.000.000đ" }], judgeNames: ["Trần Quang Huy", "Lê Thị Mai"] },
  { id: "c2", name: "Film & City", startDate: "2025-08-15", endDate: "2025-11-30", participantCount: 285, submissionCount: 680, status: "UPCOMING", tags: ["Đường phố", "Kiến trúc"] },
  { id: "c3", name: "The Vintage Look", startDate: "2025-07-10", endDate: "2025-09-30", participantCount: 198, submissionCount: 540, status: "ENDED", tags: ["Hoài cổ", "Chân dung"] },
  { id: "c4", name: "Nature on Film", startDate: "2023-06-01", endDate: "2023-12-21", participantCount: 160, submissionCount: 426, status: "ENDED" },
  { id: "c5", name: "Street Life", startDate: "2023-03-12", endDate: "2023-06-30", participantCount: 120, submissionCount: 310, status: "ENDED" },
];

export const MOCK_PARTICIPANTS: Participant[] = [
  { id: "p1", fullName: "Trần Minh Quân", email: "quantran@gmail.com", submissionCount: 3, registeredAt: "2025-06-10", status: "ACTIVE", recentSubmissions: [{ id: "ps1", title: "Ánh nắng cuối ngày", contestName: "Analog Moments 2025", submittedAt: "2025-06-18", status: "VALID" }, { id: "ps2", title: "Qua ô cửa cũ", contestName: "Film & City", submittedAt: "2025-06-14", status: "PENDING" }] },
  { id: "p2", fullName: "Lê Thu Hà", email: "ha.le@gmail.com", submissionCount: 2, registeredAt: "2025-06-12", status: "ACTIVE", recentSubmissions: [{ id: "ps3", title: "Mùa hè trong veo", contestName: "The Vintage Look", submittedAt: "2025-06-21", status: "VALID" }] },
  { id: "p3", fullName: "Nguyễn Hoàng Nam", email: "nam.ng@gmail.com", submissionCount: 5, registeredAt: "2025-06-15", status: "ACTIVE", recentSubmissions: [{ id: "ps4", title: "Một góc bình yên", contestName: "Nature on Film", submittedAt: "2025-06-24", status: "PENDING" }, { id: "ps5", title: "Vệt nắng qua phố", contestName: "Film & City", submittedAt: "2025-06-19", status: "VALID" }] },
  { id: "p4", fullName: "Phạm Thị Dung", email: "dung.pt@gmail.com", submissionCount: 2, registeredAt: "2025-06-16", status: "LOCKED", recentSubmissions: [{ id: "ps6", title: "Tĩnh lặng", contestName: "Analog Moments 2025", submittedAt: "2025-06-25", status: "PENDING" }] },
  { id: "p5", fullName: "Đỗ Minh Đức", email: "duc.dm@gmail.com", submissionCount: 1, registeredAt: "2025-06-20", status: "ACTIVE", recentSubmissions: [{ id: "ps7", title: "Chuyến tàu sớm", contestName: "Film & City", submittedAt: "2025-06-27", status: "VALID" }] },
];

const sampleMetadata = (filmStock: string, camera: string, rollCode: string): FilmMetadata => ({
  filmStock,
  iso: "400",
  camera,
  lens: "50mm f/1.8",
  format: "35mm",
  rollCode,
  frame: "24",
  location: "TP. Hồ Chí Minh",
  lab: "Lab A (mẫu)",
  scan: "JPEG · 3000 × 2000 px · 24-bit",
  negative: "Có (mẫu)",
});

export const MOCK_SUBMISSIONS: Submission[] = [
  { id: "s1", code: "SUB-001", title: "Chiều bên hồ", authorName: "Nguyễn Văn A", contestName: "Analog Moments 2025", submittedAt: "2025-06-10", status: "VALID", metadata: sampleMetadata("Kodak Portra 400", "Nikon FM2", "ROLL-001") },
  { id: "s2", code: "SUB-002", title: "Góc phố cũ", authorName: "Lê Minh Cường", contestName: "Film & City", submittedAt: "2025-06-12", status: "VALID", metadata: sampleMetadata("Fujifilm C200", "Canon AE-1", "ROLL-002") },
  { id: "s3", code: "SUB-003", title: "Ánh sáng cuối ngày", authorName: "Phạm Thị Dung", contestName: "The Vintage Look", submittedAt: "2025-06-15", status: "PENDING", metadata: sampleMetadata("Ilford HP5 Plus", "Pentax K1000", "ROLL-003") },
  { id: "s4", code: "SUB-004", title: "Ga xưa", authorName: "Đỗ Minh G", contestName: "Film & City", submittedAt: "2025-06-16", status: "VALID", metadata: sampleMetadata("Kodak Gold 200", "Olympus OM-1", "ROLL-004") },
  { id: "s5", code: "SUB-005", title: "Nhịp sống thành phố", authorName: "Trần Văn H", contestName: "Analog Moments 2025", submittedAt: "2025-06-20", status: "PENDING", metadata: sampleMetadata("CineStill 800T", "Leica M6", "ROLL-005") },
];

export const MOCK_JUDGES: Judge[] = [
  { id: "j1", fullName: "Trần Quang Huy", email: "huy.tq@gmail.com", specialty: "Nhiếp ảnh phim", contestCount: 3, status: "ACTIVE", isDefault: true },
  { id: "j2", fullName: "Lê Thị Mai", email: "mai.lt@gmail.com", specialty: "Nhiếp ảnh nghệ thuật", contestCount: 2, status: "ACTIVE", isDefault: true },
  { id: "j3", fullName: "Nguyễn Hoàng Nam", email: "nam.nh@gmail.com", specialty: "Nhiếp ảnh phong cảnh", contestCount: 4, status: "ACTIVE", isDefault: false },
  { id: "j4", fullName: "Phạm Thu Trang", email: "trang.pt@gmail.com", specialty: "Nhiếp ảnh tài liệu", contestCount: 1, status: "LOCKED", isDefault: false },
  { id: "j5", fullName: "Đỗ Khánh Quân", email: "quan.dk@gmail.com", specialty: "Nhiếp ảnh đường phố", contestCount: 1, status: "ACTIVE", isDefault: false },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: "a1", judgeName: "Trần Quang Huy", contestName: "Analog Moments 2025", assignedCount: 120, reviewedCount: 84 },
  { id: "a2", judgeName: "Lê Thị Mai", contestName: "Analog Moments 2025", assignedCount: 120, reviewedCount: 120 },
  { id: "a3", judgeName: "Nguyễn Hoàng Nam", contestName: "Film & City", assignedCount: 95, reviewedCount: 10 },
  { id: "a4", judgeName: "Phạm Thu Trang", contestName: "Film & City", assignedCount: 95, reviewedCount: 0 },
];

export const MOCK_RESULTS: ContestResult[] = [
  { id: "r1", rank: 1, title: "Hoàng hôn phố cổ", authorName: "Nguyễn Văn A", score: 9.4, award: "FIRST" },
  { id: "r2", rank: 2, title: "Góc phố cũ", authorName: "Lê Minh Cường", score: 9.1, award: "SECOND" },
  { id: "r3", rank: 3, title: "Nhịp sống TP", authorName: "Trần Văn H", score: 8.8, award: "THIRD" },
  { id: "r4", rank: 4, title: "Chiều bên hồ", authorName: "Nguyễn Văn A", score: 8.5, award: "HONORABLE" },
];

export const MOCK_TYPE_DISTRIBUTION: ReportItem[] = [
  { label: "Phong cảnh", percent: 32 },
  { label: "Đường phố", percent: 27 },
  { label: "Chân dung", percent: 21 },
  { label: "Tài liệu", percent: 12 },
  { label: "Khác", percent: 8 },
];

export const MOCK_PROFILE: OrganizerProfile = {
  fullName: "Nguyễn Văn A",
  email: "nguyenvana@gmail.com",
  phone: "0901 234 567",
  role: "Organizer",
  bio: "Người tổ chức các cuộc thi nhiếp ảnh phim, yêu thích nhiếp ảnh analog.",
};
