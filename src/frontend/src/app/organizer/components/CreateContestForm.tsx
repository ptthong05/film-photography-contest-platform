import { useState, type ReactNode } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { organizerUserService } from "../../../services/organizerUserService";
import type { Contest, ContestDraft, Prize } from "../../../types/contest";
import { formatDate } from "../../../utils/formatDate";
import { PageHeader } from "./PageHeader";

const STEPS = ["Thông tin cơ bản", "Thể loại & tiêu chí", "Thời gian & giải thưởng", "Giám khảo", "Xác nhận"];
const CATEGORIES = ["Nhiếp ảnh phong cảnh", "Nhiếp ảnh đường phố", "Nhiếp ảnh chân dung", "Nhiếp ảnh tài liệu"];
const CRITERIA = ["Bố cục", "Ánh sáng", "Cảm xúc", "Kỹ thuật", "Sáng tạo"];
const FIELD_CLASS = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const INITIAL_DRAFT: ContestDraft = {
  name: "",
  category: CATEGORIES[0],
  description: "",
  criteria: ["Bố cục", "Ánh sáng"],
  maxPhotosPerPerson: 3,
  startDate: "",
  endDate: "",
  prizes: [
    { name: "Giải Nhất", reward: "10.000.000đ" },
    { name: "Giải Nhì", reward: "5.000.000đ" },
    { name: "Giải Ba", reward: "2.000.000đ" },
  ],
  judgeIds: null,
};

function validateStep(step: number, draft: ContestDraft, judgeCount: number): string | null {
  if (step === 0 && (!draft.name.trim() || !draft.description.trim())) {
    return "Vui lòng nhập tên và mô tả cuộc thi.";
  }
  if (step === 1 && (draft.criteria.length === 0 || draft.maxPhotosPerPerson < 1)) {
    return "Chọn ít nhất 1 tiêu chí và số ảnh tối đa từ 1 trở lên.";
  }
  if (step === 2) {
    if (!draft.startDate || !draft.endDate) return "Vui lòng chọn ngày bắt đầu và kết thúc.";
    if (draft.endDate < draft.startDate) return "Ngày kết thúc phải sau ngày bắt đầu.";
    if (draft.prizes.length === 0 || draft.prizes.some((prize) => !prize.name.trim())) {
      return "Thêm ít nhất 1 giải thưởng và nhập đủ tên giải.";
    }
  }
  if (step === 3 && judgeCount === 0) return "Chọn ít nhất 1 giám khảo.";
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
  onBack: () => void;
  onCreated: (contest: Contest) => void;
}

export function CreateContestForm({ onBack, onCreated }: CreateContestFormProps) {
  const judges = useFetch(organizerUserService.getJudges);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ContestDraft>(INITIAL_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLastStep = step === STEPS.length - 1;

  const activeJudges = (judges.data ?? []).filter((judge) => judge.status === "ACTIVE");
  const defaultJudgeIds = activeJudges.filter((judge) => judge.isDefault).map((judge) => judge.id);
  const selectedJudgeIds = draft.judgeIds ?? defaultJudgeIds;

  const updateDraft = <K extends keyof ContestDraft>(key: K, value: ContestDraft[K]) =>
    setDraft((previous) => ({ ...previous, [key]: value }));

  const toggleCriterion = (criterion: string) =>
    updateDraft(
      "criteria",
      draft.criteria.includes(criterion)
        ? draft.criteria.filter((item) => item !== criterion)
        : [...draft.criteria, criterion],
    );

  const toggleJudge = (id: string) =>
    updateDraft(
      "judgeIds",
      selectedJudgeIds.includes(id) ? selectedJudgeIds.filter((item) => item !== id) : [...selectedJudgeIds, id],
    );

  const updatePrize = (index: number, key: keyof Prize, value: string) =>
    updateDraft("prizes", draft.prizes.map((prize, i) => (i === index ? { ...prize, [key]: value } : prize)));

  const handleNext = () => {
    const message = validateStep(step, draft, selectedJudgeIds.length);
    setError(message);
    if (!message) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      onCreated(await contestService.createContest(draft, selectedJudgeIds));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tạo cuộc thi");
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <PageHeader title="Tạo cuộc thi mới" subtitle="Hoàn thành 5 bước để tạo cuộc thi" onBack={onBack} />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <ol className="mx-auto mb-7 flex max-w-4xl items-start justify-between gap-2 text-center text-xs">
          {STEPS.map((label, index) => (
            <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold ${
                  index < step
                    ? "bg-emerald-500 text-white"
                    : index === step
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {index < step ? <Check size={16} aria-hidden /> : index + 1}
              </span>
              <span className={index === step ? "font-semibold text-[#0B356B]" : "text-slate-400"}>{label}</span>
            </li>
          ))}
        </ol>

        <div className="mx-auto flex min-h-64 max-w-3xl flex-col gap-5">
          {step === 0 && (
            <>
              <Field label="Tên cuộc thi *">
                <input className={FIELD_CLASS} value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} />
              </Field>
              <Field label="Mô tả *">
                <textarea rows={6} className={FIELD_CLASS} value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} />
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
              <fieldset className="flex flex-wrap gap-4 text-sm">
                <legend className="mb-1.5 font-medium text-slate-700">Tiêu chí chấm điểm</legend>
                {CRITERIA.map((criterion) => (
                  <label key={criterion} className="flex items-center gap-2">
                    <input type="checkbox" checked={draft.criteria.includes(criterion)} onChange={() => toggleCriterion(criterion)} />
                    {criterion}
                  </label>
                ))}
              </fieldset>
              <Field label="Số ảnh tối đa mỗi thí sinh">
                <input type="number" min={1} className={FIELD_CLASS} value={draft.maxPhotosPerPerson} onChange={(e) => updateDraft("maxPhotosPerPerson", Number(e.target.value))} />
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ngày bắt đầu *">
                  <input type="date" className={FIELD_CLASS} value={draft.startDate} onChange={(e) => updateDraft("startDate", e.target.value)} />
                </Field>
                <Field label="Ngày kết thúc *">
                  <input type="date" className={FIELD_CLASS} value={draft.endDate} onChange={(e) => updateDraft("endDate", e.target.value)} />
                </Field>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-slate-700">Giải thưởng</p>
                {draft.prizes.map((prize, index) => (
                  <div key={index} className="flex gap-3">
                    <input aria-label="Tên giải" placeholder="Tên giải" className={FIELD_CLASS} value={prize.name} onChange={(e) => updatePrize(index, "name", e.target.value)} />
                    <input aria-label="Giá trị giải" placeholder="Giá trị (vd: 5.000.000đ)" className={FIELD_CLASS} value={prize.reward} onChange={(e) => updatePrize(index, "reward", e.target.value)} />
                    <button
                      type="button"
                      aria-label="Xóa giải thưởng"
                      className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                      onClick={() => updateDraft("prizes", draft.prizes.filter((_, i) => i !== index))}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
                  onClick={() => updateDraft("prizes", [...draft.prizes, { name: "", reward: "" }])}
                >
                  <Plus size={16} aria-hidden />
                  Thêm giải thưởng
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-sm text-slate-500">Giám khảo được đặt chấm mặc định đã được chọn sẵn, bạn có thể bỏ chọn hoặc chọn thêm.</p>
              {judges.isLoading && <StateMessage message="Đang tải danh sách giám khảo..." />}
              {judges.error && <StateMessage message={judges.error} isError />}
              {activeJudges.map((judge) => (
                <label key={judge.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm">
                  <input type="checkbox" checked={selectedJudgeIds.includes(judge.id)} onChange={() => toggleJudge(judge.id)} />
                  <span className="font-semibold text-[#0B356B]">{judge.fullName}</span>
                  <span className="text-slate-500">{judge.specialty}</span>
                  {judge.isDefault && <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Chấm mặc định</span>}
                </label>
              ))}
            </>
          )}
          {isLastStep && (
            <dl className="grid grid-cols-[10rem_1fr] gap-y-3 text-sm">
              <dt className="text-slate-500">Tên cuộc thi</dt>
              <dd className="font-medium text-[#0B356B]">{draft.name}</dd>
              <dt className="text-slate-500">Thể loại</dt>
              <dd>{draft.category}</dd>
              <dt className="text-slate-500">Tiêu chí</dt>
              <dd>{draft.criteria.join(", ")}</dd>
              <dt className="text-slate-500">Ảnh tối đa / người</dt>
              <dd>{draft.maxPhotosPerPerson}</dd>
              <dt className="text-slate-500">Thời gian</dt>
              <dd>{`${formatDate(draft.startDate)} - ${formatDate(draft.endDate)}`}</dd>
              <dt className="text-slate-500">Giải thưởng</dt>
              <dd>{draft.prizes.map((prize) => `${prize.name}: ${prize.reward}`).join(" · ")}</dd>
              <dt className="text-slate-500">Giám khảo</dt>
              <dd>{activeJudges.filter((judge) => selectedJudgeIds.includes(judge.id)).map((judge) => judge.fullName).join(", ")}</dd>
            </dl>
          )}
        </div>

        {error && (
          <p role="alert" className="mx-auto mt-4 max-w-3xl text-sm text-rose-600">
            {error}
          </p>
        )}
        <div className="mx-auto mt-8 flex max-w-3xl justify-between">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            onClick={step === 0 ? onBack : () => setStep(step - 1)}
          >
            {step === 0 ? "Hủy" : "Quay lại"}
          </button>
          <button type="button" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} onClick={isLastStep ? handleSubmit : handleNext}>
            {isLastStep ? (isSubmitting ? "Đang tạo..." : "Tạo cuộc thi") : "Tiếp theo"}
          </button>
        </div>
      </div>
    </section>
  );
}
