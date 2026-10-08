import type { ReactNode } from 'react';
import { UserRound } from 'lucide-react';
import type { AssignedSubmission } from '../../../types/judge';
import { formatDate } from '../../../utils/formatDate';
import { StatusBadge } from './StatusBadge';

interface SubmissionInfoProps {
  submission: AssignedSubmission;
  /** Nút hành động phụ đặt cuối khối, ví dụ "Xem ảnh gốc" */
  footer?: ReactNode;
}

export function SubmissionInfo({ submission, footer }: SubmissionInfoProps) {
  const { metadata } = submission;
  const rows: [string, string][] = [
    ['Film stock', `${metadata.filmStock} (ISO ${metadata.iso})`],
    ['Máy ảnh', metadata.cameraBody],
    ['Ống kính', metadata.lens],
    ['Định dạng', metadata.filmFormat],
    ['Ngày chụp', formatDate(metadata.shootingDate)],
    ['Lab xử lý', metadata.developingLab],
    ['Scan', metadata.scanSpec],
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{submission.title}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
          <UserRound className="h-4 w-4 text-slate-400" />
          {submission.authorName ?? <span className="italic text-slate-400">Tác giả ẩn danh</span>}
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Thông tin kỹ thuật</h3>
        <dl className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Chủ đề</h3>
        <StatusBadge kind="custom" label={submission.category} tone="sky" />
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-slate-900">Mô tả</h3>
        <p className="text-sm leading-6 text-slate-600">{submission.description}</p>
      </div>

      {footer}
    </div>
  );
}
