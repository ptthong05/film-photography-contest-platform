import { useState } from 'react';
import { ArrowRight, BookOpen, CircleCheck, ClipboardList, Hourglass, Image } from 'lucide-react';
import { judgeService } from '../../../services/judgeService';
import { useFetch } from '../../../hooks/useFetch';
import type { JudgeNotification, JudgeProfile, JudgeView } from '../../../types/judge';
import { AsyncState } from './AsyncState';
import { ContestProgressItem } from './ContestProgressItem';
import { NotificationItem } from './NotificationItem';
import { StatCard } from './StatCard';

const HERO_IMAGE_URL = 'https://picsum.photos/id/250/1600/700';

const JUDGING_GUIDELINES = [
  'Chấm độc lập, không trao đổi điểm với giám khảo khác trong khi vòng chấm đang diễn ra.',
  'Đánh giá đủ tất cả tiêu chí; điểm tổng được tính theo trọng số do ban tổ chức cấu hình.',
  'Đối chiếu ảnh với thông tin kỹ thuật (film stock, máy ảnh, scan) và âm bản nếu có.',
  'Có thể "Lưu nháp" nhiều lần; sau khi "Gửi đánh giá" phiếu chấm sẽ bị khóa.',
  'Báo cho ban tổ chức nếu bạn quen biết tác giả hoặc nghi ngờ bài vi phạm thể lệ.',
];

interface OverviewViewProps {
  profile: JudgeProfile | null;
  notifications: JudgeNotification[];
  onNavigate: (view: JudgeView) => void;
  onOpenContest: (contestId: string) => void;
}

export function OverviewView({ profile, notifications, onNavigate, onOpenContest }: OverviewViewProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const stats = useFetch(judgeService.getStats);
  const contests = useFetch(judgeService.getContests);

  const activeContests = (contests.data ?? []).filter((item) => item.status !== 'COMPLETED');

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-2xl bg-blue-950 bg-cover bg-center px-6 py-10 text-white sm:px-10"
        style={{ backgroundImage: `linear-gradient(90deg, rgb(23 37 84 / 0.97) 30%, rgb(23 37 84 / 0.55) 55%, rgb(23 37 84 / 0) 85%), url(${HERO_IMAGE_URL})` }}
      >
        <p className="text-sm text-blue-200">Giám khảo cuộc thi nhiếp ảnh phim</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Chào mừng trở lại, {profile?.fullName ?? 'Giám khảo'}!</h2>
        <p className="mt-3 max-w-lg text-blue-100 italic">
          “Mỗi bức ảnh phim là một câu chuyện. Hãy cùng tìm kiếm những câu chuyện xứng đáng được tỏa sáng.”
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label="Thống kê nhanh">
        <StatCard icon={ClipboardList} tone="blue" value={stats.data?.assignedContests ?? '–'} label="Cuộc thi được phân công" />
        <StatCard icon={Image} tone="emerald" value={stats.data?.pendingSubmissions ?? '–'} label="Bài dự thi cần chấm" />
        <StatCard icon={CircleCheck} tone="indigo" value={stats.data?.evaluatedSubmissions ?? '–'} label="Đã chấm điểm" />
        <StatCard icon={Hourglass} tone="amber" value={stats.data?.awaitingNextRound ?? '–'} label="Đang chờ vòng tiếp theo" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="judge-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Cuộc thi của tôi</h3>
            <button type="button" onClick={() => onNavigate('CONTESTS')} className="flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <AsyncState isLoading={contests.isLoading} error={contests.error} onRetry={contests.refetch} />
          {contests.data && (
            <div className="divide-y divide-slate-100">
              {activeContests.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Hiện chưa có cuộc thi cần chấm.</p>}
              {activeContests.map((contest) => (
                <ContestProgressItem key={contest.id} contest={contest} onOpenContest={onOpenContest} />
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="judge-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Thông báo</h3>
              <button type="button" onClick={() => onNavigate('MESSAGES')} className="flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="divide-y divide-slate-100">
              {notifications.slice(0, 4).map((item) => (
                <NotificationItem key={item.id} notification={item} />
              ))}
            </ul>
          </section>

          <section className="judge-card p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Hướng dẫn chấm điểm</h3>
                <p className="text-sm text-slate-500">Nguyên tắc và quy trình chấm điểm của nền tảng</p>
                <button type="button" onClick={() => setIsGuideOpen((value) => !value)} className="judge-btn-outline mt-3 px-3 py-1.5 text-xs">
                  {isGuideOpen ? 'Thu gọn' : 'Xem ngay'}
                </button>
              </div>
            </div>
            {isGuideOpen && (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
                {JUDGING_GUIDELINES.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
