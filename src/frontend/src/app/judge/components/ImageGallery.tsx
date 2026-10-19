import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  imageUrls: string[];
  thumbnailUrls: string[];
  title: string;
}

export function ImageGallery({ imageUrls, thumbnailUrls, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = imageUrls.length;

  const handleStep = (step: number) => {
    setActiveIndex((index) => (index + step + total) % total);
  };

  if (total === 0) {
    return <div className="flex aspect-[3/2] items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">Không có ảnh</div>;
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-slate-900">
        <img src={imageUrls[activeIndex]} alt={`${title} - ảnh ${activeIndex + 1}`} className="aspect-[3/2] w-full object-contain" />
        {total > 1 && (
          <>
            <button type="button" onClick={() => handleStep(-1)} className="absolute top-1/2 left-3 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 text-slate-700 shadow hover:bg-white" aria-label="Ảnh trước">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => handleStep(1)} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 text-slate-700 shadow hover:bg-white" aria-label="Ảnh sau">
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white">
              {activeIndex + 1}/{total}
            </span>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {imageUrls.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`cursor-pointer overflow-hidden rounded-lg ring-2 transition ${index === activeIndex ? 'ring-blue-600' : 'ring-transparent opacity-70 hover:opacity-100'}`}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <img src={thumbnailUrls[index] ?? url} alt="" className="aspect-[3/2] w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
