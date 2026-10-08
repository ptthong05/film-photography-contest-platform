import { useState } from 'react';
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
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import { SubmissionDetailModal } from './components/SubmissionDetailModal';

const VIEW_META: Record<JudgeView, { title: string; subtitle: string }> = {
  OVERVIEW: { title: 'Tổng quan', subtitle: 'Theo dõi nhiệm vụ đánh giá và tiến độ chấm điểm' },
  CONTESTS: { title: 'Cuộc thi của tôi', subtitle: 'Các cuộc thi bạn được phân công làm giám khảo' },
  ASSIGNED: { title: 'Danh sách bài dự thi được phân công', subtitle: 'Tìm kiếm, lọc và bắt đầu chấm các bài dự thi' },
  SCORING: { title: 'Chấm điểm bài dự thi', subtitle: 'Đánh giá ảnh theo tiêu chí của cuộc thi' },
  RESULTS: { title: 'Kết quả và lịch sử chấm', subtitle: 'Xem lại các phiếu chấm đã gửi và kết quả cuộc thi' },
  MESSAGES: { title: 'Tin nhắn & thông báo', subtitle: 'Thông báo từ ban tổ chức và hệ thống' },
  PROFILE: { title: 'Hồ sơ cá nhân', subtitle: 'Thông tin giám khảo' },
};

interface JudgePageProps {
  onExit: () => void;
}

export default function JudgePage({ onExit }: JudgePageProps) {
  const [activeView, setActiveView] = useState<JudgeView>('OVERVIEW');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contestFilterId, setContestFilterId] = useState<string | null>(null);
  const [scoringSubmissionId, setScoringSubmissionId] = useState<string | null>(null);
  const [detailSubmissionId, setDetailSubmissionId] = useState<string | null>(null);
  const { data: profile, refetch: refetchProfile } = useFetch(judgeService.getProfile);
  const { data: notifications, refetch: refetchNotifications } = useFetch(judgeService.getNotifications);

  const unreadCount = notifications?.filter((item) => !item.isRead).length ?? 0;
  const meta = VIEW_META[activeView];

  const handleNavigate = (view: JudgeView) => {
    if (view === 'ASSIGNED') {
      setContestFilterId(null);
    }
    setActiveView(view);
    setIsMenuOpen(false);
  };

  const handleOpenContest = (contestId: string) => {
    setContestFilterId(contestId);
    setActiveView('ASSIGNED');
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

      <div className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-8">
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

        <main className="mt-6">
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
          {activeView === 'MESSAGES' && (
            <MessagesView notifications={notifications ?? []} onChanged={refetchNotifications} />
          )}
          {activeView === 'PROFILE' && <ProfileView profile={profile} onUpdated={refetchProfile} />}
        </main>
      </div>

      {detailSubmissionId && (
        <SubmissionDetailModal
          submissionId={detailSubmissionId}
          onClose={() => setDetailSubmissionId(null)}
          onStartScoring={handleStartScoring}
        />
      )}
    </div>
  );
}
