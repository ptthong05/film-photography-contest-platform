import { formatDate } from './formatDate';
import { readTimeSimulation } from '../services/contestSyncService';

/**
 * Kiểm tra xem thời gian chấm điểm của vòng chấm đã hết hạn hay chưa.
 * @param endDate Chuỗi ngày kết thúc vòng chấm (VD: '2026-11-15' hoặc ISO string)
 * @param contestId (Tùy chọn) Mã cuộc thi để kiểm tra ghi đè mô phỏng
 * @returns boolean: true nếu thời gian hiện tại đã vượt qua hạn chót chấm điểm.
 */
export function isJudgingExpired(endDate?: string | null, contestId?: string): boolean {
  if (contestId) {
    const sim = readTimeSimulation();
    if (sim[contestId] === 'JUDGING_CLOSED') return true;
    if (sim[contestId] === 'OPEN' || sim[contestId] === 'SUBMISSION_CLOSED') return false;
  }
  if (!endDate) return false;
  // Thiết lập cuối ngày của endDate (23:59:59.999) nếu chỉ có YYYY-MM-DD
  const deadline = new Date(endDate);
  if (endDate.length <= 10) {
    deadline.setHours(23, 59, 59, 999);
  }
  return new Date().getTime() > deadline.getTime();
}

/**
 * Lấy nhãn thông báo thời hạn chấm điểm.
 */
export function getJudgingDeadlineInfo(endDate?: string | null, contestId?: string): {
  isExpired: boolean;
  message: string;
} {
  const expired = isJudgingExpired(endDate, contestId);
  if (expired) {
    return {
      isExpired: true,
      message: `Đã hết thời hạn chấm điểm (hạn chót: ${endDate ? formatDate(endDate) : 'Đã qua hạn'}). Cổng chấm điểm đã đóng.`,
    };
  }
  if (!endDate) {
    return { isExpired: false, message: 'Đang mở cổng chấm điểm' };
  }
  return {
    isExpired: false,
    message: `Thời hạn chấm điểm: đến hết ngày ${formatDate(endDate)}`,
  };
}
