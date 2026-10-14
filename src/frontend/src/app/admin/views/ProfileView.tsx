import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Bell, Camera, CheckCircle2, Eye, EyeOff, Info, KeyRound,
  RotateCcw, Save, ShieldCheck, UserRound, X,
} from 'lucide-react';

// Dữ liệu phục vụ dựng giao diện. Chưa đồng bộ với phiên đăng nhập hoặc cơ sở dữ liệu.
const PROFILE_STORAGE_KEY = 'filmcontest-admin-profile-demo-v1';
const NOTIFICATION_STORAGE_KEY = 'filmcontest-admin-profile-notifications-demo-v1';
const MAX_AVATAR_BYTES = 700 * 1024;

type ProfileTab = 'personal' | 'password' | 'notifications';
type ProfileField = 'fullName' | 'email' | 'phone';

export interface DemoAdminProfile {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  avatarDataUrl: string | null;
}

interface NotificationPreferences {
  newUser: boolean;
  contestUpdates: boolean;
  securityAlerts: boolean;
  systemReports: boolean;
}

const DEFAULT_PROFILE: DemoAdminProfile = {
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '0901 235 567',
  bio: 'Quản trị hệ thống FilmContest, đam mê nhiếp ảnh phim và cộng đồng.',
  avatarDataUrl: null,
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  newUser: true,
  contestUpdates: true,
  securityAlerts: true,
  systemReports: false,
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
  { id: 'newUser', label: 'Đăng ký tài khoản mới', description: 'Hiển thị tùy chọn nhận thông tin khi có người dùng mới.' },
  { id: 'contestUpdates', label: 'Cập nhật cuộc thi', description: 'Hiển thị tùy chọn nhận thông báo khi cuộc thi thay đổi trạng thái.' },
  { id: 'securityAlerts', label: 'Cảnh báo bảo mật', description: 'Hiển thị tùy chọn nhận thông tin về sự kiện bảo mật.' },
  { id: 'systemReports', label: 'Báo cáo hệ thống', description: 'Hiển thị tùy chọn nhận báo cáo tổng hợp định kỳ.' },
];

/** Đọc tên và thông tin profile DEMO, chỉ dùng trong vùng Admin. */
export function readAdminDemoProfile(): DemoAdminProfile {
  try {
    if (typeof window === 'undefined') return { ...DEFAULT_PROFILE };
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ...DEFAULT_PROFILE };
    const source = parsed as Record<string, unknown>;
    const avatar = source.avatarDataUrl;
    return {
      fullName: typeof source.fullName === 'string' ? source.fullName.slice(0, 80) : DEFAULT_PROFILE.fullName,
      email: typeof source.email === 'string' ? source.email.slice(0, 120) : DEFAULT_PROFILE.email,
      phone: typeof source.phone === 'string' ? source.phone.slice(0, 24) : DEFAULT_PROFILE.phone,
      bio: typeof source.bio === 'string' ? source.bio.slice(0, 500) : DEFAULT_PROFILE.bio,
      avatarDataUrl: typeof avatar === 'string' && avatar.length < 1_500_000 &&
        /^data:image\/(?:jpeg|png|webp);base64,/i.test(avatar) ? avatar : null,
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function readDemoNotifications(): NotificationPreferences {
  try {
    if (typeof window === 'undefined') return { ...DEFAULT_NOTIFICATIONS };
    const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_NOTIFICATIONS };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ...DEFAULT_NOTIFICATIONS };
    const source = parsed as Record<string, unknown>;
    return {
      newUser: typeof source.newUser === 'boolean' ? source.newUser : DEFAULT_NOTIFICATIONS.newUser,
      contestUpdates: typeof source.contestUpdates === 'boolean' ? source.contestUpdates : DEFAULT_NOTIFICATIONS.contestUpdates,
      securityAlerts: typeof source.securityAlerts === 'boolean' ? source.securityAlerts : DEFAULT_NOTIFICATIONS.securityAlerts,
      systemReports: typeof source.systemReports === 'boolean' ? source.systemReports : DEFAULT_NOTIFICATIONS.systemReports,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATIONS };
  }
}

function validateProfile(profile: DemoAdminProfile): Partial<Record<ProfileField, string>> {
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

interface ProfileViewProps {
  /** Thay đổi nhãn Sidebar sau khi hồ sơ mẫu được lưu thành công. */
  onNameSaved?: (name: string) => void;
}

/** Màn hình 10: Hồ sơ Admin. Không có thao tác xác thực hoặc gửi mật khẩu đến backend. */
export function ProfileView({ onNameSaved }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [savedProfile, setSavedProfile] = useState<DemoAdminProfile>(readAdminDemoProfile);
  const [draftProfile, setDraftProfile] = useState<DemoAdminProfile>(savedProfile);
  const [savedNotifications, setSavedNotifications] = useState<NotificationPreferences>(readDemoNotifications);
  const [draftNotifications, setDraftNotifications] = useState<NotificationPreferences>(savedNotifications);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProfileField, string>>>({});
  const [notice, setNotice] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const profileDirty = JSON.stringify(draftProfile) !== JSON.stringify(savedProfile);
  const notificationDirty = JSON.stringify(draftNotifications) !== JSON.stringify(savedNotifications);

  const updateProfile = (key: 'fullName' | 'email' | 'phone' | 'bio', value: string) => {
    setDraftProfile((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
    setNotice('');
  };

  const chooseAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setNotice('Ảnh đại diện chỉ chấp nhận JPG, PNG hoặc WebP.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setNotice('Ảnh phải nhỏ hơn hoặc bằng 700 KB để lưu bản demo trên trình duyệt.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string' ||
        !/^data:image\/(?:jpeg|png|webp);base64,/i.test(reader.result)) {
        setNotice('Không thể đọc định dạng ảnh này.');
        return;
      }
      setDraftProfile((previous) => ({ ...previous, avatarDataUrl: reader.result as string }));
      setNotice('Đã thay ảnh xem trước. Nhấn Lưu thay đổi để giữ trên trình duyệt này.');
    };
    reader.onerror = () => setNotice('Không đọc được ảnh. Vui lòng thử lại.');
    reader.readAsDataURL(file);
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateProfile(draftProfile);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setNotice('Vui lòng kiểm tra các trường được đánh dấu.');
      return;
    }
    const normalized: DemoAdminProfile = {
      ...draftProfile,
      fullName: draftProfile.fullName.trim(),
      email: draftProfile.email.trim().toLowerCase(),
      phone: draftProfile.phone.trim(),
      bio: draftProfile.bio.trim(),
    };
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalized));
      setSavedProfile(normalized);
      setDraftProfile(normalized);
      onNameSaved?.(normalized.fullName);
      setNotice('Đã lưu hồ sơ DEMO trên trình duyệt này; chưa cập nhật tài khoản trên máy chủ.');
    } catch {
      setNotice('Không thể lưu hồ sơ trên trình duyệt. Hãy thử ảnh nhỏ hơn hoặc kiểm tra quyền lưu trữ.');
    }
  };

  const cancelProfile = () => {
    setDraftProfile({ ...savedProfile });
    setFieldErrors({});
    setNotice('Đã hủy các thay đổi chưa lưu.');
  };

  const switchTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    setNotice('');
    setPasswordError('');
    setPasswordNotice('');
    // Không giữ nội dung mật khẩu khi rời tab.
    setPassword({ current: '', next: '', confirm: '' });
    setShowPassword(false);
  };

  const checkPasswordForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordNotice('');
    if (!password.current) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại để kiểm tra biểu mẫu.');
    } else if (password.next.length < 8 || !/[0-9]/.test(password.next)) {
      setPasswordError('Mật khẩu mới cần từ 8 ký tự và có ít nhất một chữ số (quy tắc giao diện demo).');
    } else if (password.next === password.current) {
      setPasswordError('Mật khẩu mới cần khác mật khẩu đang nhập ở ô hiện tại.');
    } else if (password.next !== password.confirm) {
      setPasswordError('Hai lần nhập mật khẩu mới không trùng nhau.');
    } else {
      setPasswordError('');
      setPasswordNotice('Biểu mẫu đáp ứng kiểm tra phía giao diện. Chưa đổi mật khẩu: cần API xác thực trên Java Backend.');
      setPassword({ current: '', next: '', confirm: '' });
    }
  };

  const saveNotifications = () => {
    try {
      window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(draftNotifications));
      setSavedNotifications({ ...draftNotifications });
      setNotice('Đã lưu TÙY CHỌN thông báo demo trên trình duyệt. Hệ thống chưa gửi thông báo thực tế.');
    } catch {
      setNotice('Không thể lưu tùy chọn thông báo trên trình duyệt.');
    }
  };

  const cancelNotifications = () => {
    setDraftNotifications({ ...savedNotifications });
    setNotice('Đã khôi phục các tùy chọn thông báo đã lưu.');
  };

  return (
    <section aria-label="Hồ sơ cá nhân Admin" className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="note">
        <Info size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p><strong>Giao diện mẫu:</strong> Thông tin hồ sơ và tùy chọn thông báo chỉ được lưu trên trình duyệt. Không đồng bộ với tài khoản đăng nhập, MongoDB hoặc dịch vụ thông báo. Mật khẩu không được lưu hay gửi đi.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div role="tablist" aria-label="Các mục hồ sơ cá nhân" className="flex flex-wrap gap-1 border-b border-slate-200 px-3 pt-3 sm:gap-5 sm:px-7">
          {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" role="tab" id={`admin-profile-tab-${id}`}
              aria-selected={activeTab === id} aria-controls={`admin-profile-panel-${id}`}
              onClick={() => switchTab(id)}
              className={`inline-flex items-center gap-2 border-b-[3px] px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                activeTab === id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-700'
              }`}>
              <Icon size={17} aria-hidden="true" />{label}
            </button>
          ))}
        </div>

        {activeTab === 'personal' && (
          <div role="tabpanel" id="admin-profile-panel-personal" aria-labelledby="admin-profile-tab-personal" className="p-4 sm:p-7">
            <form noValidate onSubmit={saveProfile}>
              <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-7">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-blue-50 bg-blue-100 text-5xl font-bold text-blue-800 shadow-sm">
                    {draftProfile.avatarDataUrl ? (
                      <img src={draftProfile.avatarDataUrl} alt="Ảnh đại diện xem trước" className="h-full w-full object-cover" />
                    ) : (
                      <span aria-label="Chưa có ảnh đại diện">{draftProfile.fullName.trim().slice(0, 1).toUpperCase() || 'A'}</span>
                    )}
                  </div>
                  <input ref={avatarInputRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp"
                    aria-label="Chọn ảnh đại diện" onChange={chooseAvatar} />
                  <button type="button" onClick={() => avatarInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600">
                    <Camera size={16} aria-hidden="true" /> Thay đổi ảnh
                  </button>
                  {draftProfile.avatarDataUrl && (
                    <button type="button" onClick={() => { setDraftProfile((p) => ({ ...p, avatarDataUrl: null })); setNotice('Đã gỡ ảnh trong bản nháp. Nhấn Lưu để áp dụng.'); }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600">
                      <X size={14} aria-hidden="true" /> Gỡ ảnh
                    </button>
                  )}
                  <p className="text-center text-xs text-slate-500">PNG, JPG hoặc WebP ≤ 700 KB</p>
                  <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-sm">
                    <p className="text-xs font-medium text-slate-500">Chức vụ</p>
                    <p className="font-semibold text-slate-800">Administrator</p>
                    <p className="text-xs text-slate-500">Vai trò được hệ thống quản lý, không thay đổi tại hồ sơ.</p>
                  </div>
                </div>

                <div className="grid min-w-0 gap-5 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="admin-profile-name" className="text-sm font-semibold text-slate-700">Họ và tên <span className="text-red-600">*</span></label>
                    <input id="admin-profile-name" required maxLength={80} value={draftProfile.fullName}
                      onChange={(event) => updateProfile('fullName', event.target.value)}
                      aria-invalid={Boolean(fieldErrors.fullName)} aria-describedby={fieldErrors.fullName ? 'admin-profile-name-error' : undefined}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    {fieldErrors.fullName && <p id="admin-profile-name-error" className="text-xs text-red-600">{fieldErrors.fullName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="admin-profile-email" className="text-sm font-semibold text-slate-700">Email <span className="text-red-600">*</span></label>
                    <input id="admin-profile-email" required type="email" autoComplete="email" maxLength={120} value={draftProfile.email}
                      onChange={(event) => updateProfile('email', event.target.value)}
                      aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'admin-profile-email-error' : undefined}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    {fieldErrors.email && <p id="admin-profile-email-error" className="text-xs text-red-600">{fieldErrors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="admin-profile-phone" className="text-sm font-semibold text-slate-700">Số điện thoại</label>
                    <input id="admin-profile-phone" type="tel" autoComplete="tel" maxLength={24} value={draftProfile.phone}
                      onChange={(event) => updateProfile('phone', event.target.value)}
                      aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'admin-profile-phone-error' : undefined}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    {fieldErrors.phone && <p id="admin-profile-phone-error" className="text-xs text-red-600">{fieldErrors.phone}</p>}
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="admin-profile-role" className="text-sm font-semibold text-slate-700">Chức vụ</label>
                    <input id="admin-profile-role" value="Administrator" readOnly aria-readonly="true"
                      className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="admin-profile-bio" className="text-sm font-semibold text-slate-700">Giới thiệu</label>
                    <textarea id="admin-profile-bio" rows={4} maxLength={500} value={draftProfile.bio}
                      onChange={(event) => updateProfile('bio', event.target.value)}
                      className="w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    <p className="text-right text-xs text-slate-400">{draftProfile.bio.length}/500 ký tự</p>
                  </div>
                </div>
              </div>

              {notice && <p role="status" className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{notice}</p>}
              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" onClick={cancelProfile} disabled={!profileDirty}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                  <RotateCcw size={16} aria-hidden="true" /> Hủy
                </button>
                <button type="submit" disabled={!profileDirty}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                  <Save size={16} aria-hidden="true" /> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div role="tabpanel" id="admin-profile-panel-password" aria-labelledby="admin-profile-tab-password" className="max-w-2xl space-y-5 p-4 sm:p-7">
            <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              <ShieldCheck size={20} className="shrink-0" aria-hidden="true" />
              <p>Đây chỉ là bản kiểm tra biểu mẫu. Chưa có API xác thực mật khẩu cũ hoặc đổi mật khẩu trên Spring Boot. Không nhập mật khẩu thật.</p>
            </div>
            <form onSubmit={checkPasswordForm} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="admin-password-current" className="text-sm font-semibold text-slate-700">Mật khẩu hiện tại (giả lập)</label>
                <input id="admin-password-current" type="password" autoComplete="off" value={password.current}
                  onChange={(event) => { setPassword((p) => ({ ...p, current: event.target.value })); setPasswordError(''); }}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="admin-password-new" className="text-sm font-semibold text-slate-700">Mật khẩu mới (giả lập)</label>
                <div className="relative">
                  <input id="admin-password-new" type={showPassword ? 'text' : 'password'} autoComplete="off" value={password.next}
                    onChange={(event) => { setPassword((p) => ({ ...p, next: event.target.value })); setPasswordError(''); }}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-blue-700">
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="admin-password-confirm" className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu mới</label>
                <input id="admin-password-confirm" type={showPassword ? 'text' : 'password'} autoComplete="off" value={password.confirm}
                  onChange={(event) => { setPassword((p) => ({ ...p, confirm: event.target.value })); setPasswordError(''); }}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <p className="text-xs text-slate-500">Quy tắc demo: tối thiểu 8 ký tự, có ít nhất 1 chữ số. Backend cần tự xác thực và áp dụng chính sách mật khẩu riêng.</p>
              {passwordError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{passwordError}</p>}
              {passwordNotice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{passwordNotice}</p>}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" onClick={() => { setPassword({ current: '', next: '', confirm: '' }); setPasswordError(''); setPasswordNotice(''); }}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Xóa biểu mẫu</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Kiểm tra biểu mẫu</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div role="tabpanel" id="admin-profile-panel-notifications" aria-labelledby="admin-profile-tab-notifications" className="space-y-5 p-4 sm:p-7">
            <p className="text-sm text-slate-600">Các công tắc bên dưới chỉ là tùy chọn giao diện mẫu. Không gửi email, push notification hoặc thay đổi cài đặt máy chủ.</p>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {NOTIFICATION_ITEMS.map(({ id, label, description }) => (
                <label key={id} className="flex cursor-pointer items-start justify-between gap-5 p-4 sm:items-center">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800">{label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{description}</span>
                  </span>
                  <input type="checkbox" checked={draftNotifications[id]}
                    onChange={(event) => { setDraftNotifications((p) => ({ ...p, [id]: event.target.checked })); setNotice(''); }}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-blue-600" aria-label={label} />
                </label>
              ))}
            </div>
            {notice && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button type="button" onClick={cancelNotifications} disabled={!notificationDirty}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Hủy</button>
              <button type="button" onClick={saveNotifications} disabled={!notificationDirty}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                <CheckCircle2 size={17} aria-hidden="true" /> Lưu tùy chọn
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
