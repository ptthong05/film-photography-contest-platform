import React, { useState, useEffect } from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import {
  Shield,
  ChevronRight,
  Lock,
  Eye,
  Database,
  UserCheck,
  Clock,
  Printer,
  FileCheck2,
  Mail,
} from 'lucide-react';

interface PrivacyPageProps {
  onGoHome: () => void;
  onSelectPortal?: (portal: Portal) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
}

// Dữ liệu mẫu cấu trúc để Admin có thể cấu hình động từ CMS
export const PRIVACY_PAGE_CONTENT = {
  title: 'Chính sách bảo mật thông tin',
  lastUpdated: '15/10/2025',
  version: '2.0.4',
  description:
    'FilmContest cam kết tôn trọng và bảo vệ tối đa quyền riêng tư cùng thông tin cá nhân của các nhiếp ảnh gia và khách truy cập. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo mật dữ liệu của bạn.',
  sections: [
    {
      id: 'thu-thap-du-lieu',
      title: '1. Thông tin chúng tôi thu thập',
      content:
        'Chúng tôi thu thập các thông tin bạn cung cấp trực tiếp khi đăng ký tài khoản (Họ tên, Email, Số điện thoại, Địa chỉ nhận giải thưởng) và thông tin tác phẩm nộp dự thi (Tên tác phẩm, cuộn film sử dụng, dòng máy ảnh, thông số chụp và câu chuyện đi kèm). Hệ thống cũng ghi nhận thông số kỹ thuật như địa chỉ IP, trình duyệt và nhật ký hoạt động nhằm mục đích phòng chống gian lận bình chọn.',
    },
    {
      id: 'muc-dich-su-dung',
      title: '2. Mục đích xử lý thông tin',
      content:
        'Thông tin thu thập được dùng cho các mục đích: (a) Quản lý tài khoản và định danh thí sinh; (b) Tổ chức chấm giải, công bố kết quả và trao giải thưởng; (c) Liên hệ hỗ trợ kỹ thuật và giải đáp thắc mắc; (d) Gửi thông báo về các cuộc thi mới hoặc sự kiện cộng đồng (bạn có thể hủy đăng ký bất cứ lúc nào).',
    },
    {
      id: 'bao-ve-anh-va-exif',
      title: '3. Bảo mật tác phẩm ảnh & Dữ liệu Exif',
      content:
        'Tất cả file ảnh scan phim gốc được lưu trữ trên hạ tầng điện toán đám mây bảo mật có mã hóa. Chúng tôi không chia sẻ file ảnh gốc độ phân giải in ấn cho bất kỳ bên thứ ba thương mại nào nếu không có sự đồng thuận bằng văn bản của tác giả. Dữ liệu metadata (film stock, máy ảnh) được công khai nhằm mục đích học hỏi trong cộng đồng analog.',
    },
    {
      id: 'chia-se-ben-thu-ba',
      title: '4. Chia sẻ thông tin với bên thứ ba',
      content:
        'FilmContest tuyệt đối không bán hoặc trao đổi dữ liệu cá nhân của người dùng cho bên tiếp thị thứ ba. Chúng tôi chỉ chia sẻ thông tin hạn chế cho các đơn vị vận chuyển (để gửi tặng phẩm/giải thưởng) hoặc khi có yêu cầu hợp pháp từ cơ quan thực thi pháp luật.',
    },
    {
      id: 'an-ninh-du-lieu',
      title: '5. An toàn và An ninh dữ liệu',
      content:
        'Toàn bộ kết nối giữa trình duyệt của bạn và hệ thống được mã hóa bằng giao thức SSL/TLS chuẩn ngân hàng. Mật khẩu người dùng được băm (hash) bằng thuật toán an toàn một chiều và đội ngũ kỹ thuật thường xuyên quét lỗ hổng bảo mật.',
    },
    {
      id: 'quyen-nguoi-dung',
      title: '6. Quyền của người dùng đối với dữ liệu',
      content:
        'Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa vĩnh viễn tài khoản và thông tin cá nhân của mình bất kỳ lúc nào thông qua trang Cài đặt tài khoản hoặc gửi yêu cầu tới ban quản trị qua email privacy@filmcontest.vn.',
    },
    {
      id: 'cookie-va-tracking',
      title: '7. Chính sách Cookie',
      content:
        'Chúng tôi sử dụng cookie cơ bản để duy trì phiên đăng nhập và ghi nhớ tùy chọn giao diện (như câu hỏi FAQ đã xem, chủ đề giao diện). Bạn có thể cấu hình trình duyệt để từ chối cookie, tuy nhiên một số tính năng có thể hoạt động không tối ưu.',
    },
  ],
};

export function PrivacyPage({ onGoHome, onSelectPortal, onOpenAuth }: PrivacyPageProps) {
  const content = PRIVACY_PAGE_CONTENT;
  const [activeSection, setActiveSection] = useState<string>(content.sections[0].id);

  // Scroll spy: tự động cập nhật activeSection khi cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = content.sections.map((sec) => ({
        id: sec.id,
        el: document.getElementById(sec.id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const item = sectionElements[i];
        if (item.el) {
          const rect = item.el.getBoundingClientRect();
          if (rect.top <= 180) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content.sections]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
              <span className="text-white font-semibold">Chính sách bảo mật</span>
            </div>

            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Bảo mật & Quyền riêng tư</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                {content.title}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {content.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-300/80 pt-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Hiệu lực từ: {content.lastUpdated}
                </span>
                <span>•</span>
                <span>Phiên bản: {content.version}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Body */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Các phần bảo mật</span>
                </div>
                <nav className="space-y-1">
                  {content.sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center justify-between ${
                        activeSection === sec.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate">{sec.title}</span>
                      {activeSection === sec.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Data Protection Officer Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 text-xs shadow-md">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Bộ phận Bảo vệ Dữ liệu (DPO)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Bạn muốn yêu cầu trích xuất dữ liệu cá nhân hoặc xóa tài khoản vĩnh viễn?
                </p>
                <div className="pt-1">
                  <a
                    href="mailto:privacy@filmcontest.vn"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors w-full justify-center text-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Gửi thư tới DPO</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Main Text Content (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
              {content.sections.map((sec) => (
                <article
                  key={sec.id}
                  id={sec.id}
                  className="scroll-mt-28 space-y-3 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {sec.title}
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line text-justify">
                    {sec.content}
                  </p>
                </article>
              ))}

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <span>Cam kết bảo mật theo tiêu chuẩn quốc tế ISO/IEC 27001.</span>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In bản chính sách</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
