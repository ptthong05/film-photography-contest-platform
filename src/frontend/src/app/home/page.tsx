import React, { useState } from 'react';
import type { Portal } from '../../types/portal';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StatsSection } from './components/StatsSection';
import { LiveContestsSection, type ContestItem } from './components/LiveContestsSection';
import { FeaturedArticlesSection } from './components/FeaturedArticlesSection';
import { ExhibitionSection } from './components/ExhibitionSection';
import { AiTechSection } from './components/AiTechSection';
import { Footer } from './components/Footer';
import { ContestDetailModal } from './components/ContestDetailModal';

interface HomePageProps {
  onSelectPortal: (portal: Portal) => void;
  onOpenAuth?: (mode: 'LOGIN' | 'REGISTER') => void;
  onOpenContestDetail?: (contestId: string) => void;
  onOpenPhotoDetail?: (photoId: string) => void;
}

export default function HomePage({
  onSelectPortal,
  onOpenAuth,
  onOpenContestDetail,
  onOpenPhotoDetail,
}: HomePageProps) {
  const [activeTab, setActiveTab] = useState<string>('Trang chủ');
  const [selectedContest, setSelectedContest] = useState<ContestItem | null>(null);

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Cuộc thi') {
      onSelectPortal('CONTESTS');
    } else if (tab === 'Tin tức') {
      const el = document.getElementById('featured-articles');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'Kho ảnh đạt giải') {
      onSelectPortal('WINNING_PHOTOS');
    } else if (tab === 'Trang chủ') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRegister = () => {
    if (onOpenAuth) {
      onOpenAuth('REGISTER');
    } else {
      onSelectPortal('AUTH');
    }
  };

  const handleLogin = () => {
    if (onOpenAuth) {
      onOpenAuth('LOGIN');
    } else {
      onSelectPortal('AUTH');
    }
  };

  const handleExploreClick = () => {
    onSelectPortal('CONTESTS');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigateTab={handleNavigateTab}
        onSelectPortal={onSelectPortal}
        onOpenContests={handleExploreClick}
        onLoginClick={handleLogin}
        onRegisterClick={handleRegister}
        onGoHome={() => handleNavigateTab('Trang chủ')}
      />

      {/* Main Home Content */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection
          onRegisterClick={handleRegister}
          onExploreClick={handleExploreClick}
        />

        {/* 3. Stats / Metrics Row */}
        <StatsSection />

        {/* 4. Cuộc thi nổi bật (Featured Contests) */}
        <div id="featured-contests">
          <LiveContestsSection
            onSelectContest={(contest) => {
              if (onOpenContestDetail) {
                onOpenContestDetail(contest.id);
              } else {
                setSelectedContest(contest);
              }
            }}
            onViewAll={handleExploreClick}
          />
        </div>

        {/* 5. Bài viết nổi bật (Featured Articles) */}
        <div id="featured-articles">
          <FeaturedArticlesSection
            onSelectArticle={(article) => {
              alert(`Xem bài viết: "${article.title}"`);
            }}
            onViewAll={() => {
              alert('Chuyển tới trang toàn bộ tin tức & kiến thức nhiếp ảnh');
            }}
          />
        </div>

        {/* 6. Kho ảnh đạt giải tiêu biểu (Exhibition Gallery) */}
        <div id="exhibition-gallery">
          <ExhibitionSection
            onSelectPhoto={onOpenPhotoDetail}
            onExploreMore={() => {
              onSelectPortal('WINNING_PHOTOS');
            }}
          />
        </div>

        {/* 7. Công nghệ AI hỗ trợ cuộc thi ảnh phim */}
        <AiTechSection />
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* Interactive Contest Detail Modal */}
      {selectedContest && (
        <ContestDetailModal
          contest={selectedContest}
          onClose={() => setSelectedContest(null)}
          onRegisterSubmit={() => {
            handleRegister();
          }}
        />
      )}
    </div>
  );
}
