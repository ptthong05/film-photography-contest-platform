import type { ContestItem } from '../LiveContestsSection';

export interface TimelineMilestone {
  title: string;
  date: string;
  description?: string;
  completed?: boolean;
}

export interface PrizeItem {
  rank: string;
  name: string;
  reward: string;
  quantity?: string;
  icon?: string;
}

export interface ContestDetailData extends ContestItem {
  organizer?: {
    name: string;
    avatar: string;
    role: string;
  };
  judges?: {
    name: string;
    avatar: string;
    title: string;
  }[];
  timeline?: TimelineMilestone[];
  rules?: string[];
  prizes?: PrizeItem[];
  faqs?: {
    question: string;
    answer: string;
  }[];
  pastPhotos?: {
    id: string;
    image: string;
    title: string;
    author: string;
  }[];
}

export const DEFAULT_PRIZES_TEMPLATE: PrizeItem[] = [
  { rank: '🥇', name: 'Giải Nhất (1 giải)', reward: '25.000.000 VNĐ + Máy ảnh Leica M6 + Cúp vàng', quantity: '1 giải' },
  { rank: '🥈', name: 'Giải Nhì (2 giải)', reward: '12.000.000 VNĐ + 20 cuộn film Kodak Portra 400', quantity: '2 giải' },
  { rank: '🥉', name: 'Giải Ba (3 giải)', reward: '6.000.000 VNĐ + 10 cuộn film Fujifilm Superia', quantity: '3 giải' },
  { rank: '🏅', name: 'Giải Sáng Tạo (1 giải)', reward: '5.000.000 VNĐ + Bộ kính lọc màu Cokin vintage', quantity: '1 giải' },
  { rank: '🎖️', name: 'Giải Khuyến Khích (5 giải)', reward: '2.000.000 VNĐ + Voucher scan tráng film 1 năm', quantity: '5 giải' },
  { rank: '🏆', name: 'Giải Bình Chọn Yêu Thích (1 giải)', reward: '3.000.000 VNĐ + Bằng chứng nhận kỷ niệm', quantity: '1 giải' },
];

export const ALL_CONTESTS: ContestDetailData[] = [
  {
    id: 'analog-moments-2025',
    title: 'Analog Moments 2025',
    status: 'active',
    statusLabel: 'Đang diễn ra',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    startDate: '01/06/2025',
    endDate: '30/09/2025',
    participantsCount: 342,
    categories: ['Phong cảnh', 'Chân dung', 'Đời sống'],
    description: 'Analog Moments 2025 là cuộc thi nhiếp ảnh phim dành cho những người đam mê nghệ thuật analog, nơi tôn vinh những giá trị thị giác thuần khiết và sự kiên nhẫn trong từng khung hình.\n\nChủ đề: Ghi lại những khoảnh khắc của thời đại nhiếp ảnh phim. Khám phá vẻ đẹp thuần khiết từ các cuộn phim cổ điển, tôn vinh độ hạt grain tự nhiên và câu chuyện cảm xúc mà kỹ thuật số không thể thay thế.',
    prizePool: '50.000.000 VNĐ + Máy ảnh Leica M6',
    timeline: [
      { title: 'Bắt đầu nhận bài', date: '01/06/2025' },
      { title: 'Hạn cuối nhận bài', date: '30/09/2025' },
      { title: 'Chấm điểm', date: '01/10/2025 - 10/10/2025' },
      { title: 'Công bố kết quả', date: '15/10/2025' },
    ],
    rules: [
      'Tác phẩm dự thi bắt buộc phải chụp bằng máy ảnh cơ học sử dụng film 35mm hoặc 120 Medium Format.',
      'Chấp nhận ảnh scan từ file âm bản độ phân giải cao, không can thiệp AI tạo sinh hoặc chỉnh sửa ghép ảnh số.',
      'Mỗi thí sinh được gửi tối đa 5 tác phẩm đơn hoặc 1 bộ ảnh phóng sự (tối đa 8 ảnh).',
      'Thí sinh phải giữ file âm bản gốc (negative) để đối chứng khi có yêu cầu từ Ban Giám Khảo.',
    ],
    prizes: [
      { rank: '🥇', name: 'Giải Nhất', reward: '25.000.000 VNĐ + Máy ảnh Leica M6 + Cúp vàng', quantity: '1 giải' },
      { rank: '🥈', name: 'Giải Nhì', reward: '12.000.000 VNĐ + 20 cuộn film Kodak Portra 400', quantity: '2 giải' },
      { rank: '🥉', name: 'Giải Ba', reward: '6.000.000 VNĐ + 10 cuộn film Fujifilm Superia', quantity: '3 giải' },
      { rank: '🏅', name: 'Giải Sáng Tạo', reward: '5.000.000 VNĐ + Bộ kính lọc ngàm vintage', quantity: '1 giải' },
      { rank: '🎖️', name: 'Giải Khuyến Khích', reward: '2.000.000 VNĐ + Voucher scan tráng 1 năm', quantity: '5 giải' },
      { rank: '🏆', name: 'Giải Bình Chọn Yêu Thích', reward: '3.000.000 VNĐ + Bằng chứng nhận kỷ niệm', quantity: '1 giải' },
    ],
    pastPhotos: [
      {
        id: 'p1',
        title: 'Đêm phố cổ',
        author: 'Hoàng Văn E',
        image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p2',
        title: 'Lối về',
        author: 'Nguyễn Thị F',
        image: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p3',
        title: 'Bóng chiều hoàng hôn',
        author: 'Đỗ Minh G',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p4',
        title: 'Khói lam chiều',
        author: 'Trần Văn H',
        image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'film-and-city',
    title: 'Film & City',
    status: 'active',
    statusLabel: 'Đang diễn ra',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    startDate: '15/08/2025',
    endDate: '30/11/2025',
    participantsCount: 285,
    categories: ['Đường phố', 'Kiến trúc', 'Đời sống'],
    description: 'Nhịp sống đô thị qua lăng kính phim 35mm. Sự giao thoa giữa ánh sáng đường phố và sự hoài niệm của màu phim. Tôn vinh góc nhìn đương đại của các nhiếp ảnh gia trẻ đối với không gian đô thị.',
    prizePool: '35.000.000 VNĐ + 50 cuộn Kodak Tri-X 400',
    timeline: [
      { title: 'Bắt đầu nhận bài', date: '15/08/2025' },
      { title: 'Hạn cuối nhận bài', date: '30/11/2025' },
      { title: 'Chấm điểm', date: '01/12/2025 - 10/12/2025' },
      { title: 'Công bố kết quả', date: '15/12/2025' },
    ],
    rules: [
      'Chụp tại không gian đô thị, đường phố, kiến trúc công cộng.',
      'Sử dụng các dòng máy rangefinder hoặc SLR phim cơ học.',
      'Gửi tối đa 6 tác phẩm.',
    ],
    prizes: [
      { rank: '🥇', name: 'Giải Nhất', reward: '18.000.000 VNĐ + Leica CL film', quantity: '1 giải' },
      { rank: '🥈', name: 'Giải Nhì', reward: '9.000.000 VNĐ + 15 cuộn Tri-X 400', quantity: '2 giải' },
      { rank: '🥉', name: 'Giải Ba', reward: '5.000.000 VNĐ + 8 cuộn Ilford HP5', quantity: '2 giải' },
      { rank: '🏅', name: 'Giải Bắt Trọn Khoảnh Khắc', reward: '3.000.000 VNĐ + Dây đeo máy da bò thủ công', quantity: '1 giải' },
      { rank: '🎖️', name: 'Giải Khuyến Khích', reward: '1.500.000 VNĐ + Voucher scan lab', quantity: '3 giải' },
    ],
    pastPhotos: [
      {
        id: 'p1',
        title: 'Phố lên đèn',
        author: 'Lê Minh',
        image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p2',
        title: 'Tàu điện trên cao',
        author: 'Bảo Anh',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p3',
        title: 'Bước chân vội vã',
        author: 'Quốc Tuấn',
        image: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p4',
        title: 'Góc quán quen',
        author: 'Thu Hằng',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'the-vintage-look',
    title: 'The Vintage Look',
    status: 'upcoming',
    statusLabel: 'Sắp diễn ra',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    startDate: '10/07/2025',
    endDate: '30/09/2025',
    participantsCount: 198,
    categories: ['Chân dung', 'Nghệ thuật', 'Tự do'],
    description: 'Tôn vinh phong cách retro cổ điển thập niên 80s-90s với màu sắc ấm áp, độ hạt grain tự nhiên và cảm xúc chân thật.',
    prizePool: '30.000.000 VNĐ + Lens ngàm M vintage',
    timeline: [
      { title: 'Bắt đầu nhận bài', date: '10/07/2025' },
      { title: 'Hạn cuối nhận bài', date: '30/09/2025' },
      { title: 'Chấm điểm', date: '01/10/2025 - 08/10/2025' },
      { title: 'Công bố kết quả', date: '12/10/2025' },
    ],
    prizes: [
      { rank: '🥇', name: 'Giải Nhất', reward: '15.000.000 VNĐ + Lens 50mm f/1.4 ngàm M', quantity: '1 giải' },
      { rank: '🥈', name: 'Giải Nhì', reward: '8.000.000 VNĐ + 12 cuộn Kodak Gold', quantity: '2 giải' },
      { rank: '🥉', name: 'Giải Ba', reward: '4.000.000 VNĐ + Túi máy ảnh da cao cấp', quantity: '2 giải' },
      { rank: '🏅', name: 'Giải Phong Cách Retro', reward: '2.500.000 VNĐ + Đèn flash vintage', quantity: '1 giải' },
      { rank: '🎖️', name: 'Giải Khuyến Khích', reward: '1.000.000 VNĐ + 5 cuộn film', quantity: '4 giải' },
      { rank: '🏆', name: 'Giải Tác Phẩm Ấn Tượng', reward: '2.000.000 VNĐ + Kỷ niệm chương', quantity: '1 giải' },
    ],
    pastPhotos: [
      {
        id: 'p1',
        title: 'Nàng thơ mùa thu',
        author: 'Ngọc Lan',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p2',
        title: 'Hoài niệm 1990',
        author: 'Thanh Sơn',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p3',
        title: 'Ánh mắt',
        author: 'Hà My',
        image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p4',
        title: 'Chiều bình yên',
        author: 'Văn Huy',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'film-portrait-2025',
    title: 'Film Portrait 2025',
    status: 'active',
    statusLabel: 'Đang diễn ra',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    startDate: '20/07/2025',
    endDate: '20/10/2025',
    participantsCount: 215,
    categories: ['Chân dung', 'Nghệ thuật', 'Ánh sáng'],
    description: 'Khắc hoạ chân dung con người với chiều sâu cảm xúc, độ tương phản mượt mà và dải sắc độ tự nhiên của film âm bản.',
    prizePool: '25.000.000 VNĐ + Body Nikon FM2',
    timeline: [
      { title: 'Bắt đầu nhận bài', date: '20/07/2025' },
      { title: 'Hạn cuối nhận bài', date: '20/10/2025' },
      { title: 'Chấm điểm', date: '21/10/2025 - 28/10/2025' },
      { title: 'Công bố kết quả', date: '01/11/2025' },
    ],
    prizes: [
      { rank: '🥇', name: 'Giải Nhất', reward: '12.000.000 VNĐ + Body Nikon FM2', quantity: '1 giải' },
      { rank: '🥈', name: 'Giải Nhì', reward: '6.000.000 VNĐ + 10 cuộn Kodak Portra 160', quantity: '2 giải' },
      { rank: '🥉', name: 'Giải Ba', reward: '3.500.000 VNĐ + Hộp đựng film chống ẩm', quantity: '2 giải' },
      { rank: '🏅', name: 'Giải Chân Dung Cảm Xúc', reward: '2.000.000 VNĐ + Giấy rọi ảnh Ilford', quantity: '1 giải' },
      { rank: '🎖️', name: 'Giải Khuyến Khích', reward: '1.000.000 VNĐ + Voucher scan', quantity: '4 giải' },
    ],
    pastPhotos: [
      {
        id: 'p1',
        title: 'Nét cười',
        author: 'Mai Anh',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p2',
        title: 'Ánh nắng qua hiên',
        author: 'Hải Đăng',
        image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p3',
        title: 'Cụ già phố cổ',
        author: 'Đức Trọng',
        image: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p4',
        title: 'Em bé vùng cao',
        author: 'Kim Oanh',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'goc-pho-film',
    title: 'Góc Phố Film',
    status: 'active',
    statusLabel: 'Đang diễn ra',
    image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
    startDate: '01/08/2025',
    endDate: '15/11/2025',
    participantsCount: 178,
    categories: ['Đường phố', 'Đời thường', 'Trắng đen'],
    description: 'Tìm kiếm vẻ đẹp trong những lát cắt bình dị thường nhật trên từng con phố thân quen qua tông màu film hoài niệm.',
    prizePool: '20.000.000 VNĐ + Voucher tráng scan 1 năm',
    prizes: [
      { rank: '🥇', name: 'Giải Nhất', reward: '10.000.000 VNĐ + Thẻ tráng scan VIP 1 năm', quantity: '1 giải' },
      { rank: '🥈', name: 'Giải Nhì', reward: '5.000.000 VNĐ + 10 cuộn film B&W', quantity: '2 giải' },
      { rank: '🥉', name: 'Giải Ba', reward: '2.500.000 VNĐ + 5 cuộn film Kodak', quantity: '2 giải' },
      { rank: '🎖️', name: 'Giải Khuyến Khích', reward: '1.000.000 VNĐ + Voucher', quantity: '3 giải' },
      { rank: '🏆', name: 'Giải Bức Ảnh Bình Dị', reward: '1.500.000 VNĐ + Kỷ niệm chương', quantity: '1 giải' },
    ],
  },
];
