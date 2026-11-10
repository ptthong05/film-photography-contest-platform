import React, { useEffect, useState } from 'react';
import { Award, ArrowRight, Eye, Heart, Sparkles } from 'lucide-react';
import { getPublishedWinningPhotos, type PublishedWinningPhoto } from '../../../services/publishedAwardService';

const STORAGE_LIKED_KEY = 'film_contest_liked_photos';
const STORAGE_LIKES_COUNT_KEY = 'film_contest_photo_likes_counts';

export function ExhibitionSection({
  onExploreMore,
  onSelectPhoto,
}: {
  onExploreMore?: () => void;
  onSelectPhoto?: (photoId: string) => void;
}) {
  const [likedMap, setLikedMap] = React.useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LIKED_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [likesCountMap, setLikesCountMap] = React.useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LIKES_COUNT_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [publishedPhotos, setPublishedPhotos] = useState<PublishedWinningPhoto[]>(getPublishedWinningPhotos);

  useEffect(() => {
    setPublishedPhotos(getPublishedWinningPhotos());
    const handleStorage = () => setPublishedPhotos(getPublishedWinningPhotos());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const winningPhotos = publishedPhotos.slice(0, 4);

  const handleToggleLike = (e: React.MouseEvent, photoId: string, baseLikes: number) => {
    e.stopPropagation();
    const isCurrentlyLiked = !!likedMap[photoId];
    const newLiked = !isCurrentlyLiked;

    const newLikedMap = { ...likedMap, [photoId]: newLiked };
    setLikedMap(newLikedMap);
    try {
      localStorage.setItem(STORAGE_LIKED_KEY, JSON.stringify(newLikedMap));
    } catch (err) {
      console.error('Failed to save liked photos:', err);
    }

    const currentCount = likesCountMap[photoId] ?? (baseLikes + (isCurrentlyLiked ? 1 : 0));
    const newCount = isCurrentlyLiked ? Math.max(baseLikes, currentCount - 1) : currentCount + 1;
    const newLikesCountMap = { ...likesCountMap, [photoId]: newCount };
    setLikesCountMap(newLikesCountMap);
    try {
      localStorage.setItem(STORAGE_LIKES_COUNT_KEY, JSON.stringify(newLikesCountMap));
    } catch (err) {
      console.error('Failed to save likes count:', err);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Kho ảnh đạt giải tiêu biểu
            </h2>
          </div>
        </div>

        <button
          onClick={onExploreMore}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer"
        >
          <span>Xem kho lưu trữ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {winningPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => onSelectPhoto?.(photo.id)}
            className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src={photo.image}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Heart Button floating at top-right corner */}
              <button
                type="button"
                onClick={(e) => handleToggleLike(e, photo.id, photo.likes)}
                className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                title="Yêu thích tác phẩm"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    likedMap[photo.id]
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-white hover:text-rose-400'
                  }`}
                />
              </button>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

              <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/90 text-[10px] font-bold text-white mb-1">
                  {photo.award}
                </span>
                <h4 className="font-bold text-sm leading-tight text-white line-clamp-1">{photo.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5">Tác giả: {photo.author}</p>
              </div>
            </div>

            <div className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 bg-white">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{photo.views} lượt xem</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-500 font-semibold">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>{likesCountMap[photo.id] ?? (photo.likes + (likedMap[photo.id] ? 1 : 0))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
