import type { DashboardPortal } from '../../types/portal';
import { AuthForm } from './components/AuthForm';
import { RoleSelector } from './components/RoleSelector';

export interface AuthPageProps {
  onLoginSuccess: (portal: DashboardPortal) => void;
}

export default function AuthPage(_props: AuthPageProps) {
  return (
    <main className="min-h-screen p-8 space-y-6">
      <h1 className="text-2xl font-bold">Đăng Nhập / Đăng Ký</h1>
      <RoleSelector />
      <AuthForm />
    </main>
  );
}
