import React from 'react';
import { ArrowRight, Sparkles, Compass, Camera, Film, Award } from 'lucide-react';

interface HeroSectionProps {
  onRegisterClick?: () => void;
  onExploreClick?: () => void;
}

export function HeroSection({ onRegisterClick, onExploreClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-slate-900 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 mb-0 text-white shadow-2xl">
      {/* Background Image with Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80"
          alt="Majestic Mountain Range"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.6] contrast-[1.1] transition-transform duration-1000 ease-out hover:scale-100"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
      </div>

      {/* Decorative analog film grain pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-14 pb-24 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Text Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wider uppercase text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Film Photography Contest Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Lưu giữ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-white">
                những khoảnh khắc
              </span> <br />
              Tôn vinh nhiếp ảnh phim
            </h1>

            {/* Subtitle */}
            <div className="space-y-1.5 text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              <p>
                Nền tảng tổ chức và quản lý cuộc thi nhiếp ảnh phim tích hợp AI
              </p>
              <p className="text-slate-400 text-sm sm:text-base">
                Kết nối cộng đồng — Bảo tồn giá trị nhiếp ảnh phim truyền thống
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Đăng ký tham gia</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-sm sm:text-base active:scale-[0.98] transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-blue-300" />
                <span>Khám phá cuộc thi</span>
              </button>
            </div>
          </div>

          {/* Right Visual Collage (5 cols) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">

              {/* Backpacker in front of mountains card */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-800 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
                  alt="Analog Moments Photographer"
                  className="w-full h-72 object-cover filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Film frame aesthetic details */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono uppercase tracking-wider text-[11px]">KODAK PORTRA 400</span>
                  </div>
                  <span className="font-mono text-white/70 text-[11px]">ISO 400 • 35mm</span>
                </div>
              </div>

              {/* Floating Film Strip Card - Top Right */}
              <div className="absolute -top-6 -right-4 sm:-right-6 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-xl max-w-[200px] hidden sm:block transform -rotate-3 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/10">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300 tracking-wider">FILM STRIP #36</span>
                </div>
                <div className="font-serif italic text-xs text-slate-200">
                  "Analog Moments Lost Forever"
                </div>
                <div className="mt-2 flex gap-1 justify-between">
                  <div className="w-2.5 h-3 bg-white/20 rounded-xs" />
                  <div className="w-2.5 h-3 bg-white/20 rounded-xs" />
                  <div className="w-2.5 h-3 bg-white/20 rounded-xs" />
                  <div className="w-2.5 h-3 bg-white/20 rounded-xs" />
                  <div className="w-2.5 h-3 bg-white/20 rounded-xs" />
                </div>
              </div>

              {/* Floating Award / Lens Card - Bottom Left */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-2xl text-slate-900 flex items-center gap-3 transform rotate-2 hover:rotate-0 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Giải thưởng mùa 2025</div>
                  <div className="text-[11px] text-slate-500 font-medium">Hơn 50+ máy ảnh & film cuộn</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
