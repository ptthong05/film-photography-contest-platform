import type { JudgeNotification, JudgeProfile } from '../types/judge';

// Dữ liệu mẫu cho phần Judge Portal mà backend chưa có module: hồ sơ chuyên môn và thông báo.
// Cuộc thi, bài dự thi, phiếu chấm đã lấy từ API /judges/me (xem judgeService.ts).

export const mockProfile: JudgeProfile = {
  id: 'judge-01',
  fullName: 'Trần Thị Bình',
  email: 'tranthibinh@filmcontest.vn',
  phone: '0901 234 567',
  specialty: 'Nhiếp ảnh phim',
  yearsOfExperience: 12,
  bio: 'Nhiếp ảnh gia và giám khảo các cuộc thi nhiếp ảnh phim trong và ngoài nước. Quan tâm đặc biệt tới ảnh đường phố và chân dung đen trắng.',
  avatarUrl: '',
};

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const mockNotifications: JudgeNotification[] = [
  { id: 'nt-1', type: 'ASSIGNMENT', message: 'Bạn được phân công chấm vòng sơ khảo cuộc thi Analog Moments 2025', createdAt: hoursAgo(2), isRead: false },
  { id: 'nt-2', type: 'DEADLINE', message: 'Hạn chấm điểm vòng sơ khảo Analog Moments 2025 còn 5 ngày', createdAt: hoursAgo(24), isRead: false },
  { id: 'nt-3', type: 'NEW_SUBMISSION', message: 'Có 4 bài dự thi mới được phân công trong cuộc thi Film & City', createdAt: hoursAgo(26), isRead: true },
  { id: 'nt-4', type: 'CRITERIA_UPDATE', message: 'Ban tổ chức đã cập nhật tiêu chí chấm cuộc thi Film & City', createdAt: hoursAgo(50), isRead: true },
];
