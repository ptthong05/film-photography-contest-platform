import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Camera, Menu, X } from 'lucide-react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar, type AdminView } from './AdminSidebar';

/**
 * Bộ khung dùng chung cho 10 màn hình thuộc khu vực Admin.
 * Chỉ phụ trách giao diện và điều hướng; không xử lý API hoặc phân quyền.
 */
export interface AdminLayoutProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  children: ReactNode;
  actions?: ReactNode;
  adminName?: string;
  className?: string;
}

export function AdminLayout({
  activeView,
  onNavigate,
  children,
  actions,
  adminName = 'Quản trị viên',
  className = '',
}: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  // Cho phép đóng bằng phím Escape và đưa con trỏ bàn phím về nút mở menu.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousFocus = document.activeElement;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    mobileCloseButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isMobileMenuOpen]);

  // Đóng menu điện thoại sau khi người dùng chuyển trang.
  const handleNavigate = (view: AdminView) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 md:flex ${className}`}>
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-blue-800 focus:shadow-lg"
      >
        Bỏ qua thanh điều hướng
      </a>

      {/* Menu cố định ở cột bên trái trên máy tính. */}
      <div className="sticky top-0 hidden h-screen w-60 shrink-0 md:block">
        <AdminSidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          adminName={adminName}
        />
      </div>

      <div className="min-w-0 flex-1">
        {/* Trên màn hình nhỏ, dùng nút để mở menu dạng ngăn kéo. */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 pb-3 pt-[4.5rem] md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Mở menu quản trị"
            aria-expanded={isMobileMenuOpen}
            aria-controls="admin-mobile-navigation"
            className="rounded-lg p-2 text-[#0B356B] transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
          <span className="flex items-center gap-2 font-semibold text-[#0B356B]">
            <Camera size={22} aria-hidden="true" />
            FilmContest
          </span>
          <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-slate-500">
            Admin
          </span>
        </div>

        {/* Header tự đổi tiêu đề theo activeView. */}
        <AdminHeader activeView={activeView} actions={actions} />

        <main id="admin-main-content" tabIndex={-1} className="min-w-0 outline-none">
          <div className="mx-auto w-full max-w-[1700px] px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Menu điện thoại: chỉ xuất hiện khi được mở. */}
      {isMobileMenuOpen && (
        <div
          id="admin-mobile-navigation"
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu quản trị"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Đóng menu quản trị"
          />
          <div className="absolute inset-y-0 left-0 w-60 shadow-xl">
            <AdminSidebar
              activeView={activeView}
              onNavigate={handleNavigate}
              adminName={adminName}
            />
          </div>
          <button
            ref={mobileCloseButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Đóng menu quản trị"
            className="absolute left-[15.5rem] top-4 rounded-full bg-white p-2 text-slate-800 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
