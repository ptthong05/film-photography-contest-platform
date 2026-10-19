import { Fragment, type ReactNode } from "react";
import { Modal } from "../../../components/Modal";

export interface DetailInfo {
  title: string;
  fields: { label: string; value: ReactNode }[];
}

interface DetailModalProps {
  detail: DetailInfo;
  onClose: () => void;
}

export function DetailModal({ detail, onClose }: DetailModalProps) {
  return (
    <Modal title={detail.title} onClose={onClose}>
      <dl className="grid grid-cols-[8rem_1fr] items-center gap-y-3 text-sm">
        {detail.fields.map((field) => (
          <Fragment key={field.label}>
            <dt className="text-slate-500">{field.label}</dt>
            <dd className="font-medium text-navy-900">{field.value}</dd>
          </Fragment>
        ))}
      </dl>
      <div className="mt-6 flex justify-end">
        <button type="button" className="btn-primary" onClick={onClose}>
          Đóng
        </button>
      </div>
    </Modal>
  );
}
