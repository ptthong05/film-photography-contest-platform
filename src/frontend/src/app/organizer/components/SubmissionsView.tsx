import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock3, Eye, FileImage, Filter, RotateCcw, Search, X } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { submissionService } from "../../../services/submissionService";
import type { OrganizerViewProps } from "../../../types/organizer";
import type { Submission } from "../../../types/submission";
import { formatDate } from "../../../utils/formatDate";
import { ContestCover } from "./ContestCover";
import { readContestSubmissionReview, saveContestSubmissionReview } from "./contestManagementStorage";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

type ReviewFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";
const PAGE_SIZE = 10;
const REVIEW_TABS: { id: ReviewFilter; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "PENDING", label: "Chờ duyệt" },
  { id: "APPROVED", label: "Đã duyệt" },
  { id: "REJECTED", label: "Đã từ chối" },
];

function reviewStatus(submission: Submission, contestId: string | undefined): Exclude<ReviewFilter, "ALL"> {
  const saved = contestId ? readContestSubmissionReview(contestId, submission.id) : undefined;
  if (saved) return saved;
  return submission.status === "VALID" ? "APPROVED" : "PENDING";
}

const STATUS_STYLE: Record<Exclude<ReviewFilter, "ALL">, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
};
const STATUS_LABEL: Record<Exclude<ReviewFilter, "ALL">, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

export function SubmissionsView({ onNavigate }: OrganizerViewProps) {
  const submissions = useFetch(submissionService.getSubmissions);
  const contests = useFetch(contestService.getContests);
  const [keyword, setKeyword] = useState("");
  const [contestFilter, setContestFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<ReviewFilter>("ALL");
  const [page, setPage] = useState(1);
  const [reviewRevision, setReviewRevision] = useState(0);
  const rows = submissions.data ?? [];
  const contestNames = [...new Set(rows.map((row) => row.contestName))].sort((a, b) => a.localeCompare(b, "vi"));
  const contestIdOf = (submission: Submission) => contests.data?.find((contest) => contest.name === submission.contestName)?.id;
  const statusOf = (submission: Submission) => reviewStatus(submission, contestIdOf(submission));

  const counts = useMemo(() => {
    const result: Record<ReviewFilter, number> = { ALL: rows.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    for (const row of rows) {
      const contestId = contests.data?.find((contest) => contest.name === row.contestName)?.id;
      result[reviewStatus(row, contestId)] += 1;
    }
    return result;
  // reviewRevision refreshes persisted local review decisions.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, contests.data, reviewRevision]);

  const filteredRows = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("vi-VN");
    return rows.filter((row) => {
      const matchesQuery = !query || `${row.title} ${row.authorName} ${row.code}`.toLocaleLowerCase("vi-VN").includes(query);
      const matchesContest = contestFilter === "ALL" || row.contestName === contestFilter;
      const matchesStatus = statusFilter === "ALL" || statusOf(row) === statusFilter;
      return matchesQuery && matchesContest && matchesStatus;
    }).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  // reviewRevision refreshes persisted local review decisions.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, keyword, contestFilter, statusFilter, contests.data, reviewRevision]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setReview = (submission: Submission, status: "APPROVED" | "REJECTED" | null) => {
    const contestId = contestIdOf(submission);
    if (!contestId) return;
    saveContestSubmissionReview(contestId, submission.id, status);
    setReviewRevision((revision) => revision + 1);
  };

  return (
    <section aria-label="Quản lý bài dự thi" className="space-y-5">
      <OrganizerPageHeader title="Quản lý bài dự thi" description="Theo dõi bài gửi về, kiểm tra thông tin và xử lý duyệt bài." />

      {(submissions.isLoading || contests.isLoading) && <StateMessage message="Đang tải danh sách bài dự thi..." />}
      {(submissions.error || contests.error) && <StateMessage message={submissions.error ?? contests.error ?? "Không tải được dữ liệu."} isError />}

      {submissions.data && <>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div role="tablist" aria-label="Lọc bài theo trạng thái duyệt" className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-2">
            {REVIEW_TABS.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={statusFilter === tab.id} onClick={() => { setStatusFilter(tab.id); setPage(1); }} className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition sm:text-sm ${statusFilter === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-blue-700"}`}>{tab.label} ({counts[tab.id]})</button>)}
          </div>

          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row">
            <label className="relative min-w-0 flex-1"><span className="sr-only">Tìm bài dự thi</span><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} placeholder="Tìm theo tên tác phẩm, thí sinh hoặc mã bài..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
            <label className="flex min-w-52 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-600"><Filter size={16} className="shrink-0 text-blue-600" aria-hidden="true" /><span className="sr-only">Lọc theo cuộc thi</span><select value={contestFilter} onChange={(event) => { setContestFilter(event.target.value); setPage(1); }} className="min-w-0 flex-1 bg-transparent py-2.5 outline-none"><option value="ALL">Tất cả cuộc thi</option>{contestNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th scope="col" className="px-4 py-3">Ảnh dự thi</th><th scope="col" className="px-4 py-3">Thông tin thí sinh</th><th scope="col" className="px-4 py-3">Thông tin phim</th><th scope="col" className="px-4 py-3">Trạng thái</th><th scope="col" className="px-4 py-3 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map((submission) => {
                  const status = statusOf(submission);
                  return <tr key={submission.id} className="align-middle hover:bg-blue-50/30">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><ContestCover title={submission.contestName} seed={Number(submission.code.replace(/\D/g, "").slice(-2)) || 0} className="h-[68px] w-20 shrink-0 rounded-lg shadow-sm" /><div className="min-w-0"><p className="max-w-60 truncate font-semibold text-[#0B356B]" title={submission.title}>{submission.title}</p><p className="mt-1 text-xs text-slate-500">{submission.code}</p><p className="mt-1 max-w-56 truncate text-xs text-blue-700">{submission.contestName}</p></div></div></td>
                    <td className="px-4 py-3"><p className="font-semibold text-slate-700">{submission.authorName}</p><p className="mt-1 text-xs text-slate-500">Nộp ngày {formatDate(submission.submittedAt)}</p></td>
                    <td className="px-4 py-3 text-xs leading-5 text-slate-600"><p><span className="font-semibold text-slate-700">Phim:</span> {submission.metadata.filmStock}</p><p><span className="font-semibold text-slate-700">Máy ảnh:</span> {submission.metadata.camera}</p><p><span className="font-semibold text-slate-700">Định dạng:</span> {submission.metadata.format} · ISO {submission.metadata.iso}</p></td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLE[status]}`}><span className="size-1.5 rounded-full bg-current" />{STATUS_LABEL[status]}</span></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => onNavigate({ view: "SUBMISSION_DETAIL", id: submission.id, backTo: "SUBMISSIONS" })} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50" aria-label={`Xem chi tiết ${submission.title}`}><Eye size={14} aria-hidden="true" />Chi tiết</button>{status === "PENDING" ? <><button type="button" onClick={() => setReview(submission, "APPROVED")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"><Check size={14} aria-hidden="true" />Duyệt</button><button type="button" onClick={() => setReview(submission, "REJECTED")} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"><X size={14} aria-hidden="true" />Từ chối</button></> : <button type="button" onClick={() => setReview(submission, null)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" title="Đưa bài về trạng thái ban đầu"><RotateCcw size={13} aria-hidden="true" />Đặt lại</button>}</div></td>
                  </tr>;
                })}
              </tbody>
            </table>
            {filteredRows.length === 0 && <div className="flex flex-col items-center px-4 py-14 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><FileImage size={23} aria-hidden="true" /></span><p className="mt-3 font-semibold text-slate-700">Không tìm thấy bài dự thi phù hợp</p><p className="mt-1 text-sm text-slate-500">Thử đổi từ khóa hoặc bộ lọc trạng thái, cuộc thi.</p></div>}
          </div>

          <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between"><p>Hiển thị {filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredRows.length)} trong {filteredRows.length} bài dự thi</p><div className="flex items-center gap-2"><span className="mr-1">Trang {currentPage} / {pageCount}</span><button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} aria-label="Trang trước" className="rounded-lg border border-slate-200 p-2 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button><button type="button" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage >= pageCount} aria-label="Trang sau" className="rounded-lg border border-slate-200 p-2 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button></div></footer>
        </div>

        <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><Clock3 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />Quyết định duyệt được Organizer lưu lại trong phần quản lý cuộc thi; có thể đặt lại để đưa bài về trạng thái ban đầu.</p>
      </>}
    </section>
  );
}
