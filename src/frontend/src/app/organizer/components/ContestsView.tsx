import { useState } from "react";
import { Plus } from "lucide-react";
import { SearchInput } from "../../../components/SearchInput";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import type { Contest, ContestStatus } from "../../../types/contest";
import { formatDate } from "../../../utils/formatDate";
import { CONTEST_STATUS } from "../../../utils/statusBadges";
import { DataTable, type Column } from "./DataTable";

type StatusFilter = ContestStatus | "ALL";

const COLUMNS: Column<Contest>[] = [
  { header: "#", render: (_row, index) => index + 1 },
  { header: "Ảnh bìa", render: () => <div className="h-10 w-14 rounded bg-gradient-to-br from-navy-800 to-brand-500" /> },
  { header: "Tên cuộc thi", render: (row) => <span className="font-semibold text-navy-900">{row.name}</span> },
  { header: "Thời gian", render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}` },
  { header: "Số bài dự thi", render: (row) => row.submissionCount.toLocaleString("en-US") },
  { header: "Trạng thái", render: (row) => <StatusBadge {...CONTEST_STATUS[row.status]} /> },
  {
    header: "Thao tác",
    render: () => (
      <button type="button" className="btn-outline">
        Quản lý
      </button>
    ),
  },
];

export function ContestsView() {
  const { data, isLoading, error } = useFetch(contestService.getContests);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const normalizedKeyword = keyword.trim().toLowerCase();
  const rows = (data ?? []).filter(
    (contest) =>
      contest.name.toLowerCase().includes(normalizedKeyword) &&
      (statusFilter === "ALL" || contest.status === statusFilter),
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Quản lý cuộc thi</h1>
        <button type="button" className="btn-primary">
          <Plus size={16} aria-hidden />
          Tạo cuộc thi
        </button>
      </div>
      <div className="mb-4 flex gap-3">
        <SearchInput value={keyword} onChange={setKeyword} placeholder="Tìm kiếm theo tên cuộc thi..." />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          aria-label="Lọc theo trạng thái"
          className="card px-3 py-2 text-sm"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ONGOING">Đang diễn ra</option>
          <option value="UPCOMING">Sắp diễn ra</option>
          <option value="ENDED">Đã kết thúc</option>
        </select>
      </div>
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}
      {data && (
        <DataTable columns={COLUMNS} rows={rows} getKey={(row) => row.id} footer={`Hiển thị ${rows.length} cuộc thi`} />
      )}
    </section>
  );
}
