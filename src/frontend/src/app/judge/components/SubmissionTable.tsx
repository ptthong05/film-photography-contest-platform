import { useState } from 'react';
import { Eye, MoreVertical, PenLine } from 'lucide-react';
import type { AssignedSubmission } from '../../../types/judge';
import { formatDate } from '../../../utils/formatDate';
import { StatusBadge } from './StatusBadge';

interface SubmissionTableProps {
  submissions: AssignedSubmission[];
  startIndex: number;
  onStartScoring: (submissionId: string) => void;
  onViewDetail: (submissionId: string) => void;
}

export function SubmissionTable({ submissions, startIndex, onStartScoring, onViewDetail }: SubmissionTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleMenuAction = (action: (submissionId: string) => void, submissionId: string) => {
    setOpenMenuId(null);
    action(submissionId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
          <tr>
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">Ảnh thu nhỏ</th>
            <th className="px-3 py-3">Tên tác phẩm</th>
            <th className="px-3 py-3">Tác giả</th>
            <th className="px-3 py-3">Chủ đề</th>
            <th className="px-3 py-3">Thông tin film</th>
            <th className="px-3 py-3">Ngày nộp</th>
            <th className="px-3 py-3">Trạng thái</th>
            <th className="px-3 py-3 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {submissions.map((submission, index) => {
            const isFinalized = submission.evaluationStatus === 'FINALIZED';
            return (
              <tr key={submission.id} className="hover:bg-slate-50">
                <td className="px-3 py-3 text-slate-500">{startIndex + index + 1}</td>
                <td className="px-3 py-3">
                  <img src={submission.thumbnailUrls[0]} alt={submission.title} className="h-14 w-20 rounded-md object-cover" loading="lazy" />
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-slate-900">{submission.title}</p>
                  <p className="text-xs text-slate-400">{submission.contestTitle}</p>
                </td>
                <td className="px-3 py-3 text-slate-600">{submission.authorName ?? <span className="italic text-slate-400">Ẩn danh</span>}</td>
                <td className="px-3 py-3">
                  <StatusBadge kind="custom" label={submission.category} tone="sky" />
                </td>
                <td className="px-3 py-3 text-xs leading-5 text-slate-600">
                  <p className="font-medium text-slate-800">{submission.metadata.filmStock}</p>
                  <p>{submission.metadata.cameraBody}</p>
                  <p>{submission.metadata.lens}</p>
                </td>
                <td className="px-3 py-3 text-slate-600">{formatDate(submission.submittedAt)}</td>
                <td className="px-3 py-3">
                  <StatusBadge kind="evaluation" status={submission.evaluationStatus} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => (isFinalized ? onViewDetail(submission.id) : onStartScoring(submission.id))}
                      className={`${isFinalized ? 'judge-btn-outline' : 'judge-btn-primary'} w-28 py-1.5`}
                    >
                      {isFinalized ? 'Xem' : 'Chấm điểm'}
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === submission.id ? null : submission.id)}
                        className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        aria-label={`Thao tác khác cho ${submission.title}`}
                        aria-expanded={openMenuId === submission.id}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === submission.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} aria-hidden="true" />
                          <div className="absolute right-full bottom-0 z-20 mr-1 w-40 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg" role="menu">
                            <button type="button" role="menuitem" onClick={() => handleMenuAction(onViewDetail, submission.id)} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                              <Eye className="h-4 w-4" /> Xem chi tiết
                            </button>
                            {!isFinalized && (
                              <button type="button" role="menuitem" onClick={() => handleMenuAction(onStartScoring, submission.id)} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <PenLine className="h-4 w-4" /> Chấm điểm
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
