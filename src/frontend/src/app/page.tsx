import { useState } from 'react';
import type { Portal } from '../types/portal';
import { BackButton } from '../components/BackButton';
import HomePage from './home/page';
import AuthPage from './auth/page';
import AdminPage from './admin/page';
import OrganizerPage from './organizer/page';
import JudgePage from './judge/page';
import ParticipantPage from './participant/page';

export default function RootPage() {
  const [activePortal, setActivePortal] = useState<Portal>('HOME');

  const goHome = () => setActivePortal('HOME');

  if (activePortal === 'HOME') {
    return <HomePage onSelectPortal={setActivePortal} />;
  }

  return (
    <div className="relative">
      {activePortal !== 'JUDGE' && <BackButton label="Về Trang Chủ" onClick={goHome} />}
      {activePortal === 'AUTH' && <AuthPage onLoginSuccess={setActivePortal} />}
      {activePortal === 'ADMIN' && <AdminPage />}
      {activePortal === 'ORGANIZER' && <OrganizerPage />}
      {activePortal === 'JUDGE' && <JudgePage onExit={goHome} />}
      {activePortal === 'PARTICIPANT' && <ParticipantPage />}
    </div>
  );
}
