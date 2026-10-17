import { useState } from "react";
import { Modal } from "../../../components/Modal";
import type { Judge } from "../../../types/organizerUser";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_CLASS = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500";

interface JudgeFormModalProps {
  onClose: () => void;
  onSubmit: (judge: Judge) => void;
}

export function JudgeFormModal({ onClose, onSubmit }: JudgeFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fields = [
    { label: "Họ tên", value: fullName, onChange: setFullName },
    { label: "Email", value: email, onChange: setEmail },
    { label: "Chuyên môn", value: specialty, onChange: setSpecialty },
  ];

  const handleSubmit = () => {
    if (!fullName.trim() || !specialty.trim()) {
      setError("Vui lòng nhập họ tên và chuyên môn.");
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Email không hợp lệ.");
      return;
    }
    onSubmit({
      id: `j-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      specialty: specialty.trim(),
      contestCount: 0,
      status: "ACTIVE",
    });
  };

  return (
    <Modal title="Thêm giám khảo" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <label key={field.label} className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {field.label}
            <input className={FIELD_CLASS} value={field.value} onChange={(e) => field.onChange(e.target.value)} />
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-600">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100" onClick={onClose}>
          Hủy
        </button>
        <button type="button" className="btn-primary" onClick={handleSubmit}>
          Lưu
        </button>
      </div>
    </Modal>
  );
}
