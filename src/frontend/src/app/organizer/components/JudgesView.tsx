import { useState } from "react";
import { Avatar } from "../../../components/Avatar";
import { StatusBadge } from "../../../components/StatusBadge";
import { organizerUserService } from "../../../services/organizerUserService";
import type { Judge } from "../../../types/organizerUser";
import { ACCOUNT_STATUS } from "../../../utils/statusBadges";
import type { Column } from "./DataTable";
import { ListPage } from "./ListPage";
import type { DetailInfo } from "./DetailModal";
import { JudgeFormModal } from "./JudgeFormModal";

const COLUMNS: Column<Judge>[] = [
  { header: "#", render: (_row, index) => index + 1 },
  { header: "Avatar", render: (row) => <Avatar name={row.fullName} /> },
  { header: "Họ tên", render: (row) => <span className="font-semibold text-navy-900">{row.fullName}</span> },
  { header: "Chuyên môn", render: (row) => row.specialty },
  { header: "Số cuộc thi", render: (row) => row.contestCount },
  { header: "Trạng thái", render: (row) => <StatusBadge {...ACCOUNT_STATUS[row.status]} /> },
];

function toDetail(row: Judge): DetailInfo {
  return {
    title: row.fullName,
    fields: [
      { label: "Email", value: row.email },
      { label: "Chuyên môn", value: row.specialty },
      { label: "Số cuộc thi", value: row.contestCount },
      { label: "Trạng thái", value: <StatusBadge {...ACCOUNT_STATUS[row.status]} /> },
    ],
  };
}

export function JudgesView() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [addedJudges, setAddedJudges] = useState<Judge[]>([]);

  const handleSubmit = (judge: Judge) => {
    setAddedJudges((previous) => [judge, ...previous]);
    setIsFormOpen(false);
  };

  return (
    <>
      <ListPage
        title="Quản lý giám khảo"
        searchPlaceholder="Tìm kiếm theo tên, email..."
        unit="giám khảo"
        fetcher={organizerUserService.getJudges}
        columns={COLUMNS}
        getKey={(row) => row.id}
        getSearchText={(row) => `${row.fullName} ${row.email} ${row.specialty}`}
        actionLabel="Thêm giám khảo"
        onAction={() => setIsFormOpen(true)}
        extraRows={addedJudges}
        getDetail={toDetail}
      />
      {isFormOpen && <JudgeFormModal onClose={() => setIsFormOpen(false)} onSubmit={handleSubmit} />}
    </>
  );
}
