import React, { useState } from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Building2,
  Headphones,
  AlertCircle,
} from 'lucide-react';
import { validateVietnamesePhone } from '../../../../utils/phoneValidator';

interface ContactPageProps {
  onGoHome: () => void;
  onSelectPortal?: (portal: Portal) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
}

// Cấu trúc nội dung có thể kết nối CMS Admin
export const CONTACT_PAGE_CONTENT = {
  title: 'Liên hệ & Trung tâm Hỗ trợ',
  subtitle:
    'Đội ngũ FilmContest luôn sẵn sàng lắng nghe, giải đáp thắc mắc về thể lệ cuộc thi, hỗ trợ kỹ thuật nộp bài và kết nối hợp tác tài trợ.',
  contactChannels: [
    {
      icon: Phone,
      title: 'Hotline Hỗ trợ thí sinh',
      value: '1900 6868 - (028) 3822 9999',
      subtext: 'Hoạt động 8:30 - 18:00 (Thứ 2 đến Thứ 7)',
      actionText: 'Gọi ngay',
      actionHref: 'tel:19006868',
    },
    {
      icon: Mail,
      title: 'Email Hỗ trợ kỹ thuật',
      value: 'support@filmcontest.vn',
      subtext: 'Phản hồi trong vòng 2 - 4 giờ làm việc',
      actionText: 'Gửi email',
      actionHref: 'mailto:support@filmcontest.vn',
    },
    {
      icon: Building2,
      title: 'Hợp tác & Tài trợ',
      value: 'partner@filmcontest.vn',
      subtext: 'Dành cho các thương hiệu film, lab tráng và bảo trợ truyền thông',
      actionText: 'Gửi đề xuất',
      actionHref: 'mailto:partner@filmcontest.vn',
    },
    {
      icon: MapPin,
      title: 'Văn phòng chính',
      value: 'Tầng 6, Creative Arts Tower, 128 Nguyễn Đình Chiểu, Q.3, TP.HCM',
      subtext: 'Chi nhánh Hà Nội: 45 Tràng Tiền, Q. Hoàn Kiếm, Hà Nội',
      actionText: 'Xem bản đồ',
      actionHref: '#map',
    },
  ],
  workingHours: 'Thứ 2 - Thứ 7: 08:30 - 18:00 (Nghỉ Chủ nhật & Ngày lễ)',
};

export function ContactPage({ onGoHome, onSelectPortal, onOpenAuth }: ContactPageProps) {
  const content = CONTACT_PAGE_CONTENT;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    topic: 'Tư vấn nộp bài dự thi',
    message: '',
  });

  const [phoneError, setPhoneError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) return;

    if (formData.phone && formData.phone.trim()) {
      const check = validateVietnamesePhone(formData.phone);
      if (!check.isValid) {
        setPhoneError(check.error);
        return;
      }
    }
    setPhoneError('');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        topic: 'Tư vấn nộp bài dự thi',
        message: '',
      });
    }, 4000);
  };

  const handleGoFaq = () => {
    onGoHome();
    setTimeout(() => {
      document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar
        activeTab=""
        onGoHome={onGoHome}
        onSelectPortal={onSelectPortal}
        onOpenContests={() => onSelectPortal?.('CONTESTS')}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
      />

      <main className="flex-1 w-full">
        {/* Banner */}
        <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white py-12 sm:py-16 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200/80 mb-4 font-medium">
              <button onClick={onGoHome} className="hover:text-white transition-colors cursor-pointer">
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
              <span className="text-white font-semibold">Liên hệ & Hỗ trợ</span>
            </div>

            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
                <Headphones className="w-4 h-4 text-blue-400" />
                <span>Chúng tôi luôn sẵn sàng hỗ trợ bạn</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                {content.title}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {content.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.contactChannels.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 space-y-2.5 flex flex-col justify-between hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                    <p className="text-xs sm:text-sm font-semibold text-blue-600 break-words">
                      {item.value}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.subtext}</p>
                  </div>
                  {item.actionHref.startsWith('http') || item.actionHref.startsWith('tel') || item.actionHref.startsWith('mailto') ? (
                    <a
                      href={item.actionHref}
                      className="text-xs font-bold text-slate-700 hover:text-blue-600 inline-flex items-center gap-1 pt-2"
                    >
                      {item.actionText} &rarr;
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 pt-2">{item.actionText}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Form and FAQ Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Gửi yêu cầu hỗ trợ hoặc tin nhắn
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Điền thông tin bên dưới và chuyên viên phụ trách sẽ liên hệ lại với bạn sớm nhất.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3 py-10 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold">Gửi yêu cầu thành công!</h3>
                  <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                    Cảm ơn bạn đã liên hệ với FilmContest. Chúng tôi đã nhận được thông tin và sẽ phản hồi qua email <span className="font-semibold">{formData.email}</span> trong thời gian sớm nhất.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Địa chỉ Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Số điện thoại
                        </label>
                        <span className="text-[11px] text-slate-400">10 số VN</span>
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (phoneError) {
                            const check = validateVietnamesePhone(e.target.value);
                            if (check.isValid) setPhoneError('');
                          }
                        }}
                        onBlur={() => {
                          if (formData.phone && formData.phone.trim()) {
                            const check = validateVietnamesePhone(formData.phone);
                            if (!check.isValid) setPhoneError(check.error);
                          } else {
                            setPhoneError('');
                          }
                        }}
                        placeholder="0912 345 678"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-all ${
                          phoneError
                            ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                            : 'border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                        }`}
                      />
                      {phoneError && (
                        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{phoneError}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Chủ đề cần hỗ trợ *
                      </label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="Tư vấn nộp bài dự thi">Tư vấn nộp bài dự thi</option>
                        <option value="Sự cố kỹ thuật tài khoản">Sự cố kỹ thuật tài khoản</option>
                        <option value="Thắc mắc về chấm giải & Thể lệ">Thắc mắc về chấm giải & Thể lệ</option>
                        <option value="Đăng ký tài trợ & Hợp tác">Đăng ký tài trợ & Hợp tác</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nội dung tin nhắn / Câu hỏi *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Mô tả chi tiết câu hỏi hoặc vấn đề bạn gặp phải..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-y"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Gửi tin nhắn</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Quick Support & FAQ Direct (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* FAQ Box */}
              <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Tìm câu trả lời nhanh?</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Hầu hết các câu hỏi thường gặp về cách đăng ký, kích thước file scan ảnh, quy chuẩn film stock và thời gian chấm thi đã được giải đáp chi tiết tại mục FAQ trang chủ.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleGoFaq}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Đến mục Câu hỏi thường gặp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Working Hours & Emergency Notice */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-sm text-slate-900">Thời gian làm việc & Tiếp nhận</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {content.workingHours}
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
                  <span className="font-bold">Lưu ý:</span> Trong các ngày cuối cùng nhận bài của cuộc thi, đường dây hotline sẽ mở hỗ trợ thêm tới 21:00 để hỗ trợ thí sinh tải bài dự thi.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
