import { UserManagementTable } from './components/UserManagementTable';
import { UserModal } from './components/UserModal';
import { DigitalArchiveManagement } from './components/DigitalArchiveManagement';
import { ActivityLogs } from './components/ActivityLogs';
import { SystemSettings } from './components/SystemSettings';

export default function AdminPage() {
  return (
    <main className="min-h-screen p-8 pt-16 space-y-6">
      <h1 className="text-2xl font-bold">Quản Trị Hệ Thống</h1>
      <UserManagementTable />
      <UserModal />
      <DigitalArchiveManagement />
      <ActivityLogs />
      <SystemSettings />
    </main>
  );
}
