import { CoverArt } from "../../../components/CoverArt";
import { StatusBadge } from "../../../components/StatusBadge";
import { submissionService } from "../../../services/submissionService";
import type { Submission } from "../../../types/submission";
import { formatDate } from "../../../utils/formatDate";
import { SUBMISSION_STATUS } from "../../../utils/statusBadges";
import type { Column } from "./DataTable";
import { ListPage } from "./ListPage";
import type { DetailInfo } from "./DetailModal";

const COLUMNS: Column<Submission>[] = [
  { header: "#", render: (_row, index) => index + 1 },
  { header: "Ảnh", render: (_row, index) => <CoverArt seed={index} className="h-10 w-14 rounded-md" /> },
  { header: "Tên tác phẩm", render: (row) => <span className="font-semibold text-navy-900">{row.title}</span> },
  { header: "Thí sinh", render: (row) => row.authorName },
  { header: "Cuộc thi", render: (row) => row.contestName },
  { header: "Ngày nộp", render: (row) => formatDate(row.submittedAt) },
  { header: "Trạng thái", render: (row) => <StatusBadge {...SUBMISSION_STATUS[row.status]} /> },
];

function toDetail(row: Submission): DetailInfo {
  return {
    title: row.title,
    fields: [
      { label: "Thí sinh", value: row.authorName },
      { label: "Cuộc thi", value: row.contestName },
      { label: "Ngày nộp", value: formatDate(row.submittedAt) },
      { label: "Trạng thái", value: <StatusBadge {...SUBMISSION_STATUS[row.status]} /> },
    ],
  };
}

export function SubmissionsView() {
  return (
    <ListPage
      title="Quản lý bài dự thi"
      searchPlaceholder="Tìm kiếm theo đề, thí sinh..."
      unit="bài dự thi"
      fetcher={submissionService.getSubmissions}
      columns={COLUMNS}
      getKey={(row) => row.id}
      getSearchText={(row) => `${row.title} ${row.authorName} ${row.contestName}`}
      getDetail={toDetail}
    />
  );
}
