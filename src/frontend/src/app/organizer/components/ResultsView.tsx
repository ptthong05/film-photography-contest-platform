import { StatusBadge } from "../../../components/StatusBadge";
import { resultService } from "../../../services/resultService";
import type { ContestResult } from "../../../types/result";
import { AWARD_LEVEL } from "../../../utils/awardLevels";
import type { Column } from "./DataTable";
import { ListPage } from "./ListPage";

const COLUMNS: Column<ContestResult>[] = [
  { header: "Hạng", render: (row) => <span className="font-bold text-navy-900">{row.rank}</span> },
  { header: "Tên tác phẩm", render: (row) => <span className="font-semibold text-navy-900">{row.title}</span> },
  { header: "Thí sinh", render: (row) => row.authorName },
  { header: "Điểm", render: (row) => row.score.toFixed(1) },
  { header: "Giải thưởng", render: (row) => <StatusBadge label={AWARD_LEVEL[row.award]} tone="warning" /> },
];

export function ResultsView() {
  return (
    <ListPage
      title="Kết quả"
      searchPlaceholder="Tìm theo tác phẩm, thí sinh..."
      unit="kết quả"
      fetcher={resultService.getResults}
      columns={COLUMNS}
      getKey={(row) => row.id}
      getSearchText={(row) => `${row.title} ${row.authorName}`}
    />
  );
}
