import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Bell, Check, ChevronDown, Clock, House, ShieldCheck, UserRound } from 'lucide-react';
import type { AdminView } from './AdminSidebar';
import { readAdminDemoProfile } from '../views/ProfileView';

interface AdminNotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  iconType: 'shield' | 'bell';
}

// Tiêu đề và mô tả của 9 màn hình Admin.
const ADMIN_PAGE_INFO: Record<AdminView, { title: string; description: string }> = {
  dashboard: {
    title: '1. Tổng quan',
    description: 'Theo dõi hoạt động và thống kê cuộc thi nhiếp ảnh phim',
  },
  users: {
    title: '2. Quản lý người dùng',
    description: 'Quản lý tài khoản, phân quyền và trạng thái người dùng',
  },
  contests: {
    title: '3. Quản lý cuộc thi',
    description: 'Theo dõi danh sách, cấu hình và trạng thái cuộc thi',
  },
  submissions: {
    title: '4. Quản lý bài dự thi',
    description: 'Theo dõi và xem tình trạng các bài dự thi',
  },
  archive: {
    title: '5. Kho dữ liệu',
    description: 'Lưu trữ và tra cứu các bài dự thi đạt giải',
  },
  'ai-settings': {
    title: '6. Cấu hình AI',
    description: 'Thiết lập các tính năng AI hỗ trợ quản lý cuộc thi',
  },
  settings: {
    title: '7. Cài đặt hệ thống',
    description: 'Quản lý cấu hình chung của nền tảng',
  },
  logs: {
    title: '8. Nhật ký log',
    description: 'Theo dõi các hoạt động trong hệ thống',
  },
  profile: {
    title: '9. Hồ sơ cá nhân',
    description: 'Quản lý thông tin tài khoản của bạn',
  },
};

export interface AdminHeaderProps {
  activeView: AdminView;
  actions?: ReactNode;
  className?: string;
  overrideTitle?: string;
  overrideDescription?: string;
  adminName?: string;
  onNavigate?: (view: AdminView) => void;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'A';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

export function AdminHeader({
  activeView,
  actions,
  className = '',
  overrideTitle,
  overrideDescription,
  adminName,
  onNavigate,
}: AdminHeaderProps) {
  const { title: defaultTitle, description: defaultDescription } = ADMIN_PAGE_INFO[activeView];
  const title = overrideTitle ?? defaultTitle;
  const description = overrideDescription ?? defaultDescription;

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const ADMIN_DEFAULT_NOTIFS: AdminNotificationItem[] = useMemo(() => [
    {
      id: 'adm-1',
      title: 'Cập nhật tài khoản mới',
      content: 'Tài khoản Lý Thị L vừa hoàn tất xác minh giám khảo.',
      time: '15 phút trước',
      iconType: 'shield',
    },
    {
      id: 'adm-2',
      title: 'Bài dự thi mới cần rà soát',
      content: 'Cuộc thi Analog Moments 2025 vừa nhận thêm 3 bài nộp.',
      time: '1 giờ trước',
      iconType: 'bell',
    },
  ], []);

  const NOTIF_STORAGE_KEY = 'filmcontest_notif_unread_admin_v1';
  const NOTIF_READ_IDS_KEY = 'filmcontest_notif_read_ids_admin_v1';

  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(NOTIF_READ_IDS_KEY);
      if (saved) return JSON.parse(saved);
      const unreadVal = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (unreadVal === '0') {
        return ['adm-1', 'adm-2'];
      }
    } catch {}
    return [];
  });

  const unreadCount = ADMIN_DEFAULT_NOTIFS.filter((n) => !readIds.includes(n.id)).length;

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(NOTIF_READ_IDS_KEY);
        if (saved) setReadIds(JSON.parse(saved));
        else if (localStorage.getItem(NOTIF_STORAGE_KEY) === '0') {
          setReadIds(['adm-1', 'adm-2']);
        }
      } catch {}
    };
    window.addEventListener('notificationsRead', handleSync);
    return () => window.removeEventListener('notificationsRead', handleSync);
  }, []);

  // Lấy thông tin admin từ profile đã lưu và đồng bộ tức thì khi có cập nhật
  const [profile, setProfile] = useState(() => readAdminDemoProfile());
  const displayName = adminName ?? profile.fullName ?? 'Nguyễn Văn B';
  const avatarUrl = profile.avatarDataUrl;

  useEffect(() => {
    const handleProfileSync = () => {
      setProfile(readAdminDemoProfile());
    };
    window.addEventListener('adminProfileUpdated', handleProfileSync);
    window.addEventListener('userNameChanged', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);
    return () => {
      window.removeEventListener('adminProfileUpdated', handleProfileSync);
      window.removeEventListener('userNameChanged', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  const handleUserMenuAction = (action: () => void) => {
    setIsUserMenuOpen(false);
    action();
  };

  const markAllRead = () => {
    const allIds = ADMIN_DEFAULT_NOTIFS.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(NOTIF_READ_IDS_KEY, JSON.stringify(allIds));
      localStorage.setItem(NOTIF_STORAGE_KEY, '0');
      window.dispatchEvent(new Event('notificationsRead'));
    } catch {}
  };

  const markItemRead = (id: string) => {
    if (readIds.includes(id)) return;
    const next = [...readIds, id];
    setReadIds(next);
    try {
      localStorage.setItem(NOTIF_READ_IDS_KEY, JSON.stringify(next));
      if (next.length >= ADMIN_DEFAULT_NOTIFS.length) {
        localStorage.setItem(NOTIF_STORAGE_KEY, '0');
      }
      window.dispatchEvent(new Event('notificationsRead'));
    } catch {}
  };

  return (
    <header
      className={`flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-7 ${className}`}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-[#0B356B]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:gap-4 sm:justify-end">
        {actions != null && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}

        {/* Chuông thông báo */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen((v) => !v);
              setIsUserMenuOpen(false);
            }}
            className="relative cursor-pointer rounded-full p-2 text-blue-700 transition hover:bg-blue-50"
            aria-label={`Thông báo (${unreadCount} chưa đọc)`}
            aria-expanded={isNotifOpen}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsNotifOpen(false)}
                aria-hidden="true"
              />
              <div
                className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
                role="region"
                aria-label="Hộp thông báo quản trị"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">Thông báo hệ thống</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Đã đọc
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 py-1">
                  {ADMIN_DEFAULT_NOTIFS.map((notif) => {
                    const isRead = readIds.includes(notif.id);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => markItemRead(notif.id)}
                        className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition ${
                          isRead ? 'opacity-60 bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            notif.iconType === 'shield'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {notif.iconType === 'shield' ? <ShieldCheck size={15} /> : <Bell size={15} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold ${isRead ? 'text-slate-600' : 'text-slate-800'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.content}</p>
                          <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock size={11} /> {notif.time}
                          </span>
                        </div>
                        {!isRead && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Chưa đọc" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifOpen(false);
                      onNavigate?.('logs');
                    }}
                    className="w-full rounded-lg py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer"
                  >
                    Xem tất cả trong Nhật ký log
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Khối Người dùng: Avatar + Tên + Chức vụ + Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsUserMenuOpen((value) => !value);
              setIsNotifOpen(false);
            }}
            aria-expanded={isUserMenuOpen}
            className="flex cursor-pointer items-center gap-3 text-left rounded-xl p-1 hover:bg-slate-50 transition"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Ảnh đại diện"
                className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm border border-slate-200"
              />
            ) : (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-semibold text-sm text-white shadow-sm"
                aria-hidden="true"
              >
                {getInitials(displayName)}
              </span>
            )}

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</p>
              <p className="text-xs text-slate-500 leading-tight">Quản trị viên</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsUserMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl animate-in fade-in"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleUserMenuAction(() => onNavigate?.('profile'))}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition"
                >
                  <UserRound className="h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleUserMenuAction(() => { window.location.href = '/'; })}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition"
                >
                  <House className="h-4 w-4" />
                  <span>Về trang chủ</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
