import { CircleAlert, LoaderCircle } from 'lucide-react';

interface AsyncStateProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

/** Hiển thị trạng thái loading / error thống nhất cho các khối dữ liệu của Judge Portal. */
export function AsyncState({ isLoading, error, onRetry }: AsyncStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-rose-600">
        <span className="flex items-center gap-2">
          <CircleAlert className="h-4 w-4" />
          {error}
        </span>
        {onRetry && (
          <button type="button" onClick={onRetry} className="judge-btn-outline">
            Thử lại
          </button>
        )}
      </div>
    );
  }

  return null;
}
