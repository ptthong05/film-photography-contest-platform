import { useCallback, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, PenLine } from 'lucide-react';
import { judgeService } from '../../../services/judgeService';
import { useFetch } from '../../../hooks/useFetch';
import type { AssignedSubmission } from '../../../types/judge';
import { formatDate } from '../../../utils/formatDate';
import { getJudgingDeadlineInfo, isJudgingExpired } from '../../../utils/judgingDeadline';
import { AsyncState } from './AsyncState';
import { EvaluationHistoryList } from './EvaluationHistoryList';
import { ImageGallery } from './ImageGallery';
import { SubmissionInfo } from './SubmissionInfo';

type DetailTab = 'ORIGINAL' | 'EXTRA' | 'HISTORY';

const TABS: { value: DetailTab; label: string }[] = [
  { value: 'ORIGINAL', label: 'Ảnh gốc' },
  { value: 'EXTRA', label: 'Thông tin bổ sung' },
  { value: 'HISTORY', label: 'Lịch sử chấm' },
];

const SPROCKET_STYLE = {
  backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 5px, rgb(229 229 229) 5px 11px, transparent 11px 16px)',
};

function OriginalFilmTab({ submission }: { submission: AssignedSubmission }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-900">Ảnh gốc (nếu có)</h4>
        {submission.negativeUrls.length === 0 ? (
          <p className="text-sm text-slate-500">Thí sinh không cung cấp ảnh gốc.</p>
        ) : (
          <div className="rounded-md bg-neutral-900 px-2 py-1.5">
            <div className="h-1.5 rounded-sm" style={SPROCKET_STYLE} />
            <div className="my-1.5 grid grid-cols-3 gap-1.5">
              {submission.negativeUrls.map((url, index) => (
                <img key={url} src={url} alt={`Khung hình gốc ${index + 1}`} className="aspect-[3/2] w-full object-cover" />
              ))}
            </div>
            <div className="h-1.5 rounded-sm" style={SPROCKET_STYLE} />
          </div>
        )}
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-900">Contact sheet (nếu có)</h4>
        {submission.contactSheetUrl ? (
          <a href={submission.contactSheetUrl} target="_blank" rel="noreferrer" title="Mở ảnh kích thước đầy đủ" className="block rounded-md bg-neutral-900 p-2">
            <img src={submission.contactSheetUrl} alt="Contact sheet" className="w-full" />
          </a>
        ) : (
          <p className="text-sm text-slate-500">Thí sinh không cung cấp contact sheet.</p>
        )}
      </div>
    </div>
  );
}

function ExtraInfoTab({ submission }: { submission: AssignedSubmission }) {
  const { metadata } = submission;
  const rows: [string, string][] = [
    ['Cuộc thi', submission.contestTitle],
    ['Vòng chấm', submission.roundName],
    ['Ngày nộp', formatDate(submission.submittedAt)],
    ['ISO', String(metadata.iso)],
    ['Số khung hình', metadata.frameNumber],
    ['Địa điểm chụp', metadata.shootingLocation],
    ['Phòng lab tráng', metadata.developingLab],
    ['Thông số scan', metadata.scanSpec],
  ];

  return (
    <dl className="divide-y divide-slate-100 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[140px_1fr] gap-3 py-2.5">
          <dt className="text-slate-500">{label}</dt>
          <dd className="font-medium text-slate-800">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

interface JudgeSubmissionDetailPageProps {
  submissionId: string;
  onBack: () => void;
  onStartScoring: (submissionId: string) => void;
}

export function JudgeSubmissionDetailPage({ submissionId, onBack, onStartScoring }: JudgeSubmissionDetailPageProps) {
  const [tab, setTab] = useState<DetailTab>('ORIGINAL');
  const fetchSubmission = useCallback(() => judgeService.getSubmission(submissionId), [submissionId]);
  const { data: submission, isLoading, error, refetch } = useFetch(fetchSubmission);
  const contests = useFetch(judgeService.getContests);

  const currentContest = useMemo(
    () => (contests.data ?? []).find((c) => c.id === submission?.contestId),
    [contests.data, submission?.contestId],
  );
  const deadlineInfo = getJudgingDeadlineInfo(currentContest?.currentRound?.endDate);
  const isExpired = deadlineInfo.isExpired;
  const canScore = submission && submission.evaluationStatus !== 'FINALIZED' && !isExpired;

  return (
    <div className="space-y-6">
      {/* Top Header bar with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            aria-label="Quay lại danh sách"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Chi tiết tác phẩm</span>
              {submission && (
                <>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">Mã bài: {submission.id}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[#0B356B]">
              {submission?.title ?? 'Đang tải tác phẩm...'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isExpired && (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700">
              <AlertCircle size={15} /> Đã hết hạn chấm
            </span>
          )}
          {canScore && (
            <button
              type="button"
              onClick={() => onStartScoring(submission.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
            >
              <PenLine size={16} /> Chấm bài này
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Quay lại
          </button>
        </div>
      </div>

      <AsyncState isLoading={isLoading && !submission} error={error} onRetry={refetch} />

      {submission && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 text-slate-800">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            {/* Left side: gallery & metadata info */}
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px]">
              <ImageGallery
                imageUrls={submission.imageUrls}
                thumbnailUrls={submission.thumbnailUrls}
                title={submission.title}
              />
              <SubmissionInfo
                submission={submission}
                footer={
                  isExpired ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs text-rose-700">
                      <p className="font-bold">Đã hết thời hạn chấm điểm</p>
                      <p className="mt-0.5 text-slate-500">{deadlineInfo.message}</p>
                    </div>
                  ) : (
                    canScore && (
                      <button
                        type="button"
                        onClick={() => onStartScoring(submission.id)}
                        className="judge-btn-primary w-full"
                      >
                        <PenLine className="h-4 w-4" /> Chấm bài này
                      </button>
                    )
                  )
                }
              />
            </div>

            {/* Right side: tabs (Ảnh gốc, thông tin bổ sung, lịch sử chấm) */}
            <div>
              <div className="flex gap-1 border-b border-slate-200" role="tablist">
                {TABS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    aria-selected={item.value === tab}
                    onClick={() => setTab(item.value)}
                    className={`-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                      item.value === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-4">
                {tab === 'ORIGINAL' && <OriginalFilmTab submission={submission} />}
                {tab === 'EXTRA' && <ExtraInfoTab submission={submission} />}
                {tab === 'HISTORY' && <EvaluationHistoryList submissionId={submission.id} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
