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

const INITIAL_RESULTS: ResultItem[] = [
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
    judgeComment: 'Bức ảnh có bố cục tốt, ánh sáng hài hòa và thể hiện được cảm xúc rất chân thực.',
    category: 'Phong cảnh • Chân dung • Đời sống',
    criteriaScores: {
      composition: '18.5 / 20',
      lighting: '17.5 / 20',
      content: '17.0 / 20',
      technique: '16.5 / 20',
      creativity: '17.0 / 20'
    }
  }
];

export function ResultsTab() {
  const [resultsList, setResultsList] = useState<ResultItem[]>(INITIAL_RESULTS);
  const [selectedResult, setSelectedResult] = useState<ResultItem | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('participant_entries');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries);
        if (Array.isArray(parsedEntries)) {
          const gradedEntries = parsedEntries.filter((item: any) => item.status === 'Đã chấm');

          const convertedGraded: ResultItem[] = gradedEntries.map((item: any, idx: number) => ({
            id: item.id || `res-graded-${idx}`,
            contestName: item.contestTitle || 'Cuộc thi Phim Analog',
            artworkTitle: item.title,
            prize: 'Đã hoàn thành chấm điểm',
            rankInfo: 'Top Đánh Giá Khảo Sát',
            status: 'Đã chấm điểm chính thức',
            score: '88.0',
            imageUrl: item.photoUrl,
            date: item.submittedAt || 'Mới cập nhật',
            judgeName: 'Hội đồng Giám khảo',
            judgeComment: item.description || 'Tác phẩm được đánh giá cao về mặt cảm xúc và kỹ thuật phim.',
            category: 'Nhiếp ảnh Phim Truyền Thống',
            criteriaScores: {
              composition: '18.0 / 20',
              lighting: '17.5 / 20',
              content: '18.0 / 20',
              technique: '17.0 / 20',
              creativity: '17.5 / 20'
            }
          }));

          const combined = [...convertedGraded, ...INITIAL_RESULTS.filter(res => !convertedGraded.some(g => g.artworkTitle === res.artworkTitle))];
          setResultsList(combined);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectResult = (res: ResultItem) => {
    setSelectedResult(res);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 3500);
  };

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

    createFirework(canvas.width * 0.3, canvas.height * 0.3);
    createFirework(canvas.width * 0.7, canvas.height * 0.3);
    setTimeout(() => createFirework(canvas.width * 0.5, canvas.height * 0.25), 300);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
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

  if (selectedResult) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-20 relative">
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

        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

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

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-6 rounded-3xl flex items-center gap-5 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Trophy className="w-9 h-9" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-black text-amber-900">{selectedResult.prize}</h3>
                <p className="text-xs font-extrabold text-amber-700">{selectedResult.rankInfo}</p>
              </div>
            </div>

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
                  <span className="text-slate-800">Tính sáng tạo</span>
                  <span className="text-right font-black text-slate-900">{selectedResult.criteriaScores.creativity}</span>
                </div>
              </div>
            </div>
          </div>

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

  return (
    <div className="space-y-8 max-w-[1800px] mx-auto pb-20">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
        <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
          ● OFFICIAL DIGITAL ARCHIVE
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Kết Quả Cuộc Thi & Digital Archive</h1>
        <p className="text-sm text-slate-500">Xem kết quả chính thức, bảng điểm chi tiết và nhận xét từ Hội đồng Giám khảo quốc tế.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {resultsList.map((res) => (
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