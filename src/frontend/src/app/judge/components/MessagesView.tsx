import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { judgeService } from '../../../services/judgeService';
import type { JudgeNotification } from '../../../types/judge';
import { NotificationItem } from './NotificationItem';

interface MessagesViewProps {
  notifications: JudgeNotification[];
}

export function MessagesView({ notifications }: MessagesViewProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasUnread = notifications.some((item) => !item.isRead);

  const handleMarkAllRead = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      // Service phát sự kiện để trang giám khảo tải lại danh sách
      await judgeService.markAllNotificationsRead();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật thông báo');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    setError(null);
    try {
      await judgeService.markNotificationRead(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật thông báo');
    }
  };

  return (
    <section className="judge-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900">Tất cả thông báo</h2>
        <button type="button" onClick={() => void handleMarkAllRead()} disabled={!hasUnread || isUpdating} className="judge-btn-outline px-3 py-1.5 text-xs">
          <CheckCheck className="h-4 w-4" /> Đánh dấu tất cả đã đọc
        </button>
      </div>
      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {notifications.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">Bạn chưa có thông báo nào.</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-100">
          {notifications.map((item) => (
            <NotificationItem key={item.id} notification={item} onMarkRead={(id) => void handleMarkRead(id)} />
          ))}
        </ul>
      )}
    </section>
  );
}
