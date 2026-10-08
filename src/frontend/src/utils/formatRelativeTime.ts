import { formatDate } from './formatDate';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** "5 phút trước", "2 giờ trước", "3 ngày trước"; quá 7 ngày thì hiển thị ngày dd/MM/yyyy. */
export function formatRelativeTime(value: string | Date): string {
  const diff = Date.now() - new Date(value).getTime();
  if (diff < MINUTE_MS) {
    return 'Vừa xong';
  }
  if (diff < HOUR_MS) {
    return `${Math.floor(diff / MINUTE_MS)} phút trước`;
  }
  if (diff < DAY_MS) {
    return `${Math.floor(diff / HOUR_MS)} giờ trước`;
  }
  if (diff < 7 * DAY_MS) {
    return `${Math.floor(diff / DAY_MS)} ngày trước`;
  }
  return formatDate(value);
}
