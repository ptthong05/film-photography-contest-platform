import React from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import {
  Camera,
  Heart,
  Award,
  Users,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Film,
  Target,
  Eye,
  Globe,
} from 'lucide-react';

interface AboutPageProps {
  onGoHome: () => void;
  onSelectPortal?: (portal: Portal) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
}

// Cấu trúc dữ liệu mẫu có thể cập nhật từ trang quản trị Admin
export const ABOUT_PAGE_CONTENT = {
  headline: 'Tôn vinh nghệ thuật nhiếp ảnh phim trong kỷ nguyên số',
  subheadline:
    'FilmContest là nền tảng tổ chức và lưu trữ các cuộc thi nhiếp ảnh phim hàng đầu tại Việt Nam, kết nối hàng chục nghìn nhiếp ảnh gia đam mê chất màu analog thuần khiết.',
  mission:
    'Bảo tồn vẻ đẹp cổ điển và giá trị nguyên bản của nhiếp ảnh phim cơ học, tạo sân chơi minh bạch, chuyên nghiệp và truyền cảm hứng cho cộng đồng người chụp phim.',
  vision:
    'Trở thành trung tâm kết nối nhiếp ảnh gia analog lớn nhất Đông Nam Á, nơi lưu trữ kho tàng di sản hình ảnh phim và ứng dụng công nghệ hiện đại để giám định công tâm.',
  stats: [
    { label: 'Nhiếp ảnh gia tham gia', value: '12.500+' },
    { label: 'Tác phẩm phim đã nộp', value: '48.000+' },
    { label: 'Cuộc thi đã tổ chức', value: '36+' },
    { label: 'Tổng giá trị giải thưởng', value: '1.2 Tỷ VNĐ+' },
  ],
  coreValues: [
    {
      icon: Film,
      title: 'Thuần khiết & Chân thật',
      desc: 'Tôn trọng độ hạt grain, độ sâu dải màu và ánh sáng thực tế của từng cuộn film mà không lạm dụng phần mềm chỉnh sửa.',
    },
    {
      icon: ShieldCheck,
      title: 'Minh bạch & Công tâm',
      desc: 'Quy trình chấm điểm kết hợp Hội đồng giám khảo chuyên môn hàng đầu và công nghệ giám định chống gian lận kỹ thuật số.',
    },
    {
      icon: Users,
      title: 'Cộng đồng gắn kết',
      desc: 'Lan tỏa văn hóa chụp phim qua các hoạt động photowalk dạo phố, workshop phòng tối và triển lãm nghệ thuật thực tế.',
    },
  ],
  team: [
    {
      name: 'Nguyễn Văn Minh',
      role: 'Nhà sáng lập & Giám đốc Nghệ thuật',
      bio: 'Hơn 15 năm kinh nghiệm chụp phim tư liệu và giảng dạy phòng tối đen trắng.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Trần Hải Đăng',
      role: 'Trưởng ban Giám định & Công nghệ AI',
      bio: 'Chuyên gia thị giác máy tính và giám định phim dương bản.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Lê Hoàng Yến',
      role: 'Điều phối viên Cộng đồng & Triển lãm',
      bio: 'Quản lý các sự kiện photowalk và giao lưu nhiếp ảnh analog toàn quốc.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
  ],
};

export function AboutPage({ onGoHome, onSelectPortal, onOpenAuth }: AboutPageProps) {
  const content = ABOUT_PAGE_CONTENT;

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
        {/* Hero Banner Header */}
        <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white py-14 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200/80 mb-4 font-medium">
              <button onClick={onGoHome} className="hover:text-white transition-colors cursor-pointer">
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
              <span className="text-white font-semibold">Giới thiệu về chúng tôi</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
                <Camera className="w-4 h-4 text-blue-400" />
                <span>Câu chuyện về FilmContest</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {content.headline}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {content.subheadline}
              </p>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {content.stats.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-500">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Sứ mệnh của chúng tôi
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {content.mission}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Tầm nhìn tương lai
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {content.vision}
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="bg-slate-100/70 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Giá trị cốt lõi
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Những nguyên tắc định hình và dẫn dắt sự phát triển của FilmContest.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.coreValues.map((val, idx) => {
                const Icon = val.icon;
                return (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-base sm:text-lg text-slate-900">
                      {val.title}
                    </h4>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Đội ngũ sáng lập & Cố vấn
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Những con người tâm huyết cùng chung tình yêu lớn với nhiếp ảnh analog.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {content.team.map((mem, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs text-center p-6 space-y-4">
                <img
                  src={mem.avatar}
                  alt={mem.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-blue-50 shadow-md"
                />
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-slate-900">{mem.name}</h4>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{mem.role}</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{mem.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/10">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold">Cùng chúng tôi tạo nên những khoảnh khắc đẹp</h3>
              <p className="text-blue-100 text-sm sm:text-base">Khám phá các cuộc thi đang mở và bắt đầu bấm máy ngay hôm nay.</p>
            </div>
            <button
              onClick={() => onSelectPortal?.('CONTESTS')}
              className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>Xem cuộc thi đang mở</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
