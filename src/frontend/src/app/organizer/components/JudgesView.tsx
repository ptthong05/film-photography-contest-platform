import { Avatar } from "../../../components/Avatar";
import { StatusBadge } from "../../../components/StatusBadge";
import { organizerUserService } from "../../../services/organizerUserService";
import type { Judge } from "../../../types/organizerUser";
import { ACCOUNT_STATUS } from "../../../utils/statusBadges";
import type { Column } from "./DataTable";
import { ListPage } from "./ListPage";

const COLUMNS: Column<Judge>[] = [
  { header: "#", render: (_row, index) => index + 1 },
  { header: "Avatar", render: (row) => <Avatar name={row.fullName} /> },
  { header: "Họ tên", render: (row) => <span className="font-semibold text-navy-900">{row.fullName}</span> },
  { header: "Chuyên môn", render: (row) => row.specialty },
  { header: "Số cuộc thi", render: (row) => row.contestCount },
  { header: "Trạng thái", render: (row) => <StatusBadge {...ACCOUNT_STATUS[row.status]} /> },
  { header: "Thao tác", render: () => <button type="button" className="btn-outline">Sửa</button> },
];

export function JudgesView() {
  return (
    <ListPage
      title="Quản lý giám khảo"
      searchPlaceholder="Tìm kiếm theo tên, email..."
      unit="giám khảo"
      fetcher={organizerUserService.getJudges}
      columns={COLUMNS}
      getKey={(row) => row.id}
      getSearchText={(row) => `${row.fullName} ${row.email} ${row.specialty}`}
      actionLabel="Thêm giám khảo"
    />
  );
}
