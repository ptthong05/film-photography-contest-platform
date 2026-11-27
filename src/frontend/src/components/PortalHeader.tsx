import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Bell, Check, ChevronDown, Clock, House, LogOut, Menu, ShieldCheck, UserRound } from 'lucide-react';
import { authService } from '../services/authService';

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  type?: 'info' | 'alert' | 'success';
  /** Chỉ dùng khi header được điều khiển (có onMarkAllRead): trạng thái đọc lấy từ server */
  isRead?: boolean;
}

export interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  userName: string;
  userRole: string;
  avatarUrl?: string | null;
  /** Chỉ dùng ở chế độ điều khiển; chế độ cũ tự đếm từ danh sách */
  unreadCount?: number;
  notifications?: NotificationItem[];
  actions?: ReactNode;
  onOpenProfile: () => void;
  onGoHome?: () => void;
  onOpenMenu?: () => void;
  onViewAllNotifications?: () => void;
  /**
   * Truyền vào thì header hiển thị đúng `notifications` và trạng thái `isRead` của chúng (dữ liệu từ API),
   * bỏ qua thông báo mẫu và trạng thái đã đọc lưu trong localStorage.
   */
  onMarkAllRead?: () => void;
  onMarkItemRead?: (id: string) => void;
  className?: string;
}

function getInitials(name: string): string {
  const clean = (name || '').trim();
  if (!clean) return 'P';
  return clean.slice(0, 1).toUpperCase();
}

export function PortalHeader({
  title,
  subtitle,
  userName,
  userRole,
  avatarUrl,
  unreadCount: unreadCountProp,
  notifications,
  actions,
  onOpenProfile,
  onGoHome,
  onOpenMenu,
  onViewAllNotifications,
  onMarkAllRead,
  onMarkItemRead,
  className = '',
}: PortalHeaderProps) {
  const isControlled = onMarkAllRead !== undefined;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const roleSlug = useMemo(() => {
    return (userRole ?? 'portal')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
  }, [userRole]);

  const storageKey = `filmcontest_notif_unread_${roleSlug}_v1`;
  const readIdsKey = `filmcontest_notif_read_ids_${roleSlug}_v1`;
  const customNotifsKey = `filmcontest_custom_notifs_${roleSlug}_v1`;

  const [customNotifs, setCustomNotifs] = useState<NotificationItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(customNotifsKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  useEffect(() => {
    const handleCustomSync = () => {
      try {
        const raw = localStorage.getItem(customNotifsKey);
        if (raw) setCustomNotifs(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener('notificationsChanged', handleCustomSync);
    return () => window.removeEventListener('notificationsChanged', handleCustomSync);
  }, [customNotifsKey]);

  const defaultNotifications: NotificationItem[] = useMemo(() => {
    if (isControlled) return notifications ?? [];
    const base = notifications ?? [
      {
        id: '1',
        title: 'Thông báo hoạt động',
        content: 'Hệ thống vừa cập nhật các thông tin mới nhất.',
        time: '15 phút trước',
        type: 'info',
      },
      {
        id: '2',
        title: 'Nhắc nhở tiến độ',
        content: 'Vui lòng kiểm tra tiến độ các nội dung đang tham gia.',
        time: '1 giờ trước',
        type: 'alert',
      },
    ];
    return [...customNotifs, ...base];
  }, [isControlled, notifications, customNotifs]);

  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(readIdsKey);
      if (saved) return JSON.parse(saved);
      const unreadVal = localStorage.getItem(storageKey);
      if (unreadVal === '0') {
        return (notifications ?? [{ id: '1' }, { id: '2' }]).map((n) => n.id);
      }
    } catch {}
    return [];
  });

  const isItemRead = (item: NotificationItem) => (isControlled ? Boolean(item.isRead) : readIds.includes(item.id));
  // Danh sách điều khiển có thể chỉ là phần đầu, nên ưu tiên unreadCount do trang cha đếm
  const unreadCount = isControlled
    ? (unreadCountProp ?? defaultNotifications.filter((n) => !n.isRead).length)
    : defaultNotifications.filter((n) => !readIds.includes(n.id)).length;

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(readIdsKey);
        if (saved) setReadIds(JSON.parse(saved));
        else if (localStorage.getItem(storageKey) === '0') {
          setReadIds(defaultNotifications.map((n) => n.id));
        }
      } catch {}
    };
    window.addEventListener('notificationsRead', handleSync);
    return () => window.removeEventListener('notificationsRead', handleSync);
  }, [readIdsKey, storageKey, defaultNotifications]);

  const markAllRead = () => {
    if (isControlled) {
      onMarkAllRead();
      return;
    }
    const allIds = defaultNotifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(readIdsKey, JSON.stringify(allIds));
      localStorage.setItem(storageKey, '0');
      window.dispatchEvent(new Event('notificationsRead'));
    } catch {}
  };

  const markItemRead = (id: string) => {
    if (isControlled) {
      const item = defaultNotifications.find((n) => n.id === id);
      if (item && !item.isRead) onMarkItemRead?.(id);
      return;
    }
    if (readIds.includes(id)) return;
    const next = [...readIds, id];
    setReadIds(next);
    try {
      localStorage.setItem(readIdsKey, JSON.stringify(next));
      if (next.length >= defaultNotifications.length) {
        localStorage.setItem(storageKey, '0');
      }
      window.dispatchEvent(new Event('notificationsRead'));
    } catch {}
  };

  return (
    <header
      className={`flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-7 ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="mt-1 cursor-pointer rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[#0B356B]">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
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
                aria-label="Hộp thông báo"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">Thông báo</span>
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
                  {defaultNotifications.length === 0 && (
                    <p className="px-2 py-6 text-center text-xs text-slate-500">Chưa có thông báo nào.</p>
                  )}
                  {defaultNotifications.map((notif) => {
                    const isRead = isItemRead(notif);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => markItemRead(notif.id)}
                        className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition ${
                          isRead ? 'opacity-60 bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50'
                        }`}
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          {notif.type === 'alert' ? <Bell size={15} /> : <ShieldCheck size={15} />}
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

                {onViewAllNotifications && (
                  <div className="border-t border-slate-100 pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotifOpen(false);
                        onViewAllNotifications();
                      }}
                      className="w-full rounded-lg py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer"
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                )}
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
            {avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '' && avatarUrl !== 'null' && avatarUrl !== 'undefined' ? (
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
                {getInitials(userName)}
              </span>
            )}

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{userName}</p>
              <p className="text-xs text-slate-500 leading-tight">{userRole}</p>
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
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition"
                >
                  <UserRound className="h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onGoHome) onGoHome();
                    else window.location.hash = '#/';
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition"
                >
                  <House className="h-4 w-4" />
                  <span>Về trang chủ</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    authService.logout();
                    if (onGoHome) onGoHome();
                    else window.location.hash = '#/';
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
