import React, { useState } from 'react';
import { Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { validateVietnamesePhone } from '../../../utils/phoneValidator';
import { authService, validateStrongPassword } from '../../../services/authService';
import { Toast, type ToastNotice } from '../../../components/Toast';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSubmitSuccess?: () => void;
}

export function RegisterForm({ onSwitchToLogin, onSubmitSuccess }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);

  // Các tiêu chí kiểm tra mật khẩu mạnh
  const hasMinLength = password.length >= 8;
  const hasUppercaseStart = /^[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setToastNotice({ type: 'error', message: 'Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật' });
      return;
    }

    // Validate số điện thoại Việt Nam 10 số
    const phoneCheck = validateVietnamesePhone(phone);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.error);
      setToastNotice({ type: 'error', message: phoneCheck.error });
      return;
    }
    setPhoneError('');

    // Kiểm tra độ mạnh của mật khẩu
    const pwdCheck = validateStrongPassword(password);
    if (!pwdCheck.isValid) {
      setToastNotice({ type: 'error', message: pwdCheck.error || 'Mật khẩu chưa đủ mạnh' });
      return;
    }

    // Kiểm tra khớp mật khẩu
    if (password !== confirmPassword) {
      setToastNotice({ type: 'error', message: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        name: fullName,
        email,
        phone: phoneCheck.normalizedPhone,
        password,
      });

      // Bật thông báo đăng ký thành công góc phải
      setToastNotice({ type: 'success', message: 'Đăng ký thành công' });

      // Tự động chuyển qua màn hình Đăng nhập sau 800ms
      setTimeout(() => {
        if (onSubmitSuccess) {
          onSubmitSuccess();
        } else {
          onSwitchToLogin();
        }
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng ký tài khoản không thành công!';
      setToastNotice({ type: 'error', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'Mặc định trở thành Thí sinh tham gia các cuộc thi',
    'Tải lên và lưu trữ các bài dự thi ảnh phim',
    'Quản lý cuộn phim (Film roll) và thông số máy ảnh',
    'Nhận đánh giá và điểm số từ Hội đồng Giám khảo',
  ];

  return (
    <>
      {/* Toast thông báo góc phải */}
      <Toast toast={toastNotice} onClose={() => setToastNotice(null)} />

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        {/* Left Column - Dark Poster Showcase */}
        <div className="lg:col-span-5 bg-[#12161E] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug text-white">
              Gia nhập cộng đồng <br />
              Thí sinh nhiếp ảnh phim
            </h2>

            <ul className="space-y-3 pt-1">
              {benefits.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                  <div className="w-4.5 h-4.5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="w-12 h-0.5 bg-slate-700 rounded-full my-4" />

            {/* Artistic Script Typography */}
            <div className="font-serif italic tracking-wide text-slate-300 text-lg sm:text-xl space-y-1">
              <div>Capture</div>
              <div className="pl-4">Develop</div>
              <div className="pl-8">Share</div>
            </div>
          </div>

          {/* Vintage Film Canister & Negative Strip Visual */}
          <div className="relative z-10 mt-6 flex justify-center">
            <div className="relative w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=700&q=80"
                alt="Vintage Film Strip"
                className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/80 font-mono">
                <span>ILFORD HP5 PLUS</span>
                <span>400 B&W</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Register Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-4">
            {/* Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Đăng ký Thí sinh
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Tạo tài khoản thí sinh để tham gia gửi bài dự thi
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Phone Number Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Số điện thoại *</label>
                  <span className="text-[11px] text-slate-400">10 số VN</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) {
                      const check = validateVietnamesePhone(e.target.value);
                      if (check.isValid) setPhoneError('');
                    }
                  }}
                  onBlur={() => {
                    if (phone.trim()) {
                      const check = validateVietnamesePhone(phone);
                      if (!check.isValid) setPhoneError(check.error);
                    }
                  }}
                  placeholder="Ví dụ: 0912345678"
                  required
                  maxLength={11}
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    phoneError
                      ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {phoneError && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ví dụ: Password@123"
                    required
                    className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Requirement Indicators */}
                <div className="pt-1.5 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                    <span>Ít nhất 8 ký tự</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercaseStart ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasUppercaseStart ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                    <span>Chữ cái đầu viết hoa</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                    <span>Chứa chữ số (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasSpecial ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                    <span>Ký tự đặc biệt (!@#...)</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    required
                    className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms and conditions checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded-md text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                  />
                  <span>
                    Tôi đồng ý với{' '}
                    <a href="#terms" className="text-blue-600 hover:underline font-semibold">
                      Điều khoản sử dụng
                    </a>{' '}
                    và{' '}
                    <a href="#privacy" className="text-blue-600 hover:underline font-semibold">
                      Chính sách bảo mật
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang đăng ký tài khoản...</span>
                    </>
                  ) : (
                    <span>Đăng ký tài khoản Thí sinh</span>
                  )}
                </button>
              </div>
            </form>

            {/* Switch to Login link */}
            <div className="text-center text-xs sm:text-sm text-slate-500 pt-1">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 font-bold hover:text-blue-700 hover:underline cursor-pointer ml-1"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
