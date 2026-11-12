import { Fragment, type ReactNode } from "react";
import { Modal } from "../../../components/Modal";

export interface DetailInfo {
  title: string;
  isWide?: boolean;
  fields: { label: string; value: ReactNode }[];
}

interface DetailModalProps {
  detail: DetailInfo;
  onClose: () => void;
}

export function DetailModal({ detail, onClose }: DetailModalProps) {
  return (
    <Modal title={detail.title} onClose={onClose} isWide={detail.isWide}>
      <dl className="grid grid-cols-[8rem_minmax(0,1fr)] items-start gap-y-3 text-sm">
        {detail.fields.map((field) => (
          <Fragment key={field.label}>
            <dt className="text-slate-500">{field.label}</dt>
            <dd className="break-words font-medium text-[#0B356B]">{field.value}</dd>
          </Fragment>
        ))}
      </dl>
      <div className="mt-6 flex justify-end">
        <button type="button" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700" onClick={onClose}>
          Đóng
        </button>
      </div>
    </Modal>
  );
}
