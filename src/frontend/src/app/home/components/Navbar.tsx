import React, { useState } from 'react';
import { Camera, Search, Menu, X, LogIn, UserPlus } from 'lucide-react';
import type { Portal } from '../../../types/portal';

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
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'Trang chủ', id: 'home' },
    { label: 'Cuộc thi', id: 'contests' },
    { label: 'Bảng xếp hạng', id: 'leaderboard' },
    { label: 'Kho ảnh đạt giải', id: 'archive' },
    { label: 'Hướng dẫn', id: 'guide' },
    { label: 'Tin tức', id: 'news' },
  ];

  const handleLinkClick = (label: string, id: string) => {
    if (label === 'Trang chủ' && onGoHome) {
      onGoHome();
    }
    if (onNavigateTab) {
      onNavigateTab(label);
    }
    if (id === 'contests' && onOpenContests) {
      onOpenContests();
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
          <div className="hidden md:flex items-center gap-3">
            {/* Search Button */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-slate-100 border border-slate-300 rounded-full px-3 py-1.5 shadow-inner">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm cuộc thi, tác giả..."
                    className="w-44 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
                    autoFocus
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs ml-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Tìm kiếm"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Search className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

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
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 mb-3">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc thi..."
              className="w-full text-sm bg-transparent outline-none text-slate-800"
            />
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
            <button
              onClick={handleLogin}
              className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Đăng nhập
            </button>
            <button
              onClick={handleRegister}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Đăng ký tài khoản
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
