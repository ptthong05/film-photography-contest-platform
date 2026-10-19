import React, { useState, useEffect } from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import type { ArticleItem } from './data';
import { ARTICLES_DATA, ALL_ARTICLES_LIST } from './data';
import {
  ChevronRight,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Check,
  Bookmark,
  Sparkles,
  Lightbulb,
  Camera,
  Film,
  Compass,
  ListOrdered,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ArticleDetailPageProps {
  articleId?: string;
  onGoHome: () => void;
  onGoArticles: () => void;
  onSelectArticle: (articleId: string) => void;
  onSelectContest?: (contestId: string) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  onSelectPortal?: (portal: Portal) => void;
}

export function ArticleDetailPage({
  articleId = '5-meo-chup-phim',
  onGoHome,
  onGoArticles,
  onSelectArticle,
  onSelectContest,
  onOpenAuth,
  onSelectPortal,
}: ArticleDetailPageProps) {
  const article: ArticleItem = ARTICLES_DATA[articleId] || ARTICLES_DATA['5-meo-chup-phim'];

  const [activeTocId, setActiveTocId] = useState<string>(article.toc[0]?.id || '');
  const [likesCount, setLikesCount] = useState<number>(article.likes);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);

  // Scroll spy & reading progress
  useEffect(() => {
    const handleScroll = () => {
      // Progress calculation
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // TOC active section detection
      const tocElements = article.toc.map((item) => ({
        id: item.id,
        el: document.getElementById(item.id),
      }));

      for (let i = tocElements.length - 1; i >= 0; i--) {
        const item = tocElements[i];
        if (item.el) {
          const rect = item.el.getBoundingClientRect();
          if (rect.top <= 160) {
            setActiveTocId(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  // Scroll to section smoothly
  const scrollToSection = (id: string) => {
    setActiveTocId(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileTocOpen(false);
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find previous and next articles
  const currentIndex = ALL_ARTICLES_LIST.findIndex((a) => a.id === article.id);
  const prevArticle = currentIndex > 0 ? ALL_ARTICLES_LIST[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < ALL_ARTICLES_LIST.length - 1 ? ALL_ARTICLES_LIST[currentIndex + 1] : null;

  // Related articles (different from current)
  const relatedArticles = ALL_ARTICLES_LIST.filter((a) => a.id !== article.id).slice(0, 3);

  // Font size modifier classes
  const contentFontSizeClass =
    fontSize === 'xlarge'
      ? 'text-lg sm:text-xl leading-relaxed sm:leading-loose'
      : fontSize === 'large'
      ? 'text-base sm:text-lg leading-relaxed'
      : 'text-[15px] sm:text-base leading-relaxed';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sticky Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Navigation Header */}
      <Navbar
        activeTab="Tin tức"
        onNavigateTab={(tab) => {
          if (tab === 'Trang chủ') onGoHome();
          else if (tab === 'Cuộc thi') onSelectPortal?.('CONTESTS');
          else if (tab === 'Bảng xếp hạng') onSelectPortal?.('LEADERBOARD');
          else if (tab === 'Kho ảnh đạt giải') onSelectPortal?.('WINNING_PHOTOS');
          else if (tab === 'Hướng dẫn') onSelectPortal?.('GUIDE');
          else if (tab === 'Tin tức') onGoArticles();
        }}
        onGoHome={onGoHome}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
        onSelectPortal={onSelectPortal}
      />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
              <button
                onClick={onGoHome}
                className="hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <button
                onClick={onGoArticles}
                className="hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                Bài viết & Kiến thức
              </button>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-md">
                {article.title}
              </span>
            </div>

            <button
              onClick={onGoArticles}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Tất cả bài viết</span>
              <span className="sm:hidden">Trở lại</span>
            </button>
          </div>
        </div>

        {/* Mobile Sticky / Collapsible TOC Button */}
        <div className="lg:hidden sticky top-[57px] z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-2.5 shadow-xs">
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="w-full flex items-center justify-between py-1.5 px-3 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              <span>Mục lục bài viết ({article.toc.length} mục)</span>
            </div>
            {mobileTocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {mobileTocOpen && (
            <div className="mt-2 py-2 px-1 bg-white rounded-lg border border-slate-200 shadow-lg max-h-60 overflow-y-auto space-y-1">
              {article.toc.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left text-xs py-1.5 px-3 rounded-md transition-colors ${
                    activeTocId === item.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Layout Grid (Article Body + Sticky Sidebar TOC) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 lg:mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* MAIN ARTICLE BODY (8 Columns) */}
            <article className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-xs">
              {/* Category badge & Read time */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  {article.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.readTime}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.date}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.views.toLocaleString()} lượt xem</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-snug mb-5">
                {article.title}
              </h1>

              {/* Excerpt / Lead */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-8 border-l-4 border-blue-600 pl-4 bg-blue-50/30 py-2 rounded-r-lg">
                {article.excerpt}
              </p>

              {/* Author bar & Article tools */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 pb-8 border-t border-slate-100">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {article.author.name}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        Tác giả
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{article.author.role}</p>
                  </div>
                </div>

                {/* Utility actions: Font size, Like, Share, Bookmark */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  {/* Font size toggle */}
                  <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => setFontSize('normal')}
                      title="Cỡ chữ vừa"
                      className={`px-2 py-1 rounded transition-colors ${
                        fontSize === 'normal'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      title="Cỡ chữ lớn"
                      className={`px-2 py-1 rounded text-sm transition-colors ${
                        fontSize === 'large'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setFontSize('xlarge')}
                      title="Cỡ chữ rất lớn"
                      className={`px-2 py-1 rounded text-base transition-colors ${
                        fontSize === 'xlarge'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      A++
                    </button>
                  </div>

                  {/* Bookmark */}
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    title="Lưu bài viết"
                    className={`p-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>

                  {/* Like */}
                  <button
                    onClick={handleToggleLike}
                    title="Thả tim bài viết"
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      isLiked
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`}
                    />
                    <span>{likesCount}</span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={handleShare}
                    title="Chia sẻ bài viết"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Đã chép link</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">Chia sẻ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Featured Main Image */}
              <figure className="mb-10 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                />
                <figcaption className="p-3 text-xs text-slate-500 italic text-center bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  Hình ảnh minh họa: Nhiếp ảnh analog qua ống kính film 35mm
                </figcaption>
              </figure>

              {/* In-article Table of Contents Box (Box Mục lục đầu bài báo) */}
              <div className="mb-10 p-5 sm:p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-blue-100/80">
                <div className="flex items-center gap-2 mb-3.5 text-slate-900 font-bold text-sm sm:text-base">
                  <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </div>
                  <span>Mục lục nội dung bài viết</span>
                </div>
                <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  {article.toc.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-left py-1 px-2 rounded text-slate-700 hover:text-blue-600 hover:bg-white transition-all flex items-start gap-2 group cursor-pointer"
                    >
                      <span className="w-4 text-blue-500 font-bold shrink-0">{idx + 1}.</span>
                      <span className="group-hover:underline underline-offset-2">
                        {item.title.replace(/^\d+\.\s*/, '')}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Editorial Structured Sections */}
              <div className={`space-y-10 text-slate-700 ${contentFontSizeClass}`}>
                {/* Section 1 */}
                <section id={article.toc[0]?.id || 'sec-1'} className="scroll-mt-28">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="text-blue-600 font-black">#1</span>
                    <span>{article.toc[0]?.title || 'Khởi đầu'}</span>
                  </h2>
                  <p className="mb-4">
                    Nhiếp ảnh phim không đơn thuần là một thú vui hoài niệm (nostalgia), mà là bài học sâu sắc về sự kiên nhẫn và khả năng quan sát thực cảnh. Khác với máy ảnh kỹ thuật số nơi bạn có thể bấm 1.000 tấm liên tục và xem kết quả ngay trên màn hình LCD, mỗi cuộn phim chỉ có vỏn vẹn từ 24 đến 36 kiểu chụp.
                  </p>
                  <p className="mb-4">
                    Mỗi lần lên cò và nhấn nút trập, bạn đang đánh đổi một chi phí hữu hình và một khoảnh khắc duy nhất không thể lặp lại. Việc nắm vững độ nhạy sáng (ISO/ASA) của cuộn phim là viên gạch đầu tiên. Một cuộn phim ISO 100 hoặc 200 sẽ đòi hỏi nguồn ánh sáng ban ngày rực rỡ, mang lại hạt phim (grain) mịn màng và độ tương phản trong trẻo. Ngược lại, ISO 400 hoặc 800 cho phép bạn tác nghiệp trong bóng râm, buổi chiều hoàng hôn hoặc trong nhà.
                  </p>

                  {/* Pro Tip Callout */}
                  <div className="my-6 p-4.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-amber-900 text-sm flex gap-3.5">
                    <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-amber-900 block mb-1">
                        Mẹo chuyên gia (Pro Tip):
                      </strong>
                      Trên máy phim, bạn không thể thay đổi ISO sau mỗi tấm chụp như máy số. Một khi đã lắp cuộn phim ISO 200 vào máy, bạn phải chụp hết 36 kiểu ở mức nhạy sáng đó (trừ khi thực hiện kỹ thuật Push/Pull khi tráng).
                    </div>
                  </div>
                </section>

                {/* Section 2 */}
                <section id={article.toc[1]?.id || 'sec-2'} className="scroll-mt-28">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="text-blue-600 font-black">#2</span>
                    <span>{article.toc[1]?.title || 'Nguyên tắc phơi sáng'}</span>
                  </h2>
                  <p className="mb-4">
                    Một trong những khác biệt lớn nhất giữa cảm biến số (Digital Sensor) và nhũ tương bạc trên phim (Film Emulsion) là cách chúng phản ứng với hiện tượng sai sáng (exposure latitude).
                  </p>
                  <p className="mb-4">
                    Ở cảm biến số, nếu vùng sáng bị cháy (blown highlights), dữ liệu vùng đó bị mất vĩnh viễn (clipping thành màu trắng tinh 255,255,255). Do đó người chụp số thường có xu hướng bảo vệ vùng sáng (expose for the highlights). Tuy nhiên, với phim âm bản màu (Color Negative Film), đặc tính lại hoàn toàn ngược lại: <strong>Phim chịu thừa sáng cực kỳ xuất sắc nhưng rất sợ thiếu sáng (underexposure).</strong>
                  </p>

                  {/* Pull Quote */}
                  <blockquote className="my-6 pl-5 py-2 border-l-4 border-blue-600 bg-slate-50 italic text-slate-800 font-serif text-lg sm:text-xl rounded-r-lg">
                    “Hãy luôn đo sáng vào vùng tối (shadows) và để vùng sáng tự do tỏa sáng. Cuộn phim màu sẽ giữ lại từng lớp mây trời mà không hề bị cháy gắt như cảm biến số.”
                  </blockquote>

                  <p className="mb-4">
                    Nếu bạn chụp thiếu sáng, vùng tối sẽ trở nên đục ngầu, hạt grain vỡ hạt thô nhám và xuất hiện hiện tượng đổ màu xanh lá cây hoặc bùn xám rất khó cứu trong khâu scan. Do đó, quy tắc vàng của dân chơi ảnh phim là: <em>Thà cộng thêm từ +1 đến +2 stop sáng còn hơn để thiếu sáng nửa stop.</em>
                  </p>
                </section>

                {/* Section 3 */}
                <section id={article.toc[2]?.id || 'sec-3'} className="scroll-mt-28">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="text-blue-600 font-black">#3</span>
                    <span>{article.toc[2]?.title || 'Kỹ thuật lấy nét'}</span>
                  </h2>
                  <p className="mb-4">
                    Hầu hết máy ảnh phim kinh điển (như Canon AE-1, Olympus OM-1, Nikon FM2 hay Leica M) đều sử dụng cơ chế lấy nét thủ công (Manual Focus). Trên kính ngắm (viewfinder), bạn sẽ thường bắt gặp hai cơ chế chính:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-700">
                    <li>
                      <strong>Vòng chia đôi nét cắt (Split-image):</strong> Hình ảnh tại trung tâm bị cắt làm đôi theo chiều ngang hoặc chéo. Bạn xoay vòng lấy nét cho đến khi hai nửa trùng khít hoàn hảo.
                    </li>
                    <li>
                      <strong>Vòng vi lăng kính (Microprism):</strong> Vùng lấy nét sẽ bị vỡ hạt li ti khi out nét và trở nên trong veo sắc sảo khi đúng nét.
                    </li>
                    <li>
                      <strong>Kỹ thuật Zone Focusing (Lấy nét theo vùng):</strong> Khép khẩu f/8 hoặc f/11 và sử dụng thước đo khoảng cách (DoF scale) trên thân ống kính. Bạn có thể chụp đường phố chớp nhoáng mà không cần đưa máy lên mắt ngắm!
                    </li>
                  </ul>

                  <figure className="my-6 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=1000&q=80"
                      alt="Thao tác lấy nét máy phim"
                      className="w-full h-64 object-cover"
                    />
                    <figcaption className="p-2.5 text-xs text-slate-500 bg-slate-50 text-center italic">
                      Thao tác xoay vòng lấy nét kim loại trên ống kính cơ học mang lại xúc giác thỏa mãn
                    </figcaption>
                  </figure>
                </section>

                {/* Section 4 */}
                <section id={article.toc[3]?.id || 'sec-4'} className="scroll-mt-28">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="text-blue-600 font-black">#4</span>
                    <span>{article.toc[3]?.title || 'Bảo quản phim'}</span>
                  </h2>
                  <p className="mb-4">
                    Nhũ tương phim được cấu tạo từ các hợp chất muối bạc nhạy sáng và gelatin hữu cơ. Khí hậu nóng ẩm nhiệt đới tại Việt Nam là kẻ thù số một của phim chưa chụp lẫn phim đã chụp nhưng chưa tráng.
                  </p>
                  <p className="mb-4">
                    Nhiệt độ cao làm đẩy nhanh phản ứng thoái hóa hóa chất, dẫn đến hiện tượng tụt ISO (phim bị ám tối), mất cân bằng màu sắc (color shift) và tăng nhiễu hạt.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-2">
                        <span className="text-blue-600">❄️</span> Trước khi chụp
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Lưu trữ phim trong ngăn mát tủ lạnh (dưới 15°C) hoặc ngăn đá nếu bảo quản dài năm. Nhớ bỏ ra ngoài trước khi chụp 1-2 tiếng để tránh ngưng tụ hơi nước trên bề mặt phim.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-2">
                        <span className="text-emerald-600">🧪</span> Sau khi chụp
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Gửi phim tới Lab tráng sớm nhất có thể (lý tưởng trong vòng 1-2 tuần). Hình ảnh ẩn (latent image) trên phim đã phơi sáng sẽ suy giảm dần theo thời gian nếu để lâu ngoài môi trường.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 5 & Conclusion */}
                <section id={article.toc[4]?.id || 'sec-5'} className="scroll-mt-28">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2.5">
                    <span className="text-blue-600 font-black">#5</span>
                    <span>{article.toc[4]?.title || 'Thói quen ghi chép'}</span>
                  </h2>
                  <p className="mb-4">
                    Vì không có dữ liệu EXIF tự động ghi lại khẩu độ, tốc độ màn trập hay loại lens như máy kỹ thuật số, rất nhiều bạn mới chơi chụp xong vài tuần sau khi nhận file scan thì quên sạch mình đã chụp với thông số nào.
                  </p>
                  <p className="mb-4">
                    Hãy trang bị cho mình một cuốn sổ tay nhỏ bỏ túi hoặc ứng dụng ghi chú trên điện thoại. Ghi lại: <em>Loại phim - Cuộn số mấy - Tên ống kính - Khẩu độ/tốc độ của những tấm đặc biệt</em>. Khi nhận file scan về so sánh, bạn sẽ rút ra được bài học tiến bộ thần tốc chỉ sau 3 đến 5 cuộn phim đầu tay!
                  </p>
                </section>

                {/* Final Conclusion */}
                {article.toc[5] && (
                  <section id={article.toc[5].id} className="scroll-mt-28 pt-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2.5">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                      <span>{article.toc[5].title}</span>
                    </h2>
                    <p className="mb-4">
                      Hãy đừng ngại ngùng những bức ảnh đầu tiên bị out nét hay cháy sáng. Đó là học phí xứng đáng để bạn cảm nhận được linh hồn của từng hạt muối bạc. Hãy cầm máy lên, bước ra phố và ghi lại những khoảnh khắc đời thường chân thật nhất.
                    </p>
                  </section>
                )}
              </div>

              {/* Tags List */}
              <div className="mt-10 pt-6 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 mr-1">Chủ đề:</span>
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interaction Bar at bottom of post */}
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleLike}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer ${
                      isLiked
                        ? 'bg-rose-500 text-white shadow-rose-200'
                        : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{isLiked ? 'Đã yêu thích' : 'Thích bài viết'}</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-black/10">
                      {likesCount}
                    </span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span>Chia sẻ</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Cập nhật lần cuối: {article.date} • Bản quyền © FilmContest
                </div>
              </div>

              {/* Author Card Box */}
              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-sm shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-base text-slate-900 mb-1">{article.author.name}</h4>
                  <p className="text-xs text-blue-700 font-medium mb-2">{article.author.role}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Đam mê nghiên cứu các dòng phim analog cổ, quang học ống kính vintage và chia sẻ kiến thức cộng đồng nhiếp ảnh phim Việt Nam.
                  </p>
                </div>
              </div>

              {/* Prev / Next Article Navigation */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                {prevArticle ? (
                  <button
                    onClick={() => onSelectArticle(prevArticle.id)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      <span>Bài viết trước</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {prevArticle.title}
                    </span>
                  </button>
                ) : (
                  <div />
                )}

                {nextArticle ? (
                  <button
                    onClick={() => onSelectArticle(nextArticle.id)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-right transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
                      <span>Bài viết tiếp theo</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {nextArticle.title}
                    </span>
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </article>

            {/* STICKY SIDEBAR (4 Columns) */}
            <aside className="lg:col-span-4 space-y-8">
              {/* STICKY TABLE OF CONTENTS (Mục lục báo bám theo màn hình) */}
              <div className="sticky top-20 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Mục lục bài viết</h3>
                    <p className="text-[11px] text-slate-400">Bấm để di chuyển nhanh</p>
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {article.toc.map((item, index) => {
                    const isActive = activeTocId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full text-left py-2 px-3 rounded-lg text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-xs translate-x-1'
                              : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <span
                            className={`w-4 shrink-0 font-bold ${
                              isActive ? 'text-white' : 'text-slate-400'
                            }`}
                          >
                            {index + 1}.
                          </span>
                          <span className="line-clamp-2">
                            {item.title.replace(/^\d+\.\s*/, '')}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Contest Promo Banner inside sidebar */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white mb-2 uppercase tracking-wide">
                        Cuộc thi đang mở
                      </span>
                      <h4 className="font-bold text-sm text-white mb-1 leading-snug">
                        Analog Moments 2025
                      </h4>
                      <p className="text-[11px] text-slate-300 mb-3 line-clamp-2">
                        Tổng giải thưởng 50.000.000 VNĐ dành cho các tác phẩm phim xuất sắc nhất.
                      </p>
                      <button
                        onClick={() => {
                          if (onSelectContest) {
                            onSelectContest('analog-moments-2025');
                          } else {
                            onSelectPortal?.('CONTESTS');
                          }
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Gửi ảnh dự thi ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Articles Widget */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>Bài viết nổi bật khác</span>
                  </h3>
                  <button
                    onClick={onGoArticles}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-4">
                  {relatedArticles.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectArticle(rel.id)}
                      className="flex items-center gap-3.5 group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <img
                          src={rel.image}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold text-blue-600 block mb-0.5">
                          {rel.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                          {rel.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span>{rel.date}</span>
                          <span>•</span>
                          <span>{rel.readTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
