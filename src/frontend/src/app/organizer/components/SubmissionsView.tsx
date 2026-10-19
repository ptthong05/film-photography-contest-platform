import { CoverArt } from "../../../components/CoverArt";
import { StatusBadge } from "../../../components/StatusBadge";
import { submissionService } from "../../../services/submissionService";
import type { OrganizerViewProps } from "../../../types/organizer";
import type { Submission } from "../../../types/submission";
import { formatDate } from "../../../utils/formatDate";
import { SUBMISSION_STATUS } from "../../../utils/statusBadges";
import type { Column } from "./DataTable";
import { ListPage } from "./ListPage";

const COLUMNS: Column<Submission>[] = [
  { header: "#", render: (_row, index) => index + 1 },
  { header: "Ảnh", render: (_row, index) => <CoverArt seed={index} className="h-10 w-14 rounded-md" /> },
  { header: "Tên tác phẩm", render: (row) => <span className="font-semibold text-navy-900">{row.title}</span> },
  { header: "Thí sinh", render: (row) => row.authorName },
  { header: "Cuộc thi", render: (row) => row.contestName },
  { header: "Ngày nộp", render: (row) => formatDate(row.submittedAt) },
  { header: "Trạng thái", render: (row) => <StatusBadge {...SUBMISSION_STATUS[row.status]} /> },
];

export function SubmissionsView({ onNavigate }: OrganizerViewProps) {
  return (
    <ListPage
      title="Quản lý bài dự thi"
      searchPlaceholder="Tìm kiếm theo đề, thí sinh..."
      unit="bài dự thi"
      fetcher={submissionService.getSubmissions}
      columns={COLUMNS}
      getKey={(row) => row.id}
      getSearchText={(row) => `${row.title} ${row.authorName} ${row.contestName}`}
      onView={(row) => onNavigate({ view: "SUBMISSION_DETAIL", id: row.id, backTo: "SUBMISSIONS" })}
    />
  );
}
