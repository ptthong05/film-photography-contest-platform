import { useCallback } from "react";
import { Calendar, Users } from "lucide-react";
import { CoverArt } from "../../../components/CoverArt";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { formatDate } from "../../../utils/formatDate";
import { CONTEST_STATUS } from "../../../utils/statusBadges";
import { PageHeader } from "./PageHeader";

interface ContestDetailPageProps {
  contestId: string;
  onBack: () => void;
}

export function ContestDetailPage({ contestId, onBack }: ContestDetailPageProps) {
  const fetcher = useCallback(() => contestService.getContestById(contestId), [contestId]);
  const { data: contest, isLoading, error } = useFetch(fetcher);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={contest?.name ?? "Chi tiết cuộc thi"} subtitle="Thông tin cuộc thi" onBack={onBack} />
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}
      {!isLoading && !error && !contest && <StateMessage message="Không tìm thấy cuộc thi." isError />}
      {contest && (
        <>
          <div className="card overflow-hidden rounded-3xl">
            <CoverArt seed={0} className="h-56 w-full" />
            <div className="flex flex-col gap-3 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge {...CONTEST_STATUS[contest.status]} />
                {(contest.tags ?? []).map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <Calendar size={16} aria-hidden />
                  {formatDate(contest.startDate)} - {formatDate(contest.endDate)}
                </span>
                <span className="flex items-center gap-2">
                  <Users size={16} aria-hidden />
                  {contest.participantCount} thí sinh · {contest.submissionCount.toLocaleString("en-US")} bài dự thi
                </span>
              </p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-2">
              <h2 className="mb-2 text-lg font-bold text-navy-900">Mô tả</h2>
              <p className="text-sm text-slate-600">{contest.description ?? "Chưa có mô tả."}</p>
            </div>
            <div className="card p-6">
              <h2 className="mb-2 text-lg font-bold text-navy-900">Giải thưởng</h2>
              <ul className="flex flex-col gap-2 text-sm">
                {(contest.prizes ?? []).map((prize, index) => (
                  <li key={`${prize.name}-${index}`} className="flex justify-between gap-3">
                    <span className="text-slate-600">{prize.name}</span>
                    <span className="font-semibold text-navy-900">{prize.reward}</span>
                  </li>
                ))}
                {!contest.prizes?.length && <li className="text-slate-400">Chưa thiết lập giải thưởng.</li>}
              </ul>
            </div>
            <div className="card p-6 lg:col-span-3">
              <h2 className="mb-2 text-lg font-bold text-navy-900">Giám khảo chấm</h2>
              <div className="flex flex-wrap gap-2">
                {(contest.judgeNames ?? []).map((name) => (
                  <span key={name} className="rounded-full bg-brand-500/10 px-3 py-1 text-sm font-semibold text-brand-600">
                    {name}
                  </span>
                ))}
                {!contest.judgeNames?.length && <span className="text-sm text-slate-400">Chưa chọn giám khảo.</span>}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
