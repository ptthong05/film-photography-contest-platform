import React, { useState, useEffect, useRef } from 'react';
import { Trophy, CheckCircle2, FileText, ArrowRight, Sparkles, Bell, ArrowLeft, Star, Award } from 'lucide-react';

export interface ResultItem {
  id: string;
  contestName: string;
  artworkTitle: string;
  prize: string;
  rankInfo: string;
  status: string;
  score: string;
  imageUrl: string;
  date: string;
  judgeName: string;
  judgeComment: string;
  category: string;
  criteriaScores: {
    composition: string;
    lighting: string;
    content: string;
    technique: string;
    creativity: string;
  };
}

const ALL_RESULTS: ResultItem[] = [
  {
    id: 'res-01',
    contestName: 'Analog Moments 2025',
    artworkTitle: 'Hoàng Hôn Cầu Ba Son',
    prize: 'Giải Nhì',
    rankInfo: 'Hạng 2 / 25',
    status: 'Đã công bố chính thức',
    score: '86.5',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80',
    date: '30/06/2025',
    judgeName: 'Lê Minh Tuấn',
    judgeComment: 'Bức ảnh có bố cục tốt, ánh sáng hài hòa và thể hiện được cảm xúc rất chân thực. Tuy nhiên, có thể cải thiện thêm về độ nét ở phần nền.',
    category: 'Phong cảnh • Chân dung • Đời sống',
    criteriaScores: {
      composition: '18.5 / 20',
      lighting: '17.5 / 20',
      content: '17.0 / 20',
      technique: '16.5 / 20',
      creativity: '17.0 / 20'
    }
  },
  {
    id: 'res-02',
    contestName: 'Sony World Photography Awards 2026',
    artworkTitle: 'Sương Sớm Cao Nguyên',
    prize: 'Top 50 Shortlist',
    rankInfo: 'Hạng 5 / 150',
    status: 'Đã công bố chính thức',
    score: '91.0',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80',
    date: '10/04/2026',
    judgeName: 'Elena Rostova',
    judgeComment: 'Tông màu film ấm áp, miêu tả chiều sâu không gian sương mờ tuyệt mỹ tại vùng cao nguyên. Kỹ thuật scan sạch sẽ và tinh tế.',
    category: 'Landscape • Nature',
    criteriaScores: {
      composition: '19.0 / 20',
      lighting: '18.0 / 20',
      content: '18.5 / 20',
      technique: '18.0 / 20',
      creativity: '17.5 / 20'
    }
  },
  {
    id: 'res-03',
    contestName: 'PX3 - Prix de la Photographie Paris',
    artworkTitle: 'Nhịp Sống Phố Cổ',
    prize: 'Honorable Mention',
    rankInfo: 'Hạng 8 / 80',
    status: 'Đã công bố chính thức',
    score: '89.5',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80',
    date: '28/07/2026',
    judgeName: 'Jean-Luc Dupont',
    judgeComment: 'Sự tương phản ánh sáng mạnh mẽ đặc trưng của dòng phim đen trắng thủ công. Bắt trọn khoảnh khắc phố xá rất tự nhiên.',
    category: 'Fine Art / Street',
    criteriaScores: {
      composition: '18.0 / 20',
      lighting: '18.5 / 20',
      content: '17.5 / 20',
      technique: '18.0 / 20',
      creativity: '17.5 / 20'
    }
  },
  {
    id: 'res-04',
    contestName: 'National Geographic Photo Contest',
    artworkTitle: 'Góc Nhìn Di Sản',
    prize: 'Finalist Award',
    rankInfo: 'Hạng 3 / 60',
    status: 'Đã công bố chính thức',
    score: '92.0',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
    date: '12/01/2026',
    judgeName: 'Marcus Vance',
    judgeComment: 'Bắt trọn khoảnh khắc chân thực của đời sống văn hóa bản địa qua chất liệu film nguyên bản. Kỹ thuật bấm máy đỉnh cao.',
    category: 'Cultural Storytelling',
    criteriaScores: {
      composition: '19.0 / 20',
      lighting: '18.5 / 20',
      content: '18.5 / 20',
      technique: '18.0 / 20',
      creativity: '18.0 / 20'
    }
  }
];

export function ResultsTab() {
  const [selectedResult, setSelectedResult] = useState<ResultItem | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Kích hoạt hiệu ứng pháo hoa khi bấm xem chi tiết
  const handleSelectResult = (res: ResultItem) => {
    setSelectedResult(res);
    setShowCelebration(true);

    // Tự động mờ dần và tắt pháo hoa sau 3.5 giây
    setTimeout(() => {
      setShowCelebration(false);
    }, 3500);
  };

  // Hiệu ứng pháo hoa vẽ trên Canvas
  useEffect(() => {
    if (!showCelebration || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      radius: number;
      alpha: number;
      decay: number;
    }> = [];

    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'];

    const createFirework = (x: number, y: number) => {
      const particleCount = 80;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 6 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          radius: Math.random() * 3.5 + 1.5,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.008
        });
      }
    };

    // Bắn 5 đợt pháo hoa ở các vị trí khác nhau
    createFirework(canvas.width * 0.3, canvas.height * 0.3);
    createFirework(canvas.width * 0.7, canvas.height * 0.3);
    setTimeout(() => createFirework(canvas.width * 0.5, canvas.height * 0.25), 300);
    setTimeout(() => createFirework(canvas.width * 0.2, canvas.height * 0.4), 600);
    setTimeout(() => createFirework(canvas.width * 0.8, canvas.height * 0.4), 800);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Trọng lực nhẹ
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(index, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        }
      });

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [showCelebration]);

  // TRANG CHI TIẾT KẾT QUẢ CÓ HIỆU ỨNG CHÚC MỪNG
  if (selectedResult) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-20 relative">

        {/* Lớp Pháo Hoa & Khung Chúc Mừng Mờ Dần */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center transition-opacity duration-1000 animate-fade-out">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            <div className="bg-slate-900/80 backdrop-blur-md px-10 py-6 rounded-3xl border border-amber-400/50 shadow-2xl flex flex-col items-center gap-2 animate-bounce z-10 text-center">
              <div className="flex items-center gap-3">
                <Trophy className="w-10 h-10 text-amber-400 animate-spin" />
                <span className="text-2xl md:text-3xl font-black text-amber-300">XIN CHÚC MỪNG TÁC GIẢ!</span>
                <Trophy className="w-10 h-10 text-amber-400 animate-spin" />
              </div>
              <p className="text-sm font-bold text-white">Bạn đã đạt kết quả xuất sắc trong cuộc thi {selectedResult.contestName}</p>
            </div>
          </div>
        )}

        {/* Toast thông báo */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header & Nút Quay Lại */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => setSelectedResult(null)}
            className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 font-extrabold rounded-2xl border border-slate-200 text-xs transition cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách kết quả
          </button>
          <button
            onClick={() => showToast('Đã mở trung tâm thông báo kết quả')}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition cursor-pointer shadow-sm"
          >
            <Bell className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Khung Giao Diện Chi Tiết Chấm Điểm */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-8">

          {/* Header Cuộc Thi & Tác Phẩm */}
          <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
            <img
              src={selectedResult.imageUrl}
              alt={selectedResult.artworkTitle}
              className="w-20 h-20 rounded-2xl object-cover shadow-md border border-slate-200 flex-shrink-0"
            />
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">{selectedResult.contestName}</h2>
              <p className="text-xs font-bold text-slate-500">{selectedResult.category}</p>
              <p className="text-xs font-extrabold text-blue-600">Tác phẩm dự thi: {selectedResult.artworkTitle}</p>
            </div>
          </div>

          {/* 2 Thẻ Cúp Giải Thưởng & Điểm Tổng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thẻ Giải Thưởng */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-6 rounded-3xl flex items-center gap-5 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Trophy className="w-9 h-9" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-black text-amber-900">{selectedResult.prize}</h3>
                <p className="text-xs font-extrabold text-amber-700">{selectedResult.rankInfo}</p>
              </div>
            </div>

            {/* Thẻ Điểm Tổng */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-3xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-black text-blue-700 uppercase tracking-wider">Điểm tổng</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-blue-600">{selectedResult.score}</span>
                  <span className="text-sm font-bold text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
                <Star className="w-7 h-7 fill-white" />
              </div>
            </div>
          </div>

          {/* Bảng Chi Tiết Điểm Từng Phần */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-base">Chi tiết điểm</h3>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 grid grid-cols-2 px-6 py-3.5 text-xs font-black text-slate-600 uppercase border-b border-slate-200">
                <span>Tiêu chí</span>
                <span className="text-right">Điểm</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs font-bold">
                <div className="grid grid-cols-2 px-6 py-4 hover:bg-slate-50/80 transition">
                  <span className="text-slate-800">Bố cục</span>
                  <span className="text-right font-black text-slate-900">{selectedResult.criteriaScores.composition}</span>
                </div>
                <div className="grid grid-cols-2 px-6 py-4 hover:bg-slate-50/80 transition">
                  <span className="text-slate-800">Ánh sáng</span>
                  <span className="text-right font-black text-slate-900">{selectedResult.criteriaScores.lighting}</span>
                </div>
                <div className="grid grid-cols-2 px-6 py-4 hover:bg-slate-50/80 transition">
                  <span className="text-slate-800">Nội dung</span>
                  <span className="text-right font-black text-slate-900">{selectedResult.criteriaScores.content}</span>
                </div>
                <div className="grid grid-cols-2 px-6 py-4 hover:bg-slate-50/80 transition">
                  <span className="text-slate-800">Kỹ thuật (film & scan)</span>
                  <span className="text-right font-black text-slate-900">{selectedResult.criteriaScores.technique}</span>
                </div>
                <div className="grid grid-cols-2 px-6 py-4 hover:bg-slate-50/80 transition">
                  <span className="text-slate-800">Tinh sáng tạo</span>
                  <span className="text-right font-black text-slate-900">{selectedResult.criteriaScores.creativity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nhận Xét Của Giám Khảo */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-base">Nhận xét của giám khảo</h3>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-base shadow-md">
                  {selectedResult.judgeName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Giám khảo: {selectedResult.judgeName}</p>
                  <p className="text-xs text-slate-400 font-bold">{selectedResult.date}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed italic">
                  "{selectedResult.judgeComment}"
                </p>
              </div>
            </div>
          </div>

          {/* Nút Xem Tất Cả Kết Quả */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setSelectedResult(null)}
              className="px-8 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-xs rounded-2xl border border-blue-200 transition cursor-pointer active:scale-95"
            >
              Xem tất cả kết quả
            </button>
          </div>

        </div>
      </div>
    );
  }

  // DANH SÁCH KẾT QUẢ TỔNG QUAN
  return (
    <div className="space-y-8 max-w-[1800px] mx-auto pb-20">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
        <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
          ● OFFICIAL DIGITAL ARCHIVE
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Kết Quả Cuộc Thi & Digital Archive</h1>
        <p className="text-sm text-slate-500">Xem kết quả chính thức, bảng điểm chi tiết và nhận xét từ Hội đồng Giám khảo quốc tế.</p>
      </div>

      {/* Grid 4 Cuộc Thi Đạt Giải */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ALL_RESULTS.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-5 p-7">
              <div className="relative h-60 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                <img
                  src={res.imageUrl}
                  alt={res.artworkTitle}
                  className="w-full h-full object-cover transition duration-300 hover:scale-105"
                />
                <span className="absolute top-4 left-4 px-4 py-2 bg-amber-500 text-white rounded-full text-xs font-black shadow-lg flex items-center gap-1.5">
                  🏆 {res.prize}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-blue-600 uppercase tracking-wider">{res.contestName}</p>
                <h3 className="font-black text-slate-900 text-2xl">{res.artworkTitle}</h3>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{res.status}</span>
                  </div>
                  <div className="font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    ⭐ Điểm hội đồng: {res.score} / 100
                  </div>
                </div>
              </div>
            </div>

            <div className="p-7 pt-0">
              <button
                onClick={() => handleSelectResult(res)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <FileText className="w-4 h-4" /> Bấm để xem chi tiết bảng điểm & nhận xét <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}