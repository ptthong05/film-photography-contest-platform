import { Calendar, Images, Trophy, UserCheck, Users, type LucideIcon } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { formatDate } from "../../../utils/formatDate";
import { CONTEST_STATUS } from "../../../utils/statusBadges";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
        <Icon size={22} aria-hidden />
      </span>
      <div>
        <p className="text-2xl font-bold text-navy-900">{value.toLocaleString("en-US")}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function OverviewView() {
  const stats = useFetch(contestService.getOverviewStats);
  const contests = useFetch(contestService.getContests);

  const featured = contests.data?.[0];

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-navy-900">Tổng quan</h1>

      {stats.error && <StateMessage message={stats.error} isError />}
      {stats.data && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Cuộc thi đang diễn ra" value={stats.data.ongoingContests} icon={Trophy} />
          <StatCard label="Thí sinh tham gia" value={stats.data.participants} icon={Users} />
          <StatCard label="Bài dự thi" value={stats.data.submissions} icon={Images} />
          <StatCard label="Giám khảo" value={stats.data.judges} icon={UserCheck} />
        </div>
      )}

      {contests.isLoading && <StateMessage message="Đang tải danh sách cuộc thi..." />}
      {contests.error && <StateMessage message={contests.error} isError />}

      {featured && (
        <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-navy-950 via-navy-800 to-brand-600 p-8 text-white">
          <StatusBadge {...CONTEST_STATUS[featured.status]} />
          <h2 className="text-3xl font-bold">{featured.name}</h2>
          <p className="flex items-center gap-2 text-sm text-slate-200">
            <Calendar size={16} aria-hidden />
            {formatDate(featured.startDate)} - {formatDate(featured.endDate)}
          </p>
          <p className="text-sm text-slate-200">
            {featured.participantCount} thí sinh · {featured.submissionCount.toLocaleString("en-US")} bài dự thi
          </p>
          <div className="mt-2 flex gap-3">
            <button type="button" className="btn-primary">
              Xem chi tiết
            </button>
            <button type="button" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-900">
              Quản lý
            </button>
          </div>
        </div>
      )}

      {contests.data && (
        <div>
          <h2 className="mb-3 text-lg font-bold text-navy-900">Các cuộc thi của tôi</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {contests.data.slice(0, 3).map((contest) => (
              <article key={contest.id} className="card overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-navy-800 to-brand-500" />
                <div className="flex flex-col gap-2 p-3">
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
    </section>
  );
}
