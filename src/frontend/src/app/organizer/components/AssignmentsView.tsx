import { useEffect, useState } from "react";
import { AlertTriangle, Bell, Check, ChevronLeft, ChevronRight, ClipboardList, Clock3, Eye, Filter, Plus, Search, UserRoundCheck, X } from "lucide-react";
import { Modal } from "../../../components/Modal";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { organizerUserService } from "../../../services/organizerUserService";
import { submissionService } from "../../../services/submissionService";
import type { Contest } from "../../../types/contest";
import type { Judge } from "../../../types/organizerUser";
import type { OrganizerViewProps } from "../../../types/organizer";
import type { Submission } from "../../../types/submission";
import { formatDate } from "../../../utils/formatDate";
import { readContestSettings } from "./contestManagementStorage";
import { readManagedAssignments, seedAdditionalManagedAssignmentsOnce, seedManagedAssignmentsOnce, writeManagedAssignments, type ManagedAssignment } from "./assignmentManagementStorage";
import { readOrganizerOnlyJudges, seedOrganizerJudgesOnce, SAMPLE_ORGANIZER_JUDGES } from "./organizerJudgeStorage";
import { OrganizerAvatar } from "./OrganizerAvatar";
import { OrganizerPageHeader } from "./OrganizerPageHeader";
import { PageHeader } from "./PageHeader";

type Distribution = "EQUAL" | "SPECIALTY" | "MANUAL";
type AssignmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
type AssignmentFilter = "ALL" | AssignmentStatus;
type AssignmentRow = {
  assignment: ManagedAssignment;
  contest: Contest;
  judge: Judge;
  submissionIds: string[];
  reviewedIds: string[];
  deadline: string;
  status: AssignmentStatus;
  progress: number;
};
type PreviewLine = { judge: Judge; submissions: Submission[] };

const PAGE_SIZE = 10;
const FILTERS: { id: AssignmentFilter; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "NOT_STARTED", label: "Chưa bắt đầu" },
  { id: "IN_PROGRESS", label: "Đang chấm" },
  { id: "COMPLETED", label: "Hoàn thành" },
  { id: "OVERDUE", label: "Quá hạn" },
];
const STATUS_TEXT: Record<AssignmentStatus, string> = {
  NOT_STARTED: "Chưa bắt đầu",
  IN_PROGRESS: "Đang chấm",
  COMPLETED: "Hoàn thành",
  OVERDUE: "Quá hạn",
};
const STATUS_STYLE: Record<AssignmentStatus, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  OVERDUE: "bg-rose-50 text-rose-700",
};

function normalized(value: string): string {
  return value.toLocaleLowerCase("vi-VN").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function statusOf(reviewed: number, assigned: number, deadline: string): AssignmentStatus {
  if (assigned > 0 && reviewed >= assigned) return "COMPLETED";
  if (deadline && deadline < new Date().toISOString().slice(0, 10)) return "OVERDUE";
  return reviewed > 0 ? "IN_PROGRESS" : "NOT_STARTED";
}

function deadlineOf(contest: Contest): string {
  return readContestSettings(contest.id)?.judgingEndDate ?? "";
}

function allocateByExpertise(submissions: Submission[], judges: Judge[], contest: Contest): PreviewLine[] {
  const allocations = new Map(judges.map((judge) => [judge.id, [] as Submission[]]));
  const topics = normalized(`${contest.name} ${(contest.tags ?? []).join(" ")}`);
  const roundRobin = [...judges].sort((a, b) => a.fullName.localeCompare(b.fullName, "vi"));
  let fallbackIndex = 0;
  for (const submission of submissions) {
    const submissionTopics = normalized(`${submission.title} ${submission.metadata.filmStock} ${submission.metadata.location} ${topics}`);
    const specialized = judges.find((judge) => {
      const expertise = normalized(judge.specialty);
      if (expertise.includes("nhiep anh phim") || expertise.includes("film")) return Boolean(submission.metadata.filmStock);
      return expertise.split(/\s+/).filter((word) => word.length > 3).some((word) => submissionTopics.includes(word));
    });
    const judge = specialized ?? roundRobin[fallbackIndex++ % roundRobin.length];
    allocations.get(judge.id)?.push(submission);
  }
  return judges.map((judge) => ({ judge, submissions: allocations.get(judge.id) ?? [] }));
}

function distribute(submissions: Submission[], judges: Judge[], contest: Contest, method: Distribution, manualCounts: Record<string, number>): PreviewLine[] {
  if (!judges.length) return [];
  if (method === "SPECIALTY") return allocateByExpertise(submissions, judges, contest);
  const allocations = new Map(judges.map((judge) => [judge.id, [] as Submission[]]));
  if (method === "MANUAL") {
    let cursor = 0;
    for (const judge of judges) {
      const count = Math.max(0, Math.min(manualCounts[judge.id] ?? 0, submissions.length - cursor));
      allocations.get(judge.id)?.push(...submissions.slice(cursor, cursor + count));
      cursor += count;
    }
  } else {
    submissions.forEach((submission, index) => allocations.get(judges[index % judges.length].id)?.push(submission));
  }
  return judges.map((judge) => ({ judge, submissions: allocations.get(judge.id) ?? [] }));
}

function AssignmentDetail({ row, submissions, onBack, onRemind, onOpenSubmission }: {
  row: AssignmentRow;
  submissions: Submission[];
  onBack: () => void;
  onRemind: () => void;
  onOpenSubmission: (id: string) => void;
}) {
  const [notice, setNotice] = useState("");
  const items = row.submissionIds.map((id) => submissions.find((submission) => submission.id === id)).filter((submission): submission is Submission => Boolean(submission));
  return <section className="space-y-5">
    <PageHeader title={row.judge.fullName} subtitle={`${row.judge.specialty} · ${row.contest.name}`} eyebrow="CHI TIẾT PHÂN CÔNG" onBack={onBack} action={<button type="button" onClick={() => { onRemind(); setNotice(`Đã ghi nhận lời nhắc chấm cho ${row.judge.fullName}.`); }} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"><Bell size={16} />Gửi nhắc chấm</button>} />
    {notice && <p role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">{notice}</p>}
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><OrganizerAvatar name={row.judge.fullName} /><div><p className="font-semibold text-[#0B356B]">{row.judge.fullName}</p><p className="text-sm text-slate-500">{row.judge.specialty} · {row.contest.name}</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[row.status]}`}>{STATUS_TEXT[row.status]}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Bài được giao</p><p className="mt-1 text-xl font-bold text-[#0B356B]">{row.submissionIds.length}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Đã chấm</p><p className="mt-1 text-xl font-bold text-[#0B356B]">{row.reviewedIds.length} / {row.submissionIds.length}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Hạn chấm</p><p className="mt-1 text-sm font-semibold text-[#0B356B]">{row.deadline ? formatDate(row.deadline) : "Chưa thiết lập"}</p></div></div></article>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold text-[#0B356B]">Danh sách bài được giao</h2><p className="mt-1 text-xs text-slate-500">Điểm số sẽ hiện tại đây khi dữ liệu chấm được kết nối.</p></div>{items.length ? <div className="divide-y divide-slate-100">{items.map((submission) => <article key={submission.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold text-slate-800">{submission.title}</p><p className="mt-1 text-xs text-slate-500">{submission.code} · {submission.authorName} · Nộp {formatDate(submission.submittedAt)}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.reviewedIds.includes(submission.id) ? STATUS_STYLE.COMPLETED : STATUS_STYLE.NOT_STARTED}`}>{row.reviewedIds.includes(submission.id) ? "Đã chấm" : "Chưa chấm"}</span><button type="button" onClick={() => onOpenSubmission(submission.id)} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">Xem bài</button></div></article>)}</div> : <p className="px-5 py-10 text-center text-sm text-slate-500">Chưa có bài chi tiết gắn với phân công này.</p>}</div>
  </section>;
}

export function AssignmentsView({ onNavigate }: OrganizerViewProps) {
  const contestsQuery = useFetch(contestService.getContests);
  const judgesQuery = useFetch(organizerUserService.getJudges);
  const submissionsQuery = useFetch(submissionService.getSubmissions);
  const [managed, setManaged] = useState(readManagedAssignments);
  const [contestFilter, setContestFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<AssignmentFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [dialog, setDialog] = useState<"AUTO" | "MANUAL" | null>(null);
  const [dialogContestId, setDialogContestId] = useState("");
  const [judgeIds, setJudgeIds] = useState<string[]>([]);
  const [distribution, setDistribution] = useState<Distribution>("EQUAL");
  const [manualCounts, setManualCounts] = useState<Record<string, number>>({});
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reassignRow, setReassignRow] = useState<AssignmentRow | null>(null);
  const [newJudgeId, setNewJudgeId] = useState("");
  const [revokeRow, setRevokeRow] = useState<AssignmentRow | null>(null);
  const [notice, setNotice] = useState("");
  const [localJudges, setLocalJudges] = useState(readOrganizerOnlyJudges);

  const contests = contestsQuery.data ?? [];
  const judges = [...(judgesQuery.data ?? []), ...localJudges];
  const submissions = submissionsQuery.data ?? [];
  const activeJudges = judges.filter((judge) => judge.status === "ACTIVE");

  useEffect(() => {
    setLocalJudges(seedOrganizerJudgesOnce());
  }, []);

  useEffect(() => {
    if (!contestsQuery.data || !judgesQuery.data || !submissionsQuery.data) return;
    const active = [...judgesQuery.data, ...localJudges].filter((judge) => judge.status === "ACTIVE");
    const eligible = submissionsQuery.data.filter((submission) => submission.status === "VALID").sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)).slice(0, 2);
    const usedJudgeIds = new Set<string>();
    const seed: ManagedAssignment[] = eligible.flatMap((submission, index) => {
      const contest = contestsQuery.data?.find((item) => item.name === submission.contestName);
      if (!contest || !active.length) return [];
      const preferred = active.find((judge) => (contest.judgeNames ?? []).includes(judge.fullName) && !usedJudgeIds.has(judge.id));
      const defaultJudge = active.find((judge) => judge.isDefault && !usedJudgeIds.has(judge.id));
      const judge = preferred ?? defaultJudge ?? active[index % active.length];
      usedJudgeIds.add(judge.id);
      return [{ id: `seed-${contest.id}-${judge.id}`, contestId: contest.id, judgeId: judge.id, submissionIds: [submission.id], reviewedSubmissionIds: [], remindersSent: 0, updatedAt: new Date().toISOString() }];
    });
    const initial = seedManagedAssignmentsOnce(seed);
    if (initial) setManaged(initial);
    const extraSeed: ManagedAssignment[] = SAMPLE_ORGANIZER_JUDGES.flatMap((judge, index) => {
      const targetName = index === 0 ? "Analog Moments 2025" : "Film & City";
      const contest = contestsQuery.data?.find((item) => item.name === targetName);
      const submission = submissionsQuery.data?.filter((item) => item.contestName === targetName && item.status === "VALID").sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))[index === 2 ? 1 : 0];
      if (!contest || !submission) return [];
      return [{ id: `seed-${contest.id}-${judge.id}`, contestId: contest.id, judgeId: judge.id, submissionIds: [submission.id], reviewedSubmissionIds: [], remindersSent: 0, updatedAt: new Date().toISOString() }];
    });
    const extras = seedAdditionalManagedAssignmentsOnce(extraSeed);
    if (extras) setManaged(extras);
  }, [contestsQuery.data, judgesQuery.data, submissionsQuery.data, localJudges]);

  const contestById = (id: string) => contests.find((contest) => contest.id === id);
  const judgeById = (id: string) => judges.find((judge) => judge.id === id);
  const rows: AssignmentRow[] = managed.flatMap((assignment) => {
    const contest = contestById(assignment.contestId);
    const judge = judgeById(assignment.judgeId);
    if (!contest || !judge) return [];
    const deadline = deadlineOf(contest);
    return [{ assignment, contest, judge, submissionIds: assignment.submissionIds, reviewedIds: assignment.reviewedSubmissionIds, deadline, status: statusOf(assignment.reviewedSubmissionIds.length, assignment.submissionIds.length, deadline), progress: assignment.submissionIds.length ? Math.round(assignment.reviewedSubmissionIds.length / assignment.submissionIds.length * 100) : 0 }];
  });
  const filteredForContest = contestFilter === "ALL" ? rows : rows.filter((row) => row.contest.id === contestFilter);
  const statusCounts = FILTERS.reduce((counts, filter) => ({ ...counts, [filter.id]: filter.id === "ALL" ? filteredForContest.length : filteredForContest.filter((row) => row.status === filter.id).length }), {} as Record<AssignmentFilter, number>);
  const filteredRows = filteredForContest.filter((row) => {
    const query = keyword.trim().toLocaleLowerCase("vi-VN");
    const matchText = !query || `${row.judge.fullName} ${row.judge.specialty} ${row.contest.name}`.toLocaleLowerCase("vi-VN").includes(query);
    return matchText && (statusFilter === "ALL" || row.status === statusFilter);
  });
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedContest = contests.find((contest) => contest.id === dialogContestId);
  const eligibleSubmissions = selectedContest ? submissions.filter((submission) => submission.contestName === selectedContest.name && submission.status === "VALID" && !managed.some((assignment) => assignment.contestId === selectedContest.id && assignment.submissionIds.includes(submission.id))) : [];
  const selectedJudges = judgeIds.map(judgeById).filter((judge): judge is Judge => Boolean(judge && judge.status === "ACTIVE"));
  const preview = selectedContest ? distribute(eligibleSubmissions, selectedJudges, selectedContest, dialog === "AUTO" ? "EQUAL" : distribution, manualCounts) : [];
  const allocatedCount = preview.reduce((total, item) => total + item.submissions.length, 0);
  const manualRequestedCount = selectedJudges.reduce((total, judge) => total + Math.max(0, manualCounts[judge.id] ?? 0), 0);
  const manualOverAllocated = dialog === "MANUAL" && distribution === "MANUAL" && manualRequestedCount > eligibleSubmissions.length;
  const currentContestAssignments = contestFilter === "ALL" ? rows : rows.filter((row) => row.contest.id === contestFilter);
  const metricsContestId = contestFilter === "ALL" ? "ALL" : contestFilter;
  const metricEligible = submissions.filter((submission) => (metricsContestId === "ALL" || submission.contestName === contestById(metricsContestId)?.name) && submission.status === "VALID" && !managed.some((assignment) => assignment.submissionIds.includes(submission.id))).length;
  const assignedJudgeIds = new Set(currentContestAssignments.map((row) => row.judge.id));
  const noWorkCount = activeJudges.filter((judge) => !assignedJudgeIds.has(judge.id)).length;
  const totalAssigned = currentContestAssignments.reduce((total, row) => total + row.submissionIds.length, 0);
  const totalReviewed = currentContestAssignments.reduce((total, row) => total + row.reviewedIds.length, 0);
  const overallProgress = totalAssigned ? Math.round(totalReviewed / totalAssigned * 100) : 0;

  const persist = (next: ManagedAssignment[]) => { setManaged(next); writeManagedAssignments(next); };
  const openDialog = (kind: "AUTO" | "MANUAL") => {
    const defaults = activeJudges.filter((judge) => judge.isDefault);
    setJudgeIds((defaults.length ? defaults : activeJudges).map((judge) => judge.id));
    setDialogContestId(contestFilter === "ALL" ? contests[0]?.id ?? "" : contestFilter);
    setDistribution("EQUAL");
    setManualCounts({});
    setDialog(kind);
  };
  const toggleJudge = (id: string) => setJudgeIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const confirmAssignment = () => {
    if (!selectedContest || !preview.length || allocatedCount === 0) return;
    let next = [...managed];
    for (const line of preview) {
      if (!line.submissions.length) continue;
      const found = next.find((item) => item.contestId === selectedContest.id && item.judgeId === line.judge.id);
      if (found) next = next.map((item) => item.id === found.id ? { ...item, submissionIds: [...new Set([...item.submissionIds, ...line.submissions.map((submission) => submission.id)])], updatedAt: new Date().toISOString() } : item);
      else next.push({ id: `asg-${Date.now()}-${line.judge.id}`, contestId: selectedContest.id, judgeId: line.judge.id, submissionIds: line.submissions.map((submission) => submission.id), reviewedSubmissionIds: [], remindersSent: 0, updatedAt: new Date().toISOString() });
    }
    persist(next);
    setNotice(`Đã phân công ${allocatedCount} bài cho ${preview.filter((line) => line.submissions.length).length} giám khảo.`);
    setDialog(null);
  };
  const remind = (row: AssignmentRow) => {
    persist(managed.map((item) => item.id === row.assignment.id ? { ...item, remindersSent: item.remindersSent + 1, updatedAt: new Date().toISOString() } : item));
    setNotice(`Đã ghi nhận lời nhắc chấm cho ${row.judge.fullName}.`);
  };
  const reassign = () => {
    if (!reassignRow || !newJudgeId) return;
    if (reassignRow.reviewedIds.length && !window.confirm("Phân công này đã có bài được chấm. Đổi giám khảo có thể ảnh hưởng dữ liệu điểm đã có. Bạn vẫn muốn tiếp tục?")) return;
    const existing = managed.find((item) => item.contestId === reassignRow.contest.id && item.judgeId === newJudgeId);
    let next = managed.filter((item) => item.id !== reassignRow.assignment.id);
    if (existing) next = next.map((item) => item.id === existing.id ? { ...item, submissionIds: [...new Set([...item.submissionIds, ...reassignRow.submissionIds])], reviewedSubmissionIds: [...new Set([...item.reviewedSubmissionIds, ...reassignRow.reviewedIds])], updatedAt: new Date().toISOString() } : item);
    else next.push({ ...reassignRow.assignment, id: `asg-${Date.now()}-${newJudgeId}`, judgeId: newJudgeId, updatedAt: new Date().toISOString() });
    persist(next);
    setReassignRow(null);
    setNotice("Đã đổi giám khảo được phân công.");
  };
  const revoke = () => {
    if (!revokeRow) return;
    if (revokeRow.reviewedIds.length && !window.confirm("Phân công này đã có bài được chấm. Thu hồi có thể ảnh hưởng điểm đã có. Bạn vẫn muốn tiếp tục?")) return;
    persist(managed.filter((item) => item.id !== revokeRow.assignment.id));
    if (detailId === revokeRow.assignment.id) setDetailId(null);
    setRevokeRow(null);
    setNotice("Đã thu hồi phân công; các bài được trả về danh sách chưa phân công.");
  };

  const detailRow = rows.find((row) => row.assignment.id === detailId);
  const resetFilters = () => { setKeyword(""); setStatusFilter("ALL"); setContestFilter("ALL"); setPage(1); };
  const isLoading = contestsQuery.isLoading || judgesQuery.isLoading || submissionsQuery.isLoading;
  const error = contestsQuery.error ?? judgesQuery.error ?? submissionsQuery.error;

  if (detailRow) return <AssignmentDetail row={detailRow} submissions={submissions} onBack={() => setDetailId(null)} onRemind={() => remind(detailRow)} onOpenSubmission={(id) => onNavigate({ view: "SUBMISSION_DETAIL", id, backTo: "ASSIGNMENTS" })} />;

  return <section aria-label="Phân công giám khảo" className="space-y-5">
    <OrganizerPageHeader title="Phân công giám khảo" description="Chia bài chấm, theo dõi tiến độ và nhắc giám khảo theo từng cuộc thi."
      action={<><button type="button" onClick={() => openDialog("MANUAL")} disabled={!activeJudges.length} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"><Plus size={16} />Phân công thủ công</button><button type="button" onClick={() => openDialog("AUTO")} disabled={!activeJudges.length} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"><Check size={16} />Tự động phân công</button></>} />
    {notice && <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Đóng thông báo"><X size={16} /></button></div>}
    {isLoading && <StateMessage message="Đang tải cuộc thi, giám khảo và bài dự thi..." />}
    {error && <StateMessage message={error} isError />}
    {contestsQuery.data && judgesQuery.data && submissionsQuery.data && <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3"><h2 className="font-bold text-[#0B356B]">Danh sách phân công</h2><p className="mt-0.5 text-xs text-slate-500">Tình hình bài chấm và khối lượng giám khảo</p></div>
      <div className="grid divide-y divide-slate-100 border-b border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex min-w-0 items-baseline gap-2 px-4 py-2.5"><span className="shrink-0 text-lg font-bold text-[#0B356B]">{metricEligible}</span><span className="truncate text-xs font-medium text-slate-600">Bài chưa phân công</span></div>
        <div className="flex min-w-0 items-baseline gap-2 px-4 py-2.5"><span className="shrink-0 text-lg font-bold text-[#0B356B]">{noWorkCount}</span><span className="truncate text-xs font-medium text-slate-600">Giám khảo chưa có bài</span></div>
        <div className="flex min-w-0 items-baseline gap-2 px-4 py-2.5"><span className="shrink-0 text-lg font-bold text-blue-700">{overallProgress}%</span><span className="truncate text-xs font-medium text-slate-600">Tiến độ chấm chung</span><span className="ml-auto shrink-0 text-[11px] text-slate-500">{totalReviewed}/{totalAssigned}</span></div>
      </div>
      <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_260px_auto]"><label className="relative"><span className="sr-only">Tìm giám khảo hoặc cuộc thi</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} placeholder="Tìm theo giám khảo, chuyên môn..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label><label><span className="sr-only">Lọc theo cuộc thi</span><select value={contestFilter} onChange={(event) => { setContestFilter(event.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"><option value="ALL">Tất cả cuộc thi</option>{contests.map((contest) => <option key={contest.id} value={contest.id}>{contest.name}</option>)}</select></label><button type="button" onClick={resetFilters} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Filter size={15} />Xóa lọc</button></div>
      <div role="tablist" aria-label="Lọc trạng thái phân công" className="flex gap-4 overflow-x-auto border-b border-slate-200 px-4">{FILTERS.map((filter) => <button key={filter.id} type="button" role="tab" aria-selected={statusFilter === filter.id} onClick={() => { setStatusFilter(filter.id); setPage(1); }} className={`shrink-0 border-b-2 py-3 text-xs font-semibold sm:text-sm ${statusFilter === filter.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{filter.label} ({statusCounts[filter.id]})</button>)}</div>
      <div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-slate-50 text-xs font-semibold text-slate-600"><tr><th className="px-3 py-3">Giám khảo</th><th className="px-3 py-3">Cuộc thi</th><th className="px-3 py-3">Chuyên môn</th><th className="px-3 py-3">Bài được giao</th><th className="px-3 py-3">Tiến độ / Hạn chấm</th><th className="px-3 py-3">Trạng thái / Cảnh báo</th><th className="px-3 py-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{pageRows.map((row) => {
        const assignedJudgeCount = new Set(currentContestAssignments.map((item) => item.judge.id)).size;
        const avgLoad = assignedJudgeCount ? totalAssigned / assignedJudgeCount : 0;
        const overloaded = row.submissionIds.length > avgLoad && row.submissionIds.length > 1;
        const daysLeft = row.deadline ? (new Date(`${row.deadline}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000 : Number.POSITIVE_INFINITY;
        const slow = row.progress < 50 && (row.status === "OVERDUE" || daysLeft >= 0 && daysLeft <= 3);
        return <tr key={row.assignment.id} className="hover:bg-blue-50/30"><td className="px-3 py-3"><div className="flex items-center gap-2.5"><OrganizerAvatar name={row.judge.fullName} /><div><p className="font-semibold text-slate-800">{row.judge.fullName}</p><p className="text-xs text-slate-500">{row.judge.email}</p></div></div></td><td className="px-3 py-3 font-medium text-[#0B356B]">{row.contest.name}</td><td className="px-3 py-3 text-slate-600">{row.judge.specialty}</td><td className="px-3 py-3 font-semibold text-slate-700">{row.submissionIds.length}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><div className="h-2 w-16 shrink-0 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${row.progress}%` }} /></div><span className="whitespace-nowrap text-xs text-slate-500">{row.reviewedIds.length}/{row.submissionIds.length}</span></div><p className="mt-1 whitespace-nowrap text-[11px] text-slate-500">Hạn: {row.deadline ? formatDate(row.deadline) : "Chưa thiết lập"}</p></td><td className="px-3 py-3"><div className="flex flex-wrap gap-1.5"><span className={`whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold ${STATUS_STYLE[row.status]}`}>{STATUS_TEXT[row.status]}</span>{overloaded && <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700"><AlertTriangle size={12} />Quá tải</span>}{slow && <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700"><Clock3 size={12} />Chậm tiến độ</span>}</div></td><td className="px-3 py-3"><div className="flex justify-end gap-1"><button type="button" onClick={() => setDetailId(row.assignment.id)} className="rounded-lg border border-blue-200 p-2 text-blue-700 hover:bg-blue-50" aria-label="Xem chi tiết phân công" title="Xem chi tiết"><Eye size={15} /></button><button type="button" onClick={() => { setReassignRow(row); setNewJudgeId(activeJudges.find((judge) => judge.id !== row.judge.id)?.id ?? ""); }} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Đổi giám khảo" title="Đổi giám khảo"><UserRoundCheck size={15} /></button><button type="button" onClick={() => remind(row)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Gửi nhắc chấm" title="Gửi nhắc chấm"><Bell size={15} /></button><button type="button" onClick={() => setRevokeRow(row)} className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50" aria-label="Thu hồi phân công" title="Thu hồi"><X size={15} /></button></div></td></tr>;
      })}{pageRows.length === 0 && <tr><td colSpan={7} className="px-4 py-14 text-center"><ClipboardList size={28} className="mx-auto text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Chưa có phân công phù hợp</p><p className="mt-1 text-sm text-slate-500">Chọn cuộc thi rồi bắt đầu phân công bài hợp lệ cho giám khảo.</p></td></tr>}</tbody></table></div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600"><span>Hiển thị {filteredRows.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredRows.length)} trong {filteredRows.length} phân công</span><div className="flex items-center gap-2"><label className="flex items-center gap-2">Dòng<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-2 py-1.5">{[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}</select></label><button type="button" aria-label="Trang trước" disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-md border border-slate-200 p-1.5 disabled:opacity-40"><ChevronLeft size={16} /></button><span>{currentPage}/{pageCount}</span><button type="button" aria-label="Trang sau" disabled={currentPage >= pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-md border border-slate-200 p-1.5 disabled:opacity-40"><ChevronRight size={16} /></button></div></footer></div>
      <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><Clock3 size={14} className="mt-0.5 shrink-0" />Hạn chấm lấy từ mốc kết thúc chấm trong cài đặt cuộc thi. Phân công và lời nhắc đang được lưu cục bộ trên trình duyệt.</p>
    </>}

    {dialog && <Modal title={dialog === "AUTO" ? "Xem trước phân công tự động" : "Phân công thủ công"} onClose={() => setDialog(null)} isWide>
      <div className="space-y-4"><label className="block text-sm font-semibold text-slate-700">Cuộc thi<select value={dialogContestId} onChange={(event) => setDialogContestId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal"><option value="">Chọn cuộc thi</option>{contests.map((contest) => <option key={contest.id} value={contest.id}>{contest.name}</option>)}</select></label>
        <div><p className="mb-2 text-sm font-semibold text-slate-700">Giám khảo nhận bài <span className="font-normal text-slate-500">(đã chọn mặc định trước)</span></p><div className="grid gap-2 sm:grid-cols-2">{activeJudges.map((judge) => <label key={judge.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${judgeIds.includes(judge.id) ? "border-blue-300 bg-blue-50" : "border-slate-200"}`}><input type="checkbox" checked={judgeIds.includes(judge.id)} onChange={() => toggleJudge(judge.id)} className="accent-blue-600" /><span className="min-w-0 flex-1"><span className="block font-semibold text-slate-800">{judge.fullName}</span><span className="block text-xs text-slate-500">{judge.specialty}</span></span>{judge.isDefault && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Mặc định</span>}</label>)}</div></div>
        {dialog === "MANUAL" && <div><p className="mb-2 text-sm font-semibold text-slate-700">Cách chia bài</p><div className="grid gap-2 sm:grid-cols-3">{([{ id: "EQUAL", label: "Chia đều" }, { id: "SPECIALTY", label: "Theo chuyên môn" }, { id: "MANUAL", label: "Nhập số bài" }] as { id: Distribution; label: string }[]).map((method) => <button key={method.id} type="button" onClick={() => setDistribution(method.id)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${distribution === method.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}>{method.label}</button>)}</div></div>}
        {dialog === "MANUAL" && distribution === "MANUAL" && <div className="space-y-2">{selectedJudges.map((judge) => <label key={judge.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm"><span>{judge.fullName}</span><input type="number" min={0} max={eligibleSubmissions.length} value={manualCounts[judge.id] ?? 0} onChange={(event) => setManualCounts((counts) => ({ ...counts, [judge.id]: Number(event.target.value) }))} className="w-24 rounded-md border border-slate-200 px-2 py-1.5 text-right" /></label>)}</div>}
        <div className="rounded-xl border border-slate-200"><div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 text-sm"><span className="font-semibold text-slate-700">Kết quả xem trước</span><span className="text-xs text-slate-500">{eligibleSubmissions.length} bài hợp lệ chưa phân công</span></div>{preview.length && allocatedCount ? <div className="divide-y divide-slate-100">{preview.map((line) => <div key={line.judge.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"><span className="font-medium text-slate-700">{line.judge.fullName}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{line.submissions.length} bài</span></div>)}</div> : <p className="px-3 py-4 text-sm text-slate-500">{!selectedContest ? "Chọn cuộc thi để xem bài có thể phân công." : !selectedJudges.length ? "Chọn ít nhất một giám khảo đang hoạt động." : "Không có bài hợp lệ chưa phân công."}</p>}</div>
        {manualOverAllocated && <p role="alert" className="text-sm text-rose-600">Số bài nhập vượt quá số bài còn có thể phân công.</p>}
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setDialog(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button><button type="button" onClick={confirmAssignment} disabled={!selectedContest || !selectedJudges.length || allocatedCount === 0 || manualOverAllocated} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Xác nhận phân công</button></div>
      </div>
    </Modal>}
    {reassignRow && <Modal title="Đổi giám khảo" onClose={() => setReassignRow(null)}><div className="space-y-4"><p className="text-sm text-slate-600">Đang chuyển {reassignRow.submissionIds.length} bài của cuộc thi <b>{reassignRow.contest.name}</b>.</p>{reassignRow.reviewedIds.length > 0 && <p className="flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"><AlertTriangle size={15} />Phân công đã có điểm. Hệ thống sẽ hỏi xác nhận trước khi chuyển.</p>}<label className="block text-sm font-semibold text-slate-700">Giám khảo mới<select value={newJudgeId} onChange={(event) => setNewJudgeId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal">{activeJudges.filter((judge) => judge.id !== reassignRow.judge.id).map((judge) => <option key={judge.id} value={judge.id}>{judge.fullName} · {judge.specialty}</option>)}</select></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setReassignRow(null)} className="rounded-lg px-4 py-2 text-sm text-slate-600">Hủy</button><button type="button" disabled={!newJudgeId} onClick={reassign} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Đổi giám khảo</button></div></div></Modal>}
    {revokeRow && <Modal title="Thu hồi phân công" onClose={() => setRevokeRow(null)}><p className="text-sm text-slate-600">Thu hồi sẽ đưa {revokeRow.submissionIds.length} bài của <b>{revokeRow.judge.fullName}</b> trở lại danh sách chưa phân công.</p>{revokeRow.reviewedIds.length > 0 && <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"><AlertTriangle size={15} />Phân công đã có điểm; thao tác này cần xác nhận lần nữa.</p>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setRevokeRow(null)} className="rounded-lg px-4 py-2 text-sm text-slate-600">Giữ phân công</button><button type="button" onClick={revoke} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Thu hồi</button></div></Modal>}
  </section>;
}
