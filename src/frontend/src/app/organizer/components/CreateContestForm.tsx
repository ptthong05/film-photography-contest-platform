import { useState, type ReactNode } from "react";
import {
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Film,
  Gift,
  Image as ImageIcon,
  Info,
  Layers,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { organizerUserService } from "../../../services/organizerUserService";
import type { Contest, ContestDraft, Prize } from "../../../types/contest";
import { formatDate } from "../../../utils/formatDate";
import { PageHeader } from "./PageHeader";

const STEPS = [
  "1. Thông tin cơ bản",
  "2. Thể loại & Thể lệ",
  "3. Thời gian & Giải thưởng",
  "4. Hội đồng Giám khảo",
  "5. Xác nhận & Tạo",
];

const CATEGORY_TAGS = [
  "Đời sống",
  "Chân dung",
  "Đường phố",
  "Kiến trúc",
  "Thiên nhiên",
  "Phong cảnh",
  "Nghệ thuật",
  "Đen trắng",
];

const SAMPLE_COVERS = [
  { label: "Thiên nhiên & Núi non", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80" },
  { label: "Đô thị & Đường phố", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80" },
  { label: "Cổ điển & Hoài niệm", url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80" },
  { label: "Bờ biển & Tự do", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
  { label: "Rừng & Sương sớm", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80" },
  { label: "Mùa thu & Sắc phim", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" },
];

const DEFAULT_CRITERIA = [
  "Bố cục & Ánh sáng (30%)",
  "Cảm xúc & Kể chuyện (30%)",
  "Xử lý phòng tối & Grain (20%)",
  "Sáng tạo & Độc bản (20%)",
];

const FIELD_CLASS = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const INITIAL_DRAFT: ContestDraft = {
  name: "",
  organizer: "FilmContest Studio",
  image: SAMPLE_COVERS[0].url,
  category: "Đời sống",
  tags: ["Đời sống", "Chân dung"],
  description: "",
  rules: "Bắt buộc chụp bằng máy ảnh cơ học hoặc máy phim analog dùng cuộn phim hóa chất thật. Giữ lại cuộn phim âm bản gốc (negative) để Hội đồng giám khảo và Ban tổ chức đối chiếu khi xét giải. Nghiêm cấm sử dụng ảnh do AI tạo sinh hoặc can thiệp kỹ thuật số sai lệch thực tế.",
  criteria: [...DEFAULT_CRITERIA],
  maxPhotosPerPerson: 3,
  startDate: "2026-09-01",
  endDate: "2026-11-30",
  judgingEndDate: "2026-12-10",
  resultsDate: "2026-12-15",
  prizes: [
    { name: "Giải Nhất (Grand Prize)", reward: "25.000.000 VNĐ + Leica M6" },
    { name: "Giải Nhì (Second Prize)", reward: "12.000.000 VNĐ + 20 cuộn film" },
    { name: "Giải Ba (Third Prize)", reward: "6.000.000 VNĐ + 10 cuộn film" },
    { name: "Giải Khuyến Khích", reward: "2.000.000 VNĐ + Voucher Lab" },
  ],
  judgeIds: null,
};

function validateStep(step: number, draft: ContestDraft, judgeCount: number): string | null {
  if (step === 0) {
    if (!(draft.name ?? "").trim()) return "Vui lòng nhập tên cuộc thi.";
    if (!(draft.organizer ?? "").trim()) return "Vui lòng nhập đơn vị tổ chức cuộc thi.";
    if (!(draft.description ?? "").trim()) return "Vui lòng nhập mô tả cuộc thi.";
  }
  if (step === 1) {
    if (!draft.tags || draft.tags.length === 0) return "Vui lòng chọn ít nhất 1 hạng mục tranh tài.";
    if (draft.criteria.length === 0) return "Vui lòng chọn ít nhất 1 tiêu chí chấm điểm.";
    if (draft.maxPhotosPerPerson < 1) return "Số ảnh tối đa mỗi thí sinh phải từ 1 trở lên.";
  }
  if (step === 2) {
    if (!draft.startDate || !draft.endDate) return "Vui lòng chọn ngày bắt đầu và kết thúc nhận bài.";
    if (draft.endDate < draft.startDate) return "Hạn chót nhận bài phải sau ngày bắt đầu.";
    if (draft.prizes.length === 0 || draft.prizes.some((p) => !(p.name ?? "").trim())) {
      return "Thêm ít nhất 1 giải thưởng và nhập đủ tên giải.";
    }
  }
  if (step === 3 && judgeCount === 0) {
    return "Vui lòng phân công ít nhất 1 giám khảo vào hội đồng.";
  }
  return null;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
      <span>
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
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

  const [availableTags, setAvailableTags] = useState<string[]>(CATEGORY_TAGS);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const [availableCriteria, setAvailableCriteria] = useState<string[]>(DEFAULT_CRITERIA);
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);
  const [newCriterionInput, setNewCriterionInput] = useState("");

  const [judgeSearch, setJudgeSearch] = useState("");
  const [showAllJudges, setShowAllJudges] = useState(false);

  const activeJudges = (judges.data ?? []).filter((judge) => judge.status === "ACTIVE");
  const defaultJudgeIds = activeJudges.slice(0, 4).map((judge) => judge.id);
  const selectedJudgeIds = draft.judgeIds ?? defaultJudgeIds;

  const sortedActiveJudges = [...activeJudges].sort((a, b) => {
    const aSelected = selectedJudgeIds.includes(a.id);
    const bSelected = selectedJudgeIds.includes(b.id);
    if (aSelected !== bSelected) return aSelected ? -1 : 1;
    if (a.fullName === "Trần Thị Bình") return -1;
    if (b.fullName === "Trần Thị Bình") return 1;
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return a.fullName.localeCompare(b.fullName, "vi");
  });

  const filteredActiveJudges = sortedActiveJudges.filter((judge) => {
    const q = judgeSearch.trim().toLowerCase();
    if (!q) return true;
    return `${judge.fullName} ${judge.specialty} ${judge.email}`.toLowerCase().includes(q);
  });

  const displayedActiveJudges = (judgeSearch.trim() || showAllJudges)
    ? filteredActiveJudges
    : filteredActiveJudges.slice(0, 5);

  const updateDraft = <K extends keyof ContestDraft>(key: K, value: ContestDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const toggleTag = (tag: string) => {
    const currentTags = draft.tags ?? [];
    const updated = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
    updateDraft("tags", updated);
    if (updated.length > 0) updateDraft("category", updated[0]);
  };

  const handleAddNewTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) {
      setIsAddingTag(false);
      return;
    }
    if (!availableTags.includes(trimmed)) {
      setAvailableTags((prev) => [...prev, trimmed]);
    }
    const currentTags = draft.tags ?? [];
    if (!currentTags.includes(trimmed)) {
      const updated = [...currentTags, trimmed];
      updateDraft("tags", updated);
      if (updated.length > 0) updateDraft("category", updated[0]);
    }
    setNewTagInput("");
    setIsAddingTag(false);
  };

  const toggleCriterion = (criterion: string) => {
    updateDraft(
      "criteria",
      draft.criteria.includes(criterion)
        ? draft.criteria.filter((c) => c !== criterion)
        : [...draft.criteria, criterion],
    );
  };

  const handleAddNewCriterion = () => {
    const trimmed = newCriterionInput.trim();
    if (!trimmed) {
      setIsAddingCriterion(false);
      return;
    }
    if (!availableCriteria.includes(trimmed)) {
      setAvailableCriteria((prev) => [...prev, trimmed]);
    }
    if (!draft.criteria.includes(trimmed)) {
      updateDraft("criteria", [...draft.criteria, trimmed]);
    }
    setNewCriterionInput("");
    setIsAddingCriterion(false);
  };

  const toggleJudge = (id: string) => {
    updateDraft(
      "judgeIds",
      selectedJudgeIds.includes(id) ? selectedJudgeIds.filter((item) => item !== id) : [...selectedJudgeIds, id],
    );
  };

  const updatePrize = (index: number, key: keyof Prize, value: string) => {
    updateDraft("prizes", draft.prizes.map((prize, i) => (i === index ? { ...prize, [key]: value } : prize)));
  };

  const handleNext = () => {
    const message = validateStep(step, draft, selectedJudgeIds.length);
    setError(message);
    if (!message) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const created = await contestService.createContest(draft, selectedJudgeIds);
      onCreated(created);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tạo cuộc thi");
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6" aria-label="Tạo cuộc thi mới">
      <PageHeader
        title="Tạo cuộc thi mới"
        subtitle="Thiết lập đầy đủ thông tin, thể lệ và giải thưởng tương thích với hệ thống"
        onBack={onBack}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {/* Step Indicator */}
        <ol className="mx-auto mb-8 flex max-w-4xl items-start justify-between gap-2 text-center text-xs">
          {STEPS.map((label, index) => (
            <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                  index < step
                    ? "bg-emerald-500 text-white shadow-sm"
                    : index === step
                    ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {index < step ? <Check size={16} aria-hidden /> : index + 1}
              </span>
              <span className={`text-[11px] sm:text-xs ${index === step ? "font-bold text-[#0B356B]" : "text-slate-400"}`}>
                {label}
              </span>
            </li>
          ))}
        </ol>

        {/* Step Contents */}
        <div className="mx-auto max-w-3xl space-y-6 min-h-[350px]">
          {/* BƯỚC 1: THÔNG TIN CƠ BẢN */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tên cuộc thi" required>
                  <input
                    className={FIELD_CLASS}
                    placeholder="Ví dụ: Analog Moments 2026, Film & City 2026"
                    value={draft.name}
                    onChange={(e) => updateDraft("name", e.target.value)}
                  />
                </Field>

                <Field label="Đơn vị tổ chức" required>
                  <input
                    className={FIELD_CLASS}
                    placeholder="Ví dụ: FilmContest Studio, Urban Film Club"
                    value={draft.organizer ?? ""}
                    onChange={(e) => updateDraft("organizer", e.target.value)}
                  />
                </Field>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ảnh bìa cuộc thi (Cover Image)
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-3">
                  {SAMPLE_COVERS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => updateDraft("image", item.url)}
                      className={`group relative h-24 overflow-hidden rounded-xl border-2 text-left transition cursor-pointer ${
                        draft.image === item.url ? "border-blue-600 ring-4 ring-blue-100" : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <img src={item.url} alt={item.label} className="h-full w-full object-cover group-hover:scale-105 transition" />
                      <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 p-1.5 text-[10px] font-semibold text-white truncate">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  className={FIELD_CLASS}
                  placeholder="Hoặc dán URL ảnh bìa tùy chỉnh (https://...)"
                  value={draft.image ?? ""}
                  onChange={(e) => updateDraft("image", e.target.value)}
                />
              </div>

              <Field label="Mô tả & Định hướng cuộc thi" required>
                <textarea
                  rows={4}
                  className={FIELD_CLASS}
                  placeholder="Giới thiệu mục đích, thông điệp truyền cảm hứng và tinh thần tôn vinh nhiếp ảnh phim..."
                  value={draft.description}
                  onChange={(e) => updateDraft("description", e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* BƯỚC 2: HẠNG MỤC, THỂ LỆ & TIÊU CHÍ */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hạng mục tranh tài * <span className="font-normal text-slate-400">(chọn các tag phù hợp hoặc bấm + để thêm)</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = (draft.tags ?? []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {tag} {isSelected && "✓"}
                      </button>
                    );
                  })}

                  {/* Nút dấu + thêm hạng mục tranh tài */}
                  {isAddingTag ? (
                    <div className="flex items-center gap-1.5 rounded-lg border border-blue-400 bg-white p-1 shadow-sm">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nhập tên hạng mục..."
                        className="rounded px-2.5 py-1 text-xs text-slate-800 outline-none w-36"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddNewTag();
                          } else if (e.key === "Escape") {
                            setIsAddingTag(false);
                            setNewTagInput("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewTag}
                        className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                      >
                        Thêm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingTag(false);
                          setNewTagInput("");
                        }}
                        className="rounded px-1.5 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(true)}
                      className="inline-flex items-center gap-1 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100/70 transition cursor-pointer"
                      title="Thêm hạng mục mới"
                    >
                      <Plus size={15} /> Thêm hạng mục
                    </button>
                  )}
                </div>
              </div>

              <Field label="Thể lệ & Quy định nộp bài">
                <textarea
                  rows={4}
                  className={FIELD_CLASS}
                  placeholder="Quy định thiết bị máy ảnh cơ, định dạng phim, yêu cầu giữ âm bản gốc..."
                  value={draft.rules ?? ""}
                  onChange={(e) => updateDraft("rules", e.target.value)}
                />
              </Field>

              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-slate-700">
                  Tiêu chí chấm điểm của Ban Giám khảo <span className="font-normal text-slate-400">(chọn hoặc bấm + để thêm tiêu chí mới)</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableCriteria.map((criterion) => (
                    <label
                      key={criterion}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-100/60 transition"
                    >
                      <input
                        type="checkbox"
                        checked={draft.criteria.includes(criterion)}
                        onChange={() => toggleCriterion(criterion)}
                        className="size-4 accent-blue-600 rounded"
                      />
                      <span className="flex-1">{criterion}</span>
                    </label>
                  ))}

                  {/* Nút dấu + thêm tiêu chí chấm điểm */}
                  {isAddingCriterion ? (
                    <div className="flex items-center gap-2 rounded-xl border-2 border-blue-400 bg-white p-2.5 shadow-sm sm:col-span-2">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nhập tên tiêu chí mới (vd: Kỹ thuật tráng & scan (20%)...)"
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                        value={newCriterionInput}
                        onChange={(e) => setNewCriterionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddNewCriterion();
                          } else if (e.key === "Escape") {
                            setIsAddingCriterion(false);
                            setNewCriterionInput("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCriterion}
                        className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                      >
                        Thêm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCriterion(false);
                          setNewCriterionInput("");
                        }}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingCriterion(true)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/40 p-3 text-xs font-bold text-blue-700 hover:bg-blue-100/60 transition cursor-pointer sm:col-span-2"
                    >
                      <Plus size={16} /> Thêm tiêu chí chấm điểm khác
                    </button>
                  )}
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Số ảnh tối đa mỗi thí sinh">
                  <input
                    type="number"
                    min={1}
                    className={FIELD_CLASS}
                    value={draft.maxPhotosPerPerson}
                    onChange={(e) => updateDraft("maxPhotosPerPerson", Math.max(1, Number(e.target.value)))}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* BƯỚC 3: THỜI GIAN & GIẢI THƯỞNG */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ngày bắt đầu nhận bài" required>
                  <input
                    type="date"
                    className={FIELD_CLASS}
                    value={draft.startDate}
                    onChange={(e) => updateDraft("startDate", e.target.value)}
                  />
                </Field>
                <Field label="Hạn chót nộp bài" required>
                  <input
                    type="date"
                    className={FIELD_CLASS}
                    value={draft.endDate}
                    onChange={(e) => updateDraft("endDate", e.target.value)}
                  />
                </Field>
                <Field label="Hạn kết thúc chấm thi">
                  <input
                    type="date"
                    className={FIELD_CLASS}
                    value={draft.judgingEndDate ?? ""}
                    onChange={(e) => updateDraft("judgingEndDate", e.target.value)}
                  />
                </Field>
                <Field label="Ngày công bố kết quả">
                  <input
                    type="date"
                    className={FIELD_CLASS}
                    value={draft.resultsDate ?? ""}
                    onChange={(e) => updateDraft("resultsDate", e.target.value)}
                  />
                </Field>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Cơ cấu giải thưởng & Phần thưởng *</label>
                  <button
                    type="button"
                    onClick={() => updateDraft("prizes", [...draft.prizes, { name: "", reward: "" }])}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                  >
                    <Plus size={15} /> Thêm giải
                  </button>
                </div>

                <div className="space-y-2.5">
                  {draft.prizes.map((prize, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        placeholder="Tên giải (vd: Giải Nhất)"
                        className={FIELD_CLASS}
                        value={prize.name}
                        onChange={(e) => updatePrize(index, "name", e.target.value)}
                      />
                      <input
                        placeholder="Trị giá & Hiện vật (vd: 25.000.000 VNĐ + Leica M6)"
                        className={FIELD_CLASS}
                        value={prize.reward}
                        onChange={(e) => updatePrize(index, "reward", e.target.value)}
                      />
                      <button
                        type="button"
                        aria-label="Xóa giải thưởng"
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 cursor-pointer"
                        onClick={() => updateDraft("prizes", draft.prizes.filter((_, i) => i !== index))}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 4: HỘI ĐỒNG GIÁM KHẢO */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-[#0B356B] text-sm sm:text-base">Phân công Hội đồng Giám khảo</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Chọn các giám khảo chuyên môn thẩm định bài thi. Đã chọn <strong>{selectedJudgeIds.length}</strong> giám khảo.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên, chuyên môn..."
                    value={judgeSearch}
                    onChange={(e) => setJudgeSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs outline-none focus:border-blue-500"
                  />
                  {judgeSearch && (
                    <button
                      type="button"
                      onClick={() => setJudgeSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {judges.isLoading && <StateMessage message="Đang tải danh sách giám khảo..." />}
              {judges.error && <StateMessage message={judges.error} isError />}

              {!judgeSearch.trim() && !showAllJudges && filteredActiveJudges.length > 5 && (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-xs text-slate-500 border border-slate-200">
                  <span>Đang hiển thị <strong>5 giám khảo tiêu biểu</strong></span>
                  <span className="text-blue-700 font-semibold">Dùng ô tìm kiếm hoặc bấm Xem thêm</span>
                </div>
              )}

              {displayedActiveJudges.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
                  Không tìm thấy giám khảo phù hợp với từ khóa tìm kiếm.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayedActiveJudges.map((judge) => {
                    const isSelected = selectedJudgeIds.includes(judge.id);
                    return (
                      <label
                        key={judge.id}
                        className={`flex items-center gap-3.5 rounded-xl border p-3.5 text-sm transition cursor-pointer ${
                          isSelected ? "border-blue-300 bg-blue-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleJudge(judge.id)}
                          className="size-4 accent-blue-600 rounded"
                        />
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                          {(judge.fullName ?? "").trim().slice(0, 1) || "G"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900">{judge.fullName}</p>
                          <p className="text-xs text-slate-500">{judge.specialty}</p>
                        </div>
                        {judge.fullName === "Trần Thị Bình" && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                            Cổng Giám khảo
                          </span>
                        )}
                        {judge.isDefault && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                            Chấm mặc định
                          </span>
                        )}
                      </label>
                    );
                  })}

                  {!judgeSearch.trim() && filteredActiveJudges.length > 5 && (
                    <div className="pt-1">
                      {!showAllJudges ? (
                        <button
                          type="button"
                          onClick={() => setShowAllJudges(true)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100/60 transition cursor-pointer"
                        >
                          <ChevronDown size={15} />
                          Xem thêm {filteredActiveJudges.length - 5} giám khảo khác
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowAllJudges(false)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <ChevronUp size={15} />
                          Thu gọn lại 5 giám khảo tiêu biểu
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BƯỚC 5: XÁC NHẬN & TẠO */}
          {isLastStep && (
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 sm:text-sm">
                Kiểm tra lại toàn bộ thông tin cuộc thi. Sau khi tạo thành công, cuộc thi sẽ xuất hiện trong danh sách Quản lý cuộc thi và tự động mở trang chi tiết đầy đủ khớp chuẩn hệ thống.
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-36 bg-slate-800">
                  <img src={draft.image} alt={draft.name} className="h-full w-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-[10px] uppercase font-bold text-blue-200">XÁC NHẬN CUỘC THI MỚI</p>
                    <h3 className="text-lg font-bold">{draft.name}</h3>
                  </div>
                </div>

                <dl className="grid grid-cols-[11rem_1fr] gap-y-3 p-5 text-xs sm:text-sm">
                  <dt className="text-slate-500">Đơn vị tổ chức</dt>
                  <dd className="font-bold text-slate-900">{draft.organizer}</dd>

                  <dt className="text-slate-500">Hạng mục tranh tài</dt>
                  <dd className="font-medium text-blue-700">{(draft.tags ?? []).join(", ")}</dd>

                  <dt className="text-slate-500">Thời gian nhận bài</dt>
                  <dd className="font-semibold text-slate-800">
                    {formatDate(draft.startDate)} – {formatDate(draft.endDate)}
                  </dd>

                  <dt className="text-slate-500">Cơ cấu giải thưởng</dt>
                  <dd className="text-slate-700">
                    {draft.prizes.map((p) => `${p.name}: ${p.reward}`).join(" · ")}
                  </dd>

                  <dt className="text-slate-500">Hội đồng giám khảo</dt>
                  <dd className="text-slate-700">
                    {activeJudges
                      .filter((j) => selectedJudgeIds.includes(j.id))
                      .map((j) => j.fullName)
                      .join(", ")}
                  </dd>
                </dl>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mx-auto mt-4 max-w-3xl text-sm font-semibold text-rose-600 text-center">
            {error}
          </p>
        )}

        {/* Step Navigation Actions */}
        <div className="mx-auto mt-8 flex max-w-3xl justify-between border-t border-slate-100 pt-5">
          <button
            type="button"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            onClick={step === 0 ? onBack : () => setStep(step - 1)}
          >
            {step === 0 ? "Hủy bỏ" : "Quay lại"}
          </button>
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            disabled={isSubmitting}
            onClick={isLastStep ? handleSubmit : handleNext}
          >
            {isLastStep ? (isSubmitting ? "Đang tạo cuộc thi..." : "Tạo cuộc thi ngay") : "Tiếp theo"}
          </button>
        </div>
      </div>
    </section>
  );
}
