import { useState } from "react";
import { Modal } from "../../../components/Modal";
import { Avatar } from "../../../components/Avatar";
import { assignmentService } from "../../../services/assignmentService";
import type { Assignment } from "../../../types/assignment";
import type { Column } from "./DataTable";
import { ListPage } from "./ListPage";

const COLUMNS: Column<Assignment>[] = [
  { header: "#", render: (_row, index) => index + 1 },
  {
    header: "Giám khảo",
    render: (row) => (
      <span className="flex items-center gap-2 font-semibold text-navy-900">
        <Avatar name={row.judgeName} />
        {row.judgeName}
      </span>
    ),
  },
  { header: "Cuộc thi", render: (row) => row.contestName },
  { header: "Bài được giao", render: (row) => row.assignedCount },
  {
    header: "Tiến độ chấm",
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-brand-500"
            style={{ width: `${(row.reviewedCount / row.assignedCount) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-500">
          {row.reviewedCount}/{row.assignedCount}
        </span>
      </div>
    ),
  },
];

export function AssignmentsView() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleClose = () => {
    setIsConfirmOpen(false);
    setIsDone(false);
  };

  return (
    <>
      <ListPage
        title="Phân công giám khảo"
        searchPlaceholder="Tìm theo giám khảo, cuộc thi..."
        unit="phân công"
        fetcher={assignmentService.getAssignments}
        columns={COLUMNS}
        getKey={(row) => row.id}
        getSearchText={(row) => `${row.judgeName} ${row.contestName}`}
        actionLabel="Tự động phân công"
        onAction={() => setIsConfirmOpen(true)}
      />
      {isConfirmOpen && (
        <Modal title="Tự động phân công" onClose={handleClose}>
          <p className="text-sm text-slate-600">
            {isDone
              ? "Đã gửi yêu cầu phân công (dữ liệu mẫu, chưa nối API)."
              : "Hệ thống sẽ chia đều các bài chưa chấm cho giám khảo trong từng cuộc thi."}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100" onClick={handleClose}>
              {isDone ? "Đóng" : "Hủy"}
            </button>
            {!isDone && (
              <button type="button" className="btn-primary" onClick={() => setIsDone(true)}>
                Xác nhận
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
