export interface ArticleAuthor {
  name: string;
  avatar: string;
  role: string;
}

export interface TocItem {
  id: string;
  title: string;
  level?: 2 | 3;
}

export interface ArticleItem {
  id: string;
  title: string;
  date: string;
  image: string;
  category: string;
  readTime: string;
  excerpt: string;
  views: number;
  likes: number;
  author: ArticleAuthor;
  toc: TocItem[];
  contentHtml?: string;
  tags: string[];
}

export const ARTICLES_DATA: Record<string, ArticleItem> = {
  '5-meo-chup-phim': {
    id: '5-meo-chup-phim',
    title: '5 mẹo chụp phim cho người mới bắt đầu',
    date: '10/06/2025',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    category: 'Cơ bản',
    readTime: '5 phút đọc',
    views: 3420,
    likes: 218,
    excerpt: 'Bước chân vào thế giới ảnh phim tương tự như việc học lại cách nhìn ánh sáng. Dưới đây là 5 nguyên tắc cốt lõi giúp bạn không bị hỏng những cuộn phim đầu tay.',
    author: {
      name: 'Nguyễn Minh Quân',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Nhiếp ảnh gia Analog & Giảng viên Workshop',
    },
    tags: ['Cơ bản', 'Mẹo chụp', 'Kỹ thuật ISO', 'Ánh sáng'],
    toc: [
      { id: 'hieu-ve-iso', title: '1. Hiểu đúng về độ nhạy sáng ISO', level: 2 },
      { id: 'nguyen-tac-thua-sang', title: '2. Nguyên tắc "Thà thừa sáng còn hơn thiếu sáng"', level: 2 },
      { id: 'lay-net-can-than', title: '3. Lấy nét thủ công và ước lượng khoảng cách', level: 2 },
      { id: 'bao-quan-phim', title: '4. Cách bảo quản phim trước và sau khi chụp', level: 2 },
      { id: 'ghi-chep-thong-so', title: '5. Thói quen ghi chép thông số từng shot hình', level: 2 },
      { id: 'loi-ket', title: 'Lời kết & Lời khuyên nhập môn', level: 2 },
    ],
  },
  'nhung-cuon-phim-kinh-dien': {
    id: 'nhung-cuon-phim-kinh-dien',
    title: 'Những cuộn phim kinh điển nên thử một lần trong đời',
    date: '05/06/2025',
    image: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?auto=format&fit=crop&w=1200&q=80',
    category: 'Film Stock',
    readTime: '8 phút đọc',
    views: 4890,
    likes: 356,
    excerpt: 'Mỗi loại cuộn phim đều sở hữu một tâm hồn và bảng màu riêng biệt. Từ tông ấm áp của Kodak Gold đến sắc xanh lục thanh nhã của Fujifilm Superia.',
    author: {
      name: 'Trần Hương Ly',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'Curator & Nhiếp ảnh tư liệu',
    },
    tags: ['Film Stock', 'Kodak Portra', 'Fujifilm', 'Ilford HP5', 'Đánh giá phim'],
    toc: [
      { id: 'kodak-gold-200', title: '1. Kodak Gold 200 - Nắng vàng tuổi thơ', level: 2 },
      { id: 'kodak-portra-400', title: '2. Kodak Portra 400 - Đỉnh cao màu da chân dung', level: 2 },
      { id: 'fuji-c200-superia', title: '3. Fujifilm C200 & Superia X-TRA 400', level: 2 },
      { id: 'ilford-hp5-plus', title: '4. Ilford HP5 Plus 400 - Ông hoàng phim đen trắng', level: 2 },
      { id: 'cinestill-800t', title: '5. CineStill 800T - Hào quang điện ảnh về đêm', level: 2 },
      { id: 'bang-so-sanh', title: 'Bảng tổng hợp đặc tính các loại film', level: 2 },
    ],
  },
  'ky-thuat-scan-phim': {
    id: 'ky-thuat-scan-phim',
    title: 'Kỹ thuật scan phim cho chất lượng tốt nhất',
    date: '28/05/2025',
    image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=80',
    category: 'Hậu kỳ & Scan',
    readTime: '6 phút đọc',
    views: 2750,
    likes: 194,
    excerpt: 'Chụp phim đẹp mới chỉ là một nửa chặng đường. Kỹ thuật số hóa cuộn phim từ âm bản sang file số sẽ quyết định độ chi tiết, màu sắc và độ nổi khối.',
    author: {
      name: 'Lê Hoàng Phong',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      role: 'Chuyên gia Lab phim & Kỹ thuật số hóa',
    },
    tags: ['Scan Lab', 'DSLR Scanning', 'Negative Lab Pro', 'Độ phân giải'],
    toc: [
      { id: 'hai-phuong-phap-scan', title: '1. Hai phương pháp scan phổ biến hiện nay', level: 2 },
      { id: 'flatbed-vs-dedicated', title: '2. Máy scan phẳng (Epson) vs Máy scan chuyên dụng (Noritsu/Frontier)', level: 2 },
      { id: 'dslr-scanning-trend', title: '3. Xu hướng DSLR/Mirrorless Scanning độ nét cao', level: 2 },
      { id: 'xuly-bui-va-vet-xuoc', title: '4. Xử lý bụi và vết trầy xước không làm mất nét', level: 2 },
      { id: 'can-chinh-mau-sac', title: '5. Cân chỉnh màu sắc và độ tương phản tự nhiên', level: 2 },
    ],
  },
  'cau-chuyen-nhiep-anh-phim': {
    id: 'cau-chuyen-nhiep-anh-phim',
    title: 'Câu chuyện về nhiếp ảnh phim trong kỷ nguyên số',
    date: '20/05/2025',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    category: 'Cảm hứng',
    readTime: '10 phút đọc',
    views: 5210,
    likes: 412,
    excerpt: 'Tại sao giữa thời đại máy ảnh kỹ thuật số chụp hàng trăm ảnh mỗi giây, người ta lại sẵn sàng chờ đợi hàng tuần lễ để nhận về 36 tấm ảnh phim?',
    author: {
      name: 'Bảo Trâm & Khách mời',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      role: 'Nhà báo nghệ thuật & Nhiếp ảnh gia',
    },
    tags: ['Triết lý', 'Slow Living', 'Nghệ thuật analog', 'Cảm xúc'],
    toc: [
      { id: 'su-cham-lai', title: '1. Sự chậm lại trong thế giới vội vã', level: 2 },
      { id: 'cam-giac-cho-doi', title: '2. Ma thuật từ sự hồi hộp khi chờ tráng phim', level: 2 },
      { id: 'hat-grain-va-khuyet-diem', title: '3. Hạt grain và vẻ đẹp của những khiếm khuyết hoàn hảo', level: 2 },
      { id: 'gia-tri-luu-tru', title: '4. Âm bản – Giá trị vật lý trường tồn với thời gian', level: 2 },
      { id: 'tuong-lai-analog', title: '5. Tương lai của nhiếp ảnh phim tại Việt Nam', level: 2 },
    ],
  },
  'chon-may-anh-film-dau-tien': {
    id: 'chon-may-anh-film-dau-tien',
    title: 'Cẩm nang chọn chiếc máy ảnh phim 35mm đầu tiên',
    date: '15/05/2025',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    category: 'Thiết bị',
    readTime: '7 phút đọc',
    views: 3120,
    likes: 245,
    excerpt: 'SLR cơ học, Rangefinder cổ điển hay Compact Point & Shoot tiện lợi? Hướng dẫn chi tiết giúp bạn chọn đúng bạn đồng hành theo ngân sách và nhu cầu.',
    author: {
      name: 'Vũ Đăng Khoa',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      role: 'Thợ sửa máy cơ & Nhà sưu tầm',
    },
    tags: ['Thiết bị', 'Máy ảnh SLR', 'Point and Shoot', 'Rangefinder'],
    toc: [
      { id: 'phan-loai-may', title: '1. Phân loại các dòng máy ảnh phim 35mm', level: 2 },
      { id: 'top-may-slr-nhap-mon', title: '2. Top máy SLR khuyên dùng cho người mới (Canon AE-1, Olympus OM-1, Pentax K1000)', level: 2 },
      { id: 'top-point-and-shoot', title: '3. Điểm mạnh của máy Point & Shoot bỏ túi', level: 2 },
      { id: 'kiem-tra-may-cu', title: '4. Checklist 6 bước kiểm tra khi mua máy cũ', level: 2 },
      { id: 'loi-khuyen-ngan-sach', title: '5. Lời khuyên phân bổ ngân sách thông minh', level: 2 },
    ],
  },
  'trang-phim-den-trang-tai-nha': {
    id: 'trang-phim-den-trang-tai-nha',
    title: 'Tự tráng phim đen trắng tại nhà: Từng bước cụ thể',
    date: '02/05/2025',
    image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=80',
    category: 'Phòng tối',
    readTime: '9 phút đọc',
    views: 1890,
    likes: 178,
    excerpt: 'Cảm giác tận tay rút dải phim còn ướt ra khỏi tank tráng và nhìn thấy những khung hình hiện lên là trải nghiệm kỳ diệu nhất mà nhiếp ảnh số không có.',
    author: {
      name: 'Lê Hoàng Phong',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      role: 'Chuyên gia Lab phim & Kỹ thuật số hóa',
    },
    tags: ['Phòng tối', 'Tráng B&W', 'Hóa chất Kodak D-76', 'Darkroom'],
    toc: [
      { id: 'dung-cu-can-thiet', title: '1. Danh sách dụng cụ và hóa chất cơ bản', level: 2 },
      { id: 'nap-phim-trong-tui-den', title: '2. Kỹ thuật cuộn phim vào reel trong túi đen (Changing bag)', level: 2 },
      { id: 'quy-trinh-hoa-chat', title: '3. Quy trình 4 bước: Hiện hình (Dev) - Hãm (Stop) - Định hình (Fix) - Rửa (Wash)', level: 2 },
      { id: 'nhiet-do-va-thoi-gian', title: '4. Kiểm soát nhiệt độ và chu kỳ lắc tank', level: 2 },
      { id: 'phoi-kho-va-bao-quan', title: '5. Phơi khô âm bản và đóng bao bảo quản', level: 2 },
    ],
  },
  'bi-quyet-chup-phim-dem': {
    id: 'bi-quyet-chup-phim-dem',
    title: 'Bí quyết phơi sáng và chụp ảnh phim ban đêm',
    date: '25/04/2025',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    category: 'Kỹ thuật',
    readTime: '6 phút đọc',
    views: 2980,
    likes: 231,
    excerpt: 'Ánh đèn neon thành phố, vệt sáng xe cộ và những bóng người lướt qua trong đêm. Làm thế nào để làm chủ hiệu ứng Schwarzschild (Reciprocity Failure)?',
    author: {
      name: 'Nguyễn Minh Quân',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Nhiếp ảnh gia Analog & Giảng viên Workshop',
    },
    tags: ['Chụp đêm', 'Long Exposure', 'Phơi sáng', 'Chân máy'],
    toc: [
      { id: 'hien-tuong-reciprocity', title: '1. Hiểu về hiện tượng Reciprocity Failure', level: 2 },
      { id: 'lua-chon-film-dem', title: '2. Chọn phim phù hợp cho ánh sáng nhân tạo', level: 2 },
      { id: 'thiet-bi-bo-tro', title: '3. Chân máy và dây bấm mềm là bắt buộc', level: 2 },
      { id: 'tinh-toan-thoi-gian-phoi', title: '4. Bảng tính thời gian phơi sáng bù trừ', level: 2 },
      { id: 'nhung-sai-lam-thuong-gap', title: '5. Các lỗi thường gặp khi chụp phim đêm', level: 2 },
    ],
  },
  'so-sanh-kodak-va-fujifilm': {
    id: 'so-sanh-kodak-va-fujifilm',
    title: 'Kodak vs Fujifilm: Cuộc so kè màu sắc của hai tượng đài',
    date: '18/04/2025',
    image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1200&q=80',
    category: 'Film Stock',
    readTime: '8 phút đọc',
    views: 4190,
    likes: 310,
    excerpt: 'Trường phái màu vàng ấm áp kiểu Mỹ hay sắc xanh mát dịu mắt phong cách Nhật Bản? Phân tích chi tiết giúp bạn chọn đúng phim cho từng hoàn cảnh.',
    author: {
      name: 'Trần Hương Ly',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'Curator & Nhiếp ảnh tư liệu',
    },
    tags: ['So sánh', 'Kodak', 'Fujifilm', 'Màu sắc'],
    toc: [
      { id: 'triet-ly-mau-sac', title: '1. Hai trường phái màu đối lập', level: 2 },
      { id: 'tone-da-chan-dung', title: '2. Màu da người: Kodak ấm áp vs Fuji trong trẻo', level: 2 },
      { id: 'phong-canh-va-thien-nhien', title: '3. Chụp phong cảnh & màu xanh cỏ cây', level: 2 },
      { id: 'do-hat-grain-va-tuong-phan', title: '4. Cấu trúc hạt grain và dải chuyển sắc highlight', level: 2 },
      { id: 'loi-khuyen-su-dung', title: '5. Khi nào nên chọn hãng nào?', level: 2 },
    ],
  },
};

export const ALL_ARTICLES_LIST: ArticleItem[] = Object.values(ARTICLES_DATA);
