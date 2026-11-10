import { useState, useEffect } from 'react';
import { judgeService } from '../../services/judgeService';
import { useFetch } from '../../hooks/useFetch';
import type { JudgeView } from '../../types/judge';
import { JudgeSidebar } from './components/JudgeSidebar';
import { JudgeHeader } from './components/JudgeHeader';
import { OverviewView } from './components/OverviewView';
import { MyContestsView } from './components/MyContestsView';
import { AssignedSubmissionsView } from './components/AssignedSubmissionsView';
import { ScoringView } from './components/ScoringView';
import { ResultsView } from './components/ResultsView';
import { JudgeArchiveView } from './components/JudgeArchiveView';
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import { JudgeSubmissionDetailPage } from './components/JudgeSubmissionDetailPage';
import { JudgeArticlesView } from './components/JudgeArticlesView';

const VIEW_META: Record<JudgeView, { title: string; subtitle: string }> = {
  OVERVIEW: { title: '1. Tổng quan', subtitle: 'Theo dõi nhiệm vụ đánh giá và tiến độ chấm điểm' },
  CONTESTS: { title: '2. Cuộc thi của tôi', subtitle: 'Các cuộc thi bạn được phân công làm giám khảo' },
  ASSIGNED: { title: '3. Danh sách bài thi', subtitle: 'Tìm kiếm, lọc và bắt đầu chấm các bài dự thi' },
  SCORING: { title: '4. Chấm điểm bài dự thi', subtitle: 'Đánh giá ảnh theo tiêu chí của cuộc thi' },
  RESULTS: { title: '5. Kết quả & Lịch sử', subtitle: 'Xem lại các phiếu chấm đã gửi và kết quả cuộc thi' },
  ARCHIVE: { title: '6. Kho dữ liệu', subtitle: 'Thư viện lưu trữ các tác phẩm đạt giải khi công bố kết quả (mỗi giải 1 bài, 4 giải 4 bài)' },
  ARTICLES: { title: '7. Viết bài chuyên môn', subtitle: 'Soạn thảo và xuất bản bài viết, nhận định chuyên môn lên mục Tin tức trang chủ' },
  MESSAGES: { title: '8. Tin nhắn & Thông báo', subtitle: 'Thông báo từ ban tổ chức và hệ thống' },
  PROFILE: { title: '9. Hồ sơ cá nhân', subtitle: 'Quản lý thông tin tài khoản giám khảo' },
};

interface JudgePageProps {
  onExit: () => void;
}

const JUDGE_VIEW_KEY = 'judge_active_view';

export default function JudgePage({ onExit }: JudgePageProps) {
  const [activeView, setActiveView] = useState<JudgeView>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(JUDGE_VIEW_KEY) as JudgeView | null;
      const valid: JudgeView[] = ['OVERVIEW', 'CONTESTS', 'ASSIGNED', 'SCORING', 'RESULTS', 'ARCHIVE', 'ARTICLES', 'MESSAGES', 'PROFILE'];
      if (saved && valid.includes(saved)) return saved;
    }
    return 'OVERVIEW';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contestFilterId, setContestFilterId] = useState<string | null>(null);
  const [scoringSubmissionId, setScoringSubmissionId] = useState<string | null>(null);
  const [detailSubmissionId, setDetailSubmissionId] = useState<string | null>(null);
  const { data: profile, refetch: refetchProfile } = useFetch(judgeService.getProfile);
  const { data: notifications, refetch: refetchNotifications } = useFetch(judgeService.getNotifications);

  useEffect(() => {
    const handleSync = () => {
      refetchNotifications();
    };
    window.addEventListener('notificationsRead', handleSync);
    return () => window.removeEventListener('notificationsRead', handleSync);
  }, [refetchNotifications]);

  useEffect(() => {
    const handleProfileSync = () => {
      refetchProfile();
    };
    window.addEventListener('judgeProfileUpdated', handleProfileSync);
    window.addEventListener('userNameChanged', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);
    return () => {
      window.removeEventListener('judgeProfileUpdated', handleProfileSync);
      window.removeEventListener('userNameChanged', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, [refetchProfile]);

  const unreadCount = notifications?.filter((item) => !item.isRead).length ?? 0;
  const meta = detailSubmissionId
    ? { title: 'Chi tiết tác phẩm', subtitle: 'Xem chi tiết thông số kỹ thuật, ảnh gốc và lịch sử chấm' }
    : VIEW_META[activeView];

  const handleNavigate = (view: JudgeView) => {
    if (view === 'ASSIGNED') {
      setContestFilterId(null);
    }
    setDetailSubmissionId(null);
    setActiveView(view);
    setIsMenuOpen(false);
    try {
      localStorage.setItem(JUDGE_VIEW_KEY, view);
    } catch {}
  };

  const handleOpenContest = (contestId: string) => {
    setContestFilterId(contestId);
    setActiveView('ASSIGNED');
    try {
      localStorage.setItem(JUDGE_VIEW_KEY, 'ASSIGNED');
    } catch {}
  };

  const handleStartScoring = (submissionId: string) => {
    setScoringSubmissionId(submissionId);
    setDetailSubmissionId(null);
    setActiveView('SCORING');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <JudgeSidebar
        activeView={activeView}
        profile={profile}
        isOpen={isMenuOpen}
        onNavigate={handleNavigate}
        onClose={() => setIsMenuOpen(false)}
      />

      <div className="min-w-0 flex-1 lg:ml-64">
        <JudgeHeader
          title={meta.title}
          subtitle={meta.subtitle}
          profile={profile}
          unreadCount={unreadCount}
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenNotifications={() => handleNavigate('MESSAGES')}
          onOpenProfile={() => handleNavigate('PROFILE')}
          onExit={onExit}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {detailSubmissionId ? (
            <JudgeSubmissionDetailPage
              submissionId={detailSubmissionId}
              onBack={() => setDetailSubmissionId(null)}
              onStartScoring={handleStartScoring}
            />
          ) : (
            <>
              {activeView === 'OVERVIEW' && (
                <OverviewView
                  profile={profile}
                  notifications={notifications ?? []}
                  onNavigate={handleNavigate}
                  onOpenContest={handleOpenContest}
                />
              )}
              {activeView === 'CONTESTS' && <MyContestsView onOpenContest={handleOpenContest} />}
              {activeView === 'ASSIGNED' && (
                <AssignedSubmissionsView
                  initialContestId={contestFilterId}
                  onStartScoring={handleStartScoring}
                  onViewDetail={setDetailSubmissionId}
                />
              )}
              {activeView === 'SCORING' && (
                <ScoringView
                  submissionId={scoringSubmissionId}
                  onSelectSubmission={setScoringSubmissionId}
                  onViewDetail={setDetailSubmissionId}
                  onBackToList={() => handleNavigate('ASSIGNED')}
                />
              )}
              {activeView === 'RESULTS' && <ResultsView onViewDetail={setDetailSubmissionId} />}
              {activeView === 'ARCHIVE' && <JudgeArchiveView />}
              {activeView === 'ARTICLES' && <JudgeArticlesView profile={profile} />}
              {activeView === 'MESSAGES' && (
                <MessagesView notifications={notifications ?? []} onChanged={refetchNotifications} />
              )}
              {activeView === 'PROFILE' && <ProfileView profile={profile} onUpdated={refetchProfile} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
