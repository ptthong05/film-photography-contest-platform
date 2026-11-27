import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Bell, Camera, CheckCircle2, Eye, EyeOff, KeyRound,
  RotateCcw, Save, ShieldCheck, UserRound, X,
} from 'lucide-react';
import { judgeService } from '../../../services/judgeService';
import { authService, validateStrongPassword } from '../../../services/authService';
import type { JudgeProfile } from '../../../types/judge';
import { AsyncState } from './AsyncState';
import { Toast, type ToastNotice } from '../../../components/Toast';

const MAX_AVATAR_BYTES = 700 * 1024;

type ProfileTab = 'personal' | 'password' | 'notifications';
type ProfileField = 'fullName' | 'email' | 'phone';

type NotificationKey = 'newAssignment' | 'contestUpdates' | 'scoringReminder';

interface NotificationPreferences {
  newAssignment: boolean;
  contestUpdates: boolean;
  scoringReminder: boolean;
}

const TAB_ITEMS: { id: ProfileTab; label: string; icon: typeof UserRound }[] = [
  { id: 'personal', label: 'Thông tin cá nhân', icon: UserRound },
  { id: 'password', label: 'Đổi mật khẩu', icon: KeyRound },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
];

const NOTIFICATION_ITEMS: {
  id: NotificationKey;
  label: string;
  description: string;
}[] = [
  { id: 'newAssignment', label: 'Phân công bài chấm mới', description: 'Nhận thông báo khi ban tổ chức phân công thêm bài dự thi vào danh sách.' },
  { id: 'contestUpdates', label: 'Cập nhật tiến độ cuộc thi', description: 'Thông báo khi các mốc chấm điểm và đóng cổng chấm thi thay đổi.' },
  { id: 'scoringReminder', label: 'Nhắc nhở hạn nộp điểm', description: 'Nhắc nhở hoàn thành đánh giá trước hạn chót của vòng chấm.' },
];

interface ProfileViewProps {
  profile: JudgeProfile | null;
  onUpdated: () => Promise<void>;
}

const JUDGE_PROFILE_TAB_KEY = 'judge_profile_tab';

function toDraft(profile: JudgeProfile | null) {
  return {
    fullName: profile?.fullName ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    specialty: profile?.specialty ?? '',
    bio: profile?.bio ?? '',
    avatarUrl: profile?.avatarUrl ?? '',
  };
}

export function ProfileView({ profile, onUpdated }: ProfileViewProps) {
  const [activeTab, setActiveTabState] = useState<ProfileTab>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(JUDGE_PROFILE_TAB_KEY) as ProfileTab | null;
      if (saved && (saved === 'personal' || saved === 'password' || saved === 'notifications')) return saved;
    }
    return 'personal';
  });

  const setActiveTab = (tab: ProfileTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem(JUDGE_PROFILE_TAB_KEY, tab);
    } catch {}
  };
  const [draftProfile, setDraftProfile] = useState(() => toDraft(profile));

  useEffect(() => {
    if (profile) setDraftProfile(toDraft(profile));
  }, [profile]);
  const [savedNotifications, setSavedNotifications] = useState<NotificationPreferences>({
    newAssignment: true,
    contestUpdates: true,
    scoringReminder: true,
  });
  const [draftNotifications, setDraftNotifications] = useState<NotificationPreferences>(savedNotifications);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProfileField, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (!profile) {
    return (
      <div className="judge-card">
        <AsyncState isLoading error={null} />
      </div>
    );
  }

  const profileDirty =
    draftProfile.fullName !== profile.fullName ||
    draftProfile.email !== profile.email ||
    draftProfile.phone !== profile.phone ||
    draftProfile.specialty !== profile.specialty ||
    draftProfile.bio !== profile.bio ||
    draftProfile.avatarUrl !== profile.avatarUrl;

  const notificationDirty = JSON.stringify(draftNotifications) !== JSON.stringify(savedNotifications);

  // Toast thông báo góc trên bên phải
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const updateField = (key: keyof typeof draftProfile, value: string) => {
    setDraftProfile((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const chooseAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Ảnh đại diện chỉ chấp nhận JPG, PNG hoặc WebP.', 'error');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showToast('Ảnh phải nhỏ hơn hoặc bằng 700 KB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraftProfile((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        showToast('Đã thay ảnh xem trước. Nhấn Lưu thay đổi để hoàn tất.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Partial<Record<ProfileField, string>> = {};
    if (draftProfile.fullName.trim().length < 2 || draftProfile.fullName.trim().length > 80) {
      errors.fullName = 'Họ và tên phải có từ 2 đến 80 ký tự.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast('Vui lòng kiểm tra lại các trường được đánh dấu.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await judgeService.updateProfile({
        fullName: draftProfile.fullName.trim(),
        specialty: draftProfile.specialty.trim(),
        bio: draftProfile.bio.trim(),
        avatarUrl: draftProfile.avatarUrl,
      });
      // Header và sidebar nhận hồ sơ mới qua prop profile sau khi tải lại
      await onUpdated();
      showToast('Đã cập nhật hồ sơ giám khảo thành công.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelProfile = () => {
    setDraftProfile(toDraft(profile));
    setFieldErrors({});
    showToast('Đã khôi phục thông tin ban đầu.', 'info');
  };

  const switchTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    setPassword({ current: '', next: '', confirm: '' });
    setShowPassword(false);
  };

  const checkPasswordForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.current) {
      showToast('Vui lòng nhập mật khẩu hiện tại.', 'error');
      return;
    }
    const validation = validateStrongPassword(password.next);
    if (!validation.isValid) {
      showToast(validation.error || 'Mật khẩu mới không đạt chuẩn an toàn.', 'error');
      return;
    }
    if (password.next === password.current) {
      showToast('Mật khẩu mới phải khác mật khẩu hiện tại.', 'error');
      return;
    }
    if (password.next !== password.confirm) {
      showToast('Hai lần nhập mật khẩu mới không trùng khớp.', 'error');
      return;
    }

    try {
      await authService.changePassword(password.current, password.next);
      showToast('Cập nhật mật khẩu thành công! Hệ thống sẽ tự động đăng xuất...', 'success');
      setPassword({ current: '', next: '', confirm: '' });
      setTimeout(() => {
        authService.logout();
        window.location.hash = '#/auth';
      }, 1500);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại.', 'error');
    }
  };

  const saveNotifications = () => {
    setSavedNotifications({ ...draftNotifications });
    showToast('Đã lưu tùy chọn thông báo của giám khảo.', 'success');
  };

  return (
    <section aria-label="Hồ sơ cá nhân Giám khảo" className="relative space-y-5">
      {/* Toast thông báo góc trên bên phải */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Navigation Tabs */}
        <div role="tablist" aria-label="Các mục hồ sơ cá nhân" className="flex flex-wrap gap-1 border-b border-slate-200 px-3 pt-3 sm:gap-5 sm:px-7">
          {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => switchTab(id)}
              className={`inline-flex items-center gap-2 border-b-[3px] px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer ${
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
          <div role="tabpanel" className="p-4 sm:p-7">
            <form noValidate onSubmit={saveProfile}>
              <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
                {/* Cột trái: Avatar và Chức vụ */}
                <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-7">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-blue-50 bg-blue-100 text-5xl font-bold text-blue-800 shadow-sm">
                    {draftProfile.avatarUrl ? (
                      <img src={draftProfile.avatarUrl} alt="Ảnh đại diện" className="h-full w-full object-cover" />
                    ) : (
                      <span>{draftProfile.fullName.trim().slice(0, 1).toUpperCase() || 'J'}</span>
                    )}
                  </div>

                  <input
                    ref={avatarInputRef}
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={chooseAvatar}
                  />

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer"
                  >
                    <Camera size={16} aria-hidden="true" /> Thay đổi ảnh
                  </button>

                  {draftProfile.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setDraftProfile((p) => ({ ...p, avatarUrl: '' }))}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 cursor-pointer"
                    >
                      <X size={14} aria-hidden="true" /> Gỡ ảnh
                    </button>
                  )}

                  <p className="text-center text-xs text-slate-500">PNG, JPG hoặc WebP ≤ 700 KB</p>

                  <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-sm">
                    <p className="text-xs font-medium text-slate-500">Chức vụ</p>
                    <p className="font-semibold text-slate-800">Judge (Giám khảo)</p>
                    <p className="text-xs text-slate-500">Vai trò được hệ thống quản lý, không thay đổi tại hồ sơ.</p>
                  </div>
                </div>

                {/* Cột phải: Các trường biểu mẫu */}
                <div className="grid min-w-0 gap-5 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="judge-profile-name" className="text-sm font-semibold text-slate-700">
                      Họ và tên <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="judge-profile-name"
                      required
                      maxLength={80}
                      value={draftProfile.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    {fieldErrors.fullName && <p className="text-xs text-red-600">{fieldErrors.fullName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="judge-profile-email" className="text-sm font-semibold text-slate-700">
                      Email <span className="text-xs font-normal text-slate-500">(Không thể thay đổi)</span>
                    </label>
                    <input
                      id="judge-profile-email"
                      disabled
                      readOnly
                      type="email"
                      value={draftProfile.email}
                      className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 select-none outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="judge-profile-phone" className="text-sm font-semibold text-slate-700">
                      Số điện thoại <span className="text-xs font-normal text-slate-500">(Không thể thay đổi)</span>
                    </label>
                    <input
                      id="judge-profile-phone"
                      disabled
                      readOnly
                      type="tel"
                      value={draftProfile.phone}
                      className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 select-none outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="judge-profile-role" className="text-sm font-semibold text-slate-700">
                      Chức vụ <span className="text-xs font-normal text-slate-500">(Không thể thay đổi)</span>
                    </label>
                    <input
                      id="judge-profile-role"
                      value="Ban giám khảo (JUDGE)"
                      disabled
                      readOnly
                      aria-readonly="true"
                      className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-medium text-slate-700 select-none opacity-80"
                    />
                    <p className="text-xs text-slate-500">Chức vụ do hệ thống phân quyền, cố định và không thể thay đổi.</p>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="judge-profile-specialty" className="text-sm font-semibold text-slate-700">
                      Lĩnh vực chuyên môn
                    </label>
                    <input
                      id="judge-profile-specialty"
                      value={draftProfile.specialty}
                      onChange={(e) => updateField('specialty', e.target.value)}
                      placeholder="Ví dụ: Nhiếp ảnh đường phố, ảnh đen trắng, phong cảnh..."
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="judge-profile-bio" className="text-sm font-semibold text-slate-700">
                      Giới thiệu
                    </label>
                    <textarea
                      id="judge-profile-bio"
                      rows={4}
                      maxLength={500}
                      value={draftProfile.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      className="w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="text-right text-xs text-slate-400">{draftProfile.bio.length}/500 ký tự</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={cancelProfile}
                  disabled={!profileDirty || isSaving}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw size={16} aria-hidden="true" /> Hủy
                </button>
                <button
                  type="submit"
                  disabled={!profileDirty || isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <Save size={16} aria-hidden="true" /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Đổi mật khẩu */}
        {activeTab === 'password' && (
          <div role="tabpanel" className="max-w-2xl space-y-5 p-4 sm:p-7">
            <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              <ShieldCheck size={20} className="shrink-0" aria-hidden="true" />
              <p>Mật khẩu an toàn giúp bảo vệ tài khoản chấm thi của bạn. Không chia sẻ tài khoản với bất kỳ ai.</p>
            </div>
            <form onSubmit={checkPasswordForm} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={password.current}
                  onChange={(e) => {
                    setPassword((p) => ({ ...p, current: e.target.value }));
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password.next}
                    onChange={(e) => {
                      setPassword((p) => ({ ...p, next: e.target.value }));
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-blue-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu mới</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password.confirm}
                  onChange={(e) => {
                    setPassword((p) => ({ ...p, confirm: e.target.value }));
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <p className="text-xs text-slate-500">Tối thiểu 8 ký tự, chữ cái đầu viết hoa, gồm chữ thường, chữ số và ký tự đặc biệt (!@#$%...).</p>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setPassword({ current: '', next: '', confirm: '' });
                  }}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Xóa biểu mẫu
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer">
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Thông báo */}
        {activeTab === 'notifications' && (
          <div role="tabpanel" className="space-y-5 p-4 sm:p-7">
            <p className="text-sm text-slate-600">Tùy chỉnh các thông báo bạn muốn nhận được trong quá trình chấm giải.</p>
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
                    onChange={(event) => {
                      setDraftNotifications((p: NotificationPreferences) => ({ ...p, [id]: event.target.checked }));
                    }}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-blue-600"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setDraftNotifications({ ...savedNotifications })}
                disabled={!notificationDirty}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={saveNotifications}
                disabled={!notificationDirty}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
