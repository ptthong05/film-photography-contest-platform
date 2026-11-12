import React, { useState, useEffect } from 'react';
import {
  PenSquare,
  Sparkles,
  Newspaper,
  Calendar,
  Eye,
  Trash2,
  Edit3,
  CheckCircle2,
  ExternalLink,
  Plus,
  ArrowLeft,
  Image as ImageIcon,
  Send,
  BookOpen,
  Tag,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import type { JudgeProfile } from '../../../types/judge';
import {
  getCustomArticles,
  saveCustomArticle,
  deleteCustomArticle,
  type ArticleItem
} from '../../home/components/articles/data';

interface JudgeArticlesViewProps {
  profile: JudgeProfile | null;
  onViewArticleDetail?: (articleId: string) => void;
}

const SAMPLE_COVERS = [
  {
    label: 'Ảnh phố analog (35mm)',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Cuộn phim & Máy cơ',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Phòng tối Darkroom',
    url: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Hạt grain & Chân dung',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
];

const CATEGORIES = [
  'Góc nhìn giám khảo',
  'Kỹ thuật & Thông số',
  'Film Stock & Đánh giá',
  'Cơ bản nhập môn',
  'Phòng tối & Scan',
  'Cảm hứng & Triết lý',
];

export function JudgeArticlesView({ profile, onViewArticleDetail }: JudgeArticlesViewProps) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(SAMPLE_COVERS[0].url);
  const [readTime, setReadTime] = useState('5 phút đọc');
  const [tagsInput, setTagsInput] = useState('Góc nhìn giám khảo, Nhiếp ảnh phim, Kinh nghiệm');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadArticles = () => {
    setArticles(getCustomArticles());
  };

  useEffect(() => {
    loadArticles();
    window.addEventListener('filmcontest:articles-updated', loadArticles);
    window.addEventListener('storage', loadArticles);
    return () => {
      window.removeEventListener('filmcontest:articles-updated', loadArticles);
      window.removeEventListener('storage', loadArticles);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStartNew = () => {
    setEditingId(null);
    setTitle('');
    setCategory(CATEGORIES[0]);
    setExcerpt('');
    setContent('');
    setImageUrl(SAMPLE_COVERS[0].url);
    setReadTime('5 phút đọc');
    setTagsInput('Góc nhìn giám khảo, Nhiếp ảnh phim, Kinh nghiệm');
    setIsComposing(true);
  };

  const handleStartEdit = (article: ArticleItem) => {
    setEditingId(article.id);
    setTitle(article.title);
    setCategory(article.category);
    setExcerpt(article.excerpt);
    setContent(
      article.contentHtml
        ? article.contentHtml.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').trim()
        : article.excerpt
    );
    setImageUrl(article.image);
    setReadTime(article.readTime || '5 phút đọc');
    setTagsInput((article.tags || []).join(', '));
    setIsComposing(true);
  };

  const handleDelete = (id: string, articleTitle: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${articleTitle}" khỏi hệ thống và mục Tin tức trang chủ?`)) {
      deleteCustomArticle(id);
      showToast('Đã xóa bài viết thành công.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }
    if (!excerpt.trim()) {
      alert('Vui lòng nhập tóm tắt ngắn cho bài viết!');
      return;
    }
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung bài viết!');
      return;
    }

    const judgeName = profile?.fullName || 'Trần Thị Bình';
    const judgeAvatar =
      profile?.avatarUrl ||
      (typeof window !== 'undefined' ? localStorage.getItem('judge_avatar') || '' : '') ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

    // Tạo HTML từ content
    const paragraphs = content
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        if (p.startsWith('# ')) {
          return `<h2 class="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]">${p.replace(/^#\s*/, '')}</h2>`;
        }
        if (p.startsWith('## ')) {
          return `<h3 class="text-lg font-bold text-slate-800 mt-4 mb-2 min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]">${p.replace(/^##\s*/, '')}</h3>`;
        }
        return `<p class="mb-4 text-slate-700 leading-relaxed text-base min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word] text-justify whitespace-pre-wrap">${p}</p>`;
      })
      .join('\n');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const dateStr = new Date().toLocaleDateString('vi-VN');
    const articleId = editingId || `art-judge-${Date.now()}`;

    const newArticle: ArticleItem = {
      id: articleId,
      title: title.trim(),
      date: dateStr,
      image: imageUrl,
      category,
      readTime: readTime || '5 phút đọc',
      views: editingId ? (articles.find((a) => a.id === editingId)?.views ?? 125) : 1,
      likes: editingId ? (articles.find((a) => a.id === editingId)?.likes ?? 18) : 1,
      excerpt: excerpt.trim(),
      author: {
        name: `${judgeName} (Giám khảo)`,
        avatar: judgeAvatar,
        role: 'Hội đồng Giám khảo FilmContest',
      },
      tags: tags.length > 0 ? tags : ['Góc nhìn giám khảo', 'Nhiếp ảnh phim'],
      toc: [
        { id: 'tong-quan', title: '1. Góc nhìn chuyên môn & Tổng quan', level: 2 },
        { id: 'phan-tich-chi-tiet', title: '2. Phân tích chi tiết & Kinh nghiệm thực chiến', level: 2 },
        { id: 'loi-khuyen-giam-khao', title: '3. Lời khuyên dành cho các thí sinh', level: 2 },
      ],
      contentHtml: paragraphs,
    };

    saveCustomArticle(newArticle);
    setIsComposing(false);
    showToast(
      editingId
        ? 'Đã cập nhật bài viết thành công!'
        : 'Bài viết đã được xuất bản trực tiếp lên mục Tin tức & Bài viết nổi bật của Trang chủ!'
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500 font-bold text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Xuất bản ra Trang chủ
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {articles.length} bài viết của bạn
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <PenSquare className="w-6 h-6 text-blue-600" />
            Viết bài & Nhận định chuyên môn
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Chia sẻ góc nhìn giám khảo, kinh nghiệm chụp phim và phân tích kỹ thuật. Bài viết của bạn sẽ được hiển thị trực tiếp tại mục <strong>Tin tức</strong> và mục <strong>Bài viết nổi bật</strong> trên trang chủ cho toàn bộ thí sinh và cộng đồng đón đọc.
          </p>
        </div>

        {!isComposing && (
          <button
            type="button"
            onClick={handleStartNew}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Viết bài mới
          </button>
        )}
      </div>

      {/* Mode: Compose or Edit */}
      {isComposing ? (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsComposing(false)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Quay lại"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Chỉnh sửa bài viết' : 'Soạn thảo bài viết mới'}
                </h2>
                <p className="text-xs text-slate-500">
                  Điền nội dung chuyên môn và nhấn xuất bản để đưa lên trang chủ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsComposing(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Xuất bản lên Trang chủ
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Tiêu đề */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tiêu đề bài viết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Bí quyết bắt trọn ánh sáng vàng (Golden Hour) bằng phim Portra 400..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-bold text-base text-slate-900 outline-none"
                />
              </div>

              {/* Tóm tắt ngắn (Excerpt) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tóm tắt ngắn (Sa-pô giới thiệu) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Tóm tắt nội dung chính trong 2-3 câu để thu hút người đọc trên thẻ bài viết..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 outline-none"
                />
              </div>

              {/* Nội dung chi tiết */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nội dung bài viết chi tiết <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Dùng '# Tiêu đề mục' để tạo đề mục lớn
                  </span>
                </div>
                <textarea
                  required
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung bài viết chuyên sâu của bạn ở đây. Chia sẻ kinh nghiệm, nhận định kỹ thuật hoặc câu chuyện tác nghiệp..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 leading-relaxed outline-none font-mono"
                />
              </div>
            </div>

            {/* Right 1 col: Settings & Cover Image */}
            <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" /> Cấu hình xuất bản
              </h3>

              {/* Chuyên mục */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Chuyên mục</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thời gian đọc */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Thời gian đọc ước tính</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="5 phút đọc"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium text-slate-800 outline-none"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Tags chủ đề (phân cách dấu phẩy)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Góc nhìn giám khảo, Phim 35mm, ISO 400"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium text-slate-800 outline-none"
                />
              </div>

              {/* Ảnh bìa */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Ảnh bìa bài viết</label>
                <div className="aspect-16/10 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 relative group">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">Chọn nhanh ảnh mẫu:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SAMPLE_COVERS.map((cov, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(cov.url)}
                        className={`text-left p-1.5 text-[11px] font-medium rounded-lg border transition truncate cursor-pointer ${
                          imageUrl === cov.url
                            ? 'bg-blue-100 text-blue-800 border-blue-400 font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={cov.label}
                      >
                        {cov.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Hoặc tải ảnh từ máy tính:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* Tác giả */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">Tác giả bài viết:</span>
                <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      'GK'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {profile?.fullName || 'Trần Thị Bình'}
                    </p>
                    <p className="text-[10px] text-blue-600 font-semibold truncate">Hội đồng Giám khảo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* List Mode */
        <div className="space-y-4">
          {articles.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Newspaper className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Bạn chưa xuất bản bài viết chuyên môn nào
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Hãy viết bài chia sẻ kinh nghiệm, phân tích kỹ thuật và nhận định tác phẩm để xuất bản trực tiếp lên mục <strong>Tin tức</strong> của trang chủ!
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartNew}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Bắt đầu viết bài đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                >
                  <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600/90 text-white backdrop-blur-xs shadow-xs">
                      {art.category}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      ● Đã lên trang chủ
                    </span>
                  </div>

                  <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{art.date}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{art.readTime}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(art)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(art.id, art.title)}
                          className="inline-flex items-center gap-1 p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                        Hiển thị tại Home & Tin tức <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
