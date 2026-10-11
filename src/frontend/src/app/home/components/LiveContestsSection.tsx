import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Calendar, Users, ArrowRight } from 'lucide-react';

export interface ContestItem {
  id: string;
  title: string;
  status: 'active' | 'upcoming' | 'ended';
  statusLabel: string;
  image: string;
  startDate: string;
  endDate: string;
  participantsCount: number;
  categories: string[];
  description?: string;
  prizePool?: string;
}

interface LiveContestsSectionProps {
  onSelectContest?: (contest: ContestItem) => void;
  onViewAll?: () => void;
}

export const FEATURED_CONTESTS: ContestItem[] = [
  {
    id: 'analog-moments-2025',
    title: 'Analog Moments 2025',
    status: 'active',
    statusLabel: 'Đang diễn ra',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    startDate: '01/06/2025',
    endDate: '30/09/2025',
    participantsCount: 342,
    categories: ['Phong cảnh', 'Chân dung', 'Đời sống'],
    description: 'Ghi lại những khoảnh khắc của thời đại nhiếp ảnh phim. Khám phá vẻ đẹp thuần khiết từ các cuộn phim cổ điển.',
    prizePool: '50.000.000 VNĐ + Máy ảnh Leica M6',
  },
  {
    id: 'film-and-city',
    title: 'Film & City',
    status: 'active',
    statusLabel: 'Đang diễn ra',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1000&q=80',
    startDate: '15/08/2025',
    endDate: '30/11/2025',
    participantsCount: 285,
    categories: ['Đường phố', 'Kiến trúc', 'Đời sống'],
    description: 'Nhịp sống đô thị qua lăng kính phim 35mm. Sự giao thoa giữa ánh sáng đường phố và sự hoài niệm của màu phim.',
    prizePool: '35.000.000 VNĐ + 50 cuộn Kodak Tri-X 400',
  },
  {
    id: 'the-vintage-look',
    title: 'The Vintage Look',
    status: 'upcoming',
    statusLabel: 'Sắp diễn ra',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    startDate: '10/07/2025',
    endDate: '30/09/2025',
    participantsCount: 198,
    categories: ['Chân dung', 'Nghệ thuật', 'Tự do'],
    description: 'Tôn vinh phong cách retro cổ điển thập niên 80s-90s với màu sắc ấm áp, độ hạt grain tự nhiên và cảm xúc chân thật.',
    prizePool: '30.000.000 VNĐ + Lens ngàm M vintage',
  },
  {
    id: 'film-portrait-2025',
    title: 'Film Portrait 2025',
    status: 'active',
    statusLabel: 'Đang diễn ra',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
    startDate: '20/07/2025',
    endDate: '20/10/2025',
    participantsCount: 215,
    categories: ['Chân dung', 'Nghệ thuật', 'Ánh sáng'],
    description: 'Khắc hoạ chân dung con người với chiều sâu cảm xúc, độ tương phản mượt mà và dải sắc độ tự nhiên của film âm bản.',
    prizePool: '25.000.000 VNĐ + Body Nikon FM2',
  },
  {
    id: 'goc-pho-film',
    title: 'Góc Phố Film',
    status: 'active',
    statusLabel: 'Đang diễn ra',
    image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1000&q=80',
    startDate: '01/08/2025',
    endDate: '15/11/2025',
    participantsCount: 178,
    categories: ['Đường phố', 'Đời thường', 'Trắng đen'],
    description: 'Tìm kiếm vẻ đẹp trong những lát cắt bình dị thường nhật trên từng con phố thân quen qua tông màu film hoài niệm.',
    prizePool: '20.000.000 VNĐ + Voucher tráng scan 1 năm',
  },
];

export function LiveContestsSection({ onSelectContest, onViewAll }: LiveContestsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Check scroll position to update navigation indicators
  const checkScrollState = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Compute approximate active card index for dots
    const cardWidth = 380;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, FEATURED_CONTESTS.length - 1));
  };

  const scrollNext = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    
    if (scrollLeft >= maxScroll - 15) {
      // Loop smoothly back to beginning
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const scrollAmount = clientWidth > 768 ? 400 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    if (scrollLeft <= 15) {
      // Loop smoothly to the end
      scrollContainerRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
    } else {
      const scrollAmount = clientWidth > 768 ? 400 : 320;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto-play sliding interval every 3.5 seconds when not paused
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      scrollNext();
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollState);
    checkScrollState();
    return () => el.removeEventListener('scroll', checkScrollState);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Cuộc thi nổi bật</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                {FEATURED_CONTESTS.length} cuộc thi
              </span>
            </h2>
          </div>
        </div>

        {/* View all link */}
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Carousel Container */}
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={scrollContainerRef}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 snap-x snap-mandatory"
        >
          {FEATURED_CONTESTS.map((contest) => {
            const isActive = contest.status === 'active';
            return (
              <div
                key={contest.id}
                className="w-[320px] sm:w-[360px] lg:w-[384px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group select-none"
              >
                {/* Card Thumbnail */}
                <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                  <img
                    src={contest.image}
                    alt={contest.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Status Pill Badge */}
                  <div className="absolute top-3.5 left-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
                        isActive
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-blue-600/90 text-white'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-white animate-pulse' : 'bg-white'
                        }`}
                      />
                      {contest.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {contest.title}
                    </h3>

                    {/* Dates & Participant meta */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{contest.startDate} - {contest.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{contest.participantsCount}</span>
                      </div>
                    </div>

                    {/* Category Tags */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {contest.categories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => onSelectContest?.(contest)}
                      className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Xem chi tiết</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Progress Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {FEATURED_CONTESTS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!scrollContainerRef.current) return;
                const cardWidth = 380;
                scrollContainerRef.current.scrollTo({
                  left: idx * cardWidth,
                  behavior: 'smooth',
                });
              }}
              aria-label={`Đi tới cuộc thi ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeIndex === idx
                  ? 'w-6 bg-blue-600'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
