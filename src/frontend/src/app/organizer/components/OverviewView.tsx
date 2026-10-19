import { Calendar, Images, Trophy, UserCheck, Users, type LucideIcon } from "lucide-react";
import { CoverArt } from "../../../components/CoverArt";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import type { OverviewStats } from "../../../types/contest";
import type { OrganizerViewProps } from "../../../types/organizer";
import { formatDate } from "../../../utils/formatDate";
import { CONTEST_STATUS } from "../../../utils/statusBadges";

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
    <section className="flex flex-col gap-8">
      <div className="card rounded-3xl p-8 shadow-md">
        <h1 className="text-4xl font-extrabold text-navy-950">Xin chào, Nguyễn Văn A! 👋</h1>
        <p className="mt-2 text-slate-600">Quản lý các cuộc thi nhiếp ảnh phim và theo dõi tiến độ chấm điểm của bạn.</p>
        {stats.error && <StateMessage message={stats.error} isError />}
        {stats.data && (
          <div className="mt-8 grid grid-cols-2 gap-5 xl:grid-cols-4">
            {STATS.map(({ key, label, icon: Icon, tone }) => (
              <div key={key} className={`flex items-center gap-4 rounded-2xl border p-5 ${tone}`}>
                <Icon size={30} aria-hidden />
                <div>
                  <p className="text-3xl font-extrabold text-navy-950">{(stats.data?.[key] ?? 0).toLocaleString("en-US")}</p>
                  <p className="text-sm font-semibold">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {contests.isLoading && <StateMessage message="Đang tải danh sách cuộc thi..." />}
      {contests.error && <StateMessage message={contests.error} isError />}
      {contests.data && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-navy-900">Các cuộc thi của tôi</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {contests.data.slice(0, 3).map((contest, index) => (
              <article key={contest.id} className="card overflow-hidden rounded-3xl shadow-md">
                <div className="relative">
                  <CoverArt seed={index} className="h-48 w-full" />
                  <div className="absolute left-3 top-3">
                    <StatusBadge {...CONTEST_STATUS[contest.status]} />
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-6">
                  <h3 className="text-xl font-bold text-brand-600">{contest.name}</h3>
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
                  <div className="flex flex-wrap gap-2">
                    {(contest.tags ?? []).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-primary w-full justify-center rounded-xl py-3 text-base"
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
