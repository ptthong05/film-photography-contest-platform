import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  Trophy,
  Camera,
  Users,
  BookOpen,
  Calendar,
  ArrowRight,
  Sparkles,
  Tag,
  Clock,
  MapPin,
  Film,
  Flame,
  ChevronRight,
} from 'lucide-react';
import type { Portal } from '../../../../types/portal';
import { ALL_CONTESTS_DATA } from '../contests/page';
import { ALL_PHOTOS_DATA } from '../photosHighlight/data';
import { ALL_AUTHORS_DATA } from '../authors/data';
import { ALL_ARTICLES_LIST } from '../articles/data';
import { EVENTS_PAGE_CONTENT } from '../pages/EventsPage';

interface HeaderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPortal?: (portal: Portal) => void;
}

export type SearchCategory = 'all' | 'contest' | 'photo' | 'author' | 'article' | 'event';

export interface SearchResultItem {
  id: string;
  type: 'contest' | 'photo' | 'author' | 'article' | 'event';
  typeLabel: string;
  title: string;
  subtitle: string;
  meta?: string;
  image?: string;
  badge?: string;
  badgeColor?: string;
  url: string;
}

// Hàm chuẩn hóa chuỗi không dấu để tìm kiếm tiếng Việt dễ dàng hơn
function removeVietnameseTones(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function HeaderSearchModal({
  isOpen,
  onClose,
  onSelectPortal,
}: HeaderSearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setActiveCategory('all');
    }
  }, [isOpen]);

  // Aggregate all searchable items
  const allSearchItems = useMemo<SearchResultItem[]>(() => {
    const list: SearchResultItem[] = [];

    // 1. Cuộc thi (Contests)
    ALL_CONTESTS_DATA.forEach((c) => {
      list.push({
        id: `contest-${c.id}`,
        type: 'contest',
        typeLabel: 'Cuộc thi',
        title: c.title,
        subtitle: c.description || '',
        meta: `Giải thưởng: ${c.prizePool || 'Hấp dẫn'} • ${c.participantsCount} người tham gia`,
        image: c.image,
        badge: c.statusLabel || (c.status === 'active' ? 'Đang diễn ra' : 'Sắp diễn ra'),
        badgeColor: c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800',
        url: `#/contest/${c.id}`,
      });
    });

    // 2. Tác phẩm đạt giải (Photos)
    Object.values(ALL_PHOTOS_DATA).forEach((p) => {
      list.push({
        id: `photo-${p.id}`,
        type: 'photo',
        typeLabel: 'Tác phẩm',
        title: p.title,
        subtitle: `Tác giả: ${p.author} • ${p.camera || 'Máy phim'} (${p.filmStock || 'Analog Film'})`,
        meta: `${p.award || 'Tác phẩm tiêu biểu'} • ${p.location || 'Việt Nam'}`,
        image: p.image,
        badge: p.award ? p.award.split(' - ')[0] : 'Ảnh phim',
        badgeColor: 'bg-amber-100 text-amber-800',
        url: `#/photo/${p.id}`,
      });
    });

    // 3. Nhiếp ảnh gia / Tác giả (Authors)
    Object.values(ALL_AUTHORS_DATA).forEach((a) => {
      list.push({
        id: `author-${a.id}`,
        type: 'author',
        typeLabel: 'Nhiếp ảnh gia',
        title: a.name,
        subtitle: a.bio || a.headline || `${a.photosCount} tác phẩm • ${a.awardsCount} giải thưởng`,
        meta: `${a.location || 'Việt Nam'} • Thiết bị chính: ${a.favoriteGear?.join(', ') || 'Máy ảnh cơ'}`,
        image: a.avatar,
        badge: 'Tác giả',
        badgeColor: 'bg-indigo-100 text-indigo-800',
        url: `#/author/${encodeURIComponent(a.name)}`,
      });
    });

    // 4. Bài viết & Cẩm nang (Articles)
    ALL_ARTICLES_LIST.forEach((art) => {
      list.push({
        id: `article-${art.id}`,
        type: 'article',
        typeLabel: 'Cẩm nang',
        title: art.title,
        subtitle: art.excerpt,
        meta: `${art.category} • ${art.readTime} • Ngày đăng: ${art.date}`,
        image: art.image,
        badge: art.category,
        badgeColor: 'bg-purple-100 text-purple-800',
        url: `#/article/${art.id}`,
      });
    });

    // 5. Sự kiện & Workshop (Events)
    EVENTS_PAGE_CONTENT.events.forEach((ev) => {
      list.push({
        id: `event-${ev.id}`,
        type: 'event',
        typeLabel: 'Sự kiện',
        title: ev.title,
        subtitle: `${ev.date} (${ev.time}) tại ${ev.location}`,
        meta: `${ev.address} • Phí: ${ev.fee}`,
        image: ev.thumbnail,
        badge: ev.category,
        badgeColor: 'bg-rose-100 text-rose-800',
        url: `#/events`,
      });
    });

    return list;
  }, []);

  // Filtered search results
  const filteredResults = useMemo(() => {
    const rawQ = query.trim();
    if (!rawQ) return [];

    const normQ = removeVietnameseTones(rawQ);
    const keywords = normQ.split(/\s+/).filter(Boolean);

    return allSearchItems.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.type !== activeCategory) {
        return false;
      }

      // Keyword match across fields
      const combinedText = removeVietnameseTones(
        `${item.title} ${item.subtitle} ${item.meta || ''} ${item.typeLabel}`
      );

      return keywords.every((kw) => combinedText.includes(kw));
    });
  }, [allSearchItems, query, activeCategory]);

  // Handle keyboard navigation inside search list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredResults.length - 1
        );
      } else if (e.key === 'Enter') {
        if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
          e.preventDefault();
          handleNavigate(filteredResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex]);

  const handleNavigate = (item: SearchResultItem) => {
    onClose();
    // Update hash URL to trigger page routing
    window.location.hash = item.url;
  };

  const handleQuickShortcut = (hashUrl: string) => {
    onClose();
    window.location.hash = hashUrl;
  };

  const getCategoryIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'contest':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'photo':
        return <Camera className="w-4 h-4 text-blue-500" />;
      case 'author':
        return <Users className="w-4 h-4 text-emerald-500" />;
      case 'article':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-rose-500" />;
    }
  };

  const popularSearches = [
    'Analog Moments 2025',
    'Kodak Portra 400',
    'Hoàng Văn E',
    'Tráng phim đen trắng',
    'Leica M6',
    'Hanoi Photowalk',
    'Tone màu ấm',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Search Modal Box */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[82vh]">
        {/* Search Header Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 bg-white">
          <Search className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm cuộc thi, ảnh phim, tác giả, cẩm nang, sự kiện..."
            className="flex-1 text-sm sm:text-base outline-none text-slate-900 placeholder-slate-400 font-medium"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer mr-2"
              title="Xóa nội dung"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200">
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-100 border border-slate-200">
              ESC
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer sm:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto text-xs no-scrollbar">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'contest', label: 'Cuộc thi' },
            { id: 'photo', label: 'Tác phẩm' },
            { id: 'author', label: 'Nhiếp ảnh gia' },
            { id: 'article', label: 'Cẩm nang' },
            { id: 'event', label: 'Sự kiện' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as SearchCategory);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results / Default State List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-1">
          {query.trim() === '' ? (
            /* TRẠNG THÁI CHƯA NHẬP TỪ KHÓA: Hiển thị gợi ý & lối tắt */
            <div className="py-4 px-2 space-y-6">
              {/* Popular keywords */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tìm kiếm phổ biến trong cộng đồng</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-medium border border-slate-200/80 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="w-3 h-3 text-slate-400" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Jump Shortcuts */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Lối tắt truy cập nhanh</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      label: 'Cuộc thi đang diễn ra',
                      desc: 'Các mùa thi ảnh phim sôi động nhất',
                      icon: Trophy,
                      color: 'text-amber-500 bg-amber-50',
                      url: '#/contests',
                    },
                    {
                      label: 'Kho ảnh đạt giải',
                      desc: 'Bộ sưu tập tác phẩm thắng giải cao nhất',
                      icon: Camera,
                      color: 'text-blue-500 bg-blue-50',
                      url: '#/winning-photos',
                    },
                    {
                      label: 'Bảng xếp hạng nhiếp ảnh gia',
                      desc: 'Vinh danh tác giả tiêu biểu theo tháng & năm',
                      icon: Users,
                      color: 'text-emerald-500 bg-emerald-50',
                      url: '#/leaderboard',
                    },
                    {
                      label: 'Cẩm nang & Mẹo chụp phim',
                      desc: 'Kiến thức đo sáng, chọn film và tráng rọi',
                      icon: BookOpen,
                      color: 'text-purple-500 bg-purple-50',
                      url: '#/articles',
                    },
                    {
                      label: 'Sự kiện & Photowalk',
                      desc: 'Workshop phòng tối và dạo phố chụp ảnh',
                      icon: Calendar,
                      color: 'text-rose-500 bg-rose-50',
                      url: '#/events',
                    },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleQuickShortcut(s.url)}
                      className="p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-left flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center shrink-0`}>
                        <s.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {s.label}
                        </h5>
                        <p className="text-[11px] text-slate-500 truncate">{s.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            /* TRƯỜNG HỢP KHÔNG TÌM THẤY KẾT QUẢ */
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                Không tìm thấy kết quả nào cho "{query}"
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Thử tìm theo tên dòng máy (Leica, Canon, Olympus), loại film (Kodak, Fuji, Ilford), tên tác giả hoặc các cuộc thi đang mở.
              </p>
            </div>
          ) : (
            /* DANH SÁCH KẾT QUẢ TÌM KIẾM */
            <div className="space-y-1 py-1">
              <div className="px-2 pb-1 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Tìm thấy {filteredResults.length} kết quả</span>
                <span className="hidden sm:inline">Dùng phím ↑ ↓ để chọn, Enter để mở</span>
              </div>
              {filteredResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border border-blue-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {/* Thumbnail or Icon */}
                    {item.image ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                        {getCategoryIcon(item.type)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 uppercase tracking-wider">
                          {item.typeLabel}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              item.badgeColor || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {item.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 truncate leading-snug">
                        {item.subtitle}
                      </p>

                      {item.meta && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.meta}
                        </p>
                      )}
                    </div>

                    {/* Arrow hint */}
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected
                          ? 'text-blue-600 translate-x-1'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">Enter</kbd>
              chọn
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">↓</kbd>
              di chuyển
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">Esc</kbd>
              đóng
            </span>
          </div>
          <span className="font-medium text-slate-600">
            FilmContest Search
          </span>
        </div>
      </div>
    </div>
  );
}
