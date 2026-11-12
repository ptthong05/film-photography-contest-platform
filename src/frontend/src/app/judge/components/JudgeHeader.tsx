import type { JudgeProfile } from '../../../types/judge';
import { PortalHeader } from '../../../components/PortalHeader';

interface JudgeHeaderProps {
  title: string;
  subtitle: string;
  profile: JudgeProfile | null;
  unreadCount: number;
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onExit: () => void;
}

export function JudgeHeader({
  title,
  subtitle,
  profile,
  unreadCount = 2,
  onOpenMenu,
  onOpenNotifications,
  onOpenProfile,
  onExit,
}: JudgeHeaderProps) {
  return (
    <PortalHeader
      title={title}
      subtitle={subtitle}
      userName={profile?.fullName ?? 'Trần Thị Bình'}
      userRole="Giám khảo"
      avatarUrl={profile?.avatarUrl || (typeof window !== 'undefined' ? localStorage.getItem('judge_avatar') : null)}
      unreadCount={unreadCount}
      onOpenProfile={onOpenProfile}
      onGoHome={onExit}
      onOpenMenu={onOpenMenu}
      onViewAllNotifications={onOpenNotifications}
    />
  );
}
