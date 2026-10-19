import { useState } from "react";
import { Avatar } from "../../../components/Avatar";
import { StatusBadge } from "../../../components/StatusBadge";
import { organizerUserService } from "../../../services/organizerUserService";
import type { Judge } from "../../../types/organizerUser";
import { ACCOUNT_STATUS } from "../../../utils/statusBadges";
import type { Column } from "./DataTable";
import type { DetailInfo } from "./DetailModal";
import { JudgeFormModal } from "./JudgeFormModal";
import { ListPage } from "./ListPage";

function createColumns(onToggleDefault: (judge: Judge) => void): Column<Judge>[] {
  return [
    { header: "#", render: (_row, index) => index + 1 },
    { header: "Avatar", render: (row) => <Avatar name={row.fullName} /> },
    { header: "Họ tên", render: (row) => <span className="font-semibold text-navy-900">{row.fullName}</span> },
    { header: "Chuyên môn", render: (row) => row.specialty },
    { header: "Số cuộc thi", render: (row) => row.contestCount },
    { header: "Trạng thái", render: (row) => <StatusBadge {...ACCOUNT_STATUS[row.status]} /> },
    {
      header: "Chấm mặc định",
      render: (row) => (
        <button
          type="button"
          role="switch"
          aria-checked={row.isDefault}
          aria-label={`Đặt ${row.fullName} chấm mặc định`}
          onClick={() => onToggleDefault(row)}
          className={`relative h-6 w-11 rounded-full transition-colors ${row.isDefault ? "bg-brand-500" : "bg-slate-300"}`}
        >
          <span
            className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${row.isDefault ? "left-[1.375rem]" : "left-0.5"}`}
          />
        </button>
      ),
    },
  ];
}

function toDetail(row: Judge): DetailInfo {
  return {
    title: row.fullName,
    fields: [
      { label: "Email", value: row.email },
      { label: "Chuyên môn", value: row.specialty },
      { label: "Số cuộc thi", value: row.contestCount },
      { label: "Trạng thái", value: <StatusBadge {...ACCOUNT_STATUS[row.status]} /> },
      { label: "Chấm mặc định", value: row.isDefault ? "Có" : "Không" },
    ],
  };
}

export function JudgesView() {
  const [version, setVersion] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Đổi key để ListPage tải lại dữ liệu sau khi mock service thay đổi.
  const handleToggleDefault = async (judge: Judge) => {
    await organizerUserService.setDefaultJudge(judge.id, !judge.isDefault);
    setVersion((previous) => previous + 1);
  };

  const handleSubmit = async (judge: Judge) => {
    await organizerUserService.createJudge(judge);
    setIsFormOpen(false);
    setVersion((previous) => previous + 1);
  };

  return (
    <>
      <ListPage
        key={version}
        title="Quản lý giám khảo"
        searchPlaceholder="Tìm kiếm theo tên, email..."
        unit="giám khảo"
        fetcher={organizerUserService.getJudges}
        columns={createColumns(handleToggleDefault)}
        getKey={(row) => row.id}
        getSearchText={(row) => `${row.fullName} ${row.email} ${row.specialty}`}
        actionLabel="Thêm giám khảo"
        onAction={() => setIsFormOpen(true)}
        getDetail={toDetail}
      />
      {isFormOpen && <JudgeFormModal onClose={() => setIsFormOpen(false)} onSubmit={handleSubmit} />}
    </>
  );
}
