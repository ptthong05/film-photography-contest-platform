import { useMemo } from 'react';
import type { JudgeNotification, JudgeNotificationType, JudgeProfile } from '../../../types/judge';
import { PortalHeader, type NotificationItem } from '../../../components/PortalHeader';
import { judgeService } from '../../../services/judgeService';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';

/** Chuông chỉ hiện vài thông báo mới nhất, đầy đủ ở trang Tin nhắn */
const BELL_LIMIT = 5;

const TYPE_TITLES: Record<JudgeNotificationType, string> = {
  ASSIGNMENT: 'Phân công chấm',
  DEADLINE: 'Nhắc hạn chấm',
  NEW_SUBMISSION: 'Bài dự thi mới',
  CRITERIA_UPDATE: 'Cập nhật tiêu chí',
};

interface JudgeHeaderProps {
  title: string;
  subtitle: string;
  profile: JudgeProfile | null;
  notifications: JudgeNotification[];
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onExit: () => void;
}

function toBellItem(item: JudgeNotification): NotificationItem {
  return {
    id: item.id,
    title: TYPE_TITLES[item.type] ?? 'Thông báo',
    content: item.message,
    time: formatRelativeTime(item.createdAt),
    type: item.type === 'DEADLINE' ? 'alert' : 'info',
    isRead: item.isRead,
  };
}

export function JudgeHeader({
  title,
  subtitle,
  profile,
  notifications,
  onOpenMenu,
  onOpenNotifications,
  onOpenProfile,
  onExit,
}: JudgeHeaderProps) {
  const bellItems = useMemo(() => notifications.slice(0, BELL_LIMIT).map(toBellItem), [notifications]);
  // Đếm trên toàn bộ danh sách, không chỉ phần hiện trong chuông
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <PortalHeader
      title={title}
      subtitle={subtitle}
      userName={profile?.fullName ?? ''}
      userRole="Giám khảo"
      avatarUrl={profile?.avatarUrl || null}
      notifications={bellItems}
      unreadCount={unreadCount}
      onMarkAllRead={() => void judgeService.markAllNotificationsRead().catch(() => {})}
      onMarkItemRead={(id) => void judgeService.markNotificationRead(id).catch(() => {})}
      onOpenProfile={onOpenProfile}
      onGoHome={onExit}
      onOpenMenu={onOpenMenu}
      onViewAllNotifications={onOpenNotifications}
    />
  );
}
