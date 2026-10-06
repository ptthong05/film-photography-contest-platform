export type Portal = 'HOME' | 'AUTH' | 'ADMIN' | 'ORGANIZER' | 'JUDGE' | 'PARTICIPANT';

export type DashboardPortal = Exclude<Portal, 'HOME' | 'AUTH'>;
