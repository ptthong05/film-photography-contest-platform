import React, { useState, useEffect } from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import {
  FileText,
  ChevronRight,
  ShieldCheck,
  Camera,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  BookOpen,
} from 'lucide-react';

interface TermsPageProps {
  onGoHome: () => void;
  onSelectPortal?: (portal: Portal) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
}

// Cấu trúc nội dung có thể quản lý qua CMS Admin sau này
export const TERMS_PAGE_CONTENT = {
  title: 'Điều khoản sử dụng dịch vụ',
  lastUpdated: '15/10/2025',
  version: '2.1.0',
  description:
    'Chào mừng bạn đến với FilmContest. Vui lòng đọc kỹ các điều khoản dưới đây trước khi đăng ký tài khoản, gửi tác phẩm dự thi hoặc tham gia tương tác trên nền tảng của chúng tôi.',
  sections: [
    {
      id: 'chap-thuan',
      title: '1. Chấp thuận điều khoản',
      content:
        'Khi truy cập và sử dụng bất kỳ tính năng nào của nền tảng FilmContest, bạn đồng ý tuân thủ toàn bộ các điều khoản, quy chế cuộc thi và chính sách liên quan được công bố trên trang web. Nếu không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ ngay lập tức.',
    },
    {
      id: 'tai-khoan',
      title: '2. Tài khoản người dùng & Bảo mật',
      content:
        'Người tham gia cần cung cấp thông tin chính xác, cập nhật khi đăng ký tài khoản. Bạn có trách nhiệm bảo mật mật khẩu và chịu mọi trách nhiệm phát sinh từ các hoạt động diễn ra dưới tài khoản của mình. FilmContest có quyền tạm khóa hoặc chấm dứt tài khoản nếu phát hiện hành vi mạo danh hoặc khai báo gian dối.',
    },
    {
      id: 'tac-pham',
      title: '3. Quy định về tác phẩm ảnh phim dự thi',
      content:
        'Tất cả ảnh gửi tham gia các cuộc thi trên hệ thống bắt buộc phải được chụp bằng máy ảnh cơ/phim quang học (35mm, 120, Large Format, Instant film...). Nghiêm cấm mọi hình thức nộp ảnh tạo bởi AI (trí tuệ nhân tạo tạo sinh) hoặc ảnh chụp kỹ thuật số thuần túy qua filter giả lập phim. Ban tổ chức bảo lưu quyền yêu cầu nộp file scan âm bản hoặc ảnh chụp cuộn film âm bản để đối soát khi cần thiết.',
    },
    {
      id: 'ban-quyen',
      title: '4. Bản quyền tác giả & Quyền sử dụng hình ảnh',
      content:
        'Tác giả dự thi giữ 100% quyền sở hữu trí tuệ và bản quyền đối với tác phẩm của mình. Khi nộp ảnh vào cuộc thi, tác giả cấp cho Ban tổ chức FilmContest quyền sử dụng tác phẩm phi thương mại nhằm mục đích: trưng bày triển lãm, đăng tải vinh danh trên website/mạng xã hội và quảng bá cho cuộc thi (luôn kèm tên tác giả).',
    },
    {
      id: 'cham-diem',
      title: '5. Quy trình chấm điểm & Trao giải',
      content:
        'Hội đồng giám khảo chấm điểm dựa trên tiêu chí nghệ thuật, kỹ thuật phơi sáng và câu chuyện truyền tải. Quyết định cuối cùng của Ban giám khảo và Ban tổ chức là quyết định có hiệu lực cao nhất. Giải thưởng sẽ được trao đúng thể lệ đã công bố sau khi hoàn tất thủ tục xác minh danh tính.',
    },
    {
      id: 'nghiem-cam',
      title: '6. Các hành vi bị nghiêm cấm',
      content:
        'Người dùng không được phép: (a) Sử dụng bot, công cụ tự động để buff lượt bình chọn hoặc tim; (b) Nộp tác phẩm vi phạm thuần phong mỹ tục, pháp luật hiện hành hoặc sao chép của người khác; (c) Quấy rối, công kích các thí sinh hoặc giám khảo khác trên phần bình luận.',
    },
    {
      id: 'trach-nhiem',
      title: '7. Giới hạn trách nhiệm pháp lý',
      content:
        'FilmContest nỗ lực tối đa để duy trì tính liên tục và ổn định của nền tảng, tuy nhiên không chịu trách nhiệm đối với các sự cố bất khả kháng như đường truyền mạng, máy chủ gián đoạn hoặc tổn thất dữ liệu do bên thứ ba gây ra.',
    },
    {
      id: 'thay-doi',
      title: '8. Sửa đổi điều khoản',
      content:
        'Chúng tôi có thể cập nhật các điều khoản này theo thời gian để phù hợp với định hướng phát triển và quy định pháp luật. Mọi thay đổi lớn sẽ được thông báo trên trang chủ và gửi email thông báo tới thành viên.',
    },
  ],
};

export function TermsPage({ onGoHome, onSelectPortal, onOpenAuth }: TermsPageProps) {
  const content = TERMS_PAGE_CONTENT;
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
        {/* Header Banner */}
        <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white py-12 sm:py-16 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200/80 mb-4 font-medium">
              <button onClick={onGoHome} className="hover:text-white transition-colors cursor-pointer">
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
              <span className="text-white font-semibold">Điều khoản sử dụng</span>
            </div>

            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Quy chế nền tảng</span>
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
                  Cập nhật lần cuối: {content.lastUpdated}
                </span>
                <span>•</span>
                <span>Phiên bản: {content.version}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Body with Sticky Sidebar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Nav Table of Contents (4 cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Mục lục điều khoản</span>
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

              {/* Support Notice Card */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2 text-xs text-blue-900">
                <div className="flex items-center gap-2 font-bold text-blue-950">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span>Cần giải đáp về quy chế?</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  Nếu bạn có bất kỳ câu hỏi nào về bản quyền hoặc quy chế dự thi, đừng ngần ngại liên hệ với ban tổ chức.
                </p>
                <button
                  onClick={() => onSelectPortal?.('CONTACT')}
                  className="mt-2 text-xs font-bold text-blue-700 hover:text-blue-900 underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Liên hệ ban tổ chức &rarr;
                </button>
              </div>
            </div>

            {/* Right Main Text Content (8 cols) */}
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
                <span>© 2025 FilmContest. Mọi quyền được bảo lưu.</span>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In văn bản điều khoản</span>
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
