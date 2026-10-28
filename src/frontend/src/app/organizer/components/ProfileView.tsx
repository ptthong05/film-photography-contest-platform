import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Bell, Camera, CheckCircle2, Eye, EyeOff, Info, KeyRound, RotateCcw, Save, ShieldCheck, UserRound, X } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { profileService } from "../../../services/profileService";
import type { OrganizerProfile } from "../../../types/organizerUser";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

const NOTIFICATION_STORAGE_KEY = "filmcontest-organizer-profile-notifications-demo-v1";
const MAX_AVATAR_BYTES = 700 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProfileTab = "personal" | "password" | "notifications";
type ProfileField = "fullName" | "email" | "phone";
interface NotificationPreferences { newSubmission: boolean; contestUpdates: boolean; reviewDeadlines: boolean; resultsPublished: boolean }

const DEFAULT_NOTIFICATIONS: NotificationPreferences = { newSubmission: true, contestUpdates: true, reviewDeadlines: true, resultsPublished: false };
const TAB_ITEMS = [
  { id: "personal" as const, label: "Thông tin cá nhân", icon: UserRound },
  { id: "password" as const, label: "Đổi mật khẩu", icon: KeyRound },
  { id: "notifications" as const, label: "Thông báo", icon: Bell },
];
const NOTIFICATION_ITEMS: { id: keyof NotificationPreferences; label: string; description: string }[] = [
  { id: "newSubmission", label: "Bài dự thi mới", description: "Nhận tùy chọn thông báo khi thí sinh gửi bài dự thi." },
  { id: "contestUpdates", label: "Cập nhật cuộc thi", description: "Nhận thông tin khi trạng thái hoặc thời gian cuộc thi thay đổi." },
  { id: "reviewDeadlines", label: "Hạn chấm bài", description: "Nhắc khi sắp đến hạn hoàn thành chấm điểm." },
  { id: "resultsPublished", label: "Công bố kết quả", description: "Nhận thông tin khi kết quả cuộc thi được công bố." },
];

function readNotifications(): NotificationPreferences {
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_NOTIFICATIONS };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { ...DEFAULT_NOTIFICATIONS };
    const source = parsed as Record<string, unknown>;
    const preference = (key: keyof NotificationPreferences) =>
      typeof source[key] === "boolean" ? source[key] as boolean : DEFAULT_NOTIFICATIONS[key];
    return {
      newSubmission: preference("newSubmission"),
      contestUpdates: preference("contestUpdates"),
      reviewDeadlines: preference("reviewDeadlines"),
      resultsPublished: preference("resultsPublished"),
    };
  } catch { return { ...DEFAULT_NOTIFICATIONS }; }
}

function validateProfile(profile: OrganizerProfile): Partial<Record<ProfileField, string>> {
  const errors: Partial<Record<ProfileField, string>> = {};
  if (profile.fullName.trim().length < 2 || profile.fullName.trim().length > 80) errors.fullName = "Họ và tên cần có từ 2 đến 80 ký tự.";
  if (profile.email.trim().length > 120 || !EMAIL_PATTERN.test(profile.email.trim())) errors.email = "Vui lòng nhập email hợp lệ, tối đa 120 ký tự.";
  if (profile.phone.trim() && (!/^\+?[0-9\s()-]{9,24}$/.test(profile.phone.trim()) || (profile.phone.match(/\d/g) ?? []).length < 9)) errors.phone = "Số điện thoại cần có ít nhất 9 chữ số.";
  return errors;
}

interface ProfileViewProps { onNameSaved?: (name: string) => void }

export function ProfileView({ onNameSaved }: ProfileViewProps) {
  const { data, isLoading, error } = useFetch(profileService.getProfile);
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [savedProfile, setSavedProfile] = useState<OrganizerProfile | null>(null);
  const [draftProfile, setDraftProfile] = useState<OrganizerProfile | null>(null);
  const [savedNotifications, setSavedNotifications] = useState<NotificationPreferences>(readNotifications);
  const [draftNotifications, setDraftNotifications] = useState<NotificationPreferences>(savedNotifications);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProfileField, string>>>({});
  const [notice, setNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const profile = savedProfile ?? data;
  const editableProfile = draftProfile ?? profile;
  const profileDirty = Boolean(editableProfile && JSON.stringify(editableProfile) !== JSON.stringify(profile));
  const notificationsDirty = JSON.stringify(draftNotifications) !== JSON.stringify(savedNotifications);

  const beginEdit = () => { if (profile) { setDraftProfile({ ...profile }); setFieldErrors({}); setNotice(""); } };
  const updateProfile = (key: "fullName" | "email" | "phone" | "bio", value: string) => {
    setDraftProfile((previous) => {
      const base = previous ?? profile;
      return base ? { ...base, [key]: value } : previous;
    });
    if (key === "fullName" || key === "email" || key === "phone") setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
    setNotice("");
  };

  const chooseAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setNotice("Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WebP."); return; }
    if (file.size > MAX_AVATAR_BYTES) { setNotice("Ảnh cần nhỏ hơn hoặc bằng 700 KB để lưu trên trình duyệt."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string" || !/^data:image\/(?:jpeg|png|webp);base64,/i.test(reader.result)) { setNotice("Không thể đọc định dạng ảnh này."); return; }
      setDraftProfile((previous) => {
        const base = previous ?? profile;
        return base ? { ...base, avatarDataUrl: reader.result as string } : previous;
      });
      setNotice("Đã cập nhật ảnh xem trước. Nhấn Lưu thay đổi để lưu trên trình duyệt.");
    };
    reader.onerror = () => setNotice("Không đọc được ảnh. Vui lòng thử lại.");
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const candidate = draftProfile ?? profile;
    if (!candidate) return;
    const errors = validateProfile(candidate);
    setFieldErrors(errors);
    if (Object.keys(errors).length) { setNotice("Vui lòng kiểm tra các trường được đánh dấu."); return; }
    const normalized = { ...candidate, fullName: candidate.fullName.trim(), email: candidate.email.trim().toLowerCase(), phone: candidate.phone.trim(), bio: candidate.bio.trim() };
    try {
      await profileService.saveProfile(normalized);
      setSavedProfile(normalized);
      setDraftProfile(normalized);
      onNameSaved?.(normalized.fullName);
      setNotice("Đã lưu hồ sơ mẫu trên trình duyệt này; chưa đồng bộ với máy chủ.");
    } catch { setNotice("Không thể lưu hồ sơ trên trình duyệt. Hãy thử ảnh nhỏ hơn hoặc kiểm tra quyền lưu trữ."); }
  };

  const cancelProfile = () => {
    setDraftProfile(profile ? { ...profile } : null);
    setFieldErrors({});
    setNotice("Đã hủy các thay đổi chưa lưu.");
  };

  const switchTab = (tab: ProfileTab) => {
    setActiveTab(tab); setNotice(""); setPasswordError(""); setPasswordNotice("");
    setPassword({ current: "", next: "", confirm: "" }); setShowPassword(false);
  };

  const checkPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPasswordNotice("");
    if (!password.current) setPasswordError("Vui lòng nhập mật khẩu hiện tại để kiểm tra biểu mẫu.");
    else if (password.next.length < 8 || !/[0-9]/.test(password.next)) setPasswordError("Mật khẩu mới cần từ 8 ký tự và có ít nhất một chữ số.");
    else if (password.next === password.current) setPasswordError("Mật khẩu mới cần khác mật khẩu hiện tại.");
    else if (password.next !== password.confirm) setPasswordError("Hai lần nhập mật khẩu mới không trùng nhau.");
    else { setPasswordError(""); setPasswordNotice("Biểu mẫu hợp lệ. Chưa đổi mật khẩu vì cần API xác thực từ máy chủ."); setPassword({ current: "", next: "", confirm: "" }); }
  };

  const saveNotifications = () => {
    try { window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(draftNotifications)); setSavedNotifications({ ...draftNotifications }); setNotice("Đã lưu tùy chọn thông báo demo trên trình duyệt."); }
    catch { setNotice("Không thể lưu tùy chọn thông báo trên trình duyệt."); }
  };
  const cancelNotifications = () => { setDraftNotifications({ ...savedNotifications }); setNotice("Đã khôi phục các tùy chọn thông báo đã lưu."); };

  return (
    <section aria-label="Hồ sơ cá nhân Organizer" className="space-y-5">
      <OrganizerPageHeader title="Hồ sơ cá nhân" description="Cập nhật thông tin và tùy chọn tài khoản Organizer." />
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="note">
        <Info size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p><strong>Giao diện mẫu:</strong> Hồ sơ và tùy chọn thông báo được lưu trên trình duyệt. Mật khẩu không được lưu hoặc gửi đi; đổi mật khẩu thật cần API máy chủ.</p>
      </div>
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}
      {profile && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div role="tablist" aria-label="Các mục hồ sơ cá nhân" className="flex flex-wrap gap-1 border-b border-slate-200 px-3 pt-3 sm:gap-5 sm:px-7">
            {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" role="tab" id={`organizer-profile-tab-${id}`} aria-selected={activeTab === id} aria-controls={`organizer-profile-panel-${id}`} onClick={() => switchTab(id)}
                className={`inline-flex items-center gap-2 border-b-[3px] px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${activeTab === id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700"}`}>
                <Icon size={17} aria-hidden="true" />{label}
              </button>
            ))}
          </div>

          {activeTab === "personal" && editableProfile && (
            <div role="tabpanel" id="organizer-profile-panel-personal" aria-labelledby="organizer-profile-tab-personal" className="p-4 sm:p-7">
              <form noValidate onSubmit={saveProfile}>
                <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-7">
                    <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-blue-50 bg-blue-100 text-5xl font-bold text-blue-800 shadow-sm">
                      {editableProfile.avatarDataUrl ? <img src={editableProfile.avatarDataUrl} alt="Ảnh đại diện xem trước" className="h-full w-full object-cover" /> : <span aria-label="Chưa có ảnh đại diện">{editableProfile.fullName.trim().slice(0, 1).toUpperCase() || "O"}</span>}
                    </div>
                    <input ref={avatarInputRef} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Chọn ảnh đại diện" onChange={chooseAvatar} />
                    <button type="button" onClick={() => avatarInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><Camera size={16} aria-hidden="true" />Thay đổi ảnh</button>
                    {editableProfile.avatarDataUrl && <button type="button" onClick={() => { setDraftProfile((previous) => ({ ...(previous ?? editableProfile), avatarDataUrl: null })); setNotice("Đã gỡ ảnh trong bản nháp. Nhấn Lưu để áp dụng."); }} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"><X size={14} aria-hidden="true" />Gỡ ảnh</button>}
                    <p className="text-center text-xs text-slate-500">PNG, JPG hoặc WebP · tối đa 700 KB</p>
                    <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-sm"><p className="text-xs font-medium text-slate-500">Chức vụ</p><p className="font-semibold text-slate-800">{profile.role}</p><p className="text-xs text-slate-500">Vai trò được hệ thống quản lý, không thay đổi tại hồ sơ.</p></div>
                  </div>
                  <div className="grid min-w-0 gap-5 md:grid-cols-2">
                    <div className="space-y-1.5 md:col-span-2"><label htmlFor="organizer-profile-name" className="text-sm font-semibold text-slate-700">Họ và tên <span className="text-red-600">*</span></label><input id="organizer-profile-name" required maxLength={80} value={editableProfile.fullName} onChange={(event) => updateProfile("fullName", event.target.value)} aria-invalid={Boolean(fieldErrors.fullName)} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />{fieldErrors.fullName && <p className="text-xs text-red-600">{fieldErrors.fullName}</p>}</div>
                    <div className="space-y-1.5"><label htmlFor="organizer-profile-email" className="text-sm font-semibold text-slate-700">Email <span className="text-red-600">*</span></label><input id="organizer-profile-email" required type="email" autoComplete="email" maxLength={120} value={editableProfile.email} onChange={(event) => updateProfile("email", event.target.value)} aria-invalid={Boolean(fieldErrors.email)} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />{fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}</div>
                    <div className="space-y-1.5"><label htmlFor="organizer-profile-phone" className="text-sm font-semibold text-slate-700">Số điện thoại</label><input id="organizer-profile-phone" type="tel" autoComplete="tel" maxLength={24} value={editableProfile.phone} onChange={(event) => updateProfile("phone", event.target.value)} aria-invalid={Boolean(fieldErrors.phone)} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />{fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}</div>
                    <div className="space-y-1.5 md:col-span-2"><label htmlFor="organizer-profile-role" className="text-sm font-semibold text-slate-700">Chức vụ</label><input id="organizer-profile-role" value={profile.role} readOnly aria-readonly="true" className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600" /></div>
                    <div className="space-y-1.5 md:col-span-2"><label htmlFor="organizer-profile-bio" className="text-sm font-semibold text-slate-700">Giới thiệu</label><textarea id="organizer-profile-bio" rows={4} maxLength={500} value={editableProfile.bio} onChange={(event) => updateProfile("bio", event.target.value)} className="w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><p className="text-right text-xs text-slate-400">{editableProfile.bio.length}/500 ký tự</p></div>
                  </div>
                </div>
                {notice && <p role="status" className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">{notice}</p>}
                <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                  <button type="button" onClick={cancelProfile} disabled={!profileDirty} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw size={16} aria-hidden="true" />Hủy</button>
                  <button type="submit" disabled={!profileDirty} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Save size={16} aria-hidden="true" />Lưu thay đổi</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div role="tabpanel" id="organizer-profile-panel-password" aria-labelledby="organizer-profile-tab-password" className="max-w-2xl space-y-5 p-4 sm:p-7">
              <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900"><ShieldCheck size={20} className="shrink-0" aria-hidden="true" /><p>Đây chỉ là bản kiểm tra biểu mẫu. Chưa có API xác thực mật khẩu cũ hoặc đổi mật khẩu trên máy chủ.</p></div>
              <form onSubmit={checkPassword} className="space-y-4" noValidate>
                <div className="space-y-1.5"><label htmlFor="organizer-password-current" className="text-sm font-semibold text-slate-700">Mật khẩu hiện tại (giả lập)</label><input id="organizer-password-current" type="password" autoComplete="off" value={password.current} onChange={(event) => { setPassword((previous) => ({ ...previous, current: event.target.value })); setPasswordError(""); }} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
                <div className="space-y-1.5"><label htmlFor="organizer-password-new" className="text-sm font-semibold text-slate-700">Mật khẩu mới (giả lập)</label><div className="relative"><input id="organizer-password-new" type={showPassword ? "text" : "password"} autoComplete="off" value={password.next} onChange={(event) => { setPassword((previous) => ({ ...previous, next: event.target.value })); setPasswordError(""); }} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><button type="button" onClick={() => setShowPassword((previous) => !previous)} aria-label={showPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-blue-700">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></div>
                <div className="space-y-1.5"><label htmlFor="organizer-password-confirm" className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu mới</label><input id="organizer-password-confirm" type={showPassword ? "text" : "password"} autoComplete="off" value={password.confirm} onChange={(event) => { setPassword((previous) => ({ ...previous, confirm: event.target.value })); setPasswordError(""); }} className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
                <p className="text-xs text-slate-500">Quy tắc demo: tối thiểu 8 ký tự và có ít nhất 1 chữ số.</p>
                {passwordError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{passwordError}</p>}{passwordNotice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{passwordNotice}</p>}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => { setPassword({ current: "", next: "", confirm: "" }); setPasswordError(""); setPasswordNotice(""); }} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Xóa biểu mẫu</button><button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Kiểm tra biểu mẫu</button></div>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div role="tabpanel" id="organizer-profile-panel-notifications" aria-labelledby="organizer-profile-tab-notifications" className="space-y-5 p-4 sm:p-7">
              <p className="text-sm text-slate-600">Các công tắc là tùy chọn giao diện mẫu. Chưa gửi email hoặc thông báo đẩy.</p>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {NOTIFICATION_ITEMS.map(({ id, label, description }) => <label key={id} className="flex cursor-pointer items-start justify-between gap-5 p-4 sm:items-center"><span className="min-w-0"><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></span><input type="checkbox" checked={draftNotifications[id]} onChange={(event) => { setDraftNotifications((previous) => ({ ...previous, [id]: event.target.checked })); setNotice(""); }} className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-blue-600" aria-label={label} /></label>)}
              </div>
              {notice && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{notice}</p>}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={cancelNotifications} disabled={!notificationsDirty} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Hủy</button><button type="button" onClick={saveNotifications} disabled={!notificationsDirty} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 size={17} aria-hidden="true" />Lưu tùy chọn</button></div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
