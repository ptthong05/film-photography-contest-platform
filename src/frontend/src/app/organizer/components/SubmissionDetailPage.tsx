import { useCallback } from "react";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { submissionService } from "../../../services/submissionService";
import type { FilmMetadata } from "../../../types/submission";
import { formatDate } from "../../../utils/formatDate";
import { SUBMISSION_STATUS } from "../../../utils/statusBadges";
import { PageHeader } from "./PageHeader";
import { ContestCover } from "./ContestCover";

const METADATA_FIELDS: { key: keyof FilmMetadata; label: string }[] = [
  { key: "filmStock", label: "Loại phim (Film stock)" },
  { key: "iso", label: "ISO" },
  { key: "camera", label: "Thân máy (Camera)" },
  { key: "lens", label: "Ống kính (Lens)" },
  { key: "format", label: "Định dạng phim" },
  { key: "rollCode", label: "Mã cuộn phim" },
  { key: "frame", label: "Khung hình (Frame)" },
  { key: "location", label: "Địa điểm chụp" },
  { key: "lab", label: "Lab tráng phim" },
  { key: "scan", label: "Thông số scan" },
  { key: "negative", label: "Phim âm bản / contact sheet" },
];

interface SubmissionDetailPageProps {
  submissionId: string;
  onBack: () => void;
}

export function SubmissionDetailPage({ submissionId, onBack }: SubmissionDetailPageProps) {
  const fetcher = useCallback(() => submissionService.getSubmissionById(submissionId), [submissionId]);
  const { data: submission, isLoading, error } = useFetch(fetcher);

  return (
    <section className="space-y-5">
      <PageHeader
        title={submission?.title ?? "Chi tiết bài dự thi"}
        subtitle={submission ? `Mã bài dự thi: ${submission.code}` : undefined}
        onBack={onBack}
      />
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}
      {!isLoading && !error && !submission && <StateMessage message="Không tìm thấy bài dự thi." isError />}
      {submission && (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ContestCover title={submission.contestName} seed={Number(submission.code.slice(-1))} className="h-64 w-full" />
            <div className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge {...SUBMISSION_STATUS[submission.status]} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{submission.contestName}</span>
              </div>
              <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div className="flex gap-2"><dt className="text-slate-500">Tác giả:</dt><dd className="font-bold text-[#0B356B]">{submission.authorName}</dd></div>
                <div className="flex gap-2"><dt className="text-slate-500">Ngày nộp:</dt><dd className="font-medium text-[#0B356B]">{formatDate(submission.submittedAt)}</dd></div>
              </dl>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-bold text-[#0B356B]">Thông tin kỹ thuật ảnh phim</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {METADATA_FIELDS.map(({ key, label }) => (
                <div key={key} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-bold text-[#0B356B]">{submission.metadata[key]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
