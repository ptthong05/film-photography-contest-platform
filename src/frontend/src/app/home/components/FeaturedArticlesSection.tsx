import React from 'react';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';

export interface ArticleItem {
  id: string;
  title: string;
  date: string;
  image: string;
  category?: string;
  readTime?: string;
}

interface FeaturedArticlesSectionProps {
  onSelectArticle?: (article: ArticleItem) => void;
  onViewAll?: () => void;
}

export const FEATURED_ARTICLES: ArticleItem[] = [
  {
    id: '5-meo-chup-phim',
    title: '5 mẹo chụp phim cho người mới bắt đầu',
    date: '10/06/2025',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    category: 'Cơ bản',
    readTime: '5 phút đọc',
  },
  {
    id: 'nhung-cuon-phim-kinh-dien',
    title: 'Những cuộn phim kinh điển nên thử',
    date: '05/06/2025',
    image: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=800&q=80',
    category: 'Film Stock',
    readTime: '8 phút đọc',
  },
  {
    id: 'ky-thuat-scan-phim',
    title: 'Kỹ thuật scan phim cho chất lượng tốt',
    date: '28/05/2025',
    image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=800&q=80',
    category: 'Hậu kỳ & Scan',
    readTime: '6 phút đọc',
  },
  {
    id: 'cau-chuyen-nhiep-anh-phim',
    title: 'Câu chuyện về nhiếp ảnh phim',
    date: '20/05/2025',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    category: 'Cảm hứng',
    readTime: '10 phút đọc',
  },
];

export function FeaturedArticlesSection({
  onSelectArticle,
  onViewAll,
}: FeaturedArticlesSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Bài viết nổi bật
            </h2>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of 4 Article Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURED_ARTICLES.map((article) => (
          <article
            key={article.id}
            onClick={() => onSelectArticle?.(article)}
            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{article.date}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                <span className="font-medium text-slate-500">{article.category}</span>
                <span className="text-blue-600 font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Đọc tiếp →
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
