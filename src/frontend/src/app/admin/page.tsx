import { useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import type { AdminView } from './components/AdminSidebar';
import { DashboardView } from './views/DashboardView';
import { UsersView } from './views/UsersView';
import { ContestsView } from './views/ContestsView';
import { SubmissionsView } from './views/SubmissionsView';
import { JudgesView } from './views/JudgesView';
import { ArchiveView } from './views/ArchiveView';
import { AiSettingsView } from './views/AiSettingsView';
import { SettingsView } from './views/SettingsView';
import { LogsView } from './views/LogsView';
import { ProfileView, readAdminDemoProfile } from './views/ProfileView';

/** Trang chính dành riêng cho Admin; không thay đổi router chung của nhóm. */
export default function AdminPage() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [adminName, setAdminName] = useState(() => readAdminDemoProfile().fullName);

  return (
    <AdminLayout
      activeView={activeView}
      onNavigate={setActiveView}
      adminName={adminName}
    >
      {activeView === 'dashboard' ? (
        <DashboardView onNavigate={setActiveView} />
      ) : activeView === 'users' ? (
        <UsersView />
      ) : activeView === 'contests' ? (
        <ContestsView />
      ) : activeView === 'submissions' ? (
        <SubmissionsView />
      ) : activeView === 'judges' ? (
        <JudgesView onNavigate={setActiveView} />
      ) : activeView === 'archive' ? (
        <ArchiveView />
      ) : activeView === 'ai-settings' ? (
        <AiSettingsView />
      ) : activeView === 'settings' ? (
        <SettingsView onNavigate={setActiveView} />
      ) : activeView === 'logs' ? (
        <LogsView />
      ) : (
        <ProfileView onNameSaved={setAdminName} />
      )}
    </AdminLayout>
  );
}
