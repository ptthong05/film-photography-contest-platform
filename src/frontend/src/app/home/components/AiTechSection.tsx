import React, { useState } from 'react';
import { Sparkles, Play, ArrowRight, Film, Image as ImageIcon, Users, X, CheckCircle, ShieldCheck } from 'lucide-react';
import bannerBg from '../../../assets/ai-banner-bg.jpg';

export function AiTechSection() {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState<boolean>(false);

  const features = [
    {
      id: 1,
      num: '01',
      icon: Film,
      title: 'Nhận diện Film Stock tự động',
      description:
        'AI phân tích quang phổ màu và đặc tính hạt film để xác thực nguồn gốc tác phẩm (Kodak, Fujifilm, Ilford...).',
      previewImage:
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80',
      detail:
        'Sử dụng mô hình mạng nơ-ron học sâu được huấn luyện trên hơn 500.000 mẫu phim thực tế để phân tích vi cấu trúc hạt muối bạc, độ bão hòa màu (color saturation) và dải màu đặc trưng của từng thương hiệu film stock.',
    },
    {
      id: 2,
      num: '02',
      icon: ImageIcon,
      title: 'Kiểm duyệt gian lận kỹ thuật số',
      description:
        'Phát hiện can thiệp chỉnh sửa quá đà, ảnh tạo bởi AI (AI generated) hoặc tái sử dụng ảnh từ internet.',
      previewImage:
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
      hasAiOverlay: true,
      detail:
        'Thuật toán phân tích mức độ đồng nhất nhiễu ảnh (Noise Print Analysis) và phát hiện chữ ký sinh ảnh khuếch tán (Diffusion Model Artifacts) giúp loại bỏ triệt để ảnh deepfake hoặc render số hóa.',
    },
    {
      id: 3,
      num: '03',
      icon: Users,
      title: 'Hỗ trợ chấm điểm khách quan',
      description:
        'Đánh giá sơ bộ bố cục, ánh sáng và độ tương phản giúp hội đồng giám khảo có thêm góc nhìn chuẩn xác.',
      previewImage:
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80',
      detail:
        'Đưa ra các chỉ số tham chiếu kỹ thuật về quy tắc một phần ba, cân bằng vùng sáng tối (Dynamic Range) và độ sắc nét quang học để hỗ trợ hội đồng giám khảo chấm giải công tâm nhất.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Outer Banner Container */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-[#080E1A] text-white">
        {/* Background Visual Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={bannerBg}
            alt="AI Film Technology"
            className="w-full h-full object-cover object-right md:object-center filter brightness-[0.95] contrast-[1.05]"
          />
          {/* Multi-stage Dark Gradients to ensure text and cards readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060B14] via-[#060B14]/90 md:via-[#060B14]/75 to-transparent/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060B14] via-transparent to-black/30" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[520px] lg:min-h-[580px]">
          {/* Top Editorial Header */}
          <div className="max-w-2xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Công nghệ AI bảo chứng</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight mb-3">
              Tích hợp Trí Tuệ Nhân Tạo{' '}
              <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300">
                hỗ trợ bảo tồn giá trị ảnh phim
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal max-w-xl">
              Hệ thống áp dụng các mô hình AI chuyên biệt để giữ vững tính trung thực, minh bạch và công bằng cho mọi giải thưởng nhiếp ảnh phim.
            </p>

            {/* Action CTA Button */}
            <button
              onClick={() => setShowLearnMoreModal(true)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all hover:gap-3.5 cursor-pointer active:scale-95 group"
            >
              <Play className="w-3.5 h-3.5 fill-current text-white" />
              <span>Tìm hiểu công nghệ AI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Bottom 3 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mt-8 lg:mt-12 pt-2">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  onClick={() => setSelectedFeature(feat.id)}
                  className="relative rounded-2xl bg-[#0B1528]/85 backdrop-blur-md border border-white/10 hover:border-blue-400/50 p-4.5 sm:p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/60 group flex flex-col justify-between min-h-[195px] cursor-pointer hover:-translate-y-0.5"
                >
                  {/* Contextual Card Background Image on Right Edge */}
                  <div className="absolute right-0 bottom-0 top-0 w-2/5 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-65 transition-opacity">
                    <img
                      src={feat.previewImage}
                      alt={feat.title}
                      className="w-full h-full object-cover object-center filter contrast-125 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/85 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528]/90 via-transparent to-transparent" />

                    {/* AI Scan Overlay on Card 02 */}
                    {feat.hasAiOverlay && (
                      <div className="absolute inset-3 border border-sky-400/50 rounded flex items-start justify-end p-1">
                        <span className="text-[9px] font-mono font-bold text-sky-200 bg-blue-950/90 px-1 py-0.5 rounded border border-sky-400/60">
                          AI
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content Top */}
                  <div className="relative z-10 pr-6">
                    {/* Number label */}
                    <span className="text-xs font-bold text-sky-400/90 tracking-wider block mb-2">
                      {feat.num}
                    </span>

                    {/* Blue Icon Box */}
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    {/* Card Title */}
                    <h3 className="font-bold text-sm text-white mb-1.5 leading-snug group-hover:text-sky-300 transition-colors">
                      {feat.title}
                    </h3>

                    {/* Card Description */}
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {feat.description}
                    </p>
                  </div>

                  {/* Card Bottom Arrow Button */}
                  <div className="relative z-10 mt-4">
                    <div className="w-7 h-7 rounded-full bg-slate-800/90 border border-white/10 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all shadow-sm">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature Detail Modal */}
      {selectedFeature !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const current = features.find((f) => f.id === selectedFeature);
              if (!current) return null;
              const Icon = current.icon;
              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                        Tính năng {current.num}
                      </span>
                      <h3 className="text-lg font-bold text-white">{current.title}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {current.description}
                  </p>

                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-slate-200 leading-relaxed mb-6">
                    <strong className="block font-bold text-blue-400 mb-1">Cơ chế hoạt động kỹ thuật:</strong>
                    {current.detail}
                  </div>

                  <button
                    onClick={() => setSelectedFeature(null)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors cursor-pointer"
                  >
                    Đã hiểu
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Overview Learn More Modal */}
      {showLearnMoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 sm:p-8 text-white shadow-2xl relative">
            <button
              onClick={() => setShowLearnMoreModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider w-fit mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kiến trúc hệ thống AI</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Quy trình AI bảo chứng tác phẩm ảnh phim
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Để bảo vệ sự trong sạch và tôn vinh công sức nghệ thuật đích thực của các nhiếp ảnh gia phim, hệ thống áp dụng pipeline xác thực gồm 3 bước nghiêm ngặt:
            </p>

            <div className="space-y-3 mb-6 text-xs sm:text-sm text-slate-200">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">1. Trích xuất đặc trưng vật lý:</strong>
                  Kiểm tra quang phổ nhũ tương bạc, nhiễu hạt film grain và cấu trúc đường cong quang học.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">2. Quét gian lận & Trùng lặp:</strong>
                  Đối soát mã băm hình ảnh và dấu vết chỉnh sửa AI (Midjourney, DALL-E, Stable Diffusion).
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">3. Phân tích chỉ số bố cục:</strong>
                  Hỗ trợ ban giám khảo chấm điểm dựa trên phân bố ánh sáng, độ sâu trường ảnh và độ tương phản.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLearnMoreModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
