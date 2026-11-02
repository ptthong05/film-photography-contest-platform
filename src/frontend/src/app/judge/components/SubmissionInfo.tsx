import { useId, useState, type ReactNode } from 'react';
import { Eye, EyeOff, UserRound } from 'lucide-react';
import type { AssignedSubmission } from '../../../types/judge';
import { formatDate } from '../../../utils/formatDate';
import { StatusBadge } from './StatusBadge';

const TECHNICAL_INFO_STORAGE_KEY = 'film_contest_judge_show_technical_info';

/** Nhớ lựa chọn ẩn/hiện của giám khảo giữa các bài; không đọc được storage thì mặc định hiện */
function readShowTechnicalInfo(): boolean {
  try {
    return window.localStorage.getItem(TECHNICAL_INFO_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

function saveShowTechnicalInfo(isShown: boolean) {
  try {
    window.localStorage.setItem(TECHNICAL_INFO_STORAGE_KEY, String(isShown));
  } catch {
    // Không lưu được thì chỉ mất lựa chọn khi tải lại trang
  }
}

interface SubmissionInfoProps {
  submission: AssignedSubmission;
  /** Nút hành động phụ đặt cuối khối, ví dụ "Xem ảnh gốc" */
  footer?: ReactNode;
}

/** UC-J2: giám khảo bật/tắt bảng thông tin kỹ thuật để chấm phần thẩm mỹ không bị ảnh hưởng hoặc đối chiếu kỹ thuật */
export function SubmissionInfo({ submission, footer }: SubmissionInfoProps) {
  const [isTechnicalInfoShown, setIsTechnicalInfoShown] = useState(readShowTechnicalInfo);
  const technicalInfoId = useId();
  const { metadata } = submission;

  const toggleTechnicalInfo = () => {
    const next = !isTechnicalInfoShown;
    setIsTechnicalInfoShown(next);
    saveShowTechnicalInfo(next);
  };
  const rows: [string, string][] = [
    ['Film stock', metadata.iso === null ? metadata.filmStock : `${metadata.filmStock} (ISO ${metadata.iso})`],
    ['Máy ảnh', metadata.camera],
    ['Ống kính', metadata.lens],
    ['Định dạng', metadata.filmFormat],
    ['Ngày chụp', metadata.shootingDate ? formatDate(metadata.shootingDate) : '—'],
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
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Thông tin kỹ thuật</h3>
          <button
            type="button"
            onClick={toggleTechnicalInfo}
            aria-expanded={isTechnicalInfoShown}
            aria-controls={technicalInfoId}
            className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            {isTechnicalInfoShown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {isTechnicalInfoShown ? 'Ẩn' : 'Hiện'}
          </button>
        </div>
        {isTechnicalInfoShown ? (
          <dl id={technicalInfoId} className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p id={technicalInfoId} className="text-sm italic text-slate-400">Đã ẩn film stock, máy ảnh, ống kính, lab và thông số scan.</p>
        )}
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
