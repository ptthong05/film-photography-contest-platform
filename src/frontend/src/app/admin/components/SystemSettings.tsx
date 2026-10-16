import { Camera, ImageUp, LockKeyhole, Settings2 } from 'lucide-react';

/** Các lựa chọn trong bản demo Admin (không phải thiết lập bảo mật phía máy chủ). */
export type InterfaceLanguage = 'vi' | 'en';
export type DisplayTimezone = 'Asia/Ho_Chi_Minh' | 'Asia/Bangkok' | 'UTC';
export type DisplayDateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type PageSize = 10 | 20 | 50;
export type IdleMinutes = 15 | 30 | 60;

export interface SystemSettingsData {
  platformName: string;
  description: string;
  supportEmail: string;
  language: InterfaceLanguage;
  timezone: DisplayTimezone;
  dateFormat: DisplayDateFormat;
  pageSize: PageSize;
  requireTwoFactor: boolean;
  idleMinutes: IdleMinutes;
  allowMultipleDevices: boolean;
  notifyUserRegistration: boolean;
  notifyContestPublished: boolean;
  notifySecurityEvents: boolean;
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsData = {
  platformName: 'FilmContest',
  description: 'Nền tảng tổ chức và quản lý cuộc thi nhiếp ảnh phim tích hợp AI',
  supportEmail: 'admin@filmcontest.vn',
  language: 'vi',
  timezone: 'Asia/Ho_Chi_Minh',
  dateFormat: 'DD/MM/YYYY',
  pageSize: 20,
  requireTwoFactor: true,
  idleMinutes: 30,
  allowMultipleDevices: false,
  notifyUserRegistration: true,
  notifyContestPublished: true,
  notifySecurityEvents: true,
};

/** Xác thực dữ liệu đọc từ localStorage / file JSON trước khi hiển thị. */
export function parseSystemSettings(raw: unknown): SystemSettingsData | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const candidate = raw as Record<string, unknown>;
  const textField = (value: unknown, maxLength: number): value is string =>
    typeof value === 'string' && value.length <= maxLength;
  const included = (options: readonly (string | number)[], value: unknown) =>
    options.includes(value as string | number);

  if (
    !textField(candidate.platformName, 80) ||
    !textField(candidate.description, 350) ||
    !textField(candidate.supportEmail, 150) ||
    !included(['vi', 'en'], candidate.language) ||
    !included(['Asia/Ho_Chi_Minh', 'Asia/Bangkok', 'UTC'], candidate.timezone) ||
    !included(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], candidate.dateFormat) ||
    !included([10, 20, 50], candidate.pageSize) ||
    !included([15, 30, 60], candidate.idleMinutes) ||
    typeof candidate.requireTwoFactor !== 'boolean' ||
    typeof candidate.allowMultipleDevices !== 'boolean' ||
    typeof candidate.notifyUserRegistration !== 'boolean' ||
    typeof candidate.notifyContestPublished !== 'boolean' ||
    typeof candidate.notifySecurityEvents !== 'boolean'
  ) return null;

  return {
    platformName: candidate.platformName as string,
    description: candidate.description as string,
    supportEmail: candidate.supportEmail as string,
    language: candidate.language as InterfaceLanguage,
    timezone: candidate.timezone as DisplayTimezone,
    dateFormat: candidate.dateFormat as DisplayDateFormat,
    pageSize: candidate.pageSize as PageSize,
    requireTwoFactor: candidate.requireTwoFactor as boolean,
    idleMinutes: candidate.idleMinutes as IdleMinutes,
    allowMultipleDevices: candidate.allowMultipleDevices as boolean,
    notifyUserRegistration: candidate.notifyUserRegistration as boolean,
    notifyContestPublished: candidate.notifyContestPublished as boolean,
    notifySecurityEvents: candidate.notifySecurityEvents as boolean,
  };
}

interface SystemSettingsProps {
  value: SystemSettingsData;
  onChange: (next: SystemSettingsData) => void;
  logoPreview: string | null;
  onChooseLogo: (file: File | null) => void;
  logoError?: string;
  errors?: Partial<Record<'platformName' | 'supportEmail', string>>;
}

const inputClass = 'min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'text-sm font-medium text-slate-700';

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function SettingsToggle({ label, checked, onChange, description }: ToggleRowProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span>
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {description && <span className="mt-1 block text-xs text-slate-500">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600" />
        <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

/** Chỉ hiển thị và cập nhật bản nháp; việc lưu được SettingsView điều phối. */
export function SystemSettings({ value, onChange, logoPreview, onChooseLogo, logoError, errors }: SystemSettingsProps) {
  const set = <K extends keyof SystemSettingsData>(key: K, next: SystemSettingsData[K]) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="basic-settings-title">
        <h3 id="basic-settings-title" className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900"><Settings2 className="h-5 w-5 text-blue-600" /> Thông tin chung</h3>
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
          <label className={labelClass} htmlFor="admin-platform-name">Tên hệ thống <span className="text-red-600">*</span></label>
          <div>
            <input id="admin-platform-name" className={inputClass} maxLength={80} value={value.platformName} onChange={(event) => set('platformName', event.target.value)} aria-invalid={Boolean(errors?.platformName)} aria-describedby={errors?.platformName ? 'admin-platform-error' : undefined} />
            {errors?.platformName && <p id="admin-platform-error" className="mt-1 text-xs text-red-600">{errors.platformName}</p>}
          </div>
          <label className={labelClass} htmlFor="admin-platform-description">Mô tả</label>
          <textarea id="admin-platform-description" rows={2} maxLength={350} className={inputClass} value={value.description} onChange={(event) => set('description', event.target.value)} />
          <label className={labelClass} htmlFor="admin-support-email">Email liên hệ <span className="text-red-600">*</span></label>
          <div>
            <input id="admin-support-email" type="email" maxLength={150} className={inputClass} value={value.supportEmail} onChange={(event) => set('supportEmail', event.target.value)} aria-invalid={Boolean(errors?.supportEmail)} aria-describedby={errors?.supportEmail ? 'admin-email-error' : undefined} />
            {errors?.supportEmail && <p id="admin-email-error" className="mt-1 text-xs text-red-600">{errors.supportEmail}</p>}
          </div>
          <span className={labelClass}>Logo hệ thống</span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex min-h-16 items-center gap-3 rounded-lg bg-blue-50 p-3" aria-label="Logo xem trước">
              {logoPreview ? <img src={logoPreview} alt="Logo vừa chọn (xem trước)" className="h-12 w-12 rounded-lg object-contain" /> : <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white"><Camera size={27} aria-hidden="true" /></span>}
              <span className="text-lg font-bold text-blue-900">{value.platformName || 'FilmContest'}</span>
            </div>
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                <ImageUp size={16} aria-hidden="true" /> Thay đổi logo
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { onChooseLogo(event.target.files?.[0] ?? null); event.target.value = ''; }} />
              </label>
              <p className="mt-1 text-xs text-slate-500">PNG, JPG hoặc WebP, tối đa 2 MB. Chỉ xem trước, không tải lên server.</p>
              {logoError && <p className="mt-1 text-xs text-red-600" role="alert">{logoError}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="common-settings-title">
        <h3 id="common-settings-title" className="mb-4 text-base font-bold text-slate-900">Cấu hình chung</h3>
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
          <label className={labelClass} htmlFor="admin-language">Ngôn ngữ mặc định</label>
          <select id="admin-language" className={inputClass} value={value.language} onChange={(e) => set('language', e.target.value as InterfaceLanguage)}><option value="vi">Tiếng Việt</option><option value="en">English</option></select>
          <label className={labelClass} htmlFor="admin-timezone">Múi giờ</label>
          <select id="admin-timezone" className={inputClass} value={value.timezone} onChange={(e) => set('timezone', e.target.value as DisplayTimezone)}><option value="Asia/Ho_Chi_Minh">(GMT+7) Hà Nội, TP.HCM, Jakarta</option><option value="Asia/Bangkok">(GMT+7) Bangkok</option><option value="UTC">(GMT+0) UTC</option></select>
          <label className={labelClass} htmlFor="admin-date-format">Định dạng ngày</label>
          <select id="admin-date-format" className={inputClass} value={value.dateFormat} onChange={(e) => set('dateFormat', e.target.value as DisplayDateFormat)}><option value="DD/MM/YYYY">dd/MM/yyyy</option><option value="MM/DD/YYYY">MM/dd/yyyy</option><option value="YYYY-MM-DD">yyyy-MM-dd</option></select>
          <label className={labelClass} htmlFor="admin-page-size">Số bản ghi mỗi trang</label>
          <select id="admin-page-size" className={inputClass} value={value.pageSize} onChange={(e) => set('pageSize', Number(e.target.value) as PageSize)}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="security-settings-title">
        <h3 id="security-settings-title" className="mb-2 flex items-center gap-2 text-base font-bold text-slate-900"><LockKeyhole className="h-5 w-5 text-blue-600" /> Bảo mật (bản mô phỏng)</h3>
        <p className="mb-3 text-xs text-amber-700">Thay đổi tại đây không kích hoạt 2FA, đăng xuất phiên hay hạn chế thiết bị thực tế. Các chính sách đó phải thực thi tại backend.</p>
        <SettingsToggle label="Bắt buộc xác thực 2 lớp (2FA)" checked={value.requireTwoFactor} onChange={(next) => set('requireTwoFactor', next)} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3">
          <label className={labelClass} htmlFor="admin-idle-minutes">Tự động đăng xuất khi không hoạt động (phút)</label>
          <select id="admin-idle-minutes" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={value.idleMinutes} onChange={(e) => set('idleMinutes', Number(e.target.value) as IdleMinutes)}><option value={15}>15 phút</option><option value={30}>30 phút</option><option value={60}>60 phút</option></select>
        </div>
        <SettingsToggle label="Cho phép đăng nhập nhiều thiết bị" checked={value.allowMultipleDevices} onChange={(next) => set('allowMultipleDevices', next)} />
      </section>
    </div>
  );
}
