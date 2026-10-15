import type { Contest, OverviewStats } from "../types/contest";
import type { Judge, OrganizerProfile, Participant } from "../types/organizerUser";
import type { Assignment } from "../types/assignment";
import type { ContestResult } from "../types/result";
import type { ReportItem } from "../types/report";
import type { Submission } from "../types/submission";

export const MOCK_OVERVIEW_STATS: OverviewStats = {
  ongoingContests: 5,
  participants: 1248,
  submissions: 3642,
  judges: 28,
};

export const MOCK_CONTESTS: Contest[] = [
  { id: "c1", name: "Analog Moments 2025", startDate: "2025-06-01", endDate: "2025-09-30", participantCount: 342, submissionCount: 1025, status: "ONGOING" },
  { id: "c2", name: "Film & City", startDate: "2025-08-15", endDate: "2025-11-30", participantCount: 285, submissionCount: 680, status: "UPCOMING" },
  { id: "c3", name: "The Vintage Look", startDate: "2025-07-10", endDate: "2025-09-30", participantCount: 198, submissionCount: 540, status: "ENDED" },
  { id: "c4", name: "Nature on Film", startDate: "2023-06-01", endDate: "2023-12-21", participantCount: 160, submissionCount: 426, status: "ENDED" },
  { id: "c5", name: "Street Life", startDate: "2023-03-12", endDate: "2023-06-30", participantCount: 120, submissionCount: 310, status: "ENDED" },
];

export const MOCK_PARTICIPANTS: Participant[] = [
  { id: "p1", fullName: "Trần Minh Quân", email: "quantran@gmail.com", submissionCount: 3, registeredAt: "2025-06-10", status: "ACTIVE" },
  { id: "p2", fullName: "Lê Thu Hà", email: "ha.le@gmail.com", submissionCount: 2, registeredAt: "2025-06-12", status: "ACTIVE" },
  { id: "p3", fullName: "Nguyễn Hoàng Nam", email: "nam.ng@gmail.com", submissionCount: 5, registeredAt: "2025-06-15", status: "ACTIVE" },
  { id: "p4", fullName: "Phạm Thị Dung", email: "dung.pt@gmail.com", submissionCount: 2, registeredAt: "2025-06-16", status: "LOCKED" },
  { id: "p5", fullName: "Đỗ Minh Đức", email: "duc.dm@gmail.com", submissionCount: 1, registeredAt: "2025-06-20", status: "ACTIVE" },
];

export const MOCK_SUBMISSIONS: Submission[] = [
  { id: "s1", title: "Chiều bên hồ", authorName: "Nguyễn Văn A", contestName: "Analog Moments 2025", submittedAt: "2025-06-10", status: "VALID" },
  { id: "s2", title: "Góc phố cũ", authorName: "Lê Minh Cường", contestName: "Film & City", submittedAt: "2025-06-12", status: "VALID" },
  { id: "s3", title: "Ánh sáng cuối ngày", authorName: "Phạm Thị Dung", contestName: "The Vintage Look", submittedAt: "2025-06-15", status: "SUSPECT_AI" },
  { id: "s4", title: "Ga xưa", authorName: "Đỗ Minh G", contestName: "Film & City", submittedAt: "2025-06-16", status: "VALID" },
  { id: "s5", title: "Nhịp sống thành phố", authorName: "Trần Văn H", contestName: "Analog Moments 2025", submittedAt: "2025-06-20", status: "PENDING" },
];

export const MOCK_JUDGES: Judge[] = [
  { id: "j1", fullName: "Trần Quang Huy", email: "huy.tq@gmail.com", specialty: "Nhiếp ảnh phim", contestCount: 3, status: "ACTIVE" },
  { id: "j2", fullName: "Lê Thị Mai", email: "mai.lt@gmail.com", specialty: "Nhiếp ảnh nghệ thuật", contestCount: 2, status: "ACTIVE" },
  { id: "j3", fullName: "Nguyễn Hoàng Nam", email: "nam.nh@gmail.com", specialty: "Nhiếp ảnh phong cảnh", contestCount: 4, status: "ACTIVE" },
  { id: "j4", fullName: "Phạm Thu Trang", email: "trang.pt@gmail.com", specialty: "Nhiếp ảnh tài liệu", contestCount: 1, status: "LOCKED" },
  { id: "j5", fullName: "Đỗ Khánh Quân", email: "quan.dk@gmail.com", specialty: "Nhiếp ảnh đường phố", contestCount: 1, status: "ACTIVE" },
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
