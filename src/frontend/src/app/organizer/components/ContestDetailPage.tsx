import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, CheckCircle2, ClipboardCheck, ClipboardList, Gift, Info, LockKeyhole, Megaphone, Pause, Play, Plus, Save, Trash2, Users, XCircle } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { organizerUserService } from "../../../services/organizerUserService";
import { submissionService } from "../../../services/submissionService";
import type { Contest, Prize } from "../../../types/contest";
import type { Submission } from "../../../types/submission";
import type { ContestManagementSettings } from "./contestManagementStorage";
import { getOrganizerContestCopy, readContestSettings, readContestSubmissionReviews, saveContestSettings, withContestSettings } from "./contestManagementStorage";
import { formatDate } from "../../../utils/formatDate";
import { CONTEST_STATUS } from "../../../utils/statusBadges";
import { StatusBadge } from "../../../components/StatusBadge";
import { ContestCover } from "./ContestCover";
import { PageHeader } from "./PageHeader";

type ManagementTab = "general" | "time" | "prizes" | "judges" | "submissions" | "settings";

const TABS: { id: ManagementTab; label: string; icon: typeof Info }[] = [
  { id: "general", label: "Thông tin chung", icon: Info },
  { id: "time", label: "Thời gian", icon: CalendarDays },
  { id: "prizes", label: "Giải thưởng", icon: Gift },
  { id: "judges", label: "Giám khảo", icon: Users },
  { id: "submissions", label: "Bài dự thi", icon: ClipboardCheck },
  { id: "settings", label: "Cài đặt", icon: Megaphone },
];

const FIELD_CLASS = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function splitItems(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function makeInitialSettings(contest: Contest, judgeList: { id: string; fullName: string; isDefault: boolean }[]): ContestManagementSettings {
  const saved = readContestSettings(contest.id);
  if (saved) return {
    ...saved,
    lifecycleStatus: saved.lifecycleStatus ?? contest.status,
    submissionOpen: saved.submissionOpen ?? contest.status !== "ENDED",
    isPaused: saved.isPaused ?? false,
    resultsPublished: saved.resultsPublished ?? false,
    submissionReviews: saved.submissionReviews ?? {},
    judgeNames: saved.judgeNames ?? contest.judgeNames ?? [],
  };
  const judgeIds = judgeList.filter((judge) => (contest.judgeNames ?? []).includes(judge.fullName)).map((judge) => judge.id);
  return {
    name: contest.name,
    description: contest.description ?? "",
    tags: contest.tags ?? [],
    criteria: ["Bố cục", "Ánh sáng", "Cảm xúc", "Kỹ thuật", "Sáng tạo"],
    maxPhotosPerPerson: 3,
    rules: "",
    startDate: contest.startDate,
    endDate: contest.endDate,
    judgingStartDate: contest.endDate,
    judgingEndDate: "",
    resultsDate: "",
    prizes: contest.prizes?.map((prize) => ({ ...prize })) ?? [],
    judgeIds,
    defaultJudgeIds: judgeList.filter((judge) => judgeIds.includes(judge.id) && judge.isDefault).map((judge) => judge.id),
    judgeNames: contest.judgeNames ?? [],
    lifecycleStatus: contest.status,
    submissionOpen: contest.status !== "ENDED",
    isPaused: false,
    resultsPublished: false,
    submissionReviews: readContestSubmissionReviews(contest.id),
  };
}

interface ContestDetailPageProps {
  contestId: string;
  onBack: () => void;
}

export function ContestDetailPage({ contestId, onBack }: ContestDetailPageProps) {
  const fetcher = useCallback(async () => getOrganizerContestCopy(contestId) ?? await contestService.getContestById(contestId), [contestId]);
  const { data: baseContest, isLoading, error } = useFetch(fetcher);
  const judges = useFetch(organizerUserService.getJudges);
  const submissions = useFetch(submissionService.getSubmissions);
  const contest = baseContest ? withContestSettings(baseContest) : null;
  const [activeTab, setActiveTab] = useState<ManagementTab>("general");
  const [draft, setDraft] = useState<ContestManagementSettings | null>(null);
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  const isEnded = contest?.status === "ENDED";
  const contestSubmissions = (submissions.data ?? []).filter((submission) => submission.contestName === contest?.name || submission.contestName === baseContest?.name);

  useEffect(() => {
    if (!baseContest || judges.isLoading) return;
    setDraft(makeInitialSettings(baseContest, judges.data ?? []));
    setNotice("");
    setSaveError("");
  }, [baseContest, judges.data, judges.isLoading]);

  const updateDraft = (changes: Partial<ContestManagementSettings>) => {
    setDraft((previous) => previous ? { ...previous, ...changes } : previous);
    setNotice("");
    setSaveError("");
  };

  const saveDraft = () => {
    if (!draft || !contest) return;
    if (!draft.name.trim()) { setSaveError("Vui lòng nhập tên cuộc thi."); return; }
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) { setSaveError("Hạn cuối nhận bài phải sau ngày bắt đầu."); return; }
    if (draft.judgingStartDate && draft.judgingEndDate && draft.judgingEndDate < draft.judgingStartDate) { setSaveError("Ngày kết thúc chấm phải sau ngày bắt đầu chấm."); return; }
    if (!isEnded && draft.prizes.some((prize) => !prize.name.trim())) { setSaveError("Vui lòng nhập tên cho tất cả giải thưởng."); setActiveTab("prizes"); return; }
    try {
      saveContestSettings(contest.id, {
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim(),
        judgeNames: (judges.data ?? []).filter((judge) => draft.judgeIds.includes(judge.id)).map((judge) => judge.fullName),
      });
      setNotice("Đã lưu thay đổi cho cuộc thi này trên trình duyệt.");
      setSaveError("");
    } catch {
      setSaveError("Không thể lưu thay đổi trên trình duyệt. Vui lòng kiểm tra dung lượng lưu trữ.");
    }
  };

  const toggleJudge = (judgeId: string) => {
    if (!draft) return;
    const isAssigned = draft.judgeIds.includes(judgeId);
    updateDraft({
      judgeIds: isAssigned ? draft.judgeIds.filter((id) => id !== judgeId) : [...draft.judgeIds, judgeId],
      defaultJudgeIds: isAssigned ? draft.defaultJudgeIds.filter((id) => id !== judgeId) : draft.defaultJudgeIds,
    });
  };

  const toggleDefaultJudge = (judgeId: string) => {
    if (!draft) return;
    const isDefault = draft.defaultJudgeIds.includes(judgeId);
    updateDraft({ defaultJudgeIds: isDefault ? draft.defaultJudgeIds.filter((id) => id !== judgeId) : [...draft.defaultJudgeIds, judgeId] });
  };

  const updatePrize = (index: number, key: keyof Prize, value: string) => {
    if (!draft) return;
    updateDraft({ prizes: draft.prizes.map((prize, prizeIndex) => prizeIndex === index ? { ...prize, [key]: value } : prize) });
  };

  const reviewSubmission = (submission: Submission, status: "APPROVED" | "REJECTED") => {
    if (!draft) return;
    updateDraft({ submissionReviews: { ...(draft.submissionReviews ?? {}), [submission.id]: status } });
  };

  return (
    <section className="space-y-5" aria-label="Quản lý cuộc thi">
      <PageHeader title={contest?.name ?? "Quản lý cuộc thi"} subtitle={contest ? `Mã cuộc thi: ${contest.id}` : "Chỉnh sửa thông tin và thiết lập cuộc thi"} onBack={onBack} />
      {isLoading && <StateMessage message="Đang tải thông tin cuộc thi..." />}
      {error && <StateMessage message={error} isError />}
      {!isLoading && !error && !baseContest && <StateMessage message="Không tìm thấy cuộc thi." isError />}
      {contest && draft && (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-36 overflow-hidden bg-slate-200 sm:h-48">
              <ContestCover title={draft.name} seed={0} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-5">
                <div><p className="text-xs font-medium text-white/80">ĐANG QUẢN LÝ</p><h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">{draft.name}</h2></div>
                <StatusBadge {...CONTEST_STATUS[contest.status]} />
              </div>
            </div>
            {isEnded && <div className="flex items-start gap-2 border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><LockKeyhole size={17} className="mt-0.5 shrink-0" aria-hidden="true" /><p>Cuộc thi đã kết thúc. Các mốc thời gian và giải thưởng đang được khóa để bảo vệ kết quả.</p></div>}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex overflow-x-auto border-b border-slate-200 px-3 pt-2 sm:px-5" role="tablist" aria-label="Các mục quản lý cuộc thi">
              {TABS.map(({ id, label, icon: Icon }, index) => (
                <button key={id} type="button" role="tab" aria-selected={activeTab === id} aria-controls="contest-management-panel" onClick={() => setActiveTab(id)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition sm:px-4 sm:text-sm ${activeTab === id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700"}`}>
                  <span className={`flex size-6 items-center justify-center rounded-full text-[10px] ${activeTab === id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{index + 1}</span>
                  <Icon size={16} aria-hidden="true" />{label}
                </button>
              ))}
            </div>

            <div id="contest-management-panel" role="tabpanel" className="min-h-72 p-4 sm:p-6">
              {activeTab === "general" && (
                <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">Tên cuộc thi
                    <input className={FIELD_CLASS} value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">Thể loại / hạng mục <span className="font-normal text-slate-400">(ngăn cách bằng dấu phẩy)</span>
                    <input className={FIELD_CLASS} value={draft.tags.join(", ")} onChange={(event) => updateDraft({ tags: splitItems(event.target.value) })} placeholder="Phong cảnh, Chân dung..." />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2">Mô tả cuộc thi
                    <textarea rows={4} className={FIELD_CLASS} value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">Tiêu chí chấm <span className="font-normal text-slate-400">(ngăn cách bằng dấu phẩy)</span>
                    <textarea rows={3} className={FIELD_CLASS} value={draft.criteria.join(", ")} onChange={(event) => updateDraft({ criteria: splitItems(event.target.value) })} placeholder="Bố cục, Ánh sáng, Sáng tạo" />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700">Số ảnh tối đa mỗi thí sinh
                    <input type="number" min={1} className={FIELD_CLASS} value={draft.maxPhotosPerPerson} onChange={(event) => updateDraft({ maxPhotosPerPerson: Math.max(1, Number(event.target.value)) })} />
                  </label>
                  <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2">Thể lệ cuộc thi
                    <textarea rows={4} className={FIELD_CLASS} value={draft.rules} onChange={(event) => updateDraft({ rules: event.target.value })} placeholder="Nhập quy định về nội dung, định dạng ảnh và điều kiện tham gia..." />
                  </label>
                </div>
              )}

              {activeTab === "time" && (
                <div className="mx-auto max-w-4xl">
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><CalendarDays size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><p>Thiết lập đủ bốn mốc cho thí sinh: thời gian nhận bài, thời gian chấm và ngày công bố kết quả.</p></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {([
                      ["Ngày bắt đầu nhận bài", "startDate"],
                      ["Hạn cuối nhận bài", "endDate"],
                      ["Bắt đầu chấm điểm", "judgingStartDate"],
                      ["Kết thúc chấm điểm", "judgingEndDate"],
                      ["Ngày công bố kết quả", "resultsDate"],
                    ] as const).map(([label, key]) => (
                      <label key={key} className="space-y-1.5 text-sm font-semibold text-slate-700">{label}
                        <input type="date" className={FIELD_CLASS} value={draft[key]} disabled={isEnded} onChange={(event) => updateDraft({ [key]: event.target.value })} />
                      </label>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-500">Thời gian nhận bài hiện tại: {formatDate(draft.startDate)} – {formatDate(draft.endDate)}</p>
                </div>
              )}

              {activeTab === "prizes" && (
                <div className="mx-auto max-w-4xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-[#0B356B]">Cơ cấu giải thưởng</h3><p className="mt-1 text-sm text-slate-500">Thêm tên giải và giá trị tương ứng.</p></div>
                    <button type="button" disabled={isEnded} onClick={() => updateDraft({ prizes: [...draft.prizes, { name: "", reward: "" }] })} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} aria-hidden="true" />Thêm giải</button>
                  </div>
                  {draft.prizes.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">Chưa có giải thưởng. Hãy thêm giải đầu tiên.</div>}
                  {draft.prizes.map((prize, index) => (
                    <div key={`${index}-${prize.name}`} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                      <label className="space-y-1.5 text-xs font-semibold text-slate-600">Tên giải
                        <input className={FIELD_CLASS} value={prize.name} disabled={isEnded} onChange={(event) => updatePrize(index, "name", event.target.value)} placeholder={`Giải ${index + 1}`} />
                      </label>
                      <label className="space-y-1.5 text-xs font-semibold text-slate-600">Giá trị giải
                        <input className={FIELD_CLASS} value={prize.reward} disabled={isEnded} onChange={(event) => updatePrize(index, "reward", event.target.value)} placeholder="Ví dụ: 10.000.000đ" />
                      </label>
                      <button type="button" disabled={isEnded} aria-label={`Xóa ${prize.name || `giải ${index + 1}`}`} onClick={() => updateDraft({ prizes: draft.prizes.filter((_, prizeIndex) => prizeIndex !== index) })} className="flex size-10 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={17} aria-hidden="true" /></button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "judges" && (
                <div className="mx-auto max-w-4xl space-y-4">
                  <div><h3 className="font-bold text-[#0B356B]">Phân công giám khảo</h3><p className="mt-1 text-sm text-slate-500">Chọn giám khảo tham gia cuộc thi và đánh dấu người chấm mặc định.</p></div>
                  {judges.isLoading && <StateMessage message="Đang tải danh sách giám khảo..." />}
                  {judges.error && <StateMessage message={judges.error} isError />}
                  {judges.data?.filter((judge) => judge.status === "ACTIVE").map((judge) => {
                    const selected = draft.judgeIds.includes(judge.id);
                    const isDefault = draft.defaultJudgeIds.includes(judge.id);
                    return (
                      <div key={judge.id} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${selected ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-white"}`}>
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                          <input type="checkbox" checked={selected} onChange={() => toggleJudge(judge.id)} className="size-4 accent-blue-600" />
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">{judge.fullName.trim().slice(0, 1)}</span>
                          <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-800">{judge.fullName}</span><span className="block truncate text-xs text-slate-500">{judge.specialty}</span></span>
                        </label>
                        {selected && <button type="button" role="switch" aria-checked={isDefault} onClick={() => toggleDefaultJudge(judge.id)} className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold transition sm:self-auto ${isDefault ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}><Check size={14} aria-hidden="true" />{isDefault ? "Chấm mặc định" : "Đặt chấm mặc định"}</button>}
                      </div>
                    );
                  })}
                  {judges.data && judges.data.every((judge) => judge.status !== "ACTIVE") && <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">Chưa có giám khảo đang hoạt động.</p>}
                  <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><ClipboardList size={16} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />Phân công giám khảo được quản lý tập trung tại đây theo từng cuộc thi.</div>
                </div>
              )}

              {activeTab === "submissions" && (
                <div className="mx-auto max-w-5xl space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-2"><div><h3 className="font-bold text-[#0B356B]">Bài dự thi của cuộc thi</h3><p className="mt-1 text-sm text-slate-500">Duyệt hoặc từ chối bài dự thi. Thay đổi được lưu trong Organizer.</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{contestSubmissions.length} bài</span></div>
                  {submissions.isLoading && <StateMessage message="Đang tải danh sách bài dự thi..." />}
                  {submissions.error && <StateMessage message={submissions.error} isError />}
                  {submissions.data && contestSubmissions.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">Chưa có bài dự thi cho cuộc thi này.</div>}
                  {contestSubmissions.map((submission) => {
                    const review = draft.submissionReviews?.[submission.id];
                    const statusLabel = review === "APPROVED" ? "Đã duyệt" : review === "REJECTED" ? "Đã từ chối" : submission.status === "VALID" ? "Hợp lệ" : "Chờ duyệt";
                    const statusTone = review === "REJECTED" ? "bg-rose-50 text-rose-700" : review === "APPROVED" || submission.status === "VALID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";
                    return (
                      <article key={submission.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">{submission.code.slice(-3)}</span><div className="min-w-0"><p className="truncate font-semibold text-[#0B356B]">{submission.title}</p><p className="mt-0.5 text-xs text-slate-500">{submission.authorName} · {formatDate(submission.submittedAt)}</p></div></div>
                        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>{statusLabel}</span>
                        <div className="flex shrink-0 gap-2">
                          <button type="button" onClick={() => reviewSubmission(submission, "APPROVED")} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"><CheckCircle2 size={14} aria-hidden="true" />Duyệt</button>
                          <button type="button" onClick={() => reviewSubmission(submission, "REJECTED")} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"><XCircle size={14} aria-hidden="true" />Từ chối</button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="mx-auto max-w-4xl space-y-3">
                  <div className="mb-5"><h3 className="font-bold text-[#0B356B]">Trạng thái cuộc thi</h3><p className="mt-1 text-sm text-slate-500">Thay đổi trạng thái sẽ được áp dụng sau khi lưu.</p></div>
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-semibold text-slate-800">Nhận bài dự thi</p><p className="mt-1 text-sm text-slate-500">Mở hoặc đóng cổng nhận bài của cuộc thi.</p></div>
                    <button type="button" role="switch" aria-checked={draft.submissionOpen ?? true} onClick={() => updateDraft({ submissionOpen: !(draft.submissionOpen ?? true) })} className={`rounded-full px-4 py-2 text-xs font-bold ${draft.submissionOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{draft.submissionOpen ? "Đang mở" : "Đã đóng"}</button>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-semibold text-slate-800">Tạm dừng cuộc thi</p><p className="mt-1 text-sm text-slate-500">Tạm ngưng hoạt động và có thể tiếp tục lại sau.</p></div>
                    <button type="button" role="switch" aria-checked={draft.isPaused ?? false} onClick={() => updateDraft({ isPaused: !draft.isPaused })} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${draft.isPaused ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>{draft.isPaused ? <Play size={14} /> : <Pause size={14} />}{draft.isPaused ? "Đang tạm dừng" : "Đang hoạt động"}</button>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-semibold text-slate-800">Công bố kết quả</p><p className="mt-1 text-sm text-slate-500">{isEnded ? "Cho phép thí sinh xem kết quả cuộc thi." : "Chỉ có thể công bố sau khi cuộc thi kết thúc."}</p></div>
                    <button type="button" role="switch" aria-checked={draft.resultsPublished ?? false} disabled={!isEnded} onClick={() => updateDraft({ resultsPublished: !draft.resultsPublished })} className={`rounded-full px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${draft.resultsPublished ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{draft.resultsPublished ? "Đã công bố" : "Chưa công bố"}</button>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-semibold text-rose-900">Kết thúc cuộc thi</p><p className="mt-1 text-sm text-rose-700">Kết thúc sẽ khóa chỉnh sửa thời gian và giải thưởng.</p></div>
                    <button type="button" disabled={isEnded} onClick={() => updateDraft({ lifecycleStatus: "ENDED", submissionOpen: false, isPaused: false })} className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"><LockKeyhole size={14} aria-hidden="true" />{isEnded ? "Đã kết thúc" : "Kết thúc cuộc thi"}</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-h-5 text-sm">{saveError ? <p role="alert" className="text-rose-700">{saveError}</p> : notice ? <p role="status" className="text-emerald-700">{notice}</p> : <p className="text-slate-500">Các thay đổi được lưu riêng trong phiên Organizer trên trình duyệt này.</p>}</div>
              <button type="button" onClick={saveDraft} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"><Save size={16} aria-hidden="true" />Lưu thay đổi</button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
