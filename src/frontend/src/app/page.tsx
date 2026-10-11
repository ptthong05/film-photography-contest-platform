import { useState } from 'react';
import type { Portal } from '../types/portal';
import HomePage from './home/page';
import AuthPage from './auth/page';
import AdminPage from './admin/page';
import OrganizerPage from './organizer/page';
import JudgePage from './judge/page';
import ParticipantPage from './participant/page';

export default function RootPage() {
  const [activePortal, setActivePortal] = useState<Portal>('PARTICIPANT');

  const goHome = () => setActivePortal('HOME');

  if (activePortal === 'HOME') {
    return <HomePage onSelectPortal={setActivePortal} />;
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800">
      {activePortal === 'AUTH' && <AuthPage onLoginSuccess={setActivePortal} />}
      {activePortal === 'ADMIN' && <AdminPage />}
      {activePortal === 'ORGANIZER' && <OrganizerPage />}
      {activePortal === 'JUDGE' && <JudgePage />}
      {activePortal === 'PARTICIPANT' && <ParticipantPage onGoHome={goHome} />}
    </div>
  );
}