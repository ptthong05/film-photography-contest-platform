import { useState } from "react";
import { ArrowRight, Calendar, Images, Trophy, UserCheck, Users, type LucideIcon } from "lucide-react";
import { CoverArt } from "../../../components/CoverArt";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import type { OverviewStats } from "../../../types/contest";
import { formatDate } from "../../../utils/formatDate";
import { CONTEST_STATUS } from "../../../utils/statusBadges";
import { DetailModal, type DetailInfo } from "./DetailModal";
import { toContestDetail } from "./toContestDetail";

interface StatConfig {
  key: keyof OverviewStats;
  label: string;
  icon: LucideIcon;
  tone: string;
}

const STATS: StatConfig[] = [
  { key: "ongoingContests", label: "Cuộc thi đang diễn ra", icon: Trophy, tone: "bg-emerald-50 text-emerald-600" },
  { key: "participants", label: "Thí sinh tham gia", icon: Users, tone: "bg-sky-50 text-sky-600" },
  { key: "submissions", label: "Bài dự thi", icon: Images, tone: "bg-violet-50 text-violet-600" },
  { key: "judges", label: "Giám khảo", icon: UserCheck, tone: "bg-amber-50 text-amber-600" },
];

export function OverviewView() {
  const stats = useFetch(contestService.getOverviewStats);
  const contests = useFetch(contestService.getContests);
  const featured = contests.data?.[0];
  const [detail, setDetail] = useState<DetailInfo | null>(null);

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-navy-900">Tổng quan</h1>

      {stats.error && <StateMessage message={stats.error} isError />}
      {stats.data && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {STATS.map(({ key, label, icon: Icon, tone }) => (
            <div key={key} className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
              <span className={`flex size-12 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={22} aria-hidden />
              </span>
              <div>
                <p className="text-2xl font-bold text-navy-900">{(stats.data?.[key] ?? 0).toLocaleString("en-US")}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {contests.isLoading && <StateMessage message="Đang tải danh sách cuộc thi..." />}
      {contests.error && <StateMessage message={contests.error} isError />}

      {featured && (
        <div className="relative isolate flex min-h-72 items-center overflow-hidden rounded-2xl text-white shadow-lg">
          <CoverArt seed={0} className="absolute inset-0 -z-20 size-full" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/90 via-navy-950/50 to-transparent" />
          <div className="flex flex-col items-start gap-4 p-8">
            <StatusBadge {...CONTEST_STATUS[featured.status]} />
            <h2 className="text-4xl font-bold tracking-tight">{featured.name}</h2>
            <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-100">
              <span className="flex items-center gap-2">
                <Calendar size={16} aria-hidden />
                {formatDate(featured.startDate)} - {formatDate(featured.endDate)}
              </span>
              <span className="flex items-center gap-2">
                <Users size={16} aria-hidden />
                {featured.participantCount} thí sinh
              </span>
              <span className="flex items-center gap-2">
                <Images size={16} aria-hidden />
                {featured.submissionCount.toLocaleString("en-US")} bài dự thi
              </span>
            </p>
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-primary" onClick={() => setDetail(toContestDetail(featured))}>
                Xem chi tiết
              </button>
              <button type="button" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-100" onClick={() => setDetail(toContestDetail(featured))}>
                Quản lý
              </button>
            </div>
          </div>
        </div>
      )}

      {contests.data && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">Các cuộc thi của tôi</h2>
            <span className="flex items-center gap-1 text-sm font-medium text-brand-500">
              Xem tất cả <ArrowRight size={14} aria-hidden />
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {contests.data.slice(0, 3).map((contest, index) => (
              <article key={contest.id} className="card group overflow-hidden transition-shadow hover:shadow-lg">
                <CoverArt seed={index} className="h-32 w-full transition-transform duration-300 group-hover:scale-105" />
                <div className="flex flex-col gap-2 border-t border-slate-100 bg-white p-3">
                  <h3 className="text-sm font-semibold text-navy-900">{contest.name}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <StatusBadge {...CONTEST_STATUS[contest.status]} />
                    <span>{contest.submissionCount.toLocaleString("en-US")} bài</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}
