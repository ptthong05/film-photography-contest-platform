import { useState } from 'react';
import type { Portal } from '../types/portal';
import HomePage from './home/page';
import AuthPage from './auth/page';
import ContestsPage from './home/contests/page';
import { ContestDetailPage } from './home/contests/ContestDetailPage';
import { PhotoDetailPage } from './home/photosHighlight/PhotoDetailPage';
import { WinningPhotosPage } from './home/photosHighlight/WinningPhotosPage';
import { AuthorProfilePage } from './home/authors/AuthorProfilePage';
import AdminPage from './admin/page';
import OrganizerPage from './organizer/page';
import JudgePage from './judge/page';
import ParticipantPage from './participant/page';

export default function RootPage() {
  const [activePortal, setActivePortal] = useState<Portal>('PARTICIPANT');

  const goHome = () => setActivePortal('HOME');
  const goContests = () => setActivePortal('CONTESTS');

  const handleOpenAuth = (mode: 'LOGIN' | 'REGISTER') => {
    setAuthMode(mode);
    setActivePortal('AUTH');
  };

  const handleOpenContestDetail = (contestId: string) => {
    setSelectedContestId(contestId);
    setActivePortal('CONTEST_DETAIL');
  };

  const handleOpenPhotoDetail = (photoId: string) => {
    setSelectedPhotoId(photoId);
    setActivePortal('PHOTO_DETAIL');
  };

  const handleOpenAuthorProfile = (authorName: string) => {
    setSelectedAuthorName(authorName);
    setActivePortal('AUTHOR_PROFILE');
  };

  const handleOpenWinningPhotos = () => {
    setActivePortal('WINNING_PHOTOS');
  };

  if (activePortal === 'HOME') {
    return (
      <HomePage
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
        onOpenContestDetail={handleOpenContestDetail}
        onOpenPhotoDetail={handleOpenPhotoDetail}
      />
    );
  }

  if (activePortal === 'AUTH') {
    return (
      <AuthPage
        initialMode={authMode}
        onGoHome={goHome}
        onLoginSuccess={(dashboardRole) => setActivePortal(dashboardRole)}
      />
    );
  }

  if (activePortal === 'CONTESTS') {
    return (
      <ContestsPage
        onGoHome={goHome}
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
        onOpenContestDetail={handleOpenContestDetail}
      />
    );
  }

  if (activePortal === 'CONTEST_DETAIL') {
    return (
      <ContestDetailPage
        contestId={selectedContestId}
        onGoHome={goHome}
        onGoContests={goContests}
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
        onOpenPhotoDetail={handleOpenPhotoDetail}
        onOpenWinningPhotos={handleOpenWinningPhotos}
      />
    );
  }

  if (activePortal === 'PHOTO_DETAIL') {
    return (
      <PhotoDetailPage
        photoId={selectedPhotoId}
        onGoHome={goHome}
        onGoContests={goContests}
        onSelectPhoto={handleOpenPhotoDetail}
        onOpenAuth={handleOpenAuth}
        onOpenAuthorProfile={handleOpenAuthorProfile}
        onOpenWinningPhotos={handleOpenWinningPhotos}
      />
    );
  }

  if (activePortal === 'AUTHOR_PROFILE') {
    return (
      <AuthorProfilePage
        authorName={selectedAuthorName}
        onGoHome={goHome}
        onGoContests={goContests}
        onSelectContest={handleOpenContestDetail}
        onSelectPhoto={handleOpenPhotoDetail}
        onOpenAuth={handleOpenAuth}
      />
    );
  }

  if (activePortal === 'WINNING_PHOTOS') {
    return (
      <WinningPhotosPage
        onGoHome={goHome}
        onGoContests={goContests}
        onSelectPhoto={handleOpenPhotoDetail}
        onOpenAuth={handleOpenAuth}
      />
    );
  }

  return (
<<<<<<< HEAD
    <div className="relative min-h-screen bg-slate-50 text-slate-800">
      {activePortal === 'AUTH' && <AuthPage onLoginSuccess={setActivePortal} />}
=======
    <div className="relative">
      <BackButton label="Về Trang Chủ" onClick={goHome} />
>>>>>>> develop
      {activePortal === 'ADMIN' && <AdminPage />}
      {activePortal === 'ORGANIZER' && <OrganizerPage />}
      {activePortal === 'JUDGE' && <JudgePage />}
      {activePortal === 'PARTICIPANT' && <ParticipantPage onGoHome={goHome} />}
    </div>
  );
}