import { Avatar } from "../../../components/Avatar";
import { StatusBadge } from "../../../components/StatusBadge";
import { organizerUserService } from "../../../services/organizerUserService";
import type { Participant } from "../../../types/organizerUser";
import { formatDate } from "../../../utils/formatDate";
import { ACCOUNT_STATUS } from "../../../utils/statusBadges";
import type { Column } from "./DataTable";
import { ListPage } from "./ListPage";
import type { DetailInfo } from "./DetailModal";

const COLUMNS: Column<Participant>[] = [
  { header: "#", render: (_row, index) => index + 1 },
  { header: "Avatar", render: (row) => <Avatar name={row.fullName} /> },
  { header: "Họ tên", render: (row) => <span className="font-semibold text-navy-900">{row.fullName}</span> },
  { header: "Email", render: (row) => row.email },
  { header: "Số bài dự thi", render: (row) => row.submissionCount },
  { header: "Ngày đăng ký", render: (row) => formatDate(row.registeredAt) },
  { header: "Trạng thái", render: (row) => <StatusBadge {...ACCOUNT_STATUS[row.status]} /> },
];

function toDetail(row: Participant): DetailInfo {
  return {
    title: row.fullName,
    fields: [
      { label: "Email", value: row.email },
      { label: "Số bài dự thi", value: row.submissionCount },
      { label: "Ngày đăng ký", value: formatDate(row.registeredAt) },
      { label: "Trạng thái", value: <StatusBadge {...ACCOUNT_STATUS[row.status]} /> },
    ],
  };
}

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
      getDetail={toDetail}
    />
  );
}
