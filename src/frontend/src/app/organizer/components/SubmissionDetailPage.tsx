import { useCallback } from "react";
import { CoverArt } from "../../../components/CoverArt";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { submissionService } from "../../../services/submissionService";
import type { FilmMetadata } from "../../../types/submission";
import { formatDate } from "../../../utils/formatDate";
import { SUBMISSION_STATUS } from "../../../utils/statusBadges";
import { PageHeader } from "./PageHeader";

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
    <section className="flex flex-col gap-6">
      <PageHeader
        title={submission?.title ?? "Chi tiết bài dự thi"}
        subtitle={submission ? `Mã bài dự thi: ${submission.code}` : undefined}
        onBack={onBack}
      />
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}
      {!isLoading && !error && !submission && <StateMessage message="Không tìm thấy bài dự thi." isError />}
      {submission && (
        <div className="card flex flex-col gap-8 rounded-3xl p-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            <CoverArt seed={Number(submission.code.slice(-1))} className="size-56 shrink-0 rounded-2xl" />
            <dl className="grid h-fit grid-cols-[6rem_1fr] items-center gap-x-4 gap-y-3 text-sm">
              <dt className="text-slate-500">Tác giả</dt>
              <dd className="font-bold text-navy-900">{submission.authorName}</dd>
              <dt className="text-slate-500">Cuộc thi</dt>
              <dd className="font-bold text-navy-900">{submission.contestName}</dd>
              <dt className="text-slate-500">Ngày nộp</dt>
              <dd className="font-medium text-navy-900">{formatDate(submission.submittedAt)}</dd>
              <dt className="text-slate-500">Trạng thái</dt>
              <dd>
                <StatusBadge {...SUBMISSION_STATUS[submission.status]} />
              </dd>
            </dl>
          </div>
          <div>
            <h2 className="mb-4 text-lg font-bold text-navy-900">Thông tin kỹ thuật ảnh phim (Metadata)</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {METADATA_FIELDS.map(({ key, label }) => (
                <div key={key} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-bold text-navy-900">{submission.metadata[key]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
