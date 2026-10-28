import { Calendar, Images, Trophy, UserCheck, Users, type LucideIcon } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import type { OverviewStats } from "../../../types/contest";
import type { OrganizerViewProps } from "../../../types/organizer";
import { formatDate } from "../../../utils/formatDate";
import { CONTEST_STATUS } from "../../../utils/statusBadges";
import { ContestCover } from "./ContestCover";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

interface StatConfig {
  key: keyof OverviewStats;
  label: string;
  icon: LucideIcon;
  tone: string;
}

const STATS: StatConfig[] = [
  { key: "ongoingContests", label: "Cuộc thi đang diễn ra", icon: Trophy, tone: "border-blue-100 bg-blue-50/60 text-blue-600" },
  { key: "participants", label: "Thí sinh tham gia", icon: Users, tone: "border-sky-100 bg-sky-50/60 text-sky-600" },
  { key: "submissions", label: "Bài dự thi", icon: Images, tone: "border-indigo-100 bg-indigo-50/60 text-indigo-600" },
  { key: "judges", label: "Giám khảo", icon: UserCheck, tone: "border-amber-100 bg-amber-50/60 text-amber-600" },
];

export function OverviewView({ onNavigate }: OrganizerViewProps) {
  const stats = useFetch(contestService.getOverviewStats);
  const contests = useFetch(contestService.getContests);

  return (
    <section aria-label="Tổng quan ban tổ chức" className="space-y-5">
      <OrganizerPageHeader title="Tổng quan" description="Theo dõi nhanh cuộc thi, thí sinh, bài dự thi và giám khảo." />
      <div>
        {stats.error && <StateMessage message={stats.error} isError />}
        {stats.data && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map(({ key, label, icon: Icon, tone }) => (
              <article key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={19} aria-hidden="true" /></span>
                <div>
                  <p className="text-xl font-extrabold tracking-tight text-[#0B356B]">{(stats.data?.[key] ?? 0).toLocaleString("vi-VN")}</p>
                  <p className="text-xs font-medium text-slate-600">{label}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {contests.isLoading && <StateMessage message="Đang tải danh sách cuộc thi..." />}
      {contests.error && <StateMessage message={contests.error} isError />}
      {contests.data && (
        <div className="space-y-5">
          {contests.data[0] && (
            <article className="group relative min-h-64 overflow-hidden rounded-2xl bg-[#0B356B] shadow-sm">
              <ContestCover title={contests.data[0].name} seed={0} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
              <div className="relative flex min-h-64 flex-col items-start justify-end gap-4 p-6 text-white sm:p-9">
                <StatusBadge {...CONTEST_STATUS[contests.data[0].status]} />
                <div>
                  <p className="text-sm font-semibold text-blue-100">CUỘC THI NỔI BẬT</p>
                  <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">{contests.data[0].name}</h2>
                  <p className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
                    <span className="inline-flex items-center gap-2"><Calendar size={16} aria-hidden />{formatDate(contests.data[0].startDate)} – {formatDate(contests.data[0].endDate)}</span>
                    <span className="inline-flex items-center gap-2"><Users size={16} aria-hidden />{contests.data[0].participantCount.toLocaleString("vi-VN")} thí sinh</span>
                    <span className="inline-flex items-center gap-2"><Images size={16} aria-hidden />{contests.data[0].submissionCount.toLocaleString("vi-VN")} bài dự thi</span>
                  </p>
                </div>
                <button type="button" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500" onClick={() => onNavigate({ view: "CONTEST_DETAIL", id: contests.data![0].id })}>
                  Xem chi tiết
                </button>
              </div>
            </article>
          )}
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-[#0B356B]">Các cuộc thi của tôi</h2><span className="text-xs text-slate-500">{contests.data.length} cuộc thi</span></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {contests.data.slice(1).map((contest, index) => (
              <article key={contest.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative">
                  <ContestCover title={contest.name} seed={index} className="h-48 w-full transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute left-3 top-3">
                    <StatusBadge {...CONTEST_STATUS[contest.status]} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <h3 className="min-h-7 text-lg font-bold text-[#0B356B]">{contest.name}</h3>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} aria-hidden />
                      {formatDate(contest.startDate)} - {formatDate(contest.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-semibold">
                      <Users size={14} aria-hidden />
                      {contest.participantCount}
                    </span>
                  </div>
                  <div className="flex min-h-12 flex-wrap content-start gap-2">
                    {(contest.tags ?? []).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    onClick={() => onNavigate({ view: "CONTEST_DETAIL", id: contest.id })}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
