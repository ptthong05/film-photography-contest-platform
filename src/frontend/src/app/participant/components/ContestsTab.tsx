import React, { useState } from 'react';
import {
  Trophy, Calendar, Users, Eye, X, CheckCircle2, AlertTriangle,
  Sparkles, ShieldCheck, FileText, Award, Disc, MapPin, Trash2, Check
} from 'lucide-react';

export interface ContestItem {
  id: string;
  title: string;
  category: string;
  dateRange: string;
  participantsCount: number;
  bannerUrl: string;
  status: 'Đang diễn ra' | 'Sắp diễn ra' | 'Đã kết thúc';
  description: string;
  rules: string[];
  prizes: {
    first: string;
    second: string;
    third: string;
    consolation: string;
  };
  technicalRequirements: string;
  judgingCriteria: string[];
}

const INITIAL_CONTESTS: ContestItem[] = [
  {
    id: 'contest-01',
    title: 'Analog Moments 2025',
    category: 'PHONG CẢNH • CHÂN DUNG • ĐỜI SỐNG',
    dateRange: '01/06/2025 - 30/09/2025',
    participantsCount: 342,
    bannerUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=85&w=1000&auto=format&fit=crop',
    status: 'Đang diễn ra',
    description: 'Cuộc thi nhiếp ảnh phim nhựa quy mô lớn nhất năm 2025, tìm kiếm những khoảnh khắc chân thực và cảm xúc nhất được lưu giữ qua cuộn film analog truyền thống. Sân chơi dành riêng cho các tay máy đam mê cơ chế cơ học, hạt grain tự nhiên và ánh sáng chân thực.',
    rules: [
      'Tác phẩm bắt buộc phải được chụp bằng máy ảnh phim analog (35mm, Medium Format, Large Format).',
      'Không chấp nhận ảnh kỹ thuật số (Digital) hoặc ảnh giả lập phim qua phần mềm chỉnh sửa.',
      'Mỗi thí sinh được gửi tối đa 05 tác phẩm dự thi kèm theo thông tin Metadata cuộn phim rõ ràng.',
      'Ban tổ chức có quyền yêu cầu thí sinh gửi âm bản gốc (Negative/Slide) để xác thực nếu lọt vào vòng chung khảo.'
    ],
    prizes: {
      first: '1x Máy ảnh Leica M6 Classic + 20 cuộn Kodak Portra 400 + Kỷ niệm chương vàng',
      second: '1x Máy ảnh Nikon FM2 + 10 cuộn Fujifilm C200 + Kỷ niệm chương bạc',
      third: '1x Máy Canon AE-1 + 5 cuộn Ilford HP5 + Kỷ niệm chương đồng',
      consolation: '05 giải khuyến khích, mỗi giải 02 cuộn phim cao cấp và Giấy chứng nhận'
    },
    technicalRequirements: 'Ảnh scan độ phân giải tối thiểu 300 DPI, định dạng JPG/TIFF không đóng khung chữ ký, giữ nguyên hạt grain và thông số quang học gốc.',
    judgingCriteria: [
      'Bố cục và góc nhìn nghệ thuật (25%)',
      'Xử lý ánh sáng và độ tương phản tự nhiên (25%)',
      'Nội dung thông điệp truyền tải (25%)',
      'Kỹ thuật tráng scan và độ tinh xảo của hạt film (25%)'
    ]
  },
  {
    id: 'contest-02',
    title: 'Film & City',
    category: 'ĐƯỜNG PHỐ • KIẾN TRÚC • ĐỜI SỐNG',
    dateRange: '15/06/2025 - 30/11/2025',
    participantsCount: 205,
    bannerUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=85&w=1000&auto=format&fit=crop',
    status: 'Đang diễn ra',
    description: 'Khám phá nhịp sống đô thị hối hả, những góc khuất kiến trúc cổ kính và hơi thở con người qua lăng kính máy phim đen trắng hoặc màu sắc rực rỡ.',
    rules: [
      'Tác phẩm chụp trong khu vực đô thị, thành phố lớn bằng máy phim analog.',
      'Khuyến khích phong cách street photography tự nhiên, không dàn dựng.',
      'Bắt buộc cung cấp thông tin về loại film stock và địa điểm chụp cụ thể.'
    ],
    prizes: {
      first: '01 Giải Đặc Biệt trị giá 25.000.000 VNĐ tiền mặt và bộ ống kính Leica cổ',
      second: '01 Giải Nhì trị giá 15.000.000 VNĐ',
      third: '01 Giải Ba trị giá 8.000.000 VNĐ',
      consolation: 'Các phần quà hiện vật giá trị từ nhà tài trợ Lab Phim Sài Gòn'
    },
    technicalRequirements: 'Ảnh scan từ cuộn film âm bản hoặc dương bản, không chèn watermark.',
    judgingCriteria: [
      'Tính thời sự và khoảnh khắc đô thị (30%)',
      'Bố cục đường phố (30%)',
      'Kỹ thuật in rọi/scan (20%)',
      'Sự sáng tạo góc máy (20%)'
    ]
  },
  {
    id: 'contest-03',
    title: 'The Vintage Look',
    category: 'CHÂN DUNG • NGHỆ THUẬT • TỰ DO',
    dateRange: '10/07/2025 - 10/10/2025',
    participantsCount: 158,
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=1000&auto=format&fit=crop',
    status: 'Sắp diễn ra',
    description: 'Sân chơi tôn vinh vẻ đẹp cổ điển vượt thời gian, nơi ánh sáng mềm mại hòa quyện cùng phong cách thời trang hoài cổ thập niên cũ.',
    rules: [
      'Chủ đề chân dung nghệ thuật mang phong cách vintage cổ điển.',
      'Sử dụng 100% thiết bị máy ảnh phim.'
    ],
    prizes: {
      first: '15.000.000 VNĐ + Huy chương vàng',
      second: '10.000.000 VNĐ + Huy chương bạc',
      third: '5.000.000 VNĐ + Huy chương đồng',
      consolation: 'Phần quà từ nhà tài trợ'
    },
    technicalRequirements: 'Độ phân giải cao, file scan gốc từ lab uy tín.',
    judgingCriteria: ['Thần thái nhân vật (40%)', 'Ánh sáng (30%)', 'Kỹ thuật phim (30%)']
  },
  {
    id: 'contest-04',
    title: 'Film Portrait 2025',
    category: 'CHÂN DUNG • NGHỆ THUẬT • ÁNH SÁNG',
    dateRange: '20/07/2025 - 20/10/2025',
    participantsCount: 215,
    bannerUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=85&w=1000&auto=format&fit=crop',
    status: 'Đang diễn ra',
    description: 'Nghệ thuật chân dung qua lăng kính máy phim, bắt trọn chiều sâu cảm xúc và biểu cảm tự nhiên nhất của nhân vật.',
    rules: ['Chủ đề chân dung con người', 'Bắt buộc dùng cuộn film màu hoặc đen trắng âm bản.'],
    prizes: { first: '20.000.000 VNĐ', second: '10.000.000 VNĐ', third: '5.000.000 VNĐ', consolation: 'Quà tặng' },
    technicalRequirements: 'File ảnh scan sắc nét.',
    judgingCriteria: ['Cảm xúc nhân vật (50%)', 'Ánh sáng (50%)']
  },
  {
    id: 'contest-05',
    title: 'Góc Phố Film',
    category: 'ĐƯỜNG PHỐ • ĐỜI THƯỜNG • THÁNG TƯ',
    dateRange: '01/08/2025 - 15/11/2025',
    participantsCount: 178,
    bannerUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=85&w=1000&auto=format&fit=crop',
    status: 'Đang diễn ra',
    description: 'Góc nhìn mộc mạc về nhịp sống thường ngày qua những cuộn phim khổ 35mm hoài niệm.',
    rules: ['Ảnh chụp đường phố đời thường.'],
    prizes: { first: '12.000.000 VNĐ', second: '7.000.000 VNĐ', third: '3.000.000 VNĐ', consolation: 'Quà tặng' },
    technicalRequirements: 'Scan độ phân giải cao.',
    judgingCriteria: ['Khoảnh khắc (50%)', 'Bố cục (50%)']
  },
  {
    id: 'contest-06',
    title: 'Nắng Cuối Ngày',
    category: 'HOÀNG HÔN • PHONG CẢNH • TỰ NHIÊN',
    dateRange: '01/10/2025 - 31/12/2025',
    participantsCount: 145,
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=1000&auto=format&fit=crop',
    status: 'Sắp diễn ra',
    description: 'Tôn vinh vẻ đẹp của ánh chiều tà và thiên nhiên qua những khung hình analog đầy màu sắc.',
    rules: ['Ảnh chụp hoàng hôn và thiên nhiên.'],
    prizes: { first: '10.000.000 VNĐ', second: '5.000.000 VNĐ', third: '2.000.000 VNĐ', consolation: 'Quà tặng' },
    technicalRequirements: 'Không chỉnh sửa số hóa quá mức.',
    judgingCriteria: ['Màu sắc (50%)', 'Không gian (50%)']
  },
  {
    id: 'contest-07',
    title: 'Hơi Thở Analog 2024',
    category: 'HOÀI NIỆM • TRUYỀN THỐNG • DI SẢN',
    dateRange: '01/01/2024 - 30/06/2024',
    participantsCount: 420,
    bannerUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=85&w=1000&auto=format&fit=crop',
    status: 'Đã kết thúc',
    description: 'Cuộc thi nhìn lại di sản nhiếp ảnh phim nhựa lịch sử, tôn vinh các tác phẩm lưu giữ giá trị văn hóa và kiến trúc cổ xưa đã khép lại thành công rực rỡ.',
    rules: ['Sử dụng thiết bị máy phim cổ điển.', 'Chủ đề di sản và ký ức.'],
    prizes: { first: '30.000.000 VNĐ', second: '15.000.000 VNĐ', third: '8.000.000 VNĐ', consolation: 'Kỷ niệm chương' },
    technicalRequirements: 'Lưu giữ âm bản gốc.',
    judgingCriteria: ['Giá trị lịch sử (50%)', 'Kỹ thuật phim (50%)']
  },
  {
    id: 'contest-08',
    title: 'Sài Gòn Xưa & Nay',
    category: 'ĐÔ THỊ • BIẾN ĐỔI • KỶ NIỆM',
    dateRange: '15/03/2024 - 15/09/2024',
    participantsCount: 389,
    bannerUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=85&w=1000&auto=format&fit=crop',
    status: 'Đã kết thúc',
    description: 'Hành trình ngược dòng thời gian khám phá sự thay đổi của Sài Gòn qua từng khung ảnh cuộn phim đen trắng và màu sắc.',
    rules: ['Tác phẩm ghi lại sự chuyển mình đô thị.'],
    prizes: { first: '25.000.000 VNĐ', second: '12.000.000 VNĐ', third: '6.000.000 VNĐ', consolation: 'Quà lưu niệm' },
    technicalRequirements: 'Scan từ film gốc.',
    judgingCriteria: ['Bố cục (50%)', 'Cảm xúc (50%)']
  }
];

export interface ContestsTabProps {
  registeredIds?: string[];
  onToggleRegister?: (contestId: string) => void;
  onNavigateSubmit?: () => void;
  filterRegisteredOnly?: boolean;
}

export function ContestsTab({ registeredIds = [], onToggleRegister, filterRegisteredOnly = false }: ContestsTabProps) {
  const [contests] = useState<ContestItem[]>(INITIAL_CONTESTS);
  const [selectedContest, setSelectedContest] = useState<ContestItem | null>(null);
  const [filterTab, setFilterTab] = useState<'Tất cả' | 'Đang diễn ra' | 'Sắp diễn ra' | 'Đã kết thúc'>('Tất cả');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegisterClick = (contestId: string, contestTitle: string, isReg: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onToggleRegister) {
      onToggleRegister(contestId);
      showToast(isReg ? `❌ Đã hủy đăng ký cuộc thi "${contestTitle}".` : `✅ Đã đăng ký thành công cuộc thi "${contestTitle}"!`);
    }
  };

  const baseContests = filterRegisteredOnly
    ? contests.filter(item => registeredIds.includes(item.id))
    : contests;

  const filteredContests = baseContests.filter(item => {
    if (filterTab === 'Tất cả') return true;
    return item.status === filterTab;
  });

  return (
    <div className="space-y-8 max-w-[1800px] mx-auto pb-24 relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {selectedContest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 md:p-8 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] max-w-5xl w-full max-h-[92vh] overflow-y-auto border-2 border-slate-200 shadow-2xl space-y-8 p-8 md:p-12 relative animate-scale-up custom-scrollbar">

            <button
              onClick={() => setSelectedContest(null)}
              className="absolute top-6 right-6 md:top-8 md:right-8 p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer z-10 shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src={selectedContest.bannerUrl}
                alt={selectedContest.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-8 text-white space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3.5 py-1 text-[11px] font-black rounded-full uppercase tracking-wider shadow-md text-white ${
                    selectedContest.status === 'Đang diễn ra' ? 'bg-emerald-500' : selectedContest.status === 'Sắp diễn ra' ? 'bg-blue-500' : 'bg-slate-500'
                  }`}>
                    ● {selectedContest.status}
                  </span>
                  <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-black rounded-full border border-white/30">
                    {selectedContest.category}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{selectedContest.title}</h2>
                <p className="text-xs md:text-sm text-slate-200 font-bold flex items-center gap-4">
                  <span>📅 Thời gian: {selectedContest.dateRange}</span>
                  <span>👥 Đã tham gia: {selectedContest.participantsCount} tay máy</span>
                </p>
              </div>
            </div>

            <div className="space-y-8 text-slate-800 text-sm md:text-base">
              <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Giới thiệu quy chế cuộc thi
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {selectedContest.description}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Thể lệ & Quy định nộp bài
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedContest.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-slate-700 font-medium text-xs md:text-sm leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" /> Cơ cấu giải thưởng hoành tráng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 space-y-1">
                    <p className="text-[11px] font-black text-amber-700 uppercase">🥇 Giải Nhất</p>
                    <p className="text-xs md:text-sm font-black text-slate-900">{selectedContest.prizes.first}</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-50 to-zinc-100 p-5 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[11px] font-black text-slate-600 uppercase">🥈 Giải Nhì</p>
                    <p className="text-xs md:text-sm font-black text-slate-900">{selectedContest.prizes.second}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-900/5 to-amber-700/10 p-5 rounded-2xl border border-amber-800/20 space-y-1">
                    <p className="text-[11px] font-black text-amber-900 uppercase">🥉 Giải Ba</p>
                    <p className="text-xs md:text-sm font-black text-slate-900">{selectedContest.prizes.third}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[11px] font-black text-blue-600 uppercase">🎁 Giải Khuyến Khích</p>
                    <p className="text-xs md:text-sm font-black text-slate-900">{selectedContest.prizes.consolation}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 md:p-8 rounded-3xl border border-purple-200 space-y-3">
                <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
                  <Disc className="w-5 h-5 text-purple-600" /> Tiêu chuẩn kỹ thuật máy & scan phim
                </h3>
                <p className="text-purple-900 text-xs md:text-sm font-medium leading-relaxed">
                  {selectedContest.technicalRequirements}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" /> Tiêu chí đánh giá từ Hội đồng giám khảo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedContest.judgingCriteria.map((crit, idx) => (
                    <div key={idx} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-indigo-950 font-bold text-xs flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0"></span>
                      <span>{crit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={() => setSelectedContest(null)}
                className="w-full md:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl transition cursor-pointer"
              >
                Đóng cửa sổ
              </button>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {selectedContest.status === 'Đã kết thúc' ? (
                  <span className="px-6 py-4 bg-slate-100 text-slate-500 font-black text-xs rounded-2xl">
                    Cuộc thi đã kết thúc (Khóa đăng ký)
                  </span>
                ) : registeredIds.includes(selectedContest.id) ? (
                  <button
                    onClick={() => handleRegisterClick(selectedContest.id, selectedContest.title, true)}
                    className="w-full md:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" /> Hủy đăng ký cuộc thi này
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegisterClick(selectedContest.id, selectedContest.title, false)}
                    className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Check className="w-4 h-4" /> Đăng ký tham gia ngay
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
        <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
          ● {filterRegisteredOnly ? 'QUẢN LÝ CÁC CUỘC THI CỦA BẠN' : 'NHIẾP ẢNH PHIM TRUYỀN THỐNG'}
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          {filterRegisteredOnly ? 'Danh sách cuộc thi đã đăng ký' : 'Danh sách cuộc thi'}
        </h1>
        <p className="text-sm text-slate-500">
          {filterRegisteredOnly
            ? 'Quản lý các cuộc thi mà bạn đã tham gia đăng ký, theo dõi thời hạn và tiến hành gửi bài dự thi.'
            : 'Khám phá những cuộc thi nhiếp ảnh phim đang diễn ra, sắp diễn ra và đã kết thúc. Gửi tác phẩm dự thi và khẳng định dấu ấn sáng tạo của bạn.'
          }
        </p>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-3 overflow-x-auto">
        {(['Tất cả', 'Đang diễn ra', 'Sắp diễn ra', 'Đã kết thúc'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-6 py-3 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
              filterTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {tab} ({tab === 'Tất cả' ? baseContests.length : baseContests.filter(c => c.status === tab).length})
          </button>
        ))}
      </div>

      {filteredContests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <p className="text-base font-bold text-slate-600">Bạn chưa đăng ký tham gia cuộc thi nào trong mục này.</p>
          <p className="text-xs text-slate-400">Hãy qua mục "Cuộc thi" để khám phá và đăng ký tham gia ngay nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContests.map((contest) => {
            const isReg = registeredIds.includes(contest.id);
            return (
              <div
                key={contest.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="space-y-4 p-6">
                  <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={contest.bannerUrl}
                      alt={contest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className={`absolute top-3 left-3 px-3.5 py-1 text-[10px] font-black rounded-full shadow-md text-white ${
                      contest.status === 'Đang diễn ra' ? 'bg-emerald-500' : contest.status === 'Sắp diễn ra' ? 'bg-blue-500' : 'bg-slate-500'
                    }`}>
                      ● {contest.status}
                    </span>

                    <span className={`absolute top-3 right-3 px-3.5 py-1 text-[10px] font-black rounded-full shadow-md ${
                      isReg ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isReg ? '✔ Đã đăng ký' : 'Chưa đăng ký'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{contest.category}</p>
                    <h3 className="font-black text-slate-900 text-xl">{contest.title}</h3>
                    <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                      <span>📅 {contest.dateRange}</span>
                      <span>•</span>
                      <span>👥 {contest.participantsCount} tham gia</span>
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 pt-1 leading-relaxed font-medium">
                      {contest.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedContest(contest)}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <Eye className="w-4 h-4" /> Xem chi tiết
                  </button>

                  {contest.status === 'Đã kết thúc' ? (
                    <button
                      onClick={() => setSelectedContest(contest)}
                      className="w-full py-3.5 bg-slate-100 text-slate-400 font-black text-xs rounded-2xl cursor-default flex items-center justify-center gap-1.5"
                    >
                      Đã kết thúc
                    </button>
                  ) : isReg ? (
                    <button
                      onClick={(e) => handleRegisterClick(contest.id, contest.title, true, e)}
                      className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Hủy đăng ký
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleRegisterClick(contest.id, contest.title, false, e)}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Đăng ký ngay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}