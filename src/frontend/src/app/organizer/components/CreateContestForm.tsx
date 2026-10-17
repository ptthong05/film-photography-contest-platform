import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Modal } from "../../../components/Modal";
import { contestService } from "../../../services/contestService";
import type { Contest, ContestDraft } from "../../../types/contest";
import { formatDate } from "../../../utils/formatDate";

const STEPS = ["Thông tin cơ bản", "Thể loại & tiêu chí", "Thời gian & quy định", "Truyền thông", "Xác nhận"];
const CATEGORIES = ["Nhiếp ảnh phong cảnh", "Nhiếp ảnh đường phố", "Nhiếp ảnh chân dung", "Nhiếp ảnh tài liệu"];
const CRITERIA = ["Bố cục", "Ánh sáng", "Cảm xúc", "Kỹ thuật", "Sáng tạo"];
const FIELD_CLASS = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500";

const INITIAL_DRAFT: ContestDraft = {
  name: "",
  category: CATEGORIES[0],
  description: "",
  criteria: ["Bố cục", "Ánh sáng"],
  maxPhotosPerPerson: 3,
  startDate: "",
  endDate: "",
  slogan: "",
};

function validateStep(step: number, draft: ContestDraft): string | null {
  if (step === 0 && (!draft.name.trim() || !draft.description.trim())) {
    return "Vui lòng nhập tên và mô tả cuộc thi.";
  }
  if (step === 1 && (draft.criteria.length === 0 || draft.maxPhotosPerPerson < 1)) {
    return "Chọn ít nhất 1 tiêu chí và số ảnh tối đa từ 1 trở lên.";
  }
  if (step === 2) {
    if (!draft.startDate || !draft.endDate) return "Vui lòng chọn ngày bắt đầu và kết thúc.";
    if (draft.endDate < draft.startDate) return "Ngày kết thúc phải sau ngày bắt đầu.";
  }
  return null;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

interface CreateContestFormProps {
  onClose: () => void;
  onCreated: (contest: Contest) => void;
}

export function CreateContestForm({ onClose, onCreated }: CreateContestFormProps) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ContestDraft>(INITIAL_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLastStep = step === STEPS.length - 1;

  const updateDraft = <K extends keyof ContestDraft>(key: K, value: ContestDraft[K]) =>
    setDraft((previous) => ({ ...previous, [key]: value }));

  const toggleCriterion = (criterion: string) =>
    updateDraft(
      "criteria",
      draft.criteria.includes(criterion)
        ? draft.criteria.filter((item) => item !== criterion)
        : [...draft.criteria, criterion],
    );

  const handleNext = () => {
    const message = validateStep(step, draft);
    setError(message);
    if (!message) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      onCreated(await contestService.createContest(draft));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tạo cuộc thi");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Tạo cuộc thi mới" onClose={onClose} isWide>
      <ol className="mb-6 flex items-start justify-between gap-2 text-center text-[11px]">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
                index < step
                  ? "bg-emerald-500 text-white"
                  : index === step
                    ? "bg-brand-500 text-white"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {index < step ? <Check size={16} aria-hidden /> : index + 1}
            </span>
            <span className={index === step ? "font-semibold text-navy-900" : "text-slate-400"}>{label}</span>
          </li>
        ))}
      </ol>

      <div className="flex min-h-56 flex-col gap-4">
        {step === 0 && (
          <>
            <Field label="Tên cuộc thi *">
              <input className={FIELD_CLASS} value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} />
            </Field>
            <Field label="Mô tả *">
              <textarea
                rows={5}
                className={FIELD_CLASS}
                value={draft.description}
                onChange={(e) => updateDraft("description", e.target.value)}
              />
            </Field>
          </>
        )}
        {step === 1 && (
          <>
            <Field label="Thể loại">
              <select className={FIELD_CLASS} value={draft.category} onChange={(e) => updateDraft("category", e.target.value)}>
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </Field>
            <fieldset className="flex flex-wrap gap-3 text-sm">
              <legend className="mb-1.5 font-medium text-slate-700">Tiêu chí chấm điểm</legend>
              {CRITERIA.map((criterion) => (
                <label key={criterion} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={draft.criteria.includes(criterion)}
                    onChange={() => toggleCriterion(criterion)}
                  />
                  {criterion}
                </label>
              ))}
            </fieldset>
            <Field label="Số ảnh tối đa mỗi thí sinh">
              <input
                type="number"
                min={1}
                className={FIELD_CLASS}
                value={draft.maxPhotosPerPerson}
                onChange={(e) => updateDraft("maxPhotosPerPerson", Number(e.target.value))}
              />
            </Field>
          </>
        )}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ngày bắt đầu *">
              <input type="date" className={FIELD_CLASS} value={draft.startDate} onChange={(e) => updateDraft("startDate", e.target.value)} />
            </Field>
            <Field label="Ngày kết thúc *">
              <input type="date" className={FIELD_CLASS} value={draft.endDate} onChange={(e) => updateDraft("endDate", e.target.value)} />
            </Field>
          </div>
        )}
        {step === 3 && (
          <>
            <Field label="Slogan / thông điệp truyền thông">
              <input className={FIELD_CLASS} value={draft.slogan} onChange={(e) => updateDraft("slogan", e.target.value)} />
            </Field>
            <p className="text-xs text-slate-500">Ảnh bìa sẽ bổ sung khi backend có API tải ảnh lên.</p>
          </>
        )}
        {isLastStep && (
          <dl className="grid grid-cols-[9rem_1fr] gap-y-2 text-sm">
            <dt className="text-slate-500">Tên cuộc thi</dt>
            <dd className="font-medium text-navy-900">{draft.name}</dd>
            <dt className="text-slate-500">Thể loại</dt>
            <dd>{draft.category}</dd>
            <dt className="text-slate-500">Tiêu chí</dt>
            <dd>{draft.criteria.join(", ")}</dd>
            <dt className="text-slate-500">Ảnh tối đa / người</dt>
            <dd>{draft.maxPhotosPerPerson}</dd>
            <dt className="text-slate-500">Thời gian</dt>
            <dd>{`${formatDate(draft.startDate)} - ${formatDate(draft.endDate)}`}</dd>
            <dt className="text-slate-500">Slogan</dt>
            <dd>{draft.slogan || "—"}</dd>
          </dl>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-600">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          onClick={step === 0 ? onClose : () => setStep(step - 1)}
        >
          {step === 0 ? "Hủy" : "Quay lại"}
        </button>
        <button
          type="button"
          className="btn-primary disabled:opacity-60"
          disabled={isSubmitting}
          onClick={isLastStep ? handleSubmit : handleNext}
        >
          {isLastStep ? (isSubmitting ? "Đang tạo..." : "Tạo cuộc thi") : "Tiếp theo"}
        </button>
      </div>
    </Modal>
  );
}
