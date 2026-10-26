import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Eye, Filter, Images, LockKeyhole, Search, Trophy, Unlock, Users } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { organizerUserService } from "../../../services/organizerUserService";
import { submissionService } from "../../../services/submissionService";
import type { Contest } from "../../../types/contest";
import type { OrganizerViewProps } from "../../../types/organizer";
import type { Participant } from "../../../types/organizerUser";
import type { Submission, SubmissionStatus } from "../../../types/submission";
import { formatDate } from "../../../utils/formatDate";
import { ContestCover } from "./ContestCover";
import { OrganizerPageHeader } from "./OrganizerPageHeader";
import { PageHeader } from "./PageHeader";

type StatusFilter = "ALL" | "ACTIVE" | "LOCKED";
type DetailTab = "submissions" | "contests" | "history";
type ParticipantEntry = {
  id: string;
  title: string;
  contestName: string;
  submittedAt: string;
  status: SubmissionStatus;
  source?: Submission;
};

const STATUS_STORAGE_KEY = "filmcontest.organizer.participant-status.v1";
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const TAB_ITEMS: { id: DetailTab; label: string }[] = [
  { id: "submissions", label: "Bài dự thi" },
  { id: "contests", label: "Cuộc thi" },
  { id: "history", label: "Lịch sử" },
];

function readStatusOverrides(): Record<string, Participant["status"]> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, Participant["status"]> : {};
  } catch {
    return {};
  }
}

function ParticipantAvatar({ name, size = "size-10" }: { name: string; size?: string }) {
  const colors = ["bg-sky-100 text-sky-800", "bg-violet-100 text-violet-800", "bg-rose-100 text-rose-800", "bg-amber-100 text-amber-800", "bg-emerald-100 text-emerald-800"];
  const hash = [...name].reduce((value, character) => value + character.charCodeAt(0), 0);
  const initial = name.trim().split(/\s+/).map((part) => part[0]).slice(-2).join("").toUpperCase();
  return <span aria-label={`Ảnh đại diện ${name}`} className={`inline-flex shrink-0 items-center justify-center rounded-full text-sm font-bold ${size} ${colors[hash % colors.length]}`}>{initial || "?"}</span>;
}

function ParticipantStatus({ status }: { status: Participant["status"] }) {
  const active = status === "ACTIVE";
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}><span className={`size-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />{active ? "Đang hoạt động" : "Tạm khóa"}</span>;
}

function makeParticipantEntries(participant: Participant, submissions: Submission[]): ParticipantEntry[] {
  const name = participant.fullName.toLocaleLowerCase("vi-VN");
  const matches = submissions.filter((submission) => submission.authorName.toLocaleLowerCase("vi-VN") === name);
  if (matches.length) return matches.map((submission) => ({ id: submission.id, title: submission.title, contestName: submission.contestName, submittedAt: submission.submittedAt, status: submission.status, source: submission }));
  return (participant.recentSubmissions ?? []).map((submission) => ({ ...submission }));
}

export function ParticipantsView({ onNavigate }: OrganizerViewProps) {
  const participantsQuery = useFetch(organizerUserService.getParticipants);
  const submissionsQuery = useFetch(submissionService.getSubmissions);
  const contestsQuery = useFetch(contestService.getContests);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [contestFilter, setContestFilter] = useState("ALL");
  const [registeredFrom, setRegisteredFrom] = useState("");
  const [registeredTo, setRegisteredTo] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [fallbackSubmission, setFallbackSubmission] = useState<{ entry: ParticipantEntry; participant: Participant } | null>(null);
  const [statusOverrides, setStatusOverrides] = useState(readStatusOverrides);

  const participants = participantsQuery.data ?? [];
  const allSubmissions = submissionsQuery.data ?? [];
  const contestNames = [...new Set([
    ...(contestsQuery.data ?? []).map((contest) => contest.name),
    ...participants.flatMap((participant) => (participant.recentSubmissions ?? []).map((submission) => submission.contestName)),
  ])].sort((a, b) => a.localeCompare(b, "vi"));
  const statusOf = (participant: Participant) => statusOverrides[participant.id] ?? participant.status;
  const entriesOf = (participant: Participant) => makeParticipantEntries(participant, allSubmissions);
  const activeCount = participants.filter((participant) => statusOf(participant) === "ACTIVE").length;
  const lockedCount = participants.filter((participant) => statusOf(participant) === "LOCKED").length;
  const statusTabs: { id: StatusFilter; label: string; count: number }[] = [
    { id: "ALL", label: "Tất cả", count: participants.length },
    { id: "ACTIVE", label: "Đang hoạt động", count: activeCount },
    { id: "LOCKED", label: "Tạm khóa", count: lockedCount },
  ];

  const filteredParticipants = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("vi-VN");
    return [...participants].filter((participant) => {
      const status = statusOverrides[participant.id] ?? participant.status;
      const entries = makeParticipantEntries(participant, allSubmissions);
      const matchesSearch = !query || `${participant.fullName} ${participant.email}`.toLocaleLowerCase("vi-VN").includes(query);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      const matchesContest = contestFilter === "ALL" || entries.some((entry) => entry.contestName === contestFilter);
      const matchesDate = (!registeredFrom || participant.registeredAt >= registeredFrom) && (!registeredTo || participant.registeredAt <= registeredTo);
      const count = participant.submissionCount;
      const matchesSubmissionCount = submissionFilter === "ALL" || (submissionFilter === "0" ? count === 0 : submissionFilter === "1-2" ? count >= 1 && count <= 2 : count >= 3);
      return matchesSearch && matchesStatus && matchesContest && matchesDate && matchesSubmissionCount;
    }).sort((left, right) => sortBy === "MOST_SUBMISSIONS" ? right.submissionCount - left.submissionCount : right.registeredAt.localeCompare(left.registeredAt));
  }, [participants, allSubmissions, keyword, statusOverrides, statusFilter, contestFilter, registeredFrom, registeredTo, submissionFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredParticipants.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleParticipants = filteredParticipants.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const setFilter = <T,>(setter: (value: T) => void, value: T) => { setter(value); setPage(1); };

  const toggleStatus = (participant: Participant) => {
    const nextStatus: Participant["status"] = statusOf(participant) === "LOCKED" ? "ACTIVE" : "LOCKED";
    const next = { ...statusOverrides, [participant.id]: nextStatus };
    setStatusOverrides(next);
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(next));
  };

  if (fallbackSubmission) return <RecentSubmissionDetail entry={fallbackSubmission.entry} participant={fallbackSubmission.participant} onBack={() => setFallbackSubmission(null)} />;

  if (selectedParticipant) {
    return <ParticipantDetailPage
      participant={{ ...selectedParticipant, status: statusOf(selectedParticipant) }}
      entries={entriesOf(selectedParticipant)}
      contests={contestsQuery.data ?? []}
      onBack={() => setSelectedParticipant(null)}
      onToggleStatus={() => toggleStatus(selectedParticipant)}
      onOpenFallback={(entry) => setFallbackSubmission({ entry, participant: selectedParticipant })}
      onNavigate={onNavigate}
    />;
  }

  return (
    <section aria-label="Quản lý thí sinh" className="space-y-5">
      <OrganizerPageHeader title="Quản lý thí sinh" description="Theo dõi hồ sơ, hoạt động và bài dự thi của thí sinh." />

      {participantsQuery.isLoading && <StateMessage message="Đang tải danh sách thí sinh..." />}
      {participantsQuery.error && <StateMessage message={participantsQuery.error} isError />}
      {participantsQuery.data && <>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div role="tablist" aria-label="Lọc thí sinh theo trạng thái" className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-2">
            {statusTabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={statusFilter === tab.id} onClick={() => setFilter(setStatusFilter, tab.id)} className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition sm:text-sm ${statusFilter === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700"}`}>{tab.label} ({tab.count})</button>)}
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative md:col-span-2 xl:col-span-2"><span className="sr-only">Tìm thí sinh</span><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input value={keyword} onChange={(event) => setFilter(setKeyword, event.target.value)} placeholder="Tìm theo họ tên, email..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs text-slate-500"><span className="shrink-0">Từ ngày</span><input aria-label="Đăng ký từ ngày" type="date" value={registeredFrom} onChange={(event) => setFilter(setRegisteredFrom, event.target.value)} className="min-w-0 flex-1 py-2 text-sm text-slate-700 outline-none" /></label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs text-slate-500"><span className="shrink-0">Đến ngày</span><input aria-label="Đăng ký đến ngày" type="date" value={registeredTo} onChange={(event) => setFilter(setRegisteredTo, event.target.value)} className="min-w-0 flex-1 py-2 text-sm text-slate-700 outline-none" /></label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-600"><Filter size={15} className="shrink-0 text-blue-600" aria-hidden="true" /><span className="sr-only">Lọc theo cuộc thi</span><select value={contestFilter} onChange={(event) => setFilter(setContestFilter, event.target.value)} className="min-w-0 flex-1 bg-transparent py-2.5 outline-none"><option value="ALL">Tất cả cuộc thi</option>{contestNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
            <label className="rounded-xl border border-slate-200 px-3 text-sm text-slate-600"><span className="sr-only">Lọc theo số bài nộp</span><select value={submissionFilter} onChange={(event) => setFilter(setSubmissionFilter, event.target.value)} className="w-full bg-transparent py-2.5 outline-none"><option value="ALL">Mọi số bài nộp</option><option value="0">Chưa nộp bài</option><option value="1-2">1–2 bài</option><option value="3+">3 bài trở lên</option></select></label>
            <label className="rounded-xl border border-slate-200 px-3 text-sm text-slate-600"><span className="sr-only">Sắp xếp thí sinh</span><select value={sortBy} onChange={(event) => setFilter(setSortBy, event.target.value)} className="w-full bg-transparent py-2.5 outline-none"><option value="NEWEST">Đăng ký mới nhất</option><option value="MOST_SUBMISSIONS">Nhiều bài nhất</option></select></label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-y border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th scope="col" className="w-14 px-4 py-3">#</th><th scope="col" className="px-4 py-3">Thí sinh</th><th scope="col" className="px-4 py-3">Email</th><th scope="col" className="px-4 py-3">Bài dự thi</th><th scope="col" className="px-4 py-3">Ngày đăng ký</th><th scope="col" className="px-4 py-3">Trạng thái</th><th scope="col" className="px-4 py-3 text-right">Thao tác</th></tr></thead>
              <tbody>
                {visibleParticipants.map((participant, index) => (
                  <tr key={participant.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40">
                    <td className="px-4 py-3.5 text-slate-500">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-3"><ParticipantAvatar name={participant.fullName} /><span className="font-semibold text-[#0B356B]">{participant.fullName}</span></div></td>
                    <td className="px-4 py-3.5 text-slate-600">{participant.email}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{participant.submissionCount}</td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(participant.registeredAt)}</td>
                    <td className="px-4 py-3.5"><ParticipantStatus status={statusOf(participant)} /></td>
                    <td className="px-4 py-3.5 text-right"><button type="button" onClick={() => setSelectedParticipant(participant)} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"><Eye size={14} aria-hidden="true" />Xem</button></td>
                  </tr>
                ))}
                {visibleParticipants.length === 0 && <tr><td colSpan={7} className="px-4 py-14 text-center"><div className="mx-auto flex max-w-sm flex-col items-center"><Users size={30} className="text-slate-300" aria-hidden="true" /><p className="mt-3 font-semibold text-slate-700">Không tìm thấy thí sinh phù hợp</p><p className="mt-1 text-sm text-slate-500">Thử thay đổi từ khóa hoặc điều kiện lọc.</p></div></td></tr>}
              </tbody>
            </table>
          </div>
          <footer className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Hiển thị {filteredParticipants.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredParticipants.length)} / {filteredParticipants.length} thí sinh</span>
            <div className="flex items-center gap-2 self-end sm:self-auto"><label htmlFor="participant-page-size">Số dòng</label><select id="participant-page-size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select><button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Trang trước" className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"><ChevronLeft size={16} /></button><span>{currentPage} / {pageCount}</span><button type="button" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label="Trang sau" className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"><ChevronRight size={16} /></button></div>
          </footer>
        </div>
      </>}
    </section>
  );
}

function ParticipantDetailPage({ participant, entries, contests, onBack, onToggleStatus, onOpenFallback, onNavigate }: {
  participant: Participant;
  entries: ParticipantEntry[];
  contests: Contest[];
  onBack: () => void;
  onToggleStatus: () => void;
  onOpenFallback: (entry: ParticipantEntry) => void;
  onNavigate: OrganizerViewProps["onNavigate"];
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("submissions");
  const registrations = [...new Set(entries.map((entry) => entry.contestName))];
  return (
    <section aria-label={`Hồ sơ thí sinh ${participant.fullName}`} className="space-y-5">
      <PageHeader title={participant.fullName} eyebrow="HỒ SƠ THÍ SINH" onBack={onBack} />

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <ParticipantAvatar name={participant.fullName} size="size-20 text-2xl" />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold text-[#0B356B]">{participant.fullName}</h2><ParticipantStatus status={participant.status} /></div><p className="mt-1 text-sm text-slate-600">{participant.email}</p><p className="mt-1 text-xs text-slate-500">Mã thí sinh: {participant.id} · Đăng ký: {formatDate(participant.registeredAt)}</p></div>
          <button type="button" onClick={onToggleStatus} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${participant.status === "LOCKED" ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50" : "bg-rose-600 text-white hover:bg-rose-700"}`}>{participant.status === "LOCKED" ? <Unlock size={16} /> : <LockKeyhole size={16} />}{participant.status === "LOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản"}</button>
        </div>
      </article>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div role="tablist" aria-label="Thông tin thí sinh" className="flex gap-1 border-b border-slate-200 px-4 pt-2">
          {TAB_ITEMS.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`border-b-2 px-4 py-3 text-sm font-semibold ${activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700"}`}>{tab.label}{tab.id === "submissions" ? ` (${entries.length})` : tab.id === "contests" ? ` (${registrations.length})` : ""}</button>)}
        </div>
        <div role="tabpanel" className="p-4 sm:p-6">
          {activeTab === "submissions" && (entries.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry, index) => <button key={entry.id} type="button" onClick={() => entry.source ? onNavigate({ view: "SUBMISSION_DETAIL", id: entry.source.id, backTo: "PARTICIPANTS" }) : onOpenFallback(entry)} className="group overflow-hidden rounded-xl border border-slate-200 text-left transition hover:border-blue-300 hover:shadow-sm">
              <div className="h-36 overflow-hidden bg-slate-100"><ContestCover title={entry.contestName} seed={index} className="h-full w-full object-cover transition group-hover:scale-[1.02]" /></div>
              <div className="p-4"><div className="flex items-start justify-between gap-2"><p className="font-semibold text-[#0B356B]">{entry.title}</p><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${entry.status === "VALID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{entry.status === "VALID" ? "Đã duyệt" : "Chờ duyệt"}</span></div><p className="mt-1 text-xs text-slate-500">{entry.contestName} · {formatDate(entry.submittedAt)}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">Mở chi tiết <Eye size={13} /></span></div>
            </button>)}
          </div> : <EmptyDetail icon={Images} title="Chưa có bài dự thi" description="Các bài thí sinh gửi sẽ xuất hiện tại đây." />)}
          {activeTab === "contests" && (registrations.length ? <div className="grid gap-3 sm:grid-cols-2">{registrations.map((name) => {
            const contest = contests.find((item) => item.name === name);
            return <article key={name} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"><span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Trophy size={19} /></span><div><p className="font-semibold text-[#0B356B]">{name}</p><p className="mt-1 text-xs text-slate-500">{contest ? `${formatDate(contest.startDate)} – ${formatDate(contest.endDate)}` : "Đăng ký được ghi nhận qua bài dự thi"}</p></div></article>;
          })}</div> : <EmptyDetail icon={Trophy} title="Chưa tham gia cuộc thi" description="Cuộc thi đăng ký sẽ được hiển thị tại đây." />)}
          {activeTab === "history" && <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><CalendarDays size={18} className="mt-0.5 shrink-0" /><p>Hệ thống hiện chưa cung cấp nhật ký đăng nhập hoặc lý do khóa tài khoản. Các mốc đăng ký và nộp bài đã ghi nhận được hiển thị bên dưới.</p></div>
            <ol className="space-y-3">{[
              { date: participant.registeredAt, label: "Tạo tài khoản thí sinh", detail: "Tham gia nền tảng FilmContest" },
              ...entries.map((entry) => ({ date: entry.submittedAt, label: "Nộp bài dự thi", detail: `${entry.title} · ${entry.contestName}` })),
            ].sort((left, right) => right.date.localeCompare(left.date)).map((event, index) => <li key={`${event.date}-${event.label}-${index}`} className="flex gap-3"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" /><div className="flex flex-1 flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between"><span><span className="font-semibold text-slate-800">{event.label}</span><span className="mt-0.5 block text-xs text-slate-500">{event.detail}</span></span><time className="text-xs text-slate-500">{formatDate(event.date)}</time></div></li>)}</ol>
          </div>}
        </div>
      </div>
    </section>
  );
}

function RecentSubmissionDetail({ entry, participant, onBack }: { entry: ParticipantEntry; participant: Participant; onBack: () => void }) {
  return <section aria-label={`Chi tiết bài dự thi ${entry.title}`} className="space-y-5">
    <PageHeader title={entry.title} subtitle={`${participant.fullName} · ${entry.contestName}`} eyebrow="BÀI DỰ THI" onBack={onBack} />
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="h-64 bg-slate-100 sm:h-96"><ContestCover title={entry.contestName} seed={0} className="h-full w-full object-cover" /></div><div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"><div><p className="text-xs text-slate-500">Tác giả</p><p className="mt-1 font-semibold text-[#0B356B]">{participant.fullName}</p></div><div><p className="text-xs text-slate-500">Cuộc thi</p><p className="mt-1 font-semibold text-[#0B356B]">{entry.contestName}</p></div><div><p className="text-xs text-slate-500">Ngày nộp</p><p className="mt-1 font-semibold text-[#0B356B]">{formatDate(entry.submittedAt)}</p></div><div><p className="text-xs text-slate-500">Trạng thái</p><p className="mt-1 font-semibold text-[#0B356B]">{entry.status === "VALID" ? "Đã duyệt" : "Chờ duyệt"}</p></div></div></article>
  </section>;
}

function EmptyDetail({ icon: Icon, title, description }: { icon: typeof Users; title: string; description: string }) {
  return <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Icon size={22} aria-hidden="true" /></span><p className="mt-3 font-semibold text-slate-700">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}
