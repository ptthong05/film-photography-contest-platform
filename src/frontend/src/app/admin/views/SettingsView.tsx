import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  AlertTriangle, Bell, CheckCircle2, Download, Info, KeyRound,
  PlugZap, RotateCcw, Save, ShieldCheck, Upload, Users,
} from 'lucide-react';
import {
  DEFAULT_SYSTEM_SETTINGS,
  parseSystemSettings,
  SettingsToggle,
  SystemSettings,
  type SystemSettingsData,
} from '../components/SystemSettings';
import type { AdminView } from '../components/AdminSidebar';

const STORAGE_KEY = 'filmcontest-admin-system-settings-demo-v1';
const TAB_ITEMS = [
  { id: 'general', label: 'Thông tin chung' },
  { id: 'permissions', label: 'Quản lý phân quyền' },
  { id: 'notifications', label: 'Thông báo hệ thống' },
  { id: 'integrations', label: 'Tích hợp' },
  { id: 'backup', label: 'Sao lưu & khôi phục' },
] as const;
type SettingsTab = (typeof TAB_ITEMS)[number]['id'];

function readDemoSettings(): SystemSettingsData {
  try {
    if (typeof window === 'undefined') return { ...DEFAULT_SYSTEM_SETTINGS };
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SYSTEM_SETTINGS };
    return parseSystemSettings(JSON.parse(raw) as unknown) ?? { ...DEFAULT_SYSTEM_SETTINGS };
  } catch {
    return { ...DEFAULT_SYSTEM_SETTINGS };
  }
}

function validate(values: SystemSettingsData) {
  const errors: Partial<Record<'platformName' | 'supportEmail', string>> = {};
  if (!values.platformName.trim()) errors.platformName = 'Tên hệ thống không được để trống.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.supportEmail.trim())) {
    errors.supportEmail = 'Vui lòng nhập địa chỉ email hợp lệ.';
  }
  return errors;
}

interface SettingsViewProps {
  onNavigate?: (view: AdminView) => void;
}

const ROLE_PERMISSIONS = [
  { role: 'Administrator', users: 'Quản lý tài khoản và quyền', contests: 'Giám sát', submissions: 'Giám sát' },
  { role: 'Contest Organizer', users: 'Không', contests: 'Tổ chức, cấu hình', submissions: 'Xác minh và duyệt' },
  { role: 'Judge', users: 'Không', contests: 'Xem bài được giao', submissions: 'Chấm và nhận xét' },
  { role: 'Participant', users: 'Hồ sơ cá nhân', contests: 'Đăng ký tham gia', submissions: 'Nộp và theo dõi' },
];

/** Trang Admin số 8. Lưu trữ bản demo trên trình duyệt, không sửa cấu hình máy chủ. */
export function SettingsView({ onNavigate }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saved, setSaved] = useState<SystemSettingsData>(readDemoSettings);
  const [draft, setDraft] = useState<SystemSettingsData>(saved);
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'platformName' | 'supportEmail', string>>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState('');
  const previewUrlRef = useRef<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const hasChanges = JSON.stringify(saved) !== JSON.stringify(draft);
  const updateDraft = (next: SystemSettingsData) => {
    setDraft(next);
    setErrors({});
    setNotice('');
  };
  const updateFlag = (key: 'notifyUserRegistration' | 'notifyContestPublished' | 'notifySecurityEvents', checked: boolean) => {
    updateDraft({ ...draft, [key]: checked });
  };

  const chooseLogo = (file: File | null) => {
    if (!file) return;
    setLogoError('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setLogoError('Chỉ chấp nhận ảnh PNG, JPG hoặc WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Kích thước logo không được vượt quá 2 MB.');
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setLogoPreview(url);
    setNotice('Đã chọn logo để xem trước. Ảnh này chưa được tải lên máy chủ và không được lưu khi tải lại trang.');
  };

  const saveDraft = () => {
    const issues = validate(draft);
    setErrors(issues);
    if (Object.keys(issues).length) {
      setActiveTab('general');
      setNotice('Vui lòng kiểm tra các trường được đánh dấu trước khi lưu.');
      return;
    }
    try {
      const normalized: SystemSettingsData = {
        ...draft,
        platformName: draft.platformName.trim(),
        supportEmail: draft.supportEmail.trim(),
        description: draft.description.trim(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      setSaved(normalized);
      setDraft(normalized);
      setNotice('Đã lưu thiết lập DEMO trên trình duyệt này. Không có thay đổi nào được gửi lên backend.');
    } catch {
      setNotice('Không thể lưu thiết lập demo vào trình duyệt. Hãy kiểm tra quyền lưu trữ.');
    }
  };

  const cancelDraft = () => {
    setDraft({ ...saved });
    setErrors({});
    setNotice('Đã hủy thay đổi chưa lưu.');
  };

  const restoreDefaults = () => {
    setDraft({ ...DEFAULT_SYSTEM_SETTINGS });
    setErrors({});
    setNotice('Đã đưa các trường về giá trị mặc định của bản demo. Nhấn Lưu thay đổi nếu muốn giữ lại.');
  };

  const exportSettings = () => {
    const content = JSON.stringify({ kind: 'filmcontest-admin-demo-settings', version: 1, settings: saved }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filmcontest-admin-settings-demo.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Đã xuất file JSON cấu hình demo đã lưu. Không bao gồm cơ sở dữ liệu, tài khoản hoặc ảnh dự thi.');
  };

  const importSettings = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 20 * 1024) {
      setNotice('File cấu hình phải nhỏ hơn hoặc bằng 20 KB.');
      return;
    }
    try {
      const raw: unknown = JSON.parse(await file.text());
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('format');
      const payload = raw as Record<string, unknown>;
      if (payload.kind !== 'filmcontest-admin-demo-settings' || payload.version !== 1) throw new Error('format');
      const parsed = parseSystemSettings(payload.settings);
      if (!parsed || Object.keys(validate(parsed)).length) throw new Error('format');
      setDraft(parsed);
      setErrors({});
      setActiveTab('general');
      setNotice('Đã nhập cấu hình demo vào bản nháp. Xem lại và nhấn Lưu thay đổi để ghi trên trình duyệt.');
    } catch {
      setNotice('Không đọc được file JSON cấu hình demo hợp lệ. Dữ liệu hiện tại vẫn được giữ nguyên.');
    }
  };

  return (
    <section className="space-y-5" aria-label="Cài đặt hệ thống của quản trị viên">
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950" role="note">
        <Info size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p><strong>Chế độ giao diện mẫu:</strong> Thông tin chỉ được lưu trên trình duyệt. Các lựa chọn phân quyền, 2FA, phiên đăng nhập, thông báo và tích hợp chưa được áp dụng trên hệ thống Java/MongoDB.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 pt-1 shadow-sm sm:px-6">
        <div role="tablist" aria-label="Nhóm cài đặt hệ thống" className="flex flex-wrap gap-x-5 gap-y-1 border-b border-slate-200">
          {TAB_ITEMS.map(({ id, label }) => (
            <button key={id} type="button" role="tab" id={`settings-tab-${id}`} aria-selected={activeTab === id} aria-controls="settings-tab-panel"
              onClick={() => { setActiveTab(id); setNotice(''); }}
              className={`border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${activeTab === id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-600'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="pb-2 pt-3 text-xs text-slate-500">Đang xem: {TAB_ITEMS.find((item) => item.id === activeTab)?.label}</div>
      </div>

      <div id="settings-tab-panel" role="tabpanel" aria-labelledby={`settings-tab-${activeTab}`}>
        {activeTab === 'general' && (
          <SystemSettings value={draft} onChange={updateDraft} logoPreview={logoPreview} onChooseLogo={chooseLogo} logoError={logoError} errors={errors} />
        )}

        {activeTab === 'permissions' && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><Users size={19} className="text-blue-600" /> Bảng quyền tham khảo theo SRS</h3>
            <p className="mt-2 text-sm text-slate-600">SRS xác định 4 actor. Bảng này mô tả quyền nghiệp vụ dự kiến, <strong>không phải</strong> trạng thái RBAC đã kích hoạt.</p>
            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-[690px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-700"><tr>{['Vai trò', 'Tài khoản', 'Cuộc thi', 'Bài dự thi'].map((column) => <th key={column} className="border-b border-slate-200 px-4 py-3 font-semibold">{column}</th>)}</tr></thead>
                <tbody>{ROLE_PERMISSIONS.map((item) => <tr key={item.role} className="border-b border-slate-100 last:border-0"><th className="px-4 py-3 font-semibold text-slate-800">{item.role}</th><td className="px-4 py-3 text-slate-600">{item.users}</td><td className="px-4 py-3 text-slate-600">{item.contests}</td><td className="px-4 py-3 text-slate-600">{item.submissions}</td></tr>)}</tbody>
              </table>
            </div>
            {onNavigate && <button type="button" onClick={() => onNavigate('users')} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Đi đến Quản lý người dùng</button>}
            <p className="mt-3 text-xs text-slate-500">Phân quyền thật cần Spring Security + JWT/RBAC và kiểm soát tại backend.</p>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><Bell size={19} className="text-blue-600" /> Tùy chọn thông báo mẫu</h3>
            <p className="mt-2 text-sm text-slate-500">Chỉ lưu tùy chọn hiển thị. Không gửi email hoặc thông báo đến người dùng thật.</p>
            <div className="mt-3">
              <SettingsToggle label="Thông báo có người dùng đăng ký" checked={draft.notifyUserRegistration} onChange={(value) => updateFlag('notifyUserRegistration', value)} />
              <SettingsToggle label="Thông báo cuộc thi được công bố" checked={draft.notifyContestPublished} onChange={(value) => updateFlag('notifyContestPublished', value)} />
              <SettingsToggle label="Thông báo hoạt động bảo mật" checked={draft.notifySecurityEvents} onChange={(value) => updateFlag('notifySecurityEvents', value)} />
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><PlugZap size={19} className="text-blue-600" /> Tích hợp dịch vụ</h3>
            <p className="mt-2 text-sm text-slate-600">Giao diện này chưa có API kiểm tra kết nối, vì vậy không khẳng định trạng thái hoạt động của dịch vụ.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[['Java Spring Boot API', 'Chưa kiểm tra từ giao diện'], ['MongoDB', 'Chưa kiểm tra từ giao diện'], ['Cloud Storage', 'Chưa cấu hình trong giao diện'], ['AI Verification Service', 'Chưa tích hợp vào giao diện']].map(([name, status]) => (
                <div key={name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-800">{name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600"><AlertTriangle size={14} className="text-amber-600" /> {status}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">Không nhập API key, mật khẩu hoặc thông tin bí mật vào bản demo này.</p>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><ShieldCheck size={19} className="text-blue-600" /> Sao lưu & khôi phục (chỉ cấu hình demo)</h3>
            <p className="mt-2 text-sm text-slate-600">Bạn có thể xuất file JSON chứa các thiết lập đang lưu trên trình duyệt hoặc nhập file đã xuất. <strong>Không sao lưu MongoDB, ảnh, tài khoản hoặc dữ liệu hệ thống thật.</strong></p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={exportSettings} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Download size={17} /> Xuất cấu hình JSON</button>
              <button type="button" onClick={() => importRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><Upload size={17} /> Nhập cấu hình JSON</button>
              <input ref={importRef} type="file" accept=".json,application/json" className="hidden" onChange={(event) => { void importSettings(event); }} aria-label="Chọn file cấu hình JSON" />
            </div>
            <p className="mt-3 text-xs text-slate-500">Giới hạn file 20 KB. Sau khi nhập, hãy xem lại và bấm Lưu thay đổi.</p>
          </div>
        )}
      </div>

      {notice && <div role="status" className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"><Info size={17} className="mt-0.5 shrink-0" aria-hidden="true" />{notice}</div>}
      <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="mr-auto flex items-center gap-1.5 text-xs text-slate-500">
          {hasChanges ? <><KeyRound size={14} className="text-amber-500" /> Có thay đổi chưa lưu</> : <><CheckCircle2 size={14} className="text-emerald-600" /> Cấu hình demo đã đồng bộ</>}
        </span>
        <button type="button" onClick={restoreDefaults} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RotateCcw size={16} /> Mặc định</button>
        <button type="button" onClick={cancelDraft} disabled={!hasChanges} className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40">Hủy</button>
        <button type="button" onClick={saveDraft} disabled={!hasChanges} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"><Save size={16} /> Lưu thay đổi</button>
      </div>
    </section>
  );
}
