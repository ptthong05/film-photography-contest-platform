import React from 'react';
import { Award, ArrowRight, Eye, Heart } from 'lucide-react';

export function ExhibitionSection({
  onExploreMore,
  onSelectPhoto,
}: {
  onExploreMore?: () => void;
  onSelectPhoto?: (photoId: string) => void;
}) {
  const [likedMap, setLikedMap] = React.useState<Record<string, boolean>>({});

  const winningPhotos = [
    {
      id: 'p1',
      title: 'Khoảnh khắc bình minh',
      author: 'Nguyễn Văn A',
      award: 'Giải Nhất - Analog Moments 2025',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      views: 1420,
      likes: 382,
    },
    {
      id: 'p2',
      title: 'Đường về',
      author: 'Trần Thị Bình',
      award: 'Giải Nhì - Film & City',
      image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
      views: 980,
      likes: 245,
    },
    {
      id: 'p3',
      title: 'Nắng cuối ngày',
      author: 'Lê Minh Cường',
      award: 'Giải Ba - The Vintage Look',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      views: 870,
      likes: 210,
    },
    {
      id: 'p4',
      title: 'Góc phố cũ',
      author: 'Phạm Thị Dung',
      award: 'Giải Khuyến khích - Film & City',
      image: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=600&q=80',
      views: 650,
      likes: 189,
    },
  ];

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
                onClick={(e) => {
                  e.stopPropagation();
                  setLikedMap((prev) => ({
                    ...prev,
                    [photo.id]: !prev[photo.id],
                  }));
                }}
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
                <span>{photo.likes + (likedMap[photo.id] ? 1 : 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
