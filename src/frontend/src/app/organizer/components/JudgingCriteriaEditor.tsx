import { useEffect, useState } from "react";
import { ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import type { JudgingCriterion } from "../../../types/judge";
import type { CriterionDraft } from "../../../types/judgingAdmin";

/** Bộ tiêu chí theo yêu cầu đề tài (chấm ảnh phim), tổng trọng số 100% */
const TEMPLATE: CriterionDraft[] = [
  { name: "Sáng tạo nghệ thuật", description: "Ý tưởng, góc nhìn mới lạ", maxScore: 10, weight: 15 },
  { name: "Bố cục", description: "Cân bằng khung hình, đường dẫn", maxScore: 10, weight: 15 },
  { name: "Kể chuyện", description: "Thông điệp và cảm xúc của bức ảnh", maxScore: 10, weight: 15 },
  { name: "Kỹ thuật thực hiện", description: "Lấy nét, phơi sáng, xử lý ánh sáng", maxScore: 10, weight: 15 },
  { name: "Độ hạt phim (grain)", description: "Đặc trưng hạt phim phù hợp chủ đề", maxScore: 10, weight: 10 },
  { name: "Dải tông màu", description: "Chi tiết vùng sáng, vùng tối", maxScore: 10, weight: 10 },
  { name: "Tái tạo màu sắc", description: "Màu trung thực với loại phim", maxScore: 10, weight: 10 },
  { name: "Chất lượng bản quét", description: "Độ phân giải, bụi, xước khi scan", maxScore: 10, weight: 10 },
];

interface JudgingCriteriaEditorProps {
  criteria: JudgingCriterion[];
  onSave: (items: CriterionDraft[]) => Promise<void>;
}

function toDrafts(criteria: JudgingCriterion[]): CriterionDraft[] {
  return criteria.map((item) => ({
    name: item.name,
    description: item.description ?? "",
    maxScore: item.maxScore,
    weight: item.weight,
  }));
}

export function JudgingCriteriaEditor({ criteria, onSave }: JudgingCriteriaEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [drafts, setDrafts] = useState<CriterionDraft[]>(() => toDrafts(criteria));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDrafts(toDrafts(criteria));
    setIsEditing(false);
    setError(null);
  }, [criteria]);

  const totalWeight = drafts.reduce((total, item) => total + (Number(item.weight) || 0), 0);
  const update = (index: number, changes: Partial<CriterionDraft>) =>
    setDrafts((items) => items.map((item, i) => (i === index ? { ...item, ...changes } : item)));

  const save = async () => {
    if (drafts.some((item) => !item.name.trim())) {
      setError("Tên tiêu chí không được để trống");
      return;
    }
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError("Tổng trọng số các tiêu chí phải bằng 100%");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave(drafts.map((item) => ({ ...item, name: item.name.trim(), description: item.description.trim() })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không lưu được tiêu chí");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        {criteria.length ? (
          <div className="flex flex-wrap gap-2">
            {criteria.map((item) => (
              <span key={item.id} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {item.name} · {item.weight}% · tối đa {item.maxScore}
              </span>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            Cuộc thi chưa có tiêu chí chấm. Giám khảo chỉ chấm được khi đã có tiêu chí.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setIsEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">
            <Pencil size={14} /> {criteria.length ? "Sửa tiêu chí" : "Tự nhập tiêu chí"}
          </button>
          {!criteria.length && (
            <button type="button" onClick={() => { setDrafts(TEMPLATE); setIsEditing(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              <ListChecks size={14} /> Dùng bộ tiêu chí ảnh phim mẫu
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {drafts.map((item, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_90px_90px_auto]">
            <input value={item.name} onChange={(event) => update(index, { name: event.target.value })} placeholder="Tên tiêu chí" aria-label="Tên tiêu chí" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <label className="flex items-center gap-1 text-xs text-slate-500">Tối đa
              <input type="number" min={1} max={100} value={item.maxScore} onChange={(event) => update(index, { maxScore: Number(event.target.value) })} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-1 text-xs text-slate-500">%
              <input type="number" min={1} max={100} value={item.weight} onChange={(event) => update(index, { weight: Number(event.target.value) })} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" />
            </label>
            <button type="button" onClick={() => setDrafts((items) => items.filter((_, i) => i !== index))} aria-label="Xoá tiêu chí" className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => setDrafts((items) => [...items, { name: "", description: "", maxScore: 10, weight: 0 }])} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
          <Plus size={14} /> Thêm tiêu chí
        </button>
        <span className={`text-xs font-semibold ${Math.abs(totalWeight - 100) > 0.01 ? "text-rose-600" : "text-emerald-700"}`}>
          Tổng trọng số: {totalWeight}%
        </span>
      </div>
      {error && <p className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { setDrafts(toDrafts(criteria)); setIsEditing(false); setError(null); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600">Huỷ</button>
        <button type="button" disabled={isSaving || !drafts.length} onClick={() => void save()} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
          {isSaving ? "Đang lưu..." : "Lưu tiêu chí"}
        </button>
      </div>
    </div>
  );
}
