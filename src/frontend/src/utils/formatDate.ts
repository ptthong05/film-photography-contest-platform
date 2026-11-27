/** Định dạng ngày theo kiểu Việt Nam (dd/MM/yyyy); giá trị thiếu hoặc không phải ngày hiển thị "—". */
export function formatDate(value: string | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
