import { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Layers,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import type { Contest } from "../../../types/contest";
import type { Judge } from "../../../types/organizerUser";
import type { Submission } from "../../../types/submission";
import { OrganizerAvatar } from "./OrganizerAvatar";
import { PageHeader } from "./PageHeader";
import { readContestSettings } from "./contestManagementStorage";
import { formatDate } from "../../../utils/formatDate";

export type DistributionMethod = "ALL_JUDGE_ALL" | "EQUAL" | "SPECIALTY";

interface AssignmentCreatePageProps {
  mode: "AUTO" | "MANUAL";
  contests: Contest[];
  activeJudges: Judge[];
  selectedContestId: string;
  onSelectContestId: (id: string) => void;
  judgeIds: string[];
  onToggleJudge: (id: string) => void;
  onSelectAllJudges: () => void;
  onClearJudges: () => void;
  eligibleSubmissions: Submission[];
  onConfirm: (deadline?: string) => void;
  onBack: () => void;
}

export function AssignmentCreatePage({
  mode,
  contests,
  activeJudges,
  selectedContestId,
  onSelectContestId,
  judgeIds,
  onToggleJudge,
  onSelectAllJudges,
  onClearJudges,
  eligibleSubmissions,
  onConfirm,
  onBack,
}: AssignmentCreatePageProps) {
  const [distributionMode, setDistributionMode] = useState<DistributionMethod>("ALL_JUDGE_ALL");
  const [deadline, setDeadline] = useState<string>("");

  const selectedContest = useMemo(
    () => contests.find((c) => c.id === selectedContestId),
    [contests, selectedContestId]
  );

  useEffect(() => {
    if (selectedContest) {
      const existing = readContestSettings(selectedContest.id)?.judgingEndDate;
      if (existing) {
        setDeadline(existing);
      } else {
        const base = selectedContest.endDate ? new Date(selectedContest.endDate) : new Date();
        const d = isNaN(base.getTime()) ? new Date() : base;
        d.setDate(d.getDate() + 14);
        setDeadline(d.toISOString().slice(0, 10));
      }
    }
  }, [selectedContest]);

  const setDaysFromNow = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDeadline(d.toISOString().slice(0, 10));
  };

  const selectedJudges = useMemo(
    () => activeJudges.filter((judge) => judgeIds.includes(judge.id)),
    [activeJudges, judgeIds]
  );

  const contestDeadline = useMemo(() => {
    if (!selectedContest) return null;
    return readContestSettings(selectedContest.id)?.judgingEndDate ?? null;
  }, [selectedContest]);

  // Phân bổ danh sách bài cho từng giám khảo
  const previewAssignments = useMemo(() => {
    if (!selectedJudges.length || !eligibleSubmissions.length) return [];

    if (distributionMode === "ALL_JUDGE_ALL") {
      // Tất cả giám khảo cùng chấm toàn bộ các bài dự thi
      return selectedJudges.map((judge) => ({
        judge,
        count: eligibleSubmissions.length,
        submissions: eligibleSubmissions,
      }));
    }

    if (distributionMode === "SPECIALTY") {
      // Phân theo chuyên môn sơ bộ
      return selectedJudges.map((judge, idx) => {
        const share = Math.ceil(eligibleSubmissions.length / selectedJudges.length);
        const start = idx * share;
        const subs = eligibleSubmissions.slice(start, start + share);
        return {
          judge,
          count: subs.length,
          submissions: subs,
        };
      });
    }

    // Chia đều
    return selectedJudges.map((judge, idx) => {
      const assigned = eligibleSubmissions.filter((_, i) => i % selectedJudges.length === idx);
      return {
        judge,
        count: assigned.length,
        submissions: assigned,
      };
    });
  }, [selectedJudges, eligibleSubmissions, distributionMode]);

  const canSubmit = Boolean(selectedContest && selectedJudges.length > 0 && eligibleSubmissions.length > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header riêng biệt của Trang Phân Công */}
      <PageHeader
        eyebrow="QUY TRÌNH PHÂN CÔNG GIÁM KHẢO"
        title={mode === "AUTO" ? "Tự động phân công giám khảo" : "Phân công giám khảo chấm bài"}
        subtitle="Chọn cuộc thi, lựa chọn hội đồng giám khảo và kích hoạt phân công chấm điểm cho các tác phẩm dự thi"
        onBack={onBack}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <X size={16} /> Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => onConfirm(deadline)}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Check size={16} /> Xác nhận phân công & Gửi thông báo
            </button>
          </div>
        }
      />

      {/* Thông điệp hướng dẫn & cam kết */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-900 shadow-xs">
        <Sparkles className="size-5 shrink-0 text-blue-600 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-blue-900">Quy trình phân công trực tiếp & Thông báo tức thời</p>
          <p className="mt-0.5 text-blue-700 text-xs sm:text-sm">
            Khi hoàn tất phân công, toàn bộ bài thi hợp lệ của cuộc thi sẽ được đưa vào hàng đợi chấm của các giám khảo đã chọn. Chuông thông báo của giám khảo và ban tổ chức sẽ hiện số đỏ thông báo ngay lập tức.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Cột trái: Thiết lập cuộc thi & Giám khảo (8 cột) */}
        <div className="space-y-6 lg:col-span-8">
          {/* BƯỚC 1: CHỌN CUỘC THI */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">1</span>
                <div>
                  <h2 className="font-bold text-[#0B356B]">Chọn cuộc thi cần phân công chấm</h2>
                  <p className="text-xs text-slate-500">Mỗi lần phân công áp dụng cho một cuộc thi nhiếp ảnh</p>
                </div>
              </div>
              <Trophy className="size-5 text-slate-400" />
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="contest-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Danh sách cuộc thi hiện có
                </label>
                <select
                  id="contest-select"
                  value={selectedContestId}
                  onChange={(e) => onSelectContestId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Vui lòng chọn cuộc thi --</option>
                  {contests.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.tags?.length ? `(${c.tags.join(", ")})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedContest && (
                <div className="grid gap-3 sm:grid-cols-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block">Số bài thi hợp lệ</span>
                    <span className="text-base font-bold text-blue-700">
                      {eligibleSubmissions.length} tác phẩm
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block">Trạng thái</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={13} /> {selectedContest.status === "ONGOING" ? "Đang diễn ra" : selectedContest.status === "UPCOMING" ? "Sắp diễn ra" : "Đã kết thúc"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block">Hạn chót hiện tại</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {contestDeadline ? formatDate(contestDeadline) : "Chưa thiết lập"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* BƯỚC 2: THIẾT LẬP HẠN CHÓT CHẤM BÀI */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">2</span>
                <div>
                  <h2 className="font-bold text-[#0B356B]">Thiết lập Hạn chót chấm bài (Deadline)</h2>
                  <p className="text-xs text-slate-500">Giám khảo cần hoàn thành tất cả bảng điểm trước thời hạn này</p>
                </div>
              </div>
              <Calendar className="size-5 text-slate-400" />
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="judging-deadline" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ngày kết thúc chấm điểm
                  </label>
                  <input
                    id="judging-deadline"
                    type="date"
                    value={deadline}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Chọn nhanh thời gian chấm
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDaysFromNow(7)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                    >
                      +7 ngày
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysFromNow(14)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                    >
                      +14 ngày
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysFromNow(30)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                    >
                      +30 ngày
                    </button>
                  </div>
                </div>
              </div>

              {deadline && (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                  <Clock3 size={15} className="text-blue-600 shrink-0" />
                  <span>
                    Hạn chót chấm bài chính thức: <b className="text-slate-800">{formatDate(deadline)}</b>
                    {new Date(`${deadline}T23:59:59`).getTime() >= Date.now() ? (
                      <span className="text-blue-700 font-medium"> (còn {Math.max(0, Math.ceil((new Date(`${deadline}T23:59:59`).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} ngày)</span>
                    ) : (
                      <span className="text-rose-600 font-medium"> (Hạn này đã qua)</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* BƯỚC 3: CHỌN GIÁM KHẢO */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">3</span>
                <div>
                  <h2 className="font-bold text-[#0B356B]">
                    Chọn Giám khảo trong hội đồng ({selectedJudges.length}/{activeJudges.length} đã chọn)
                  </h2>
                  <p className="text-xs text-slate-500">Các giám khảo được đánh dấu sẽ được quyền chấm bài thi của cuộc thi này</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSelectAllJudges}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={onClearJudges}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {activeJudges.map((judge) => {
                const isChecked = judgeIds.includes(judge.id);
                return (
                  <div
                    key={judge.id}
                    onClick={() => onToggleJudge(judge.id)}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition select-none ${
                      isChecked
                        ? "border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleJudge(judge.id)}
                      className="mt-1 size-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                    />
                    <OrganizerAvatar name={judge.fullName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-slate-800 truncate">{judge.fullName}</span>
                        {judge.isDefault && (
                          <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            Chính
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{judge.email}</p>
                      <div className="mt-1">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {judge.specialty}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* BƯỚC 4: PHƯƠNG THỨC CHẤM & PHÂN BỔ */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">4</span>
              <div>
                <h2 className="font-bold text-[#0B356B]">Phương thức phân bổ bài thi</h2>
                <p className="text-xs text-slate-500">Quy định cách các bài thi được gán cho từng giám khảo</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setDistributionMode("ALL_JUDGE_ALL")}
                className={`flex flex-col text-left rounded-xl border p-4 transition ${
                  distributionMode === "ALL_JUDGE_ALL"
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Khuyên dùng</span>
                  {distributionMode === "ALL_JUDGE_ALL" && <CheckCircle2 size={16} className="text-blue-600" />}
                </div>
                <span className="mt-1 font-semibold text-sm text-slate-800">Tất cả cùng chấm</span>
                <span className="mt-1 text-xs text-slate-500">
                  Toàn bộ giám khảo được chọn sẽ cùng chấm tất cả bài thi của cuộc thi.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDistributionMode("EQUAL")}
                className={`flex flex-col text-left rounded-xl border p-4 transition ${
                  distributionMode === "EQUAL"
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Chia đều</span>
                  {distributionMode === "EQUAL" && <CheckCircle2 size={16} className="text-blue-600" />}
                </div>
                <span className="mt-1 font-semibold text-sm text-slate-800">Chia đều số lượng</span>
                <span className="mt-1 text-xs text-slate-500">
                  Số lượng bài dự thi được chia đều lần lượt cho từng giám khảo.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDistributionMode("SPECIALTY")}
                className={`flex flex-col text-left rounded-xl border p-4 transition ${
                  distributionMode === "SPECIALTY"
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Chuyên môn</span>
                  {distributionMode === "SPECIALTY" && <CheckCircle2 size={16} className="text-blue-600" />}
                </div>
                <span className="mt-1 font-semibold text-sm text-slate-800">Theo chuyên môn</span>
                <span className="mt-1 text-xs text-slate-500">
                  Phân công theo thể loại phim, phong cách và chuyên môn của giám khảo.
                </span>
              </button>
            </div>
          </section>
        </div>

        {/* Cột phải: Xem trước kết quả & Hành động (4 cột) */}
        <div className="space-y-6 lg:col-span-4 sticky top-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-base text-[#0B356B] pb-3 border-b border-slate-100 flex items-center gap-2">
              <ClipboardList size={18} className="text-blue-600" />
              Xem trước kết quả phân công
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Cuộc thi:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px] text-right">
                  {selectedContest ? selectedContest.name : "Chưa chọn"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Hạn chót chấm bài:</span>
                <span className="font-bold text-amber-700">
                  {deadline ? formatDate(deadline) : "Chưa thiết lập"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tổng số bài thi:</span>
                <span className="font-bold text-blue-700">{eligibleSubmissions.length} tác phẩm</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Giám khảo tham gia:</span>
                <span className="font-semibold text-slate-800">{selectedJudges.length} người</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Chế độ phân bổ:</span>
                <span className="font-semibold text-slate-800">
                  {distributionMode === "ALL_JUDGE_ALL"
                    ? "Tất cả cùng chấm"
                    : distributionMode === "EQUAL"
                    ? "Chia đều"
                    : "Theo chuyên môn"}
                </span>
              </div>
            </div>

            {/* Chi tiết từng giám khảo */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Bài được giao theo từng giám khảo
              </h4>

              {previewAssignments.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {previewAssignments.map(({ judge, count }) => (
                    <div
                      key={judge.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <OrganizerAvatar name={judge.fullName} />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate">{judge.fullName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{judge.specialty}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 font-bold text-blue-800">
                        {count} bài
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500 border border-dashed border-slate-200">
                  {!selectedContest
                    ? "Vui lòng chọn cuộc thi ở Bước 1"
                    : !selectedJudges.length
                    ? "Vui lòng chọn ít nhất 1 giám khảo ở Bước 2"
                    : "Cuộc thi chưa có bài dự thi nào."}
                </div>
              )}
            </div>

            {/* Cảnh báo nếu chưa hợp lệ */}
            {!canSubmit && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
                <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                <span>Hãy chọn cuộc thi và ít nhất 1 giám khảo để hoàn tất phân công.</span>
              </div>
            )}

            {/* Nút lưu & phân công */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => onConfirm(deadline)}
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Check size={16} /> Xác nhận phân công
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Quay lại danh sách phân công
              </button>
            </div>
          </section>

          {/* Hộp thông báo chuông */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Bell size={15} className="text-blue-600" />
              Tự động kích hoạt chuông thông báo
            </div>
            <p className="leading-relaxed text-slate-500">
              Sau khi xác nhận, thông báo phân công sẽ lập tức được gửi đến cổng Giám khảo và hiển thị huy hiệu đỏ trên thanh điều hướng.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
