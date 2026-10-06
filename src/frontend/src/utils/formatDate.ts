/** Hàm mẫu: định dạng ngày theo kiểu Việt Nam (dd/MM/yyyy). */
export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
