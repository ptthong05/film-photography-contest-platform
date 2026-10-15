import { submissionService } from "../../../services/submissionService";
import type { Submission } from "../../../types/submission";
import { formatDate } from "../../../utils/formatDate";
import type { Column } from "./DataTable";
import { ListPage } from "./ListPage";

const COLUMNS: Column<Submission>[] = [
  { header: "Ảnh gốc", render: () => <div className="h-10 w-14 rounded bg-gradient-to-br from-navy-800 to-brand-500" /> },
  { header: "Tên tác phẩm", render: (row) => <span className="font-semibold text-navy-900">{row.title}</span> },
  { header: "Thí sinh", render: (row) => row.authorName },
  { header: "Cuộc thi", render: (row) => row.contestName },
  { header: "Ngày nộp", render: (row) => formatDate(row.submittedAt) },
  { header: "Thao tác", render: () => <button type="button" className="btn-outline">Tải lại</button> },
];

export function ArchiveView() {
  return (
    <ListPage
      title="Kho dữ liệu"
      searchPlaceholder="Tìm theo tác phẩm, thí sinh..."
      unit="tác phẩm"
      fetcher={submissionService.getSubmissions}
      columns={COLUMNS}
      getKey={(row) => row.id}
      getSearchText={(row) => `${row.title} ${row.authorName} ${row.contestName}`}
    />
  );
}
