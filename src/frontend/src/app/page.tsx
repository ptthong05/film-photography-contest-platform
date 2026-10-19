import { useState, useEffect } from 'react';
import type { Portal } from '../types/portal';
import HomePage from './home/page';
import AuthPage from './auth/page';
import ContestsPage from './home/components/contests/page';
import { ContestDetailPage } from './home/components/contests/ContestDetailPage';
import { PhotoDetailPage } from './home/components/photosHighlight/PhotoDetailPage';
import { WinningPhotosPage } from './home/components/photosHighlight/WinningPhotosPage';
import { AuthorProfilePage } from './home/components/authors/AuthorProfilePage';
import { AllArticlesPage } from './home/components/articles/AllArticlesPage';
import { ArticleDetailPage } from './home/components/articles/ArticleDetailPage';
import { LeaderboardPage } from './home/components/leaderboard/LeaderboardPage';
import { GuidePage } from './home/components/guide/GuidePage';
import { AboutPage } from './home/components/pages/AboutPage';
import { TermsPage } from './home/components/pages/TermsPage';
import { PrivacyPage } from './home/components/pages/PrivacyPage';
import { ContactPage } from './home/components/pages/ContactPage';
import { EventsPage } from './home/components/pages/EventsPage';
import AdminPage from './admin/page';
import OrganizerPage from './organizer/page';
import JudgePage from './judge/page';
import ParticipantPage from './participant/page';
import { BackButton } from '../components/BackButton';

const PORTAL_STORAGE_KEY = 'film_contest_active_portal';
const CONTEST_ID_STORAGE_KEY = 'film_contest_selected_contest_id';
const PHOTO_ID_STORAGE_KEY = 'film_contest_selected_photo_id';
const AUTHOR_NAME_STORAGE_KEY = 'film_contest_selected_author_name';
const ARTICLE_ID_STORAGE_KEY = 'film_contest_selected_article_id';

function parseHashRoute(): {
  portal: Portal | null;
  contestId?: string;
  photoId?: string;
  authorName?: string;
  articleId?: string;
} {
  if (typeof window === 'undefined') return { portal: null };
  const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
  if (!rawHash) return { portal: null };

  if (rawHash === 'leaderboard' || rawHash === 'bang-xep-hang') {
    return { portal: 'LEADERBOARD' };
  }
  if (rawHash === 'contests' || rawHash === 'cuoc-thi') {
    return { portal: 'CONTESTS' };
  }
  if (rawHash === 'winning-photos' || rawHash === 'kho-anh-dat-giai') {
    return { portal: 'WINNING_PHOTOS' };
  }
  if (rawHash === 'articles' || rawHash === 'tin-tuc') {
    return { portal: 'ARTICLES' };
  }
  if (rawHash === 'guide' || rawHash === 'huong-dan') {
    return { portal: 'GUIDE' };
  }
  if (rawHash === 'auth' || rawHash === 'dang-nhap' || rawHash === 'dang-ky') {
    return { portal: 'AUTH' };
  }
  if (rawHash === 'admin') return { portal: 'ADMIN' };
  if (rawHash === 'organizer') return { portal: 'ORGANIZER' };
  if (rawHash === 'judge') return { portal: 'JUDGE' };
  if (rawHash === 'participant') return { portal: 'PARTICIPANT' };
  if (rawHash === 'about' || rawHash === 'gioi-thieu') {
    return { portal: 'ABOUT' };
  }
  if (rawHash === 'terms' || rawHash === 'dieu-khoan' || rawHash === 'dieu-khoan-su-dung') {
    return { portal: 'TERMS' };
  }
  if (rawHash === 'privacy' || rawHash === 'chinh-sach' || rawHash === 'chinh-sach-bao-mat') {
    return { portal: 'PRIVACY' };
  }
  if (rawHash === 'contact' || rawHash === 'lien-he' || rawHash === 'lien-he-ho-tro' || rawHash === 'support') {
    return { portal: 'CONTACT' };
  }
  if (rawHash === 'events' || rawHash === 'su-kien') {
    return { portal: 'EVENTS' };
  }
  if (rawHash === 'community' || rawHash === 'cong-dong' || rawHash === 'ket-noi-cong-dong') {
    return { portal: 'HOME' };
  }
  if (rawHash === 'faq' || rawHash === 'faq-section' || rawHash === 'cau-hoi-thuong-gap') {
    return { portal: 'HOME' };
  }
  if (rawHash === 'home' || rawHash === 'trang-chu') return { portal: 'HOME' };

  if (rawHash.startsWith('contest/')) {
    const id = rawHash.replace('contest/', '');
    return { portal: 'CONTEST_DETAIL', contestId: id };
  }
  if (rawHash.startsWith('photo/')) {
    const id = rawHash.replace('photo/', '');
    return { portal: 'PHOTO_DETAIL', photoId: id };
  }
  if (rawHash.startsWith('author/')) {
    const name = decodeURIComponent(rawHash.replace('author/', ''));
    return { portal: 'AUTHOR_PROFILE', authorName: name };
  }
  if (rawHash.startsWith('article/')) {
    const id = rawHash.replace('article/', '');
    return { portal: 'ARTICLE_DETAIL', articleId: id };
  }

  return { portal: null };
}

function getPortalHash(
  portal: Portal,
  contestId?: string,
  photoId?: string,
  authorName?: string,
  articleId?: string
): string {
  switch (portal) {
    case 'HOME':
      return '#/';
    case 'LEADERBOARD':
      return '#/leaderboard';
    case 'CONTESTS':
      return '#/contests';
    case 'WINNING_PHOTOS':
      return '#/winning-photos';
    case 'ARTICLES':
      return '#/articles';
    case 'GUIDE':
      return '#/guide';
    case 'ABOUT':
      return '#/about';
    case 'TERMS':
      return '#/terms';
    case 'PRIVACY':
      return '#/privacy';
    case 'CONTACT':
      return '#/contact';
    case 'EVENTS':
      return '#/events';
    case 'AUTH':
      return '#/auth';
    case 'ADMIN':
      return '#/admin';
    case 'ORGANIZER':
      return '#/organizer';
    case 'JUDGE':
      return '#/judge';
    case 'PARTICIPANT':
      return '#/participant';
    case 'CONTEST_DETAIL':
      return `#/contest/${contestId || 'analog-moments-2025'}`;
    case 'PHOTO_DETAIL':
      return `#/photo/${photoId || 'p1'}`;
    case 'AUTHOR_PROFILE':
      return `#/author/${encodeURIComponent(authorName || 'Hoàng Văn E')}`;
    case 'ARTICLE_DETAIL':
      return `#/article/${articleId || '5-meo-chup-phim'}`;
    default:
      return '#/';
  }
}

export default function RootPage() {
  const initialRoute = parseHashRoute();
  const savedPortal = (() => {
    try {
      return localStorage.getItem(PORTAL_STORAGE_KEY) as Portal | null;
    } catch {
      return null;
    }
  })();

  const [activePortal, setActivePortalState] = useState<Portal>(() => {
    if (initialRoute.portal) return initialRoute.portal;
    if (savedPortal) return savedPortal;
    return 'HOME';
  });

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const [selectedContestId, setSelectedContestId] = useState<string>(() => {
    if (initialRoute.contestId) return initialRoute.contestId;
    try {
      const saved = localStorage.getItem(CONTEST_ID_STORAGE_KEY);
      if (saved) return saved;
    } catch {}
    return 'analog-moments-2025';
  });

  const [selectedPhotoId, setSelectedPhotoId] = useState<string>(() => {
    if (initialRoute.photoId) return initialRoute.photoId;
    try {
      const saved = localStorage.getItem(PHOTO_ID_STORAGE_KEY);
      if (saved) return saved;
    } catch {}
    return 'p1';
  });

  const [selectedAuthorName, setSelectedAuthorName] = useState<string>(() => {
    if (initialRoute.authorName) return initialRoute.authorName;
    try {
      const saved = localStorage.getItem(AUTHOR_NAME_STORAGE_KEY);
      if (saved) return saved;
    } catch {}
    return 'Hoàng Văn E';
  });

  const [selectedArticleId, setSelectedArticleId] = useState<string>(() => {
    if (initialRoute.articleId) return initialRoute.articleId;
    try {
      const saved = localStorage.getItem(ARTICLE_ID_STORAGE_KEY);
      if (saved) return saved;
    } catch {}
    return '5-meo-chup-phim';
  });

  const setActivePortal = (portal: Portal) => {
    setActivePortalState(portal);
    try {
      localStorage.setItem(PORTAL_STORAGE_KEY, portal);
    } catch (e) {
      console.error(e);
    }
    const targetHash = getPortalHash(
      portal,
      selectedContestId,
      selectedPhotoId,
      selectedAuthorName,
      selectedArticleId
    );
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  // Sync hash changes (e.g. browser back/forward buttons or direct URL change)
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHashRoute();
      if (route.portal) {
        setActivePortalState(route.portal);
        try {
          localStorage.setItem(PORTAL_STORAGE_KEY, route.portal);
        } catch {}
        if (route.contestId) setSelectedContestId(route.contestId);
        if (route.photoId) setSelectedPhotoId(route.photoId);
        if (route.authorName) setSelectedAuthorName(route.authorName);
        if (route.articleId) setSelectedArticleId(route.articleId);
      } else if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
        setActivePortalState('HOME');
        try {
          localStorage.setItem(PORTAL_STORAGE_KEY, 'HOME');
        } catch {}
      }

      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (rawHash === 'faq' || rawHash === 'faq-section' || rawHash === 'cau-hoi-thuong-gap') {
        setTimeout(() => {
          document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash on first load if missing
  useEffect(() => {
    const currentHash = window.location.hash;
    if (!currentHash || currentHash === '#' || currentHash === '#/') {
      if (activePortal !== 'HOME') {
        const hash = getPortalHash(
          activePortal,
          selectedContestId,
          selectedPhotoId,
          selectedAuthorName,
          selectedArticleId
        );
        window.history.replaceState(null, '', hash);
      }
    }
  }, [activePortal, selectedContestId, selectedPhotoId, selectedAuthorName, selectedArticleId]);

  const goHome = () => {
    setActivePortal('HOME');
    window.location.hash = '#/';
  };

  const goContests = () => {
    setActivePortal('CONTESTS');
    window.location.hash = '#/contests';
  };

  const goArticles = () => {
    setActivePortal('ARTICLES');
    window.location.hash = '#/articles';
  };

  const handleOpenAuth = (mode: 'LOGIN' | 'REGISTER') => {
    setAuthMode(mode);
    setActivePortal('AUTH');
    window.location.hash = '#/auth';
  };

  const handleOpenContestDetail = (contestId: string) => {
    setSelectedContestId(contestId);
    try {
      localStorage.setItem(CONTEST_ID_STORAGE_KEY, contestId);
      localStorage.setItem(PORTAL_STORAGE_KEY, 'CONTEST_DETAIL');
    } catch {}
    setActivePortalState('CONTEST_DETAIL');
    window.location.hash = `#/contest/${contestId}`;
  };

  const handleOpenPhotoDetail = (photoId: string) => {
    setSelectedPhotoId(photoId);
    try {
      localStorage.setItem(PHOTO_ID_STORAGE_KEY, photoId);
      localStorage.setItem(PORTAL_STORAGE_KEY, 'PHOTO_DETAIL');
    } catch {}
    setActivePortalState('PHOTO_DETAIL');
    window.location.hash = `#/photo/${photoId}`;
  };

  const handleOpenAuthorProfile = (authorName: string) => {
    setSelectedAuthorName(authorName);
    try {
      localStorage.setItem(AUTHOR_NAME_STORAGE_KEY, authorName);
      localStorage.setItem(PORTAL_STORAGE_KEY, 'AUTHOR_PROFILE');
    } catch {}
    setActivePortalState('AUTHOR_PROFILE');
    window.location.hash = `#/author/${encodeURIComponent(authorName)}`;
  };

  const handleOpenWinningPhotos = () => {
    setActivePortal('WINNING_PHOTOS');
    window.location.hash = '#/winning-photos';
  };

  const handleOpenArticleDetail = (articleId: string) => {
    setSelectedArticleId(articleId);
    try {
      localStorage.setItem(ARTICLE_ID_STORAGE_KEY, articleId);
      localStorage.setItem(PORTAL_STORAGE_KEY, 'ARTICLE_DETAIL');
    } catch {}
    setActivePortalState('ARTICLE_DETAIL');
    window.location.hash = `#/article/${articleId}`;
  };

  const handleViewAllArticles = () => {
    setActivePortal('ARTICLES');
    window.location.hash = '#/articles';
  };

  if (activePortal === 'HOME') {
    return (
      <HomePage
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
        onOpenContestDetail={handleOpenContestDetail}
        onOpenPhotoDetail={handleOpenPhotoDetail}
        onOpenArticleDetail={handleOpenArticleDetail}
        onViewAllArticles={handleViewAllArticles}
      />
    );
  }


  if (activePortal === 'AUTH') {
    return (
      <AuthPage
        initialMode={authMode}
        onGoHome={goHome}
        onSelectPortal={setActivePortal}
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
        onSelectPortal={setActivePortal}
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
        onSelectPortal={setActivePortal}
      />
    );
  }

  if (activePortal === 'ARTICLES') {
    return (
      <AllArticlesPage
        onGoHome={goHome}
        onSelectArticle={handleOpenArticleDetail}
        onOpenAuth={handleOpenAuth}
        onSelectPortal={setActivePortal}
      />
    );
  }

  if (activePortal === 'ARTICLE_DETAIL') {
    return (
      <ArticleDetailPage
        articleId={selectedArticleId}
        onGoHome={goHome}
        onGoArticles={goArticles}
        onSelectArticle={handleOpenArticleDetail}
        onSelectContest={handleOpenContestDetail}
        onOpenAuth={handleOpenAuth}
        onSelectPortal={setActivePortal}
      />
    );
  }

  if (activePortal === 'LEADERBOARD') {
    return (
      <LeaderboardPage
        onGoHome={goHome}
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
        onOpenAuthorProfile={handleOpenAuthorProfile}
        onOpenPhotoDetail={handleOpenPhotoDetail}
        onOpenContestDetail={handleOpenContestDetail}
      />
    );
  }

  if (activePortal === 'GUIDE') {
    return (
      <GuidePage
        onGoHome={goHome}
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
        onOpenContestDetail={handleOpenContestDetail}
      />
    );
  }

  if (activePortal === 'ABOUT') {
    return (
      <AboutPage
        onGoHome={goHome}
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
      />
    );
  }

  if (activePortal === 'TERMS') {
    return (
      <TermsPage
        onGoHome={goHome}
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
      />
    );
  }

  if (activePortal === 'PRIVACY') {
    return (
      <PrivacyPage
        onGoHome={goHome}
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
      />
    );
  }

  if (activePortal === 'CONTACT') {
    return (
      <ContactPage
        onGoHome={goHome}
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
      />
    );
  }

  if (activePortal === 'EVENTS') {
    return (
      <EventsPage
        onGoHome={goHome}
        onSelectPortal={setActivePortal}
        onOpenAuth={handleOpenAuth}
      />
    );
  }


  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800">
      {activePortal !== 'PARTICIPANT' && activePortal !== 'ORGANIZER' && activePortal !== 'JUDGE' && (
        <BackButton label="Về Trang Chủ" onClick={goHome} />
      )}
      {activePortal === 'ADMIN' && <AdminPage />}
      {activePortal === 'ORGANIZER' && <OrganizerPage onGoHome={goHome} />}
      {activePortal === 'JUDGE' && <JudgePage onExit={goHome} />}
      {activePortal === 'PARTICIPANT' && <ParticipantPage onGoHome={goHome} />}
    </div>
  );
}