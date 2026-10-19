export interface AuthorAward {
  id: string;
  title: string;
  contestId: string;
  contestName: string;
  year: string;
  rank: string;
  rankIcon: string;
  photoTitle: string;
  photoImage: string;
  prizeReward: string;
}

export interface AuthorContest {
  id: string;
  title: string;
  year: string;
  status: 'Đã hoàn thành' | 'Đang diễn ra' | 'Đạt giải';
  role: string;
  awardReceived?: string;
  entryCount: number;
}

export interface AuthorWork {
  id: string;
  title: string;
  image: string;
  contestName: string;
  award?: string;
  camera: string;
  filmStock: string;
  likes: number;
}

export interface AuthorProfile {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  headline: string;
  bio: string;
  location: string;
  joinedYear: string;
  favoriteGear: string[];
  favoriteFilms: string[];
  awardsCount: number;
  contestsCount: number;
  photosCount: number;
  totalLikes: number;
  awards: AuthorAward[];
  contests: AuthorContest[];
  works: AuthorWork[];
}

export const ALL_AUTHORS_DATA: Record<string, AuthorProfile> = {
  'Hoàng Văn E': {
    id: 'hoang-van-e',
    name: 'Hoàng Văn E',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
    headline: 'Nhiếp ảnh gia phim tài liệu đường phố & Đô thị đêm',
    bio: 'Bắt đầu bấm máy với chiếc máy ảnh cơ cơ học đầu tiên từ năm 2018. Niềm đam mê lớn nhất là ghi lại khoảnh khắc tĩnh lặng của những con phố Hà Nội và Sài Gòn dưới ánh đèn vàng mờ ảo qua chất màu đen trắng của phim Tri-X 400.',
    location: 'Hà Nội, Việt Nam',
    joinedYear: '2020',
    favoriteGear: ['Leica M6 Classic', 'Summicron 35mm f/2', 'Nikon FM2'],
    favoriteFilms: ['Kodak Tri-X 400', 'Ilford HP5 Plus', 'Kodak Portra 400'],
    awardsCount: 4,
    contestsCount: 6,
    photosCount: 28,
    totalLikes: 3420,
    awards: [
      {
        id: 'aw-1',
        title: 'Giải Nhất - Hạng mục Đường phố',
        contestId: 'analog-moments-2025',
        contestName: 'Analog Moments 2024',
        year: '2024',
        rank: 'Giải Nhất',
        rankIcon: '🥇',
        photoTitle: 'Phố lên đèn',
        photoImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
        prizeReward: '15.000.000 VNĐ + Body Leica CL + 10 Cuộn Tri-X 400',
      },
      {
        id: 'aw-2',
        title: 'Giải Ba - Nhiếp ảnh đen trắng',
        contestId: 'bw-film-masters',
        contestName: 'Monochrome Film Spirit 2023',
        year: '2023',
        rank: 'Giải Ba',
        rankIcon: '🥉',
        photoTitle: 'Gánh hàng hoa sớm',
        photoImage: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=600&q=80',
        prizeReward: '5.000.000 VNĐ + Voucher Lab tráng phim 1 năm',
      },
      {
        id: 'aw-3',
        title: 'Giải Khán giả yêu thích nhất',
        contestId: 'film-and-city',
        contestName: 'Film & City Exhibition 2023',
        year: '2023',
        rank: 'Giải Bình chọn',
        rankIcon: '🌟',
        photoTitle: 'Hoàng hôn cầu Long Biên',
        photoImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        prizeReward: '3.000.000 VNĐ + Kỷ niệm chương Pha Lê',
      },
    ],
    contests: [
      {
        id: 'analog-moments-2025',
        title: 'Analog Moments 2025 - Sắc Màu Hoài Niệm',
        year: '2025',
        status: 'Đang diễn ra',
        role: 'Thí sinh tham gia',
        entryCount: 2,
      },
      {
        id: 'analog-moments-2024',
        title: 'Analog Moments 2024 - Khoảnh Khắc Bất Tận',
        year: '2024',
        status: 'Đạt giải',
        role: 'Thí sinh đoạt giải',
        awardReceived: 'Giải Nhất Hạng mục Đường phố',
        entryCount: 4,
      },
      {
        id: 'monochrome-film-2023',
        title: 'Monochrome Film Spirit 2023',
        year: '2023',
        status: 'Đạt giải',
        role: 'Thí sinh đoạt giải',
        awardReceived: 'Giải Ba Trắng Đen',
        entryCount: 3,
      },
      {
        id: 'film-and-city',
        title: 'Film & City - Nhịp Sống Đô Thị Phim',
        year: '2023',
        status: 'Đạt giải',
        role: 'Thí sinh đoạt giải',
        awardReceived: 'Giải Bình chọn Khán giả',
        entryCount: 5,
      },
    ],
    works: [
      {
        id: 'p1',
        title: 'Phố lên đèn',
        image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
        contestName: 'Analog Moments 2024',
        award: 'Giải Nhất',
        camera: 'Leica M6 Classic',
        filmStock: 'Kodak Tri-X 400',
        likes: 420,
      },
      {
        id: 'p2',
        title: 'Góc phố cà phê sớm',
        image: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=600&q=80',
        contestName: 'Monochrome Film Spirit',
        award: 'Giải Ba',
        camera: 'Leica M6 Classic',
        filmStock: 'Ilford HP5 Plus',
        likes: 315,
      },
      {
        id: 'p3',
        title: 'Bóng chiều hoàng hôn',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        contestName: 'Film & City Exhibition',
        award: 'Khán giả bình chọn',
        camera: 'Canon AE-1 Program',
        filmStock: 'Kodak Portra 160',
        likes: 280,
      },
      {
        id: 'p4',
        title: 'Hồ Gươm sương sớm',
        image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=600&q=80',
        contestName: 'Analog Moments 2025',
        camera: 'Nikon FM2n',
        filmStock: 'Kodak Ektar 100',
        likes: 210,
      },
    ],
  },
  'Nguyễn Thị F': {
    id: 'nguyen-thi-f',
    name: 'Nguyễn Thị F',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=1600&q=80',
    headline: 'Nhiếp ảnh gia phim đời thường & Phong cảnh cao nguyên',
    bio: 'Yêu những cung đường uốn lượn và dải sương mù cao nguyên Đà Lạt. Tông màu xanh pastel và sắc ấm nhẹ của dòng phim Fuji Pro là người bạn đồng hành trong mọi chuyến đi.',
    location: 'Lâm Đồng, Việt Nam',
    joinedYear: '2021',
    favoriteGear: ['Olympus OM-1n', 'Zuiko 50mm f/1.4'],
    favoriteFilms: ['Fujifilm Pro 400H', 'Kodak Gold 200'],
    awardsCount: 2,
    contestsCount: 4,
    photosCount: 19,
    totalLikes: 2180,
    awards: [
      {
        id: 'aw-21',
        title: 'Giải Nhì - Đời thường & Con người',
        contestId: 'analog-moments-2025',
        contestName: 'Analog Moments 2024',
        year: '2024',
        rank: 'Giải Nhì',
        rankIcon: '🥈',
        photoTitle: 'Lối về',
        photoImage: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=600&q=80',
        prizeReward: '10.000.000 VNĐ + Lens Zuiko 28mm f/2.8',
      },
    ],
    contests: [
      {
        id: 'analog-moments-2025',
        title: 'Analog Moments 2025',
        year: '2025',
        status: 'Đang diễn ra',
        role: 'Thí sinh tham gia',
        entryCount: 3,
      },
      {
        id: 'analog-moments-2024',
        title: 'Analog Moments 2024',
        year: '2024',
        status: 'Đạt giải',
        role: 'Thí sinh đoạt giải',
        awardReceived: 'Giải Nhì Đời thường',
        entryCount: 4,
      },
    ],
    works: [
      {
        id: 'p2',
        title: 'Lối về',
        image: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=600&q=80',
        contestName: 'Analog Moments 2024',
        award: 'Giải Nhì',
        camera: 'Olympus OM-1n',
        filmStock: 'Fujifilm Pro 400H',
        likes: 315,
      },
    ],
  },
  'Đỗ Minh G': {
    id: 'do-minh-g',
    name: 'Đỗ Minh G',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    headline: 'Nhiếp ảnh gia phong cảnh biển & Du lịch dã ngoại',
    bio: 'Chuyên sáng tác các tác phẩm phong cảnh biển đảo Việt Nam bằng phim màu độ bão hòa cao và dải nhạy sáng rộng.',
    location: 'Đà Nẵng, Việt Nam',
    joinedYear: '2019',
    favoriteGear: ['Canon AE-1 Program', 'Canon FD 28mm f/2.8'],
    favoriteFilms: ['Kodak Portra 160', 'Kodak Ektar 100'],
    awardsCount: 3,
    contestsCount: 5,
    photosCount: 22,
    totalLikes: 2890,
    awards: [
      {
        id: 'aw-31',
        title: 'Giải Ba - Phong cảnh Thiên nhiên',
        contestId: 'analog-moments-2025',
        contestName: 'The Vintage Look 2024',
        year: '2024',
        rank: 'Giải Ba',
        rankIcon: '🥉',
        photoTitle: 'Bóng chiều hoàng hôn',
        photoImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        prizeReward: '5.000.000 VNĐ + 5 Cuộn Kodak Portra 160',
      },
    ],
    contests: [
      {
        id: 'the-vintage-look-2024',
        title: 'The Vintage Look 2024',
        year: '2024',
        status: 'Đạt giải',
        role: 'Thí sinh đoạt giải',
        awardReceived: 'Giải Ba Phong cảnh',
        entryCount: 3,
      },
    ],
    works: [
      {
        id: 'p3',
        title: 'Bóng chiều hoàng hôn',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        contestName: 'The Vintage Look 2024',
        award: 'Giải Ba',
        camera: 'Canon AE-1 Program',
        filmStock: 'Kodak Portra 160',
        likes: 280,
      },
    ],
  },
  'Trần Văn H': {
    id: 'tran-van-h',
    name: 'Trần Văn H',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1600&q=80',
    headline: 'Nhiếp ảnh gia tài liệu nông thôn & Di sản văn hóa',
    bio: 'Tìm kiếm vẻ đẹp mộc mạc của các làng quê Bắc Bộ qua ống kính cơ khí cổ điển.',
    location: 'Lạng Sơn, Việt Nam',
    joinedYear: '2022',
    favoriteGear: ['Nikon FM2n', 'Nikkor 50mm f/1.8'],
    favoriteFilms: ['Kodak Ektar 100', 'Fuji C200'],
    awardsCount: 1,
    contestsCount: 3,
    photosCount: 15,
    totalLikes: 1450,
    awards: [
      {
        id: 'aw-41',
        title: 'Giải Khuyến khích - Mùa 2024',
        contestId: 'analog-moments-2025',
        contestName: 'Analog Moments 2024',
        year: '2024',
        rank: 'Khuyến khích',
        rankIcon: '🎖️',
        photoTitle: 'Khói lam chiều',
        photoImage: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=600&q=80',
        prizeReward: '2.000.000 VNĐ + Voucher mua film',
      },
    ],
    contests: [
      {
        id: 'analog-moments-2024',
        title: 'Analog Moments 2024',
        year: '2024',
        status: 'Đạt giải',
        role: 'Thí sinh đoạt giải',
        awardReceived: 'Giải Khuyến khích',
        entryCount: 3,
      },
    ],
    works: [
      {
        id: 'p4',
        title: 'Khói lam chiều',
        image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=600&q=80',
        contestName: 'Analog Moments 2024',
        award: 'Khuyến khích',
        camera: 'Nikon FM2n',
        filmStock: 'Kodak Ektar 100',
        likes: 210,
      },
    ],
  },
  'Nguyễn Văn A': {
    id: 'nguyen-van-a',
    name: 'Nguyễn Văn A',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    headline: 'Nhiếp ảnh gia phim Medium Format & Phong cảnh thiên nhiên',
    bio: 'Đam mê chụp phim dương bản (Slide film) 120 trên hệ máy Hasselblad 500 C/M. Tác phẩm của anh tập trung vào vẻ đẹp kỳ vĩ của thiên nhiên Việt Nam.',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    joinedYear: '2019',
    favoriteGear: ['Hasselblad 500 C/M', 'Carl Zeiss Planar 80mm f/2.8'],
    favoriteFilms: ['Fujifilm Velvia 50', 'Kodak Ektar 100'],
    awardsCount: 5,
    contestsCount: 8,
    photosCount: 36,
    totalLikes: 4620,
    awards: [
      {
        id: 'aw-101',
        title: 'Giải Nhất Toàn Đoàn - Analog Moments 2025',
        contestId: 'analog-moments-2025',
        contestName: 'Analog Moments 2025',
        year: '2025',
        rank: 'Giải Nhất',
        rankIcon: '🥇',
        photoTitle: 'Khoảnh khắc bình minh',
        photoImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        prizeReward: '20.000.000 VNĐ + Kính Carl Zeiss + 20 Cuộn phim 120',
      },
    ],
    contests: [
      {
        id: 'analog-moments-2025',
        title: 'Analog Moments 2025',
        year: '2025',
        status: 'Đạt giải',
        role: 'Quán quân',
        awardReceived: 'Giải Nhất Toàn Đoàn',
        entryCount: 5,
      },
    ],
    works: [
      {
        id: 'p1',
        title: 'Khoảnh khắc bình minh',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        contestName: 'Analog Moments 2025',
        award: 'Giải Nhất',
        camera: 'Hasselblad 500 C/M',
        filmStock: 'Fujifilm Velvia 50',
        likes: 580,
      },
    ],
  },
};
