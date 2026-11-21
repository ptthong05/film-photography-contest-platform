import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { ROLE_INFO, STATUS_INFO, type AdminUser, type UserDraft, type UserRole, type UserStatus } from '../types/adminUser';
import { validateVietnamesePhone } from '../../../utils/phoneValidator';

interface AdminUserEditPageProps {
  user?: AdminUser | null; // null if adding new user
  onBack: () => void;
  onSave: (draft: UserDraft) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AdminUserEditPage({ user, onBack, onSave }: AdminUserEditPageProps) {
  const isEditing = Boolean(user);
  const [draft, setDraft] = useState<UserDraft>(() => ({
    fullName: user ? user.fullName : '',
    email: user ? user.email : '',
    phone: user ? (user.phone || '') : '',
    password: '',
    role: user ? user.role : 'PARTICIPANT',
    status: user ? user.status : 'ACTIVE',
  }));

  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ fullName: false, email: false, phone: false, password: false });
  const [formError, setFormError] = useState('');

  const normalizedName = draft.fullName.trim();
  const normalizedEmail = draft.email.trim();
  const normalizedPhone = (draft.phone || '').trim();

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

  const phoneCheck = normalizedPhone ? validateVietnamesePhone(normalizedPhone) : { isValid: true, error: '' };
  const phoneError = !normalizedPhone
    ? 'Vui lòng nhập số điện thoại.'
    : !phoneCheck.isValid
      ? (phoneCheck.error || 'Số điện thoại không hợp lệ.')
      : '';

  const passwordError = (!isEditing && (!draft.password || draft.password.length < 6))
    ? 'Mật khẩu phải có ít nhất 6 ký tự.'
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, password: true });
    if (nameError || emailError || phoneError || passwordError) return;
    onSave(draft);
  };

  const inputClass = 'mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition';
  const selectClass = `${inputClass} cursor-pointer`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Quản lý người dùng</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{isEditing ? `Mã: ${user?.id}` : 'Thêm mới'}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B356B]">
              {isEditing ? `Chỉnh sửa: ${user?.fullName}` : 'Thêm người dùng mới'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy thao tác
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Họ và tên <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              autoComplete="name"
              value={draft.fullName}
              maxLength={80}
              onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
              onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
              placeholder="Ví dụ: Nguyễn Văn A"
              className={`${inputClass} ${touched.fullName && nameError ? 'border-red-400 focus:border-red-500' : ''}`}
            />
            {touched.fullName && nameError && (
              <p className="mt-1 text-xs text-red-600">{nameError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Email đăng nhập <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={draft.email}
                maxLength={120}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                placeholder="user@example.com"
                className={`${inputClass} ${touched.email && emailError ? 'border-red-400 focus:border-red-500' : ''}`}
              />
              {touched.email && emailError && (
                <p className="mt-1 text-xs text-red-600">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Số điện thoại <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                value={draft.phone || ''}
                maxLength={15}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                placeholder="Ví dụ: 0912345678"
                className={`${inputClass} ${touched.phone && phoneError ? 'border-red-400 focus:border-red-500' : ''}`}
              />
              {touched.phone && phoneError && (
                <p className="mt-1 text-xs text-red-600">{phoneError}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              {isEditing ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu cấp ban đầu *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={draft.password || ''}
                onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                placeholder={isEditing ? 'Nhập mật khẩu mới nếu muốn thay đổi' : 'Nhập mật khẩu cấp ban đầu'}
                className={`${inputClass} pr-11 ${touched.password && passwordError ? 'border-red-400 focus:border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && passwordError && (
              <p className="mt-1 text-xs text-red-600">{passwordError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Vai trò (Role)
              </label>
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRole })}
                className={selectClass}
              >
                {Object.entries(ROLE_INFO).map(([val, info]) => (
                  <option key={val} value={val}>{info.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Trạng thái tài khoản
              </label>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as UserStatus })}
                className={selectClass}
              >
                {Object.entries(STATUS_INFO).map(([val, info]) => (
                  <option key={val} value={val}>{info.label}</option>
                ))}
              </select>
            </div>
          </div>

          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <CheckCircle2 size={16} />
              {isEditing ? 'Lưu cập nhật' : 'Cấp tài khoản & Lưu CSDL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
