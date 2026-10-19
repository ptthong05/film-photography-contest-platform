import React, { useState } from 'react';
import type { DashboardPortal, Portal } from '../../types/portal';
import { Navbar } from '../home/components/Navbar';
import { Footer } from '../home/components/Footer';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';

export interface AuthPageProps {
  initialMode?: 'LOGIN' | 'REGISTER';
  onGoHome?: () => void;
  onSelectPortal?: (portal: Portal) => void;
  onLoginSuccess?: (portal: DashboardPortal) => void;
}

export default function AuthPage({
  initialMode = 'LOGIN',
  onGoHome,
  onSelectPortal,
  onLoginSuccess,
}: AuthPageProps) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. Header / Navbar - Clean, no Role/Portal selector box */}
      <Navbar
        onGoHome={onGoHome}
        onSelectPortal={onSelectPortal}
        onLoginClick={() => setMode('LOGIN')}
        onRegisterClick={() => setMode('REGISTER')}
      />

      {/* 2. Main Authentication Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-100/70">
        {mode === 'LOGIN' ? (
          <LoginForm
            onSwitchToRegister={() => setMode('REGISTER')}
            onSubmitSuccess={() => onLoginSuccess?.('PARTICIPANT')}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setMode('LOGIN')}
            onSubmitSuccess={() => onLoginSuccess?.('PARTICIPANT')}
          />
        )}
      </main>

      {/* 3. Footer */}
      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
