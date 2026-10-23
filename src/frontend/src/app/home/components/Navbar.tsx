import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search, Menu, X, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import type { Portal } from '../../../types/portal';
import { clearSession } from '../../../utils/authSession';
import { ROLE_LABEL, ROLE_PORTAL } from '../../../utils/rolePortal';
import { HeaderSearchModal } from './search/HeaderSearchModal';

interface NavbarProps {
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
  onSelectPortal?: (portal: Portal) => void;
  onOpenContests?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onGoHome?: () => void;
}

export function Navbar({
  activeTab = 'Trang chủ',
  onNavigateTab,
  onSelectPortal,
  onOpenContests,
  onLoginClick,
  onRegisterClick,
  onGoHome,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | undefined>(undefined);

  // Dropdown tìm kiếm neo vào nhóm nút bên phải, mỗi kích thước màn hình có một nhóm riêng
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Chạm/click ra ngoài vùng tìm kiếm thì đóng (cần cho màn hình cảm ứng, nơi không có rê chuột)
  useEffect(() => {
    if (!searchOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!searchAreaRef.current?.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [searchOpen]);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  // Rê chuột ra khỏi vùng tìm kiếm thì đóng; trễ một chút để lỡ tay trượt ra rồi quay lại không bị tắt
  const cancelSearchClose = () => window.clearTimeout(closeTimerRef.current);
  const scheduleSearchClose = () => {
    if (!searchOpen) return;
    cancelSearchClose();
    closeTimerRef.current = window.setTimeout(() => setSearchOpen(false), 200);
  };

  const searchDropdown = (
    <HeaderSearchModal
      isOpen={searchOpen}
      onClose={() => setSearchOpen(false)}
      onSelectPortal={onSelectPortal}
    />
  );

  // Lắng nghe phím tắt Ctrl+K hoặc Cmd+K để mở tìm kiếm Spotlight
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const navLinks = [
    { label: 'Trang chủ', id: 'home' },
    { label: 'Cuộc thi', id: 'contests' },
    { label: 'Bảng xếp hạng', id: 'leaderboard' },
    { label: 'Kho ảnh đạt giải', id: 'archive' },
    { label: 'Hướng dẫn', id: 'guide' },
    { label: 'Tin tức', id: 'news' },
  ];

  const handleLinkClick = (label: string, id: string) => {
    if (label === 'Trang chủ' || id === 'home') {
      if (onGoHome) onGoHome();
      else if (onSelectPortal) onSelectPortal('HOME');
    } else if (id === 'contests' || label === 'Cuộc thi') {
      if (onOpenContests) onOpenContests();
      else if (onSelectPortal) onSelectPortal('CONTESTS');
    } else if (id === 'leaderboard' || label === 'Bảng xếp hạng') {
      if (onSelectPortal) onSelectPortal('LEADERBOARD');
    } else if (id === 'archive' || label === 'Kho ảnh đạt giải') {
      if (onSelectPortal) onSelectPortal('WINNING_PHOTOS');
    } else if (id === 'guide' || label === 'Hướng dẫn') {
      if (onSelectPortal) onSelectPortal('GUIDE');
    } else if (id === 'news' || label === 'Tin tức') {
      if (onSelectPortal) onSelectPortal('ARTICLES');
    }

    if (onNavigateTab) {
      onNavigateTab(label);
    }
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      onSelectPortal?.('AUTH');
    }
    setMobileMenuOpen(false);
  };

  const handleRegister = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      onSelectPortal?.('AUTH');
    }
    setMobileMenuOpen(false);
  };

  const handleOpenDashboard = () => {
    if (user) onSelectPortal?.(ROLE_PORTAL[user.role]);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    clearSession();
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      handleLinkClick('Trang chủ', 'home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                FilmContest
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.label;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.label, link.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer relative ${
                    isActive
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div
            ref={isDesktop ? searchAreaRef : undefined}
            onMouseEnter={cancelSearchClose}
            onMouseLeave={scheduleSearchClose}
            className="relative hidden md:flex items-center gap-3"
          >
            {/* Spotlight Search Trigger Button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Tìm kiếm trong FilmContest"
              title="Tìm kiếm (Ctrl+K)"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 border border-slate-200/80 transition-all cursor-pointer group"
            >
              <Search className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
              <span className="text-xs font-medium text-slate-500 hidden xl:inline">Tìm kiếm...</span>
            </button>

            {user ? (
              <>
                {/* Dashboard Button — đi tới trang quản lý đúng role */}
                <button
                  onClick={handleOpenDashboard}
                  title={`Vào trang ${ROLE_LABEL[user.role]}`}
                  className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="max-w-36 truncate">{user.name}</span>
                    <span className="text-[10px] font-medium text-blue-100">{ROLE_LABEL[user.role]}</span>
                  </span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>

                {/* Register Button */}
                <button
                  onClick={handleRegister}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng ký</span>
                </button>
              </>
            )}

            {isDesktop && searchDropdown}
          </div>

          {/* Mobile Search & Menu Button */}
          <div ref={isDesktop ? undefined : searchAreaRef} className="relative flex md:hidden items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Tìm kiếm"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {!isDesktop && searchDropdown}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div
            onClick={() => {
              setMobileMenuOpen(false);
              setSearchOpen(true);
            }}
            className="flex items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl px-3 py-2.5 mb-3 cursor-pointer text-slate-500 text-sm transition-colors"
          >
            <Search className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
            <span>Tìm kiếm cuộc thi, tác phẩm, tác giả...</span>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.label, link.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                  activeTab === link.label
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={handleOpenDashboard}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                >
                  {user.name} · Vào trang {ROLE_LABEL[user.role]}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={handleRegister}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Đăng ký tài khoản
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
