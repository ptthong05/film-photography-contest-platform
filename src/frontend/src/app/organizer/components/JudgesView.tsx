import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Filter, Mail, Search, ShieldCheck, Star, UserRoundCheck } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { assignmentService } from "../../../services/assignmentService";
import { contestService } from "../../../services/contestService";
import { organizerUserService } from "../../../services/organizerUserService";
import type { Assignment } from "../../../types/assignment";
import type { Contest } from "../../../types/contest";
import type { OrganizerViewProps } from "../../../types/organizer";
import type { AccountStatus, Judge } from "../../../types/organizerUser";
import { ACCOUNT_STATUS } from "../../../utils/statusBadges";
import { readManagedAssignments, type ManagedAssignment } from "./assignmentManagementStorage";
import { readOrganizerOnlyJudges, seedOrganizerJudgesOnce, updateOrganizerOnlyJudge } from "./organizerJudgeStorage";
import { OrganizerAvatar } from "./OrganizerAvatar";
import { OrganizerPageHeader } from "./OrganizerPageHeader";
import { OrganizerJudgeDetailPage } from "./OrganizerJudgeDetailPage";

type StatusFilter = "ALL" | AccountStatus;
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "ACTIVE", label: "Đang hoạt động" },
  { id: "LOCKED", label: "Tạm khóa" },
];

export function JudgesView({ onNavigate }: OrganizerViewProps) {
  const [version, setVersion] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [expertiseFilter, setExpertiseFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);
  const [localJudges, setLocalJudges] = useState(readOrganizerOnlyJudges);
  const fetchJudges = useCallback(() => organizerUserService.getJudges(), [version]);
  const judgesQuery = useFetch(fetchJudges);
  const contestsQuery = useFetch(contestService.getContests);
  const assignmentsQuery = useFetch(assignmentService.getAssignments);
  const managedAssignments = readManagedAssignments();
  useEffect(() => {
    const handleSync = () => {
      setVersion((v) => v + 1);
    };
    window.addEventListener('usersChanged', handleSync);
    return () => window.removeEventListener('usersChanged', handleSync);
  }, []);
  useEffect(() => { setLocalJudges(seedOrganizerJudgesOnce()); }, []);
  const judges = useMemo(() => {
    const map = new Map<string, Judge>();
    for (const judge of judgesQuery.data ?? []) {
      map.set(judge.id, judge);
    }
    for (const judge of localJudges) {
      if (!map.has(judge.id)) {
        map.set(judge.id, judge);
      }
    }
    return Array.from(map.values());
  }, [judgesQuery.data, localJudges]);
  const statusCounts = useMemo(() => ({
    ALL: judges.length,
    ACTIVE: judges.filter((judge) => judge.status === "ACTIVE").length,
    LOCKED: judges.filter((judge) => judge.status === "LOCKED").length,
  }), [judges]);
  const expertiseOptions = [...new Set(judges.map((judge) => judge.specialty).filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi"));
  const filteredJudges = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("vi-VN");
    return judges.filter((judge) => {
      const matchesStatus = statusFilter === "ALL" || judge.status === statusFilter;
      const matchesExpertise = expertiseFilter === "ALL" || judge.specialty === expertiseFilter;
      const matchesQuery = !query || `${judge.fullName} ${judge.email} ${judge.specialty} ${judge.id}`.toLocaleLowerCase("vi-VN").includes(query);
      return matchesStatus && matchesExpertise && matchesQuery;
    }).sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.fullName.localeCompare(b.fullName, "vi"));
  }, [judges, statusFilter, expertiseFilter, keyword]);
  const pageCount = Math.max(1, Math.ceil(filteredJudges.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredJudges.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstRow = filteredJudges.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastRow = Math.min(currentPage * pageSize, filteredJudges.length);

  const resetFilters = () => { setKeyword(""); setStatusFilter("ALL"); setExpertiseFilter("ALL"); setPage(1); };
  const toggleDefault = async (judge: Judge) => {
    if (localJudges.some((item) => item.id === judge.id)) setLocalJudges(updateOrganizerOnlyJudge(judge.id, { isDefault: !judge.isDefault }));
    else await organizerUserService.setDefaultJudge(judge.id, !judge.isDefault);
    setVersion((value) => value + 1);
  };

  if (selectedJudge) {
    return (
      <OrganizerJudgeDetailPage
        judge={selectedJudge}
        contests={contestsQuery.data ?? []}
        assignments={assignmentsQuery.data ?? []}
        managedAssignments={managedAssignments}
        onBack={() => setSelectedJudge(null)}
        onToggleDefault={() => void toggleDefault(selectedJudge)}
      />
    );
  }

  return (
    <section aria-label="Quản lý giám khảo" className="space-y-5">
      <OrganizerPageHeader
        title="Quản lý giám khảo"
        description="Theo dõi chuyên môn, người chấm mặc định và phân công theo cuộc thi."
      />

      {(judgesQuery.isLoading || contestsQuery.isLoading || assignmentsQuery.isLoading) && <StateMessage message="Đang tải danh sách giám khảo..." />}
      {(judgesQuery.error || contestsQuery.error || assignmentsQuery.error) && <StateMessage message={judgesQuery.error ?? contestsQuery.error ?? assignmentsQuery.error ?? "Không tải được dữ liệu."} isError />}

      {judgesQuery.data && <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4"><span className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><UserRoundCheck size={21} aria-hidden="true" /></span><div><h2 className="text-base font-bold text-[#0B356B]">Danh sách giám khảo</h2><p className="text-xs text-slate-500">Chuyên môn, trạng thái và khối lượng phân công</p></div></div>
        <div role="tablist" aria-label="Lọc trạng thái giám khảo" className="flex gap-5 overflow-x-auto border-b border-slate-200 px-5">{FILTERS.map((filter) => <button key={filter.id} type="button" role="tab" aria-selected={statusFilter === filter.id} onClick={() => { setStatusFilter(filter.id); setPage(1); }} className={`shrink-0 border-b-2 py-3 text-sm font-medium transition-colors ${statusFilter === filter.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{filter.label} <span className="text-xs opacity-75">({statusCounts[filter.id]})</span></button>)}</div>

        <div className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_240px_auto]"><label className="relative block"><span className="sr-only">Tìm kiếm giám khảo</span><Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={keyword} placeholder="Tìm tên, email, chuyên môn..." onChange={(event) => { setKeyword(event.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label><label><span className="sr-only">Lọc chuyên môn</span><select value={expertiseFilter} onChange={(event) => { setExpertiseFilter(event.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="ALL">Tất cả chuyên môn</option>{expertiseOptions.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}</select></label><button type="button" onClick={resetFilters} className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"><Filter size={16} aria-hidden="true" />Xóa bộ lọc</button></div>

        <div className="overflow-x-auto"><table className="w-full min-w-[920px] border-collapse text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-600"><tr><th scope="col" className="px-5 py-3 font-semibold">Họ và tên</th><th scope="col" className="px-4 py-3 font-semibold">Email</th><th scope="col" className="px-4 py-3 font-semibold">Chuyên môn</th><th scope="col" className="px-4 py-3 text-center font-semibold">Cuộc thi</th><th scope="col" className="px-4 py-3 font-semibold">Trạng thái</th><th scope="col" className="px-4 py-3 text-center font-semibold">Chấm mặc định</th><th scope="col" className="px-5 py-3 text-right font-semibold">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">
          {pageRows.map((judge) => { const managedCount = new Set(managedAssignments.filter((item) => item.judgeId === judge.id).map((item) => item.contestId)).size; const assignedCount = managedCount || (assignmentsQuery.data ?? []).filter((assignment) => assignment.judgeName === judge.fullName).length || judge.contestCount; return <tr key={judge.id} className="hover:bg-blue-50/40"><td className="px-5 py-3"><div className="flex items-center gap-3"><OrganizerAvatar name={judge.fullName} /><div className="min-w-0"><p className="font-semibold text-slate-900">{judge.fullName}</p><p className="text-xs text-slate-500">{judge.isDefault ? "Giám khảo mặc định" : "Giám khảo"}</p></div></div></td><td className="px-4 py-3 text-slate-600"><span className="inline-flex items-center gap-1.5"><Mail size={13} aria-hidden="true" />{judge.email}</span></td><td className="px-4 py-3 text-slate-700">{judge.specialty}</td><td className="px-4 py-3 text-center font-semibold text-blue-700">{assignedCount}</td><td className="px-4 py-3"><StatusBadge {...ACCOUNT_STATUS[judge.status]} /></td><td className="px-4 py-3 text-center"><button type="button" role="switch" aria-checked={judge.isDefault} aria-label={`${judge.isDefault ? "Bỏ" : "Đặt"} ${judge.fullName} làm giám khảo mặc định`} onClick={() => void toggleDefault(judge)} disabled={judge.status !== "ACTIVE"} className={`relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${judge.isDefault ? "bg-blue-600" : "bg-slate-300"}`}><span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${judge.isDefault ? "left-[1.375rem]" : "left-0.5"}`} /></button></td><td className="px-5 py-3 text-right"><button type="button" onClick={() => setSelectedJudge(judge)} aria-label={`Xem chi tiết giám khảo ${judge.fullName}`} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"><Eye size={15} aria-hidden="true" />Xem</button></td></tr>; })}
          {pageRows.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center"><Search size={28} aria-hidden="true" className="mx-auto mb-3 text-slate-300" /><p className="font-semibold text-slate-700">Không tìm thấy giám khảo phù hợp</p><p className="mt-1 text-xs text-slate-500">Thử từ khóa hoặc bộ lọc khác.</p><button type="button" onClick={resetFilters} className="mt-3 text-sm font-semibold text-blue-700 hover:underline">Hiện tất cả</button></td></tr>}
        </tbody></table></div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-3"><p>Hiển thị {firstRow}–{lastRow} của {filteredJudges.length} giám khảo</p><label className="flex items-center gap-2 text-xs">Dòng mỗi trang<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-700">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}</select></label></div><nav aria-label="Phân trang giám khảo" className="flex items-center gap-1"><button type="button" aria-label="Trang trước" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft size={15} aria-hidden="true" /></button><span className="px-2 text-xs">Trang {currentPage} / {pageCount}</span><button type="button" aria-label="Trang sau" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight size={15} aria-hidden="true" /></button></nav></footer>
      </div>}

      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><p>Organizer theo dõi danh sách giám khảo, đánh dấu người chấm mặc định và phân công theo cuộc thi. Trạng thái tài khoản do Admin quản lý.</p></div>
    </section>
  );
}
