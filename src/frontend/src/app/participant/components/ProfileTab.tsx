import React, { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import {
  Bell, Camera, CheckCircle2, Eye, EyeOff, Info, KeyRound,
  RotateCcw, Save, ShieldCheck, UserRound, X,
} from 'lucide-react';
import { Toast, type ToastNotice } from '../../../components/Toast';

const PROFILE_STORAGE_KEY = 'participant_profile';
const USERNAME_STORAGE_KEY = 'participant_user_name';
const AVATAR_STORAGE_KEY = 'participant_avatar';
const NOTIFICATION_STORAGE_KEY = 'participant_notifications_prefs';
const MAX_AVATAR_BYTES = 700 * 1024;

type ProfileTab = 'personal' | 'password' | 'notifications';
type ProfileField = 'fullName' | 'email' | 'phone';

export interface ParticipantProfile {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  avatarDataUrl: string | null;
}

interface NotificationPreferences {
  contestUpdates: boolean;
  submissionStatus: boolean;
  awardAnnouncement: boolean;
  organizerMessages: boolean;
}

const DEFAULT_PROFILE: ParticipantProfile = {
  fullName: 'Hồ Thanh Bình',
  email: 'thanhbinh.photo@filmcontest.vn',
  phone: '0912 345 678',
  bio: 'Nhiếp ảnh gia phim tài liệu và đường phố tự do. Đam mê chụp với film 35mm và định dạng Medium Format.',
  avatarDataUrl: null,
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  contestUpdates: true,
  submissionStatus: true,
  awardAnnouncement: true,
  organizerMessages: true,
};

const TAB_ITEMS: { id: ProfileTab; label: string; icon: typeof UserRound }[] = [
  { id: 'personal', label: 'Thông tin cá nhân', icon: UserRound },
  { id: 'password', label: 'Đổi mật khẩu', icon: KeyRound },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
];

const NOTIFICATION_ITEMS: {
  id: keyof NotificationPreferences;
  label: string;
  description: string;
}[] = [
  {
    id: 'contestUpdates',
    label: 'Cập nhật cuộc thi mới',
    description: 'Nhận thông báo ngay khi có cuộc thi nhiếp ảnh phim mới mở cổng đăng ký.',
  },
  {
    id: 'submissionStatus',
    label: 'Tiến độ duyệt bài dự thi',
    description: 'Nhận thông báo khi ban tổ chức duyệt hoặc cập nhật trạng thái tác phẩm dự thi.',
  },
  {
    id: 'awardAnnouncement',
    label: 'Công bố giải thưởng & Bảng điểm',
    description: 'Nhận thông báo khi Hội đồng Giám khảo hoàn tất chấm thi và công bố xếp hạng.',
  },
  {
    id: 'organizerMessages',
    label: 'Thông báo từ Ban tổ chức',
    description: 'Nhận các thông báo khẩn, hướng dẫn nộp ảnh gốc và quy chế trao giải trực tiếp.',
  },
];

function readParticipantProfile(): ParticipantProfile {
  try {
    if (typeof window === 'undefined') return { ...DEFAULT_PROFILE };

    let avatarDataUrl: string | null = null;
    const directAvatar = window.localStorage.getItem(AVATAR_STORAGE_KEY);
    if (directAvatar && directAvatar.startsWith('data:image/')) {
      avatarDataUrl = directAvatar;
    }

    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const source = parsed as Record<string, unknown>;
        return {
          fullName: (typeof source.name === 'string' && source.name.trim()) ||
                    (typeof source.fullName === 'string' && source.fullName.trim()) ||
                    window.localStorage.getItem(USERNAME_STORAGE_KEY) ||
                    DEFAULT_PROFILE.fullName,
          email: typeof source.email === 'string' ? source.email.slice(0, 120) : DEFAULT_PROFILE.email,
          phone: typeof source.phone === 'string' ? source.phone.slice(0, 24) : DEFAULT_PROFILE.phone,
          bio: typeof source.bio === 'string' ? source.bio.slice(0, 500) : DEFAULT_PROFILE.bio,
          avatarDataUrl: avatarDataUrl || (typeof source.avatarUrl === 'string' && source.avatarUrl.startsWith('data:image/') ? source.avatarUrl : null),
        };
      }
    }

    const savedName = window.localStorage.getItem(USERNAME_STORAGE_KEY);
    return {
      ...DEFAULT_PROFILE,
      fullName: savedName || DEFAULT_PROFILE.fullName,
      avatarDataUrl,
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function readNotifications(): NotificationPreferences {
  try {
    if (typeof window === 'undefined') return { ...DEFAULT_NOTIFICATIONS };
    const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_NOTIFICATIONS };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_NOTIFICATIONS };
    const source = parsed as Record<string, unknown>;
    return {
      contestUpdates: typeof source.contestUpdates === 'boolean' ? source.contestUpdates : DEFAULT_NOTIFICATIONS.contestUpdates,
      submissionStatus: typeof source.submissionStatus === 'boolean' ? source.submissionStatus : DEFAULT_NOTIFICATIONS.submissionStatus,
      awardAnnouncement: typeof source.awardAnnouncement === 'boolean' ? source.awardAnnouncement : DEFAULT_NOTIFICATIONS.awardAnnouncement,
      organizerMessages: typeof source.organizerMessages === 'boolean' ? source.organizerMessages : DEFAULT_NOTIFICATIONS.organizerMessages,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATIONS };
  }
}

function validateProfile(profile: ParticipantProfile): Partial<Record<ProfileField, string>> {
  const errors: Partial<Record<ProfileField, string>> = {};
  if (profile.fullName.trim().length < 2 || profile.fullName.trim().length > 80) {
    errors.fullName = 'Họ và tên phải có từ 2 đến 80 ký tự.';
  }
  if (profile.email.trim().length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.email = 'Vui lòng nhập email hợp lệ, tối đa 120 ký tự.';
  }
  if (profile.phone.trim() && (!/^\+?[0-9\s()-]{9,24}$/.test(profile.phone.trim()) ||
    (profile.phone.match(/\d/g) ?? []).length < 9)) {
    errors.phone = 'Số điện thoại cần có ít nhất 9 chữ số.';
  }
  return errors;
}

const PARTICIPANT_PROFILE_TAB_KEY = 'participant_profile_subtab';

export function ProfileTab() {
  const [activeTab, setActiveTabState] = useState<ProfileTab>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PARTICIPANT_PROFILE_TAB_KEY) as ProfileTab | null;
      if (saved && (saved === 'personal' || saved === 'password' || saved === 'notifications')) return saved;
    }
    return 'personal';
  });

  const setActiveTab = (tab: ProfileTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem(PARTICIPANT_PROFILE_TAB_KEY, tab);
    } catch {}
  };
  const [savedProfile, setSavedProfile] = useState<ParticipantProfile>(readParticipantProfile);
  const [draftProfile, setDraftProfile] = useState<ParticipantProfile>(savedProfile);
  const [savedNotifications, setSavedNotifications] = useState<NotificationPreferences>(readNotifications);
  const [draftNotifications, setDraftNotifications] = useState<NotificationPreferences>(savedNotifications);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProfileField, string>>>({});
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = readParticipantProfile();
    setSavedProfile(loaded);
    setDraftProfile(loaded);
  }, []);

  const profileDirty = JSON.stringify(draftProfile) !== JSON.stringify(savedProfile);
  const notificationDirty = JSON.stringify(draftNotifications) !== JSON.stringify(savedNotifications);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const updateProfile = (key: 'fullName' | 'email' | 'phone' | 'bio', value: string) => {
    setDraftProfile((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const chooseAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Ảnh đại diện chỉ chấp nhận định dạng JPG, PNG hoặc WebP.', 'error');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showToast('Ảnh phải nhỏ hơn hoặc bằng 700 KB để tối ưu hiển thị trên trình duyệt.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string' ||
        !/^data:image\/(?:jpeg|png|webp);base64,/i.test(reader.result)) {
        showToast('Không thể đọc định dạng ảnh này.', 'error');
        return;
      }
      setDraftProfile((previous) => ({ ...previous, avatarDataUrl: reader.result as string }));
      showToast('Đã tải ảnh xem trước. Nhấn "Lưu thay đổi" để hoàn tất cập nhật.', 'info');
    };
    reader.onerror = () => showToast('Không đọc được tệp ảnh. Vui lòng thử lại.', 'error');
    reader.readAsDataURL(file);
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateProfile(draftProfile);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast('Vui lòng kiểm tra lại các trường thông tin được đánh dấu đỏ.', 'error');
      return;
    }

    const normalized: ParticipantProfile = {
      ...draftProfile,
      fullName: draftProfile.fullName.trim(),
      email: draftProfile.email.trim().toLowerCase(),
      phone: draftProfile.phone.trim(),
      bio: draftProfile.bio.trim(),
    };

    try {
      // Lưu vào participant_profile
      const profileToSave = {
        name: normalized.fullName,
        fullName: normalized.fullName,
        email: normalized.email,
        phone: normalized.phone,
        bio: normalized.bio,
        role: 'Nhiếp ảnh gia',
        avatarUrl: normalized.avatarDataUrl,
      };
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileToSave));
      window.localStorage.setItem(USERNAME_STORAGE_KEY, normalized.fullName);

      if (normalized.avatarDataUrl) {
        window.localStorage.setItem(AVATAR_STORAGE_KEY, normalized.avatarDataUrl);
      } else {
        window.localStorage.removeItem(AVATAR_STORAGE_KEY);
      }

      setSavedProfile(normalized);
      setDraftProfile(normalized);

      // Phát sự kiện cho Sidebar và Topbar cập nhật tức thì
      window.dispatchEvent(new Event('userNameChanged'));
      window.dispatchEvent(new Event('avatarChanged'));
      window.dispatchEvent(new Event('profileChanged'));

      showToast('Đã lưu hồ sơ cá nhân thí sinh thành công.', 'success');
    } catch {
      showToast('Không thể lưu hồ sơ trên trình duyệt. Hãy thử ảnh có dung lượng nhỏ hơn.', 'error');
    }
  };

  const cancelProfile = () => {
    setDraftProfile({ ...savedProfile });
    setFieldErrors({});
    showToast('Đã hủy các thay đổi chưa lưu.', 'info');
  };

  const switchTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    setPassword({ current: '', next: '', confirm: '' });
    setShowPassword(false);
  };

  const checkPasswordForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.current) {
      showToast('Vui lòng nhập mật khẩu hiện tại.', 'error');
    } else if (password.next.length < 8 || !/[0-9]/.test(password.next)) {
      showToast('Mật khẩu mới cần từ 8 ký tự và có ít nhất 1 chữ số.', 'error');
    } else if (password.next === password.current) {
      showToast('Mật khẩu mới cần khác mật khẩu hiện tại.', 'error');
    } else if (password.next !== password.confirm) {
      showToast('Mật khẩu mới nhập hai lần không trùng khớp.', 'error');
    } else {
      showToast('Cập nhật mật khẩu thành công.', 'success');
      setPassword({ current: '', next: '', confirm: '' });
    }
  };

  const saveNotifications = () => {
    try {
      window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(draftNotifications));
      setSavedNotifications({ ...draftNotifications });
      showToast('Đã lưu các tùy chọn thông báo thành công.', 'success');
    } catch {
      showToast('Không thể lưu tùy chọn thông báo trên trình duyệt.', 'error');
    }
  };

  const cancelNotifications = () => {
    setDraftNotifications({ ...savedNotifications });
    showToast('Đã khôi phục các tùy chọn thông báo đã lưu.', 'info');
  };

  return (
    <section aria-label="Hồ sơ cá nhân Thí sinh" className="relative space-y-5">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Banner thông báo chế độ demo / đồng bộ cục bộ */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="note">
        <Info size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p><strong>Giao diện hồ sơ thí sinh:</strong> Thông tin cá nhân và tùy chọn thông báo được cập nhật trực tiếp trên trình duyệt. Thay đổi tên hoặc ảnh đại diện sẽ tự động đồng bộ trên toàn bộ cổng thí sinh (Sidebar, Topbar). Mật khẩu không được lưu hay gửi đi.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Thanh chuyển tab đồng nhất với Admin */}
        <div role="tablist" aria-label="Các mục hồ sơ cá nhân" className="flex flex-wrap gap-1 border-b border-slate-200 px-3 pt-3 sm:gap-5 sm:px-7">
          {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`participant-profile-tab-${id}`}
              aria-selected={activeTab === id}
              aria-controls={`participant-profile-panel-${id}`}
              onClick={() => switchTab(id)}
              className={`inline-flex items-center gap-2 border-b-[3px] px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                activeTab === id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-700'
              }`}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab 1: Thông tin cá nhân */}
        {activeTab === 'personal' && (
          <div role="tabpanel" id="participant-profile-panel-personal" aria-labelledby="participant-profile-tab-personal" className="p-4 sm:p-7">
            <form noValidate onSubmit={saveProfile}>
              <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
                {/* Cột trái: Ảnh đại diện & Vai trò */}
                <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-7">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-blue-50 bg-blue-100 text-5xl font-bold text-blue-800 shadow-sm">
                    {draftProfile.avatarDataUrl ? (
                      <img src={draftProfile.avatarDataUrl} alt="Ảnh đại diện xem trước" className="h-full w-full object-cover" />
                    ) : (
                      <span aria-label="Chưa có ảnh đại diện">
                        {draftProfile.fullName.trim().slice(0, 1).toUpperCase() || 'P'}
                      </span>
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    aria-label="Chọn ảnh đại diện"
                    onChange={chooseAvatar}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    <Camera size={16} aria-hidden="true" /> Thay đổi ảnh
                  </button>
                  {draftProfile.avatarDataUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraftProfile((p) => ({ ...p, avatarDataUrl: null }));
                        showToast('Đã gỡ ảnh trong bản nháp. Nhấn "Lưu thay đổi" để áp dụng.', 'info');
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"
                    >
                      <X size={14} aria-hidden="true" /> Gỡ ảnh
                    </button>
                  )}
                  <p className="text-center text-xs text-slate-500">PNG, JPG hoặc WebP ≤ 700 KB</p>

                  <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-sm">
                    <p className="text-xs font-medium text-slate-500">Vai trò thí sinh</p>
                    <p className="font-semibold text-slate-800">Thí sinh / Nhiếp ảnh gia</p>
                    <p className="text-xs text-slate-500">Tài khoản chính thức tham gia dự thi và nộp cuộn phim.</p>
                  </div>
                </div>

                {/* Cột phải: Form thông tin cá nhân */}
                <div className="grid min-w-0 gap-5 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="participant-profile-name" className="text-sm font-semibold text-slate-700">
                      Họ và tên <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="participant-profile-name"
                      required
                      maxLength={80}
                      value={draftProfile.fullName}
                      onChange={(event) => updateProfile('fullName', event.target.value)}
                      aria-invalid={Boolean(fieldErrors.fullName)}
                      aria-describedby={fieldErrors.fullName ? 'participant-profile-name-error' : undefined}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    {fieldErrors.fullName && (
                      <p id="participant-profile-name-error" className="text-xs text-red-600">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="participant-profile-email" className="text-sm font-semibold text-slate-700">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="participant-profile-email"
                      required
                      type="email"
                      autoComplete="email"
                      maxLength={120}
                      value={draftProfile.email}
                      onChange={(event) => updateProfile('email', event.target.value)}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'participant-profile-email-error' : undefined}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    {fieldErrors.email && (
                      <p id="participant-profile-email-error" className="text-xs text-red-600">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="participant-profile-phone" className="text-sm font-semibold text-slate-700">
                      Số điện thoại
                    </label>
                    <input
                      id="participant-profile-phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={24}
                      value={draftProfile.phone}
                      onChange={(event) => updateProfile('phone', event.target.value)}
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={fieldErrors.phone ? 'participant-profile-phone-error' : undefined}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    {fieldErrors.phone && (
                      <p id="participant-profile-phone-error" className="text-xs text-red-600">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="participant-profile-role" className="text-sm font-semibold text-slate-700">
                      Chức vụ / Tư cách tham gia
                    </label>
                    <input
                      id="participant-profile-role"
                      value="Thí sinh (Nhiếp ảnh gia phim)"
                      readOnly
                      aria-readonly="true"
                      className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="participant-profile-bio" className="text-sm font-semibold text-slate-700">
                      Tiểu sử & Phong cách nhiếp ảnh
                    </label>
                    <textarea
                      id="participant-profile-bio"
                      rows={4}
                      maxLength={500}
                      value={draftProfile.bio}
                      onChange={(event) => updateProfile('bio', event.target.value)}
                      className="w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Mô tả ngắn gọn về thiết bị quen thuộc, thể loại ảnh yêu thích hoặc kinh nghiệm nhiếp ảnh..."
                    />
                    <p className="text-right text-xs text-slate-400">{draftProfile.bio.length}/500 ký tự</p>
                  </div>
                </div>
              </div>

              {/* Hàng nút hành động dưới cùng */}
              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={cancelProfile}
                  disabled={!profileDirty}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw size={16} aria-hidden="true" /> Hủy
                </button>
                <button
                  type="submit"
                  disabled={!profileDirty}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} aria-hidden="true" /> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Đổi mật khẩu */}
        {activeTab === 'password' && (
          <div role="tabpanel" id="participant-profile-panel-password" aria-labelledby="participant-profile-tab-password" className="max-w-2xl space-y-5 p-4 sm:p-7">
            <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              <ShieldCheck size={20} className="shrink-0" aria-hidden="true" />
              <p>Mật khẩu an toàn giúp bảo vệ tài khoản nộp bài thi và các bộ ảnh bản quyền của bạn. Không chia sẻ mật khẩu cho người khác.</p>
            </div>
            <form onSubmit={checkPasswordForm} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="participant-password-current" className="text-sm font-semibold text-slate-700">
                  Mật khẩu hiện tại
                </label>
                <input
                  id="participant-password-current"
                  type="password"
                  autoComplete="off"
                  value={password.current}
                  onChange={(event) => setPassword((p) => ({ ...p, current: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="participant-password-new" className="text-sm font-semibold text-slate-700">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="participant-password-new"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="off"
                    value={password.next}
                    onChange={(event) => setPassword((p) => ({ ...p, next: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-blue-700"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="participant-password-confirm" className="text-sm font-semibold text-slate-700">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="participant-password-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  value={password.confirm}
                  onChange={(event) => setPassword((p) => ({ ...p, confirm: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <p className="text-xs text-slate-500">Tối thiểu 8 ký tự, có ít nhất 1 chữ số.</p>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setPassword({ current: '', next: '', confirm: '' })}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Xóa biểu mẫu
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Cài đặt thông báo */}
        {activeTab === 'notifications' && (
          <div role="tabpanel" id="participant-profile-panel-notifications" aria-labelledby="participant-profile-tab-notifications" className="space-y-5 p-4 sm:p-7">
            <p className="text-sm text-slate-600">Tùy chỉnh các thông báo và cập nhật bạn muốn nhận trong quá trình dự thi.</p>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {NOTIFICATION_ITEMS.map(({ id, label, description }) => (
                <label key={id} className="flex cursor-pointer items-start justify-between gap-5 p-4 sm:items-center">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800">{label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{description}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={draftNotifications[id]}
                    onChange={(event) => setDraftNotifications((p) => ({ ...p, [id]: event.target.checked }))}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-blue-600"
                    aria-label={label}
                  />
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={cancelNotifications}
                disabled={!notificationDirty}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={saveNotifications}
                disabled={!notificationDirty}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={17} aria-hidden="true" /> Lưu tùy chọn
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
