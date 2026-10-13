import React, { useState, useMemo } from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import type { ArticleItem } from './data';
import { ALL_ARTICLES_LIST } from './data';
import {
  Search,
  Calendar,
  Clock,
  Eye,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
  TrendingUp,
  Tag,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface AllArticlesPageProps {
  onGoHome: () => void;
  onSelectArticle: (articleId: string) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  onSelectPortal?: (portal: Portal) => void;
}

export function AllArticlesPage({
  onGoHome,
  onSelectArticle,
  onOpenAuth,
  onSelectPortal,
}: AllArticlesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả chủ đề' },
    { id: 'Cơ bản', label: 'Cơ bản nhập môn' },
    { id: 'Film Stock', label: 'Film Stock & Đánh giá' },
    { id: 'Hậu kỳ & Scan', label: 'Hậu kỳ & Scan' },
    { id: 'Cảm hứng', label: 'Cảm hứng & Triết lý' },
    { id: 'Thiết bị', label: 'Thiết bị & Máy ảnh' },
    { id: 'Phòng tối', label: 'Phòng tối Darkroom' },
    { id: 'Kỹ thuật', label: 'Kỹ thuật chụp' },
  ];

  // Filter articles based on category and search query
  const filteredArticles = useMemo(() => {
    return ALL_ARTICLES_LIST.filter((article) => {
      const matchesCategory =
        selectedCategory === 'all' || article.category === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredArticle = ALL_ARTICLES_LIST[0]; // Hero article

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        activeTab="Tin tức"
        onNavigateTab={(tab) => {
          if (tab === 'Trang chủ') onGoHome();
          else if (tab === 'Cuộc thi') onSelectPortal?.('CONTESTS');
          else if (tab === 'Bảng xếp hạng') onSelectPortal?.('LEADERBOARD');
          else if (tab === 'Kho ảnh đạt giải') onSelectPortal?.('WINNING_PHOTOS');
          else if (tab === 'Hướng dẫn') onSelectPortal?.('GUIDE');
        }}
        onGoHome={onGoHome}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
        onSelectPortal={onSelectPortal}
      />

      <main className="flex-1 pb-20">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <button
                onClick={onGoHome}
                className="hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-semibold">Tất cả bài viết & Kiến thức</span>
            </div>

            <div className="text-xs text-slate-500 font-medium hidden sm:block">
              Tổng số <span className="font-bold text-blue-600">{ALL_ARTICLES_LIST.length}</span> bài viết chuyên đề
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50/60 via-white to-[#F8FAFC] py-12 lg:py-16 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Thư viện kiến thức Analog</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                Kiến thức & Câu chuyện Nhiếp ảnh Phim
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Nơi tổng hợp các mẹo chụp thực chiến, kinh nghiệm chọn máy & cuộn phim, kỹ thuật scan và những bài viết truyền cảm hứng từ cộng đồng yêu nhiếp ảnh analog.
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm bài viết theo tiêu đề, phim stock, kỹ thuật..."
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          {/* Spotlight Hero Article (Only if no specific search query) */}
          {selectedCategory === 'all' && searchQuery.trim() === '' && featuredArticle && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-rose-500" />
                <h2 className="text-lg font-bold text-slate-900">Bài viết tâm điểm</h2>
              </div>

              <div
                onClick={() => onSelectArticle(featuredArticle.id)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 cursor-pointer group"
              >
                <div className="lg:col-span-7 relative aspect-16/10 lg:aspect-auto overflow-hidden bg-slate-100">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
                      {featuredArticle.category}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{featuredArticle.date}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{featuredArticle.readTime}</span>
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3 leading-snug">
                      {featuredArticle.title}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={featuredArticle.author.avatar}
                        alt={featuredArticle.author.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        {featuredArticle.author.name}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Đọc tiếp</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedCategory === 'all' && !searchQuery
                ? 'Danh sách bài viết mới nhất'
                : `Kết quả tìm kiếm (${filteredArticles.length} bài viết)`}
            </h2>
          </div>

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => onSelectArticle(article.id)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white/90 backdrop-blur-xs text-blue-700 shadow-2xs">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{article.date}</span>
                        </div>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 flex items-center justify-between text-xs border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>

                      <span className="text-blue-600 font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Đọc tiếp</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Không tìm thấy bài viết phù hợp
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn chủ đề khác.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Xem tất cả bài viết
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
