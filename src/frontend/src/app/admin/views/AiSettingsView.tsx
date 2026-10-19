import { useState } from 'react';
import { CheckCircle2, Info, RotateCcw, Save, ShieldAlert, WifiOff } from 'lucide-react';
import {
  AI_TABS,
  AiSettingsControls,
  DEFAULT_AI_SETTINGS,
  type AiFeatureKey,
  type AiSettings,
  type AiTab,
  type AiThresholdKey,
} from '../components/AiSettingsControls';

const STORAGE_KEY = 'filmcontest-admin-ai-settings-demo-v1';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Chỉ nhận những dữ liệu mẫu hợp lệ từ trình duyệt, không tin tưởng nội dung localStorage.
function readSavedSettings(): AiSettings {
  if (typeof window === 'undefined') return DEFAULT_AI_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    const stored: unknown = JSON.parse(raw);
    if (!isObject(stored) || !isObject(stored.features) || !isObject(stored.thresholds)) {
      return DEFAULT_AI_SETTINGS;
    }
    const storedFeatures = stored.features;
    const storedThresholds = stored.thresholds;
    const features = { ...DEFAULT_AI_SETTINGS.features };
    (Object.keys(features) as AiFeatureKey[]).forEach((key) => {
      const value = storedFeatures[key];
      if (typeof value === 'boolean') features[key] = value;
    });
    const thresholds = { ...DEFAULT_AI_SETTINGS.thresholds };
    (Object.keys(thresholds) as AiThresholdKey[]).forEach((key) => {
      const value = storedThresholds[key];
      const min = key === 'maximumTags' ? 1 : 0;
      const max = key === 'maximumTags' ? 20 : 100;
      if (typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max) {
        thresholds[key] = value;
      }
    });
    return { features, thresholds };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

/** Admin chỉ cấu hình dữ liệu trình diễn; không đánh giá hoặc duyệt ảnh thực tế. */
export function AiSettingsView() {
  const [tab, setTab] = useState<AiTab>('general');
  const [saved, setSaved] = useState<AiSettings>(readSavedSettings);
  const [draft, setDraft] = useState<AiSettings>(saved);
  const [notice, setNotice] = useState('');
  const [showConnectionInfo, setShowConnectionInfo] = useState(false);

  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(saved);

  const handleToggle = (key: AiFeatureKey) => {
    setDraft((previous) => ({
      ...previous,
      features: { ...previous.features, [key]: !previous.features[key] },
    }));
    setNotice('');
  };

  const handleThresholdChange = (key: AiThresholdKey, value: number) => {
    setDraft((previous) => ({
      ...previous,
      thresholds: { ...previous.thresholds, [key]: value },
    }));
    setNotice('');
  };

  const handleSave = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setSaved(draft);
      setNotice('Đã lưu cấu hình mẫu trên trình duyệt này. Chưa gửi thiết lập đến máy chủ AI.');
    } catch {
      setNotice('Không lưu được dữ liệu mẫu vào trình duyệt. Vui lòng kiểm tra quyền lưu trữ.');
    }
  };

  const handleCancel = () => {
    setDraft(saved);
    setNotice('Đã hoàn tác các thay đổi chưa lưu.');
  };

  const handleReset = () => {
    setDraft({
      features: { ...DEFAULT_AI_SETTINGS.features },
      thresholds: { ...DEFAULT_AI_SETTINGS.thresholds },
    });
    setNotice('Đã đưa về giá trị mẫu ban đầu. Bấm Lưu cấu hình để ghi lại trên trình duyệt.');
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950" role="status">
        <div className="flex items-start gap-2">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p><strong>Chế độ giao diện mẫu:</strong> Các thay đổi chỉ được lưu trên trình duyệt của bạn.
            Chưa có API cấu hình AI, chưa kiểm tra mô hình AI thật.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 pt-3 shadow-sm sm:px-5">
        <nav aria-label="Nhóm thiết lập AI" className="flex flex-wrap gap-x-5 gap-y-1 border-b border-slate-200">
          {AI_TABS.map(({ id, label }) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                tab === id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-700'
              }`}>{label}</button>
          ))}
        </nav>
        <div className="py-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-slate-100 p-2 text-slate-600">
                <WifiOff size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-[#0B356B]">Trạng thái dịch vụ AI: Chưa kết nối</p>
                <p className="mt-1 text-xs text-slate-500">Trạng thái này chỉ phản ánh phiên bản giao diện chưa tích hợp API.</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowConnectionInfo((value) => !value)}
              className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              Thông tin kết nối
            </button>
          </div>
          {showConnectionInfo && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900" role="status">
              Chưa có endpoint kiểm tra trạng thái dịch vụ AI trong bản frontend hiện tại. Không thực hiện yêu cầu mạng.
            </div>
          )}
        </div>
      </div>

      <AiSettingsControls tab={tab} settings={draft}
        onToggle={handleToggle} onThresholdChange={handleThresholdChange} />

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
          <p>Kết quả AI chỉ hỗ trợ gắn cờ bài dự thi cần xác minh. Theo SRS, ban tổ chức vẫn là bên
            xem xét và quyết định, không được tự động loại bài bằng các ngưỡng này.</p>
        </div>
      </div>

      {notice && (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />{notice}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500">{hasUnsavedChanges ? 'Có thay đổi chưa lưu' : 'Không có thay đổi chưa lưu'}</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RotateCcw size={16} aria-hidden="true" /> Mặc định
          </button>
          <button type="button" onClick={handleCancel} disabled={!hasUnsavedChanges}
            className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40">
            Hủy
          </button>
          <button type="button" onClick={handleSave} disabled={!hasUnsavedChanges}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
            <Save size={16} aria-hidden="true" /> Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}
