import { useCallback } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Image } from 'lucide-react';
import { judgeService } from '../../../services/judgeService';
import { useFetch } from '../../../hooks/useFetch';
import type { EvaluationRequest } from '../../../types/judge';
import { AsyncState } from './AsyncState';
import { ImageGallery } from './ImageGallery';
import { ScoringPanel } from './ScoringPanel';
import { StatusBadge } from './StatusBadge';
import { SubmissionInfo } from './SubmissionInfo';

interface ScoringViewProps {
  /** null khi vào từ menu "Đánh giá": tự chọn bài chưa chấm đầu tiên */
  submissionId: string | null;
  onSelectSubmission: (submissionId: string) => void;
  onViewDetail: (submissionId: string) => void;
  onBackToList: () => void;
}

export function ScoringView({ submissionId, onSelectSubmission, onViewDetail, onBackToList }: ScoringViewProps) {
  const submissions = useFetch(judgeService.getAssignedSubmissions);
  const contests = useFetch(judgeService.getContests);

  const allSubmissions = submissions.data ?? [];
  const current =
    allSubmissions.find((item) => item.id === submissionId) ??
    allSubmissions.find((item) => item.evaluationStatus !== 'FINALIZED') ??
    allSubmissions[0];
  const currentId = current?.id ?? '';

  // Gắn submissionId vào kết quả để biết phiếu chấm đang giữ có đúng là của bài đang hiển thị không
  const fetchEvaluation = useCallback(
    async () => ({ submissionId: currentId, evaluation: currentId ? await judgeService.getEvaluation(currentId) : null }),
    [currentId],
  );
  const evaluation = useFetch(fetchEvaluation);
  const isEvaluationReady = evaluation.data?.submissionId === currentId;

  // Chỉ chặn toàn màn hình ở lần tải đầu; các lần refetch sau khi lưu giữ nguyên giao diện
  if (!submissions.data || !contests.data) {
    const handleRetry = () => {
      void submissions.refetch();
      void contests.refetch();
    };
    return (
      <div className="judge-card">
        <AsyncState isLoading={!submissions.error && !contests.error} error={submissions.error ?? contests.error} onRetry={handleRetry} />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="judge-card py-16 text-center text-sm text-slate-500">
        Bạn chưa được phân công bài dự thi nào.
      </div>
    );
  }

  const contest = contests.data?.find((item) => item.id === current.contestId);
  const siblings = allSubmissions.filter((item) => item.contestId === current.contestId);
  const position = siblings.findIndex((item) => item.id === current.id);
  const previous = siblings[position - 1];
  const next = siblings[position + 1];

  const handleSave = async (request: EvaluationRequest) => {
    await judgeService.saveEvaluation(current.id, request);
    await Promise.all([evaluation.refetch(), submissions.refetch(), contests.refetch()]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
          <button type="button" onClick={onBackToList} className="cursor-pointer hover:text-blue-600">Đánh giá</button>
          <ChevronRight className="h-4 w-4" />
          <span>{current.contestTitle}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-slate-800">Bài {position + 1}/{siblings.length}</span>
          <span className="ml-2"><StatusBadge kind="custom" label={current.roundName} tone="sky" /></span>
        </nav>
        <div className="flex gap-2">
          <button type="button" disabled={!previous} onClick={() => previous && onSelectSubmission(previous.id)} className="judge-btn-outline py-1.5">
            <ArrowLeft className="h-4 w-4" /> Bài trước
          </button>
          <button type="button" disabled={!next} onClick={() => next && onSelectSubmission(next.id)} className="judge-btn-primary py-1.5">
            Bài tiếp theo <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="judge-card grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <ImageGallery key={current.id} imageUrls={current.imageUrls} thumbnailUrls={current.thumbnailUrls} title={current.title} />
          <SubmissionInfo
            submission={current}
            footer={
              <button type="button" onClick={() => onViewDetail(current.id)} className="judge-btn-outline w-full">
                <Image className="h-4 w-4" /> Xem ảnh gốc (nếu có)
              </button>
            }
          />
        </div>

        <aside className="judge-card p-5">
          {isEvaluationReady && contest ? (
            <ScoringPanel key={current.id} criteria={contest.criteria} evaluation={evaluation.data?.evaluation ?? null} onSave={handleSave} />
          ) : (
            <AsyncState
              isLoading={!isEvaluationReady && !evaluation.error}
              error={evaluation.error ?? (contest ? null : 'Không tìm thấy cấu hình tiêu chí của cuộc thi')}
              onRetry={evaluation.refetch}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
