import { useCallback, useEffect, useState } from 'react';
import { PenLine, X } from 'lucide-react';
import { judgeService } from '../../../services/judgeService';
import { useFetch } from '../../../hooks/useFetch';
import type { AssignedSubmission } from '../../../types/judge';
import { formatDate } from '../../../utils/formatDate';
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

interface SubmissionDetailModalProps {
  submissionId: string;
  onClose: () => void;
  onStartScoring: (submissionId: string) => void;
}

export function SubmissionDetailModal({ submissionId, onClose, onStartScoring }: SubmissionDetailModalProps) {
  const [tab, setTab] = useState<DetailTab>('ORIGINAL');
  const fetchSubmission = useCallback(() => judgeService.getSubmission(submissionId), [submissionId]);
  const { data: submission, isLoading, error, refetch } = useFetch(fetchSubmission);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết bài dự thi"
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-full w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-5 text-slate-800 shadow-2xl sm:p-6"
      >
        <button type="button" onClick={onClose} className="absolute top-3 right-3 z-10 cursor-pointer rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng">
          <X className="h-5 w-5" />
        </button>

        <AsyncState isLoading={isLoading && !submission} error={error} onRetry={refetch} />
        {submission && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_240px]">
              <ImageGallery imageUrls={submission.imageUrls} thumbnailUrls={submission.thumbnailUrls} title={submission.title} />
              <SubmissionInfo
                submission={submission}
                footer={
                  submission.evaluationStatus !== 'FINALIZED' && (
                    <button type="button" onClick={() => onStartScoring(submission.id)} className="judge-btn-primary w-full">
                      <PenLine className="h-4 w-4" /> Chấm bài này
                    </button>
                  )
                }
              />
            </div>

            <div>
              <div className="flex gap-1 border-b border-slate-200 pr-10" role="tablist">
                {TABS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    aria-selected={item.value === tab}
                    onClick={() => setTab(item.value)}
                    className={`-mb-px cursor-pointer border-b-2 px-3 py-2.5 text-sm font-medium ${item.value === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
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
        )}
      </div>
    </div>
  );
}

// Hàng lỗ răng cưa của dải phim 35mm, vẽ bằng gradient để không cần ảnh nền riêng
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
