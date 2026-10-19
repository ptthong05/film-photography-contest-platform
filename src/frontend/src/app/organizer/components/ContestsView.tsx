import { useState } from "react";
import { Plus } from "lucide-react";
import { CoverArt } from "../../../components/CoverArt";
import { SearchInput } from "../../../components/SearchInput";
import { StateMessage } from "../../../components/StateMessage";
import { StatusBadge } from "../../../components/StatusBadge";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import type { Contest, ContestStatus } from "../../../types/contest";
import { formatDate } from "../../../utils/formatDate";
import { CONTEST_STATUS } from "../../../utils/statusBadges";
import { CreateContestForm } from "./CreateContestForm";
import { DataTable, type Column } from "./DataTable";
import { DetailModal, type DetailInfo } from "./DetailModal";
import { toContestDetail } from "./ContestDetail";

type StatusFilter = ContestStatus | "ALL";

function createColumns(onManage: (contest: Contest) => void): Column<Contest>[] {
  return [
    { header: "#", render: (_row, index) => index + 1 },
    { header: "Ảnh bìa", render: (_row, index) => <CoverArt seed={index} className="h-10 w-14 rounded-md" /> },
    { header: "Tên cuộc thi", render: (row) => <span className="font-semibold text-navy-900">{row.name}</span> },
    { header: "Thời gian", render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}` },
    { header: "Số bài dự thi", render: (row) => row.submissionCount.toLocaleString("en-US") },
    { header: "Trạng thái", render: (row) => <StatusBadge {...CONTEST_STATUS[row.status]} /> },
    {
      header: "Thao tác",
      render: (row) => (
        <button type="button" className="btn-outline" onClick={() => onManage(row)}>
          Quản lý
        </button>
      ),
    },
  ];
}

export function ContestsView() {
  const { data, isLoading, error } = useFetch(contestService.getContests);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [createdContests, setCreatedContests] = useState<Contest[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detail, setDetail] = useState<DetailInfo | null>(null);

  const normalizedKeyword = keyword.trim().toLowerCase();
  const rows = [...createdContests, ...(data ?? [])].filter(
    (contest) =>
      contest.name.toLowerCase().includes(normalizedKeyword) &&
      (statusFilter === "ALL" || contest.status === statusFilter),
  );

  const handleCreated = (contest: Contest) => {
    setCreatedContests((previous) => [contest, ...previous]);
    setIsFormOpen(false);
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Quản lý cuộc thi</h1>
        <button type="button" className="btn-primary" onClick={() => setIsFormOpen(true)}>
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
        <DataTable
          columns={createColumns((contest) => setDetail(toContestDetail(contest)))}
          rows={rows}
          getKey={(row) => row.id}
          footer={`Hiển thị ${rows.length} cuộc thi`}
        />
      )}
      {isFormOpen && <CreateContestForm onClose={() => setIsFormOpen(false)} onCreated={handleCreated} />}
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}
