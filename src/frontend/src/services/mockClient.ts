// Backend chưa có endpoint cho portal Organizer nên tạm giả lập độ trễ mạng.
// Khi API sẵn sàng: thay mockRequest(...) trong từng service bằng request<T>("/contests").
export function mockRequest<T>(data: T, delayMs = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
}
