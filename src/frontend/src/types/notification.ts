/** Khớp với enum com.example.backend.enums.NotificationType */
export type NotificationType =
  | 'ASSIGNMENT'
  | 'DEADLINE'
  | 'NEW_SUBMISSION'
  | 'CRITERIA_UPDATE'
  | 'SUBMISSION_STATUS'
  | 'RESULT_PUBLISHED';

/** Khớp với NotificationResponse của backend */
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  isRead: boolean;
}
