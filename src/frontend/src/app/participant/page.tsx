import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './components/DashboardTab';
import { ContestsTab } from './components/ContestsTab';
import { ProfileTab } from './components/ProfileTab';
import { FilmRollTab } from './components/FilmRollTab';
import { SubmitEntryForm } from './components/SubmitEntryForm';
import { MyEntriesList } from './components/MyEntriesList';
import { ResultsTab } from './components/ResultsTab';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { notificationService } from '../../services/notificationService';
import { participantService } from '../../services/participantService';
import { formatDate } from '../../utils/formatDate';

interface ParticipantPageProps {
  onGoHome?: () => void;
}

export default function ParticipantPage({ onGoHome }: ParticipantPageProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  const { user } = useAuth();
  const userName = user?.name ?? '';
  const registrations = useFetch(participantService.getRegistrations);
  const notifications = useFetch(notificationService.getMine);
  const registeredContestIds = (registrations.data ?? []).map((item) => item.contestId);
  const unreadCount = (notifications.data ?? []).filter((item) => !item.isRead).length;

  // Lỗi (vd. đã nộp bài nên không được hủy) ném lên để tab hiển thị đúng thông báo của backend
  const handleToggleRegister = async (contestId: string) => {
    if (registeredContestIds.includes(contestId)) {
      await participantService.cancelRegistration(contestId);
    } else {
      await participantService.register(contestId);
    }
    await registrations.refetch();
  };

  const toggleNotifications = async () => {
    const willOpen = !isNotificationOpen;
    setIsNotificationOpen(willOpen);
    if (willOpen && unreadCount > 0) {
      await notificationService.markAllRead();
      await notifications.refetch();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans text-base w-full">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onGoHome={onGoHome} userName={userName} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between gap-6 flex-shrink-0 z-20 w-full">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc thi, bài dự thi, nhiếp ảnh gia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center space-x-4 relative">
            <button
              onClick={() => { void toggleNotifications(); }}
              className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-all cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-bold text-slate-900 text-sm">Thông báo hệ thống</h4>
                  <button onClick={() => setIsNotificationOpen(false)} className="text-xs text-blue-600 font-bold cursor-pointer">
                    Đóng
                  </button>
                </div>
                {(notifications.data ?? []).length === 0 && <p className="p-2.5 text-xs text-slate-500">Chưa có thông báo nào.</p>}
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {(notifications.data ?? []).map((item) => (
                  <p key={item.id} className="p-2.5 bg-blue-50 rounded-xl text-xs text-slate-600">
                    {item.message}
                    <span className="mt-1 block text-[10px] text-slate-400">{formatDate(item.createdAt)}</span>
                  </p>
                ))}
              </div>
              </div>
            )}

            <div className="h-6 w-px bg-slate-200"></div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500 font-medium">Participant Portal</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 space-y-8 overflow-y-auto w-full max-w-none">
          {activeTab === 'dashboard' && (
            <DashboardTab
              registeredCount={registeredContestIds.length}
              registeredIds={registeredContestIds}
              onToggleRegister={handleToggleRegister}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'contests' && (
            <ContestsTab
              registeredIds={registeredContestIds}
              onToggleRegister={handleToggleRegister}
              onNavigateSubmit={() => setActiveTab('submit')}
            />
          )}

          {activeTab === 'my-registrations' && (
            <ContestsTab
              registeredIds={registeredContestIds}
              onToggleRegister={handleToggleRegister}
              onNavigateSubmit={() => setActiveTab('submit')}
              filterRegisteredOnly={true}
            />
          )}

          {activeTab === 'profile' && <ProfileTab />}

          {activeTab === 'film-roll' && <FilmRollTab />}

          {activeTab === 'submit' && (
            <SubmitEntryForm
              registeredIds={registeredContestIds}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'my-entries' && <MyEntriesList />}

          {activeTab === 'results' && <ResultsTab />}
        </div>
      </main>
    </div>
  );
}