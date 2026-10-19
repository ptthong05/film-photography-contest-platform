import { CalendarClock, ClipboardCheck, ImagePlus, ListChecks } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { JudgeNotification, JudgeNotificationType } from '../../../types/judge';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';

const TYPE_CONFIG: Record<JudgeNotificationType, { icon: LucideIcon; className: string }> = {
  ASSIGNMENT: { icon: ClipboardCheck, className: 'bg-blue-50 text-blue-600' },
  DEADLINE: { icon: CalendarClock, className: 'bg-orange-50 text-orange-600' },
  NEW_SUBMISSION: { icon: ImagePlus, className: 'bg-indigo-50 text-indigo-600' },
  CRITERIA_UPDATE: { icon: ListChecks, className: 'bg-emerald-50 text-emerald-600' },
};

interface NotificationItemProps {
  notification: JudgeNotification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { icon: Icon, className } = TYPE_CONFIG[notification.type];

  return (
    <li className="flex gap-3 py-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${className}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${notification.isRead ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>
          {notification.message}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{formatRelativeTime(notification.createdAt)}</p>
      </div>
      {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Chưa đọc" />}
    </li>
  );
}
