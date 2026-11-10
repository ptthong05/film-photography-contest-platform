import { useMemo, useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import type { AdminView } from './components/AdminSidebar';
import { DashboardView } from './views/DashboardView';
import { UsersView } from './views/UsersView';
import { ContestsView, DEMO_CONTESTS } from './views/ContestsView';
import { SubmissionsView } from './views/SubmissionsView';
import { ArchiveView } from './views/ArchiveView';
import { AiSettingsView } from './views/AiSettingsView';
import { SettingsView } from './views/SettingsView';
import { LogsView } from './views/LogsView';
import { ProfileView, readAdminDemoProfile } from './views/ProfileView';

const ADMIN_VIEW_KEY = 'admin_active_view';
const ADMIN_CONTEST_ID_KEY = 'admin_selected_contest_id';

/** Trang chính dành riêng cho Admin; không thay đổi router chung của nhóm. */
export default function AdminPage() {
  const [activeView, setActiveView] = useState<AdminView>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ADMIN_VIEW_KEY) as AdminView | null;
      const validViews: AdminView[] = ['dashboard', 'users', 'contests', 'submissions', 'archive', 'ai-settings', 'settings', 'logs', 'profile'];
      if (saved && validViews.includes(saved)) {
        return saved;
      }
    }
    return 'dashboard';
  });
  const [adminName, setAdminName] = useState(() => readAdminDemoProfile().fullName);
  const [selectedContestId, setSelectedContestId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ADMIN_CONTEST_ID_KEY) || null;
    }
    return null;
  });

  const selectedContest = useMemo(() => {
    if (activeView === 'contests' && selectedContestId) {
      return DEMO_CONTESTS.find((c) => c.id === selectedContestId) ?? null;
    }
    return null;
  }, [activeView, selectedContestId]);

  const handleNavigate = (view: AdminView) => {
    setActiveView(view);
    try {
      localStorage.setItem(ADMIN_VIEW_KEY, view);
    } catch {}
    if (view === 'contests') {
      setSelectedContestId(null);
      try {
        localStorage.removeItem(ADMIN_CONTEST_ID_KEY);
      } catch {}
    }
  };

  const handleSelectContestId = (id: string | null) => {
    setSelectedContestId(id);
    try {
      if (id) {
        localStorage.setItem(ADMIN_CONTEST_ID_KEY, id);
      } else {
        localStorage.removeItem(ADMIN_CONTEST_ID_KEY);
      }
    } catch {}
  };

  return (
    <AdminLayout
      activeView={activeView}
      onNavigate={handleNavigate}
      adminName={adminName}
      overrideTitle={
        selectedContest
          ? `3. Quản lý cuộc thi · ${selectedContest.title}`
          : undefined
      }
      overrideDescription={
        selectedContest
          ? `Mã: ${selectedContest.id} · Giám sát chi tiết thông tin, mốc thời gian, giải thưởng và hội đồng giám khảo`
          : undefined
      }
    >
      {activeView === 'dashboard' ? (
        <DashboardView onNavigate={handleNavigate} />
      ) : activeView === 'users' ? (
        <UsersView />
      ) : activeView === 'contests' ? (
        <ContestsView
          onNavigate={handleNavigate}
          selectedContestId={selectedContestId}
          onSelectContestId={handleSelectContestId}
        />
      ) : activeView === 'submissions' ? (
        <SubmissionsView />
      ) : activeView === 'archive' ? (
        <ArchiveView />
      ) : activeView === 'ai-settings' ? (
        <AiSettingsView />
      ) : activeView === 'settings' ? (
        <SettingsView onNavigate={handleNavigate} />
      ) : activeView === 'logs' ? (
        <LogsView />
      ) : (
        <ProfileView onNameSaved={setAdminName} />
      )}
    </AdminLayout>
  );
}
