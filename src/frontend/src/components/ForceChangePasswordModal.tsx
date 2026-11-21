import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Lock, LogOut, ShieldAlert, Check, AlertCircle } from 'lucide-react';
import { authService, validateStrongPassword, type AuthUser } from '../services/authService';

interface ForceChangePasswordModalProps {
  user: AuthUser;
  onSuccess: () => void;
}

export function ForceChangePasswordModal({ user, onSuccess }: ForceChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Kiểm tra thời gian thực các tiêu chuẩn mật khẩu
  const hasMinLength = newPassword.length >= 8;
  const hasUppercaseStart = /^[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-]/.test(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu hiện tại được cấp!');
      return;
    }

    const validation = validateStrongPassword(newPassword);
    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Mật khẩu mới không đáp ứng tiêu chuẩn an toàn!');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.hash = '#/';
  };

  const roleLabel =
    user.role === 'JUDGE'
      ? 'Ban giám khảo (JUDGE)'
      : user.role === 'ORGANIZER'
      ? 'Ban tổ chức (ORGANIZER)'
      : user.role === 'ADMIN'
      ? 'Quản trị viên (ADMIN)'
      : 'Thí sinh (PARTICIPANT)';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="force-password-modal-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        {/* Banner cảnh báo cấp quyền */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 id="force-password-modal-title" className="text-lg font-bold leading-tight">
                Bắt buộc đổi mật khẩu lần đầu
              </h2>
              <p className="text-xs text-amber-100 mt-0.5">
                Tài khoản được cấp quyền bởi Quản trị viên hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Nội dung form */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Hộp thông tin tài khoản */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-start gap-3">
            <Lock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">
                Xin chào <span className="text-amber-800 font-bold">{user.fullName}</span> ({roleLabel})
              </p>
              <p className="mt-0.5 text-slate-600">
                Vì lý do an toàn bảo mật, tài khoản lần đầu đăng nhập bắt buộc phải đổi mật khẩu khởi tạo thành mật khẩu cá nhân để kích hoạt quyền truy cập.
              </p>
            </div>
          </div>

          {/* Hiển thị lỗi nếu có */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 animate-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mật khẩu hiện tại */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Mật khẩu hiện tại (mật khẩu được cấp) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại (VD: 123456)"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-11 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới an toàn"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-11 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-11 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Checklist tiêu chí mật khẩu mạnh */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs">
              <p className="font-semibold text-slate-700 mb-1">Yêu cầu bảo mật mật khẩu:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className={`h-3.5 w-3.5 ${hasMinLength ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>Tối thiểu 8 ký tự</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercaseStart ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className={`h-3.5 w-3.5 ${hasUppercaseStart ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>Ký tự đầu viết hoa (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase && hasNumber ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className={`h-3.5 w-3.5 ${hasLowercase && hasNumber ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>Có chữ thường và số</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className={`h-3.5 w-3.5 ${hasSpecial ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <span>Có ký tự đặc biệt (!@#$...)</span>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất & Thoát</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm px-5 py-2.5 shadow-md shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                <span>{isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu & Tiếp tục'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
