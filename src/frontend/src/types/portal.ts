export type Portal =
  | 'HOME'
  | 'AUTH'
  | 'ADMIN'
  | 'ORGANIZER'
  | 'JUDGE'
  | 'PARTICIPANT'
  | 'CONTESTS'
  | 'CONTEST_DETAIL'
  | 'PHOTO_DETAIL'
  | 'AUTHOR_PROFILE'
  | 'WINNING_PHOTOS';

export type DashboardPortal = Exclude<
  Portal,
  'HOME' | 'AUTH' | 'CONTESTS' | 'CONTEST_DETAIL' | 'PHOTO_DETAIL' | 'AUTHOR_PROFILE' | 'WINNING_PHOTOS'
>;
