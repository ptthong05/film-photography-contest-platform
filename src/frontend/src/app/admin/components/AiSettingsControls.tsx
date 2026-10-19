import type { ReactNode } from 'react';
import { ToggleRight } from 'lucide-react';

// Các giá trị chỉ phục vụ thao tác giao diện; chưa cấu hình một mô hình AI thực tế.
export type AiTab = 'general' | 'duplicates' | 'generated' | 'categorization' | 'reports';
export type AiFeatureKey =
  | 'duplicateDetection'
  | 'generatedDetection'
  | 'automaticClassification'
  | 'keywordSuggestion'
  | 'analytics'
  | 'automaticReports';
export type AiThresholdKey = 'duplicateSimilarity' | 'generatedConfidence' | 'maximumTags';

export interface AiSettings {
  features: Record<AiFeatureKey, boolean>;
  thresholds: Record<AiThresholdKey, number>;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  features: {
    duplicateDetection: true,
    generatedDetection: true,
    automaticClassification: true,
    keywordSuggestion: true,
    analytics: true,
    automaticReports: true,
  },
  thresholds: { duplicateSimilarity: 85, generatedConfidence: 70, maximumTags: 10 },
};

export const AI_TABS: { id: AiTab; label: string }[] = [
  { id: 'general', label: 'Thiết lập chung' },
  { id: 'duplicates', label: 'Phát hiện trùng lặp' },
  { id: 'generated', label: 'Phát hiện ảnh AI' },
  { id: 'categorization', label: 'Phân loại tự động' },
  { id: 'reports', label: 'Báo cáo & Thống kê' },
];

const FEATURE_ITEMS: { key: AiFeatureKey; label: string }[] = [
  { key: 'duplicateDetection', label: 'Phát hiện ảnh trùng lặp' },
  { key: 'generatedDetection', label: 'Phát hiện ảnh tạo bởi AI' },
  { key: 'automaticClassification', label: 'Tự động phân loại ảnh' },
  { key: 'keywordSuggestion', label: 'Gợi ý thẻ từ khóa' },
  { key: 'analytics', label: 'Phân tích và thống kê' },
  { key: 'automaticReports', label: 'Tạo báo cáo tự động' },
];

const THRESHOLD_ITEMS: {
  key: AiThresholdKey; label: string; min: number; max: number; suffix: string;
}[] = [
  { key: 'duplicateSimilarity', label: 'Ngưỡng độ tương đồng', min: 0, max: 100, suffix: '%' },
  { key: 'generatedConfidence', label: 'Ngưỡng phát hiện ảnh AI', min: 0, max: 100, suffix: '%' },
  { key: 'maximumTags', label: 'Số thẻ tối đa tự động gán', min: 1, max: 20, suffix: ' thẻ' },
];

interface AiSettingsControlsProps {
  tab: AiTab;
  settings: AiSettings;
  onToggle: (key: AiFeatureKey) => void;
  onThresholdChange: (key: AiThresholdKey, value: number) => void;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-bold text-[#0B356B]">{title}</h3>
      {children}
    </section>
  );
}

export function AiSettingsControls({ tab, settings, onToggle, onThresholdChange }: AiSettingsControlsProps) {
  const features = tab === 'general' ? FEATURE_ITEMS : FEATURE_ITEMS.filter(({ key }) => {
    if (tab === 'duplicates') return key === 'duplicateDetection';
    if (tab === 'generated') return key === 'generatedDetection';
    if (tab === 'categorization') return key === 'automaticClassification' || key === 'keywordSuggestion';
    return key === 'analytics' || key === 'automaticReports';
  });
  const thresholds = tab === 'general' ? THRESHOLD_ITEMS : THRESHOLD_ITEMS.filter(({ key }) => {
    if (tab === 'duplicates') return key === 'duplicateSimilarity';
    if (tab === 'generated') return key === 'generatedConfidence';
    if (tab === 'categorization') return key === 'maximumTags';
    return false;
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {thresholds.length > 0 && (
        <Panel title="Ngưỡng và thiết lập">
          <div className="space-y-5">
            {thresholds.map(({ key, label, min, max, suffix }) => (
              <div key={key}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor={`ai-${key}`} className="text-sm text-slate-700">{label}</label>
                  <output htmlFor={`ai-${key}`} className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">
                    {settings.thresholds[key]}{suffix}
                  </output>
                </div>
                <input id={`ai-${key}`} type="range" min={min} max={max} step={1}
                  value={settings.thresholds[key]}
                  onChange={(event) => onThresholdChange(key, Number(event.target.value))}
                  className="w-full cursor-pointer accent-blue-600"
                  aria-valuetext={`${settings.thresholds[key]}${suffix}`} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Các giá trị là tham số minh họa từ giao diện, chưa phải ngưỡng đã được kiểm chứng của AI.
          </p>
        </Panel>
      )}
      <Panel title="Tính năng AI">
        <div className="space-y-2">
          {features.map(({ key, label }) => {
            const isEnabled = settings.features[key];
            return (
              <div key={key} className="flex min-h-10 items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
                <span id={`ai-label-${key}`} className="text-sm text-slate-700">{label}</span>
                <button type="button" role="switch" aria-checked={isEnabled}
                  aria-labelledby={`ai-label-${key}`} onClick={() => onToggle(key)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}>
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
        {tab === 'reports' && (
          <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
            <ToggleRight size={16} className="shrink-0" aria-hidden="true" />
            Cấu hình này chưa tự động sinh báo cáo khi chưa tích hợp dịch vụ xử lý.
          </p>
        )}
      </Panel>
    </div>
  );
}
