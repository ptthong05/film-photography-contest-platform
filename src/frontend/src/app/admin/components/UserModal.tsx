import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { ROLE_INFO, STATUS_INFO, type UserDraft, type UserRole, type UserStatus } from '../types/adminUser';

interface UserModalProps {
  draft: UserDraft;
  isEditing: boolean;
  error: string;
  onChange: (nextDraft: UserDraft) => void;
  onSave: () => void;
  onClose: () => void;
}

interface TouchedFields {
  fullName: boolean;
  email: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Hộp thoại thêm/sửa người dùng cho giao diện Admin.
 * Chỉ hiển thị biểu mẫu và kiểm tra dữ liệu đầu vào ở phía trình duyệt.
 * UsersView giữ dữ liệu và thực hiện thao tác lưu (hiện là dữ liệu mẫu).
 */
export function UserModal({
  draft,
  isEditing,
  error,
  onChange,
  onSave,
  onClose,
}: UserModalProps) {
  const dialogTitleId = useId();
  const dialogNoteId = useId();
  const nameErrorId = useId();
  const emailErrorId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState<TouchedFields>({ fullName: false, email: false });

  const normalizedName = draft.fullName.trim();
  const normalizedEmail = draft.email.trim();
  const nameError = normalizedName.length === 0
    ? 'Vui lòng nhập họ và tên.'
    : normalizedName.length < 2
      ? 'Họ và tên cần ít nhất 2 ký tự.'
      : '';
  const emailError = !normalizedEmail
    ? 'Vui lòng nhập email.'
    : !EMAIL_PATTERN.test(normalizedEmail)
      ? 'Email không đúng định dạng (ví dụ: user@example.com).'
      : '';

  useEffect(() => {
    const previousActiveElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    nameInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      // Giữ thứ tự focus bên trong hộp thoại khi bấm Tab/Shift+Tab.
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getClientRects().length > 0);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ fullName: true, email: true });
    if (nameError || emailError) return;
    onSave();
  };

  const inputClass = 'mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100';
  const selectClass = `${inputClass} border-slate-300 focus:border-blue-500`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogNoteId}
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id={dialogTitleId} className="text-xl font-bold text-[#0B356B]">
              {isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
            </h2>
            <p id={dialogNoteId} className="mt-1 text-xs text-amber-700">
              Dữ liệu mô phỏng — chưa lưu vào máy chủ Java/MongoDB.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng biểu mẫu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor={`${dialogTitleId}-name`} className="block text-sm font-medium text-slate-700">
              Họ và tên <span className="text-red-600">*</span>
            </label>
            <input
              id={`${dialogTitleId}-name`}
              ref={nameInputRef}
              name="fullName"
              autoComplete="name"
              value={draft.fullName}
              maxLength={80}
              onChange={(event) => onChange({ ...draft, fullName: event.target.value })}
              onBlur={() => setTouched((previous) => ({ ...previous, fullName: true }))}
              aria-invalid={touched.fullName && Boolean(nameError)}
              aria-describedby={touched.fullName && nameError ? nameErrorId : undefined}
              placeholder="Ví dụ: Nguyễn Văn A"
              className={`${inputClass} ${touched.fullName && nameError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
            {touched.fullName && nameError && <p id={nameErrorId} className="mt-1 text-xs text-red-600">{nameError}</p>}
          </div>

          <div>
            <label htmlFor={`${dialogTitleId}-email`} className="block text-sm font-medium text-slate-700">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id={`${dialogTitleId}-email`}
              type="email"
              name="email"
              autoComplete="email"
              value={draft.email}
              maxLength={120}
              onChange={(event) => onChange({ ...draft, email: event.target.value })}
              onBlur={() => setTouched((previous) => ({ ...previous, email: true }))}
              aria-invalid={touched.email && Boolean(emailError)}
              aria-describedby={touched.email && emailError ? emailErrorId : undefined}
              placeholder="user@example.com"
              className={`${inputClass} ${touched.email && emailError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
            />
            {touched.email && emailError && <p id={emailErrorId} className="mt-1 text-xs text-red-600">{emailError}</p>}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${dialogTitleId}-role`} className="block text-sm font-medium text-slate-700">Vai trò</label>
              <select
                id={`${dialogTitleId}-role`}
                value={draft.role}
                onChange={(event) => onChange({ ...draft, role: event.target.value as UserRole })}
                className={selectClass}
              >
                {Object.entries(ROLE_INFO).map(([value, info]) => (
                  <option key={value} value={value}>{info.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${dialogTitleId}-status`} className="block text-sm font-medium text-slate-700">Trạng thái</label>
              <select
                id={`${dialogTitleId}-status`}
                value={draft.status}
                onChange={(event) => onChange({ ...draft, status: event.target.value as UserStatus })}
                className={selectClass}
              >
                {Object.entries(STATUS_INFO).map(([value, info]) => (
                  <option key={value} value={value}>{info.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Hủy
            </button>
            <button type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              {isEditing ? 'Lưu thay đổi' : 'Thêm người dùng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
