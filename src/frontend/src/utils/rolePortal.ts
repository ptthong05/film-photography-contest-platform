import type { DashboardPortal, Portal } from '../types/portal';
import type { Role } from '../types/user';

/** Mỗi role chỉ được vào đúng một trang quản lý. */
export const ROLE_PORTAL: Record<Role, DashboardPortal> = {
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  JUDGE: 'JUDGE',
  PARTICIPANT: 'PARTICIPANT',
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Quản trị viên',
  ORGANIZER: 'Ban tổ chức',
  JUDGE: 'Giám khảo',
  PARTICIPANT: 'Thí sinh',
};

export function isDashboardPortal(portal: Portal): portal is DashboardPortal {
  return Object.values(ROLE_PORTAL).includes(portal as DashboardPortal);
}
