import React, { useState } from 'react';
import { Info } from 'lucide-react';
import type { DashboardPortal, Portal } from '../../types/portal';
import type { User } from '../../types/user';
import { ROLE_PORTAL } from '../../utils/rolePortal';
import { Navbar } from '../home/components/Navbar';
import { Footer } from '../home/components/Footer';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';

export interface AuthPageProps {
  initialMode?: 'LOGIN' | 'REGISTER';
  onGoHome?: () => void;
  onSelectPortal?: (portal: Portal) => void;
  onLoginSuccess?: (portal: DashboardPortal) => void;
  /** Hiện phía trên form, vd. khi bị chuyển tới đây vì vào trang quản lý mà chưa đăng nhập */
  notice?: string;
}

export default function AuthPage({
  initialMode = 'LOGIN',
  onGoHome,
  onSelectPortal,
  onLoginSuccess,
  notice,
}: AuthPageProps) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);

  const handleAuthenticated = (user: User) => onLoginSuccess?.(ROLE_PORTAL[user.role]);

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
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-8 sm:py-12 bg-slate-100/70">
        {notice && (
          <p className="flex w-full max-w-5xl items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
            <Info className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </p>
        )}
        {mode === 'LOGIN' ? (
          <LoginForm onSwitchToRegister={() => setMode('REGISTER')} onSubmitSuccess={handleAuthenticated} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode('LOGIN')} onSubmitSuccess={handleAuthenticated} />
        )}
      </main>

      {/* 3. Footer */}
      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
