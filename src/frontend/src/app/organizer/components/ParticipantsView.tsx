import { Avatar } from "../../../components/Avatar";
import { StatusBadge } from "../../../components/StatusBadge";
import { organizerUserService } from "../../../services/organizerUserService";
import type { Participant } from "../../../types/organizerUser";
import { formatDate } from "../../../utils/formatDate";
import { ACCOUNT_STATUS } from "../../../utils/statusBadges";
import type { Column } from "./DataTable";
import { ListPage } from "./ListPage";

const COLUMNS: Column<Participant>[] = [
  { header: "#", render: (_row, index) => index + 1 },
  { header: "Avatar", render: (row) => <Avatar name={row.fullName} /> },
  { header: "Họ tên", render: (row) => <span className="font-semibold text-navy-900">{row.fullName}</span> },
  { header: "Email", render: (row) => row.email },
  { header: "Số bài dự thi", render: (row) => row.submissionCount },
  { header: "Ngày đăng ký", render: (row) => formatDate(row.registeredAt) },
  { header: "Trạng thái", render: (row) => <StatusBadge {...ACCOUNT_STATUS[row.status]} /> },
  { header: "Thao tác", render: () => <button type="button" className="btn-outline">Xem</button> },
];

export function ParticipantsView() {
  return (
    <ListPage
      title="Quản lý thí sinh"
      searchPlaceholder="Tìm kiếm theo tên, email..."
      unit="thí sinh"
      fetcher={organizerUserService.getParticipants}
      columns={COLUMNS}
      getKey={(row) => row.id}
      getSearchText={(row) => `${row.fullName} ${row.email}`}
    />
  );
}
