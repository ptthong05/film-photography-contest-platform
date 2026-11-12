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

interface StoredEntryItem {
  id?: string;
  contestTitle?: string;
  title?: string;
  status?: string;
  score?: string | number;
  prize?: string;
  rankInfo?: string;
  judgeName?: string;
  judgeComment?: string;
  photoUrl?: string;
  submittedAt?: string;
  description?: string;
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
        const parsedEntries: StoredEntryItem[] = JSON.parse(savedEntries);
        if (Array.isArray(parsedEntries)) {
          const gradedEntries = parsedEntries.filter((item: StoredEntryItem) => item.status === 'Đã chấm');

          const convertedGraded: ResultItem[] = gradedEntries.map((item: StoredEntryItem, idx: number) => {
            const rawScore = Number(item.score || 85);
            return {
              id: item.id || `res-graded-${idx}`,
              contestName: item.contestTitle || 'Cuộc thi Phim Analog',
              artworkTitle: item.title || 'Tác phẩm',
              prize: item.prize || 'Đã hoàn thành chấm điểm',
              rankInfo: item.rankInfo || 'Top Đánh Giá Khảo Sát',
              status: 'Đã công bố chính thức',
              score: item.score ? String(item.score) : '88.0',
              imageUrl: item.photoUrl || '',
              date: item.submittedAt || 'Mới cập nhật',
              judgeName: item.judgeName || 'Hội đồng Giám khảo',
              judgeComment: item.judgeComment || item.description || 'Tác phẩm được đánh giá cao về mặt cảm xúc và kỹ thuật phim.',
              category: 'Nhiếp ảnh Phim Truyền Thống',
              criteriaScores: {
                composition: `${(rawScore * 0.22).toFixed(1)} / 20`,
                lighting: `${(rawScore * 0.20).toFixed(1)} / 20`,
                content: `${(rawScore * 0.20).toFixed(1)} / 20`,
                technique: `${(rawScore * 0.19).toFixed(1)} / 20`,
                creativity: `${(rawScore * 0.19).toFixed(1)} / 20`
              }
            };
          });

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

        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <button
            onClick={() => setSelectedResult(null)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 text-xs transition cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách kết quả
          </button>
          <span className="text-xs font-semibold text-slate-500">Mã bài: {selectedResult.id}</span>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <img
              src={selectedResult.imageUrl}
              alt={selectedResult.artworkTitle}
              className="w-16 h-16 rounded-xl object-cover shadow-xs border border-slate-200 flex-shrink-0"
            />
            <div className="space-y-0.5 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">{selectedResult.contestName}</h2>
              <p className="text-xs text-slate-500">{selectedResult.category}</p>
              <p className="text-xs font-semibold text-blue-600 truncate">Tác phẩm dự thi: {selectedResult.artworkTitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3.5 shadow-xs">
              <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-amber-900">{selectedResult.prize}</h3>
                <p className="text-xs font-semibold text-amber-700">{selectedResult.rankInfo}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Điểm tổng</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-blue-600">{selectedResult.score}</span>
                  <span className="text-xs font-medium text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                <Star className="w-5 h-5 fill-white" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Chi tiết điểm</h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-slate-50 grid grid-cols-2 px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                <span>Tiêu chí</span>
                <span className="text-right">Điểm</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="grid grid-cols-2 px-4 py-2.5 hover:bg-slate-50/80 transition">
                  <span className="text-slate-700">Bố cục</span>
                  <span className="text-right font-bold text-slate-900">{selectedResult.criteriaScores.composition}</span>
                </div>
                <div className="grid grid-cols-2 px-4 py-2.5 hover:bg-slate-50/80 transition">
                  <span className="text-slate-700">Ánh sáng</span>
                  <span className="text-right font-bold text-slate-900">{selectedResult.criteriaScores.lighting}</span>
                </div>
                <div className="grid grid-cols-2 px-4 py-2.5 hover:bg-slate-50/80 transition">
                  <span className="text-slate-700">Nội dung</span>
                  <span className="text-right font-bold text-slate-900">{selectedResult.criteriaScores.content}</span>
                </div>
                <div className="grid grid-cols-2 px-4 py-2.5 hover:bg-slate-50/80 transition">
                  <span className="text-slate-700">Kỹ thuật (film & scan)</span>
                  <span className="text-right font-bold text-slate-900">{selectedResult.criteriaScores.technique}</span>
                </div>
                <div className="grid grid-cols-2 px-4 py-2.5 hover:bg-slate-50/80 transition">
                  <span className="text-slate-700">Tính sáng tạo</span>
                  <span className="text-right font-bold text-slate-900">{selectedResult.criteriaScores.creativity}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Nhận xét của giám khảo</h3>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-xs">
                  {selectedResult.judgeName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Giám khảo: {selectedResult.judgeName}</p>
                  <p className="text-[11px] text-slate-400">{selectedResult.date}</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{selectedResult.judgeComment}"
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setSelectedResult(null)}
              className="px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 transition cursor-pointer active:scale-95"
            >
              Xem tất cả kết quả
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full pb-16">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-bounce text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
        <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-block">
          ● OFFICIAL DIGITAL ARCHIVE
        </span>
        <h1 className="text-lg sm:text-xl font-bold text-[#0B356B] tracking-tight">Kết Quả Cuộc Thi & Digital Archive</h1>
        <p className="text-xs text-slate-500 leading-relaxed">Xem kết quả chính thức, bảng điểm chi tiết và nhận xét từ Hội đồng Giám khảo quốc tế.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {resultsList.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group"
          >
            <div className="space-y-3 p-3.5 sm:p-4">
              <div className="relative h-44 rounded-lg overflow-hidden bg-slate-100 shadow-inner">
                <img
                  src={res.imageUrl}
                  alt={res.artworkTitle}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-amber-500 text-white rounded-md text-[11px] font-bold shadow-md flex items-center gap-1">
                  🏆 {res.prize}
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider truncate">{res.contestName}</p>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate" title={res.artworkTitle}>{res.artworkTitle}</h3>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 font-medium text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate">{res.status}</span>
                  </div>
                  <div className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] shrink-0">
                    ⭐ {res.score} / 100
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 pt-0">
              <button
                onClick={() => handleSelectResult(res)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
              >
                <FileText className="w-3.5 h-3.5" /> Xem chi tiết bảng điểm <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}