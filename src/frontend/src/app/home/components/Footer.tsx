import React, { useState } from 'react';
import type { Portal } from '../../../types/portal';
import { Camera, Send, Check } from 'lucide-react';

export interface FooterProps {
  onSelectPortal?: (portal: Portal) => void;
  onGoHome?: () => void;
}

export function Footer({ onSelectPortal, onGoHome }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  const handleGoHome = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (onGoHome) {
      onGoHome();
    } else if (onSelectPortal) {
      onSelectPortal('HOME');
    }
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigatePortal = (portal: Portal, e?: React.MouseEvent) => {
    e?.preventDefault();
    if (onSelectPortal) {
      onSelectPortal(portal);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFaqClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const faqEl = document.getElementById('faq-section');
    if (faqEl) {
      faqEl.scrollIntoView({ behavior: 'smooth' });
      window.location.hash = '#/faq-section';
    } else {
      if (onGoHome) {
        onGoHome();
      } else if (onSelectPortal) {
        onSelectPortal('HOME');
      }
      window.location.hash = '#/faq-section';
      setTimeout(() => {
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  };

  return (
    <footer className="bg-[#0B1528] text-slate-400 text-sm border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-500 transition-colors">
                <Camera className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1 group-hover:text-blue-300 transition-colors">
                FilmContest
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              </span>
            </button>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Nền tảng tổ chức và quản lý cuộc thi nhiếp ảnh phim tích hợp trí tuệ nhân tạo.
            </p>

            <div className="pt-2 text-xs text-slate-500">
              © 2025 FilmContest. All rights reserved.
            </div>
          </div>

          {/* Links Column: Về chúng tôi (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Về chúng tôi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={(e) => handleNavigatePortal('ABOUT', e)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Giới thiệu
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavigatePortal('TERMS', e)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Điều khoản sử dụng
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavigatePortal('PRIVACY', e)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Chính sách bảo mật
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavigatePortal('CONTACT', e)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Liên hệ
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column: Hỗ trợ (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Hỗ trợ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={(e) => handleNavigatePortal('GUIDE', e)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Hướng dẫn
                </button>
              </li>
              <li>
                <button
                  onClick={handleFaqClick}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Câu hỏi thường gặp
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavigatePortal('CONTACT', e)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Liên hệ hỗ trợ
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column: Cộng đồng & Social (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Cộng đồng
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={(e) => handleNavigatePortal('ARTICLES', e)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Tin tức
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleNavigatePortal('EVENTS', e)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sự kiện
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <h5 className="text-[11px] font-semibold text-slate-300 mb-2">
                Kết nối với chúng tôi
              </h5>
              <div className="flex items-center gap-2 text-slate-400">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Column (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Nhận tin tức mới nhất
            </h4>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã đăng ký!</span>
                  </>
                ) : (
                  <>
                    <span>Đăng ký</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </footer>
  );
}
