import React, { useState, useMemo } from 'react';
import type { Portal } from '../../../types/portal';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import type { PhotoDetailItem } from './data';
import { ALL_PHOTOS_DATA } from './data';
import {
  Trophy,
  Award,
  Search,
  ChevronRight,
  ArrowLeft,
  Camera,
  Film,
  Heart,
  Eye,
  Filter,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';

interface WinningPhotosPageProps {
  onGoHome: () => void;
  onGoContests: () => void;
  onSelectPhoto: (photoId: string) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
}

export function WinningPhotosPage({
  onGoHome,
  onGoContests,
  onSelectPhoto,
  onOpenAuth,
}: WinningPhotosPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});

  const handleToggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedPhotos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allPhotos = useMemo(() => Object.values(ALL_PHOTOS_DATA), []);

  const ranks = [
    { id: 'all', label: 'Tất cả giải thưởng' },
    { id: 'first', label: '🥇 Giải Nhất' },
    { id: 'second', label: '🥈 Giải Nhì' },
    { id: 'third', label: '🥉 Giải Ba' },
    { id: 'other', label: '🎖️ Khuyến khích / Bình chọn' },
  ];

  const years = [
    { id: 'all', label: 'Tất cả các mùa' },
    { id: '2025', label: 'Mùa 2025' },
    { id: '2024', label: 'Mùa 2024' },
    { id: '2023', label: 'Mùa 2023' },
  ];

  const categories = [
    { id: 'all', label: 'Tất cả thể loại' },
    { id: 'Đường phố', label: 'Đường phố & Đô thị' },
    { id: 'Phong cảnh', label: 'Phong cảnh' },
    { id: 'Chân dung', label: 'Chân dung' },
    { id: 'Đời thường', label: 'Đời thường' },
    { id: 'Kiến trúc', label: 'Kiến trúc' },
  ];

  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((p) => {
      // Search
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.filmStock.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.camera.toLowerCase().includes(searchQuery.toLowerCase());

      // Rank
      let matchesRank = true;
      if (selectedRank === 'first') matchesRank = p.award?.includes('Giải Nhất') ?? false;
      else if (selectedRank === 'second') matchesRank = p.award?.includes('Giải Nhì') ?? false;
      else if (selectedRank === 'third') matchesRank = p.award?.includes('Giải Ba') ?? false;
      else if (selectedRank === 'other') {
        matchesRank =
          (p.award?.includes('Khuyến khích') || p.award?.includes('Bình chọn')) ?? false;
      }

      // Year
      let matchesYear = true;
      if (selectedYear !== 'all') {
        matchesYear = p.year === selectedYear || (p.award?.includes(selectedYear) ?? false);
      }

      // Category
      let matchesCat = true;
      if (selectedCategory !== 'all') {
        matchesCat = p.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ?? false;
      }

      return matchesSearch && matchesRank && matchesYear && matchesCat;
    });
  }, [allPhotos, searchQuery, selectedRank, selectedYear, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <Navbar
        activeTab="Kho ảnh đạt giải"
        onNavigateTab={(tab) => {
          if (tab === 'Trang chủ') onGoHome();
          else if (tab === 'Cuộc thi') onGoContests();
        }}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <button
              onClick={onGoHome}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Trang chủ
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={onGoContests}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Cuộc thi
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">Tất cả ảnh đạt giải</span>
          </nav>

          <button
            onClick={onGoContests}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Page Hero Header */}
        <div className="relative rounded-3xl bg-slate-950 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute inset-0 bg-radial from-blue-900/40 via-slate-950/80 to-slate-950" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Kho Lưu Trữ Tác Phẩm Đạt Giải Các Mùa</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Tuyển tập tác phẩm nhiếp ảnh phim xuất sắc nhất
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Nơi vinh danh những khung hình tương tự đẹp nhất, vượt qua hàng ngàn tác phẩm dự thi để giành lấy những giải thưởng danh giá qua các mùa giải.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs sm:text-sm text-slate-300 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Tổng cộng {allPhotos.length} tác phẩm đoạt giải
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                3 Mùa giải tổ chức thành công
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                100% Ảnh chụp phim cơ học xác thực AI
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên ảnh, tên tác giả, thân máy, dòng film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2 border-t border-slate-100">
            {/* Rank Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                Giải:
              </span>
              {ranks.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRank(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRank === r.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Year Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                Mùa:
              </span>
              {years.map((y) => (
                <button
                  key={y.id}
                  onClick={() => setSelectedYear(y.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedYear === y.id
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {y.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Danh sách tác phẩm đạt giải ({filteredPhotos.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Bấm vào bất kỳ ảnh nào để xem toàn bộ thông số kỹ thuật & câu chuyện
          </span>
        </div>

        {/* Photos Grid */}
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => onSelectPhoto(photo.id)}
                className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-950">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                    {/* Award Badge Floating */}
                    {photo.award && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-md">
                          <Trophy className="w-3 h-3" />
                          <span>{photo.award}</span>
                        </span>
                      </div>
                    )}

                    {/* Top Right: Year badge & Heart Button */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {photo.year && (
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold">
                          {photo.year}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleToggleLike(e, photo.id)}
                        className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                        title="Yêu thích"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${
                            likedPhotos[photo.id]
                              ? 'fill-rose-500 text-rose-500'
                              : 'text-white hover:text-rose-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Bottom overlay text */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base font-bold leading-tight group-hover:text-blue-300 transition-colors line-clamp-1">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5 flex items-center justify-between">
                        <span>Tác giả: <strong className="text-white font-semibold">{photo.author}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Metadata Details */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 truncate">
                        <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{photo.camera}</span>
                      </span>
                      {photo.category && (
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                          {photo.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-50/70 border border-amber-200/50 px-2.5 py-1 rounded-xl">
                      <span className="flex items-center gap-1.5 truncate font-medium">
                        <Film className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{photo.filmStock}</span>
                      </span>
                    </div>

                    {photo.location && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{photo.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer card */}
                <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/60">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{photo.views}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleToggleLike(e, photo.id)}
                    className="flex items-center gap-1 text-rose-500 font-semibold hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    title="Yêu thích tác phẩm"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${
                        likedPhotos[photo.id]
                          ? 'fill-rose-500 text-rose-500 scale-110'
                          : 'fill-rose-200 text-rose-500'
                      }`}
                    />
                    <span>{photo.likes + (likedPhotos[photo.id] ? 1 : 0)}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy tác phẩm phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Vui lòng thử tìm kiếm bằng từ khóa khác hoặc bỏ các bộ lọc để xem toàn bộ ảnh.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRank('all');
                setSelectedYear('all');
                setSelectedCategory('all');
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
