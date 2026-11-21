import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { validateLoginIdentifier } from '../../../utils/phoneValidator';
import { authService, type AuthUser } from '../../../services/authService';
import { Toast, type ToastNotice } from '../../../components/Toast';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSubmitSuccess?: (user: AuthUser) => void;
}

export function LoginForm({ onSwitchToRegister, onSubmitSuccess }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const check = validateLoginIdentifier(identifier);
    if (!check.isValid) {
      setIdentifierError(check.error);
      setToastNotice({ type: 'error', message: 'Đăng nhập không hợp lệ' });
      return;
    }
    setIdentifierError('');

    if (!password.trim()) {
      setToastNotice({ type: 'error', message: 'Đăng nhập không hợp lệ' });
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.login(check.normalizedValue, password);
      // Hiển thị thông báo đăng nhập thành công ở góc phải
      setToastNotice({ type: 'success', message: 'Đăng nhập thành công' });

      // Đợi ngắn để người dùng nhìn thấy thông báo thành công trước khi chuyển trang
      setTimeout(() => {
        if (onSubmitSuccess) {
          onSubmitSuccess(user);
        }
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập không hợp lệ';
      setToastNotice({ type: 'error', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toast thông báo ở góc phải màn hình */}
      <Toast toast={toastNotice} onClose={() => setToastNotice(null)} />

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        {/* Left Column - Dark Poster Showcase */}
        <div className="lg:col-span-5 bg-[#12161E] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow & texture */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <blockquote className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug text-white">
              “Nhiếp ảnh phim là nghệ thuật của sự kiên nhẫn”
            </blockquote>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Tham gia cộng đồng nhiếp ảnh phim, khám phá những cuộc thi thú vị và lưu giữ hành trình sáng tạo của bạn.
            </p>

            <div className="w-12 h-0.5 bg-slate-600 rounded-full" />
          </div>

          {/* Vintage Camera & Film Roll Visual */}
          <div className="relative z-10 my-6 flex justify-center">
            <div className="relative w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=700&q=80"
                alt="Vintage Analog Camera and Film"
                className="w-full h-52 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/80 font-mono">
                <span>CANON F-1</span>
                <span>KODAK GOLD 200</span>
              </div>
            </div>
          </div>

          {/* Bottom Italic Quote */}
          <div className="relative z-10 text-[11px] sm:text-xs text-slate-400 italic text-center font-serif leading-relaxed border-t border-slate-800/80 pt-4">
            “Film is not a limitation, it’s a different way of seeing the world.”
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Đăng nhập
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Truy cập tài khoản FilmContest của bạn
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email or Phone Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Email hoặc Số điện thoại</label>
                  <span className="text-[11px] text-slate-400">10 số VN</span>
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (identifierError) setIdentifierError('');
                  }}
                  onBlur={() => {
                    if (identifier.trim()) {
                      const check = validateLoginIdentifier(identifier);
                      if (!check.isValid) setIdentifierError(check.error);
                    }
                  }}
                  placeholder="Nhập email hoặc số điện thoại (10 số)"
                  required
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    identifierError
                      ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {identifierError && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{identifierError}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Vui lòng kiểm tra hộp thư email để khôi phục mật khẩu')}
                  className="text-blue-600 hover:text-blue-700 hover:underline font-semibold cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </form>

            {/* Switch to Register link */}
            <div className="text-center text-xs sm:text-sm text-slate-500 pt-6">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 font-bold hover:text-blue-700 hover:underline cursor-pointer ml-1"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
