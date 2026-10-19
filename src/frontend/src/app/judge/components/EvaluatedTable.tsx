import type { AssignedSubmission, Evaluation } from '../../../types/judge';
import { formatDate } from '../../../utils/formatDate';
import { StatusBadge } from './StatusBadge';

interface EvaluatedTableProps {
  submissions: AssignedSubmission[];
  evaluations: Evaluation[];
  onViewDetail: (submissionId: string) => void;
}

export function EvaluatedTable({ submissions, evaluations, onViewDetail }: EvaluatedTableProps) {
  if (submissions.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-500">Bạn chưa gửi phiếu chấm nào trong cuộc thi này.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
          <tr>
            <th className="px-3 py-3">#</th>
            <th className="px-3 py-3">Ảnh thi</th>
            <th className="px-3 py-3">Tên tác phẩm</th>
            <th className="px-3 py-3 text-right">Điểm của bạn</th>
            <th className="px-3 py-3">Trạng thái</th>
            <th className="px-3 py-3">Nhận xét</th>
            <th className="px-3 py-3">Ngày chấm</th>
            <th className="px-3 py-3 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {submissions.map((submission, index) => {
            const evaluation = evaluations.find((item) => item.submissionId === submission.id);
            return (
              <tr key={submission.id} className="hover:bg-slate-50">
                <td className="px-3 py-3 text-slate-500">{index + 1}</td>
                <td className="px-3 py-3">
                  <img src={submission.thumbnailUrls[0]} alt={submission.title} className="h-12 w-16 rounded-md object-cover" loading="lazy" />
                </td>
                <td className="px-3 py-3 font-semibold text-slate-900">{submission.title}</td>
                <td className="px-3 py-3 text-right text-base font-bold text-blue-700 tabular-nums">{submission.totalScore?.toFixed(1) ?? '–'}</td>
                <td className="px-3 py-3">
                  <StatusBadge kind="custom" label="Đã gửi" tone="emerald" />
                </td>
                <td className="max-w-xs px-3 py-3 text-slate-600">
                  <p className="truncate" title={evaluation?.comment}>{evaluation?.comment}</p>
                </td>
                <td className="px-3 py-3 text-slate-600">{submission.evaluatedAt ? formatDate(submission.evaluatedAt) : '–'}</td>
                <td className="px-3 py-3 text-center">
                  <button type="button" onClick={() => onViewDetail(submission.id)} className="judge-btn-outline px-3 py-1.5">
                    Xem
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
