import React, { useState, useEffect, useRef } from 'react';
import { Camera, Menu, X } from 'lucide-react';
import { PortalHeader } from '../../components/PortalHeader';
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

const PARTICIPANT_PAGE_INFO: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Tổng quan',
    subtitle: 'Theo dõi hoạt động, đăng ký và tiến độ tham gia cuộc thi nhiếp ảnh phim',
  },
  contests: {
    title: 'Khám phá cuộc thi',
    subtitle: 'Danh sách và thông tin các cuộc thi nhiếp ảnh phim đang mở',
  },
  'my-registrations': {
    title: 'Đăng ký của tôi',
    subtitle: 'Quản lý các cuộc thi bạn đã đăng ký tham gia',
  },
  submit: {
    title: 'Nộp ảnh dự thi',
    subtitle: 'Tải lên tác phẩm ảnh chụp phim và điền thông số kỹ thuật',
  },
  'film-roll': {
    title: 'Quản lý cuộn phim',
    subtitle: 'Quản lý Film Roll & Frame cho tác phẩm dự thi',
  },
  'my-entries': {
    title: 'Bài dự thi của tôi',
    subtitle: 'Theo dõi tình trạng phê duyệt và điểm số của các tác phẩm',
  },
  results: {
    title: 'Kết quả & Giải thưởng',
    subtitle: 'Bảng xếp hạng chung cuộc và các giải thưởng đạt được',
  },
  profile: {
    title: 'Hồ sơ cá nhân',
    subtitle: 'Quản lý thông tin tài khoản thí sinh và sở thích',
  },
};

const PARTICIPANT_TAB_KEY = 'participant_active_tab';

export default function ParticipantPage({ onGoHome }: ParticipantPageProps) {
  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PARTICIPANT_TAB_KEY);
      const valid = ['dashboard', 'contests', 'my-registrations', 'profile', 'film-roll', 'submit', 'my-entries', 'results'];
      if (saved && valid.includes(saved)) return saved;
    }
    return 'dashboard';
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem(PARTICIPANT_TAB_KEY, tab);
    } catch {}
  };
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => localStorage.getItem('participant_avatar'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  const [registeredContestIds, setRegisteredContestIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('participant_registered_contests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

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

  const [userName, setUserName] = useState<string>(() => {
    try {
      const savedProfile = localStorage.getItem('participant_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) return parsed.name;
      }
    } catch (e) {
      console.error(e);
    }
    return localStorage.getItem('participant_user_name') || 'Hồ Thanh Bình';
  });

  useEffect(() => {
    const handleNameChange = () => {
      try {
        const savedProfile = localStorage.getItem('participant_profile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          if (parsed.name) {
            setUserName(parsed.name);
            return;
          }
        }
        const savedName = localStorage.getItem('participant_user_name');
        if (savedName) setUserName(savedName);
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('userNameChanged', handleNameChange);
    return () => window.removeEventListener('userNameChanged', handleNameChange);
  }, []);

  useEffect(() => {
    const handleAvatarChange = () => {
      setAvatarUrl(localStorage.getItem('participant_avatar'));
    };
    window.addEventListener('avatarChanged', handleAvatarChange);
    return () => window.removeEventListener('avatarChanged', handleAvatarChange);
  }, []);

  // Xử lý phím Escape để đóng mobile drawer
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    mobileCloseButtonRef.current?.focus();
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isMobileMenuOpen]);

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

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const currentMeta = PARTICIPANT_PAGE_INFO[activeTab] ?? {
    title: 'Thí sinh',
    subtitle: 'Cổng thông tin thí sinh tham gia cuộc thi',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      {/* Sidebar cố định trên máy tính (desktop) - đồng nhất kích thước w-60 và màu nền #0B356B */}
      <div className="sticky top-0 hidden h-screen w-60 shrink-0 md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onGoHome={onGoHome}
          userName={userName}
        />
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Topbar trên thiết bị di động */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 pb-3 pt-4 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Mở menu thí sinh"
            aria-expanded={isMobileMenuOpen}
            className="rounded-lg p-2 text-[#0B356B] transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
          <span className="flex items-center gap-2 font-semibold text-[#0B356B]">
            <Camera size={22} aria-hidden="true" />
            FilmContest
          </span>
          <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-slate-500">
            Participant
          </span>
        </div>

        {/* Portal Header */}
        <PortalHeader
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          userName={userName}
          userRole="Thí sinh"
          avatarUrl={avatarUrl}
          unreadCount={2}
          onOpenProfile={() => setActiveTab('profile')}
          onGoHome={onGoHome}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Nội dung chính đồng bộ lề và max-width với Admin & Organizer */}
        <main
          id="participant-main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1700px] flex-1 p-4 outline-none sm:p-6 lg:p-8"
        >
          {activeTab === 'dashboard' && (
            <DashboardTab
              registeredCount={registeredContestIds.length}
              onNavigate={handleNavigateTab}
            />
          )}

          {activeTab === 'contests' && (
            <ContestsTab
              registeredIds={registeredContestIds}
              onToggleRegister={handleToggleRegister}
              onNavigateSubmit={() => handleNavigateTab('submit')}
            />
          )}

          {activeTab === 'my-registrations' && (
            <ContestsTab
              registeredIds={registeredContestIds}
              onToggleRegister={handleToggleRegister}
              onNavigateSubmit={() => handleNavigateTab('submit')}
              filterRegisteredOnly={true}
            />
          )}

          {activeTab === 'profile' && <ProfileTab />}

          {activeTab === 'film-roll' && <FilmRollTab />}

          {activeTab === 'submit' && (
            <SubmitEntryForm
              onSubmitSuccess={() => handleNavigateTab('my-entries')}
            />
          )}

          {activeTab === 'my-entries' && <MyEntriesList />}

          {activeTab === 'results' && <ResultsTab />}
        </main>
      </div>

      {/* Menu Drawer trên màn hình di động */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu thí sinh"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Đóng menu"
          />
          <div className="absolute inset-y-0 left-0 w-60 shadow-xl">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={handleNavigateTab}
              onGoHome={onGoHome}
              userName={userName}
            />
          </div>
          <button
            ref={mobileCloseButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Đóng menu thí sinh"
            className="absolute left-[15.5rem] top-4 rounded-full bg-white p-2 text-slate-800 shadow-md hover:bg-slate-100"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
