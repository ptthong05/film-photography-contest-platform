import React, { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './components/DashboardTab';
import { ContestsTab } from './components/ContestsTab';
import { ProfileTab } from './components/ProfileTab';
import { FilmRollTab } from './components/FilmRollTab';
import { SubmitEntryForm } from './components/SubmitEntryForm';
import { MyEntriesList } from './components/MyEntriesList';
import { ResultsTab } from './components/ResultsTab';

interface ParticipantPageProps {
  onGoHome?: () => void;
}

export default function ParticipantPage({ onGoHome }: ParticipantPageProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  // Đọc danh sách ID cuộc thi đã đăng ký từ localStorage
  const [registeredContestIds, setRegisteredContestIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('participant_registered_contests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Đồng bộ thời gian thực khi có sự thay đổi đăng ký
  useEffect(() => {
    const handleRegistrationChange = () => {
      try {
        const saved = localStorage.getItem('participant_registered_contests');
        setRegisteredContestIds(saved ? JSON.parse(saved) : []);
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('contestRegistrationChanged', handleRegistrationChange);
    return () => window.removeEventListener('contestRegistrationChanged', handleRegistrationChange);
  }, []);

  // Đọc tên người dùng từ localStorage
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('participant_user_name') || 'Nguyễn Văn A';
  });

  useEffect(() => {
    const handleNameChange = () => {
      const savedName = localStorage.getItem('participant_user_name');
      if (savedName) setUserName(savedName);
    };
    window.addEventListener('userNameChanged', handleNameChange);
    return () => window.removeEventListener('userNameChanged', handleNameChange);
  }, []);

  const registeredContests = [
    { id: 1, title: 'Analog Moments 2025' },
    { id: 2, title: 'Film & City' }
  ];

  const handleToggleRegister = (contestId: string) => {
    let updated: string[] = [];
    if (registeredContestIds.includes(contestId)) {
      updated = registeredContestIds.filter((id) => id !== contestId);
    } else {
      updated = [...registeredContestIds, contestId];
    }
    setRegisteredContestIds(updated);
    localStorage.setItem('participant_registered_contests', JSON.stringify(updated));
    localStorage.setItem('participant_registrations', JSON.stringify(updated));
    window.dispatchEvent(new Event('contestRegistrationChanged'));
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans text-base">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onGoHome={onGoHome} userName={userName} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between gap-6 flex-shrink-0 z-20">
          <div className="relative flex-1 max-w-xl">
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
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-all cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-bold text-slate-900 text-sm">Thông báo hệ thống</h4>
                  <button onClick={() => setIsNotificationOpen(false)} className="text-xs text-blue-600 font-bold cursor-pointer">
                    Đóng
                  </button>
                </div>
                <p className="p-2.5 bg-blue-50 rounded-xl text-xs text-slate-600">
                  🔹 Bài dự thi của bạn đã được kiểm duyệt thành công.
                </p>
              </div>
            )}

            <div className="h-6 w-px bg-slate-200"></div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500 font-medium">Participant Portal</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 space-y-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardTab
              registeredCount={registeredContestIds.length}
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
            />
          )}

          {activeTab === 'profile' && <ProfileTab />}

          {activeTab === 'film-roll' && <FilmRollTab />}

          {activeTab === 'submit' && (
            <SubmitEntryForm
              registeredContests={registeredContests}
              onSubmitSuccess={() => setActiveTab('my-entries')}
            />
          )}

          {activeTab === 'my-entries' && <MyEntriesList />}

          {activeTab === 'results' && <ResultsTab />}
        </div>
      </main>
    </div>
  );
}