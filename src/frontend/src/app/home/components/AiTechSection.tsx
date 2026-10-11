import React from 'react';
import { Cpu, ShieldCheck, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

export function AiTechSection() {
  const features = [
    {
      icon: Cpu,
      title: 'Nhận diện Film Stock tự động',
      description: 'AI phân tích quang phổ màu và đặc tính hạt film để xác thực cuộn phim sử dụng (Kodak, Fujifilm, Ilford...).',
    },
    {
      icon: ShieldCheck,
      title: 'Kiểm duyệt gian lận kỹ thuật số',
      description: 'Phát hiện can thiệp chỉnh sửa số quá đà, ảnh tạo bởi AI (AI generated) hoặc tái sử dụng ảnh từ internet.',
    },
    {
      icon: Sliders,
      title: 'Hỗ trợ chấm điểm khách quan',
      description: 'Đánh giá sơ bộ bố cục, ánh sáng và độ tương phản giúp hội đồng giám khảo có thêm góc nhìn chuẩn xác.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-blue-900/50 shadow-xl relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Công nghệ AI bảo chứng</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Tích hợp Trí Tuệ Nhân Tạo hỗ trợ bảo tồn giá trị ảnh phim
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Hệ thống áp dụng các mô hình học sâu chuyên biệt để giữ vững tính trung thực và công bằng cho mọi giải thưởng nhiếp ảnh truyền thống.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1.5">{feat.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
