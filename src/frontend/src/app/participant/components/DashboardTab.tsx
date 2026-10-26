import React, { useState, useEffect } from 'react';
import {
  Trophy,
  BookOpen,
  Clock,
  Image as ImageIcon,
  Sparkles,
  Bell,
  X,
  FileText,
  ShieldCheck,
  Disc,
  Award,
  Check,
  Trash2
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

interface StoredDashboardEntryItem {
  status?: string;
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
  }
];

export interface DashboardTabProps {
  registeredCount?: number;
  registeredIds?: string[];
  onNavigate?: (tab: string, filter?: string) => void;
  onToggleRegister?: (contestId: string) => void;
}

export function DashboardTab({ registeredCount = 0, registeredIds = [], onNavigate, onToggleRegister }: DashboardTabProps) {
  const [userName, setUserName] = useState('Hồ Thanh Bình');
  const [totalEntriesCount, setTotalEntriesCount] = useState(2);
  const [pendingEntriesCount, setPendingEntriesCount] = useState(0);
  const [selectedContest, setSelectedContest] = useState<ContestItem | null>(null);
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

  useEffect(() => {
    const updateDashboardData = () => {
      try {
        const savedName = localStorage.getItem('participant_user_name');
        if (savedName) {
          setUserName(savedName);
        } else {
          const savedProfile = localStorage.getItem('participant_profile');
          if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            if (parsed.name) setUserName(parsed.name);
          }
        }

        const savedCount = localStorage.getItem('participant_total_entries_count');
        if (savedCount) {
          setTotalEntriesCount(parseInt(savedCount, 10));
        }

        const savedEntries = localStorage.getItem('participant_entries');
        if (savedEntries) {
          const parsedEntries: StoredDashboardEntryItem[] = JSON.parse(savedEntries);
          if (Array.isArray(parsedEntries)) {
            setTotalEntriesCount(parsedEntries.length);
            const pendingCount = parsedEntries.filter((item: StoredDashboardEntryItem) => item.status === 'Đang chờ duyệt').length;
            setPendingEntriesCount(pendingCount);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    updateDashboardData();
    window.addEventListener('userNameChanged', updateDashboardData);
    window.addEventListener('storage', updateDashboardData);

    return () => {
      window.removeEventListener('userNameChanged', updateDashboardData);
      window.removeEventListener('storage', updateDashboardData);
    };
  }, []);

  return (
    <div className="space-y-8 max-w-[1800px] mx-auto pb-20 font-sans text-slate-900 relative">
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

      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 md:p-10 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-3 z-10 max-w-3xl">
          <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3.5 py-1.5 rounded-full border border-white/30 backdrop-blur-md">
            ● PARTICIPANT PORTAL • NỀN TẢNG QUẢN LÝ NHIẾP ẢNH PHIM
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Xin chào, {userName}! 👋
          </h1>
          <p className="text-sm md:text-base text-blue-100 font-medium leading-relaxed">
            Cùng khám phá các cuộc thi nhiếp ảnh phim độc bản, quản lý cuộn phim cuộn và lưu giữ những khoảnh khắc tuyệt vời nhất của bạn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => onNavigate && onNavigate('contests', 'Đang diễn ra')}
            className="px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
          >
            Xem Cuộc Thi →
          </button>
          <button
            onClick={() => onNavigate && onNavigate('film-roll')}
            className="px-6 py-3.5 bg-blue-800/60 hover:bg-blue-800 text-white font-black text-xs rounded-2xl border border-blue-400/30 backdrop-blur-md transition cursor-pointer active:scale-95"
          >
            Quản Lý Film Roll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => onNavigate && onNavigate('contests', 'Đang diễn ra')}
          className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex justify-between items-center group"
        >
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">CUỘC THI ĐANG MỞ</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">4</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">/ 8 cuộc thi</span>
            </div>
            <p className="text-[11px] font-extrabold text-emerald-600">🔥 +1 Mới cập nhật tuần này</p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200 flex-shrink-0 group-hover:scale-105 transition">
            <Trophy className="w-7 h-7" />
          </div>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('my-registrations')}
          className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer flex justify-between items-center group"
        >
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">ĐÃ ĐĂNG KÝ</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{registeredCount}</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">Hoàn tất</span>
            </div>
            <p className="text-[11px] font-extrabold text-blue-600">
              {registeredCount > 0 ? '✔ Đang tham gia tích cực' : 'Chưa đăng ký cuộc thi nào'}
            </p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-200 flex-shrink-0 group-hover:scale-105 transition">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('my-entries', 'pending')}
          className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:border-amber-400 hover:shadow-md transition cursor-pointer flex justify-between items-center group"
        >
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">ĐANG CHỜ DUYỆT</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{pendingEntriesCount}</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">Bài chờ duyệt</span>
            </div>
            <p className="text-[11px] font-extrabold text-amber-600">🕒 Hệ thống AI đang quét</p>
          </div>
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200 flex-shrink-0 group-hover:scale-105 transition">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('my-entries', 'all')}
          className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:border-indigo-400 hover:shadow-md transition cursor-pointer flex justify-between items-center group"
        >
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">TỔNG BÀI DỰ THI</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{totalEntriesCount}</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">Tác phẩm</span>
            </div>
            <p className="text-[11px] font-extrabold text-indigo-600">🛡 Đồng bộ từ thư viện bài nộp</p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-200 flex-shrink-0 group-hover:scale-105 transition">
            <ImageIcon className="w-7 h-7" />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-black text-slate-900">Cuộc thi đang mở</h2>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('contests', 'Đang diễn ra')}
            className="text-xs font-extrabold text-blue-600 hover:underline cursor-pointer"
          >
            Xem tất cả (8 cuộc thi) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_CONTESTS.map((contest) => (
            <div key={contest.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-400 transition flex flex-col justify-between">
              <div className="space-y-4 p-5">
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={contest.bannerUrl}
                    alt={contest.title}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-black rounded-full shadow-md text-white ${
                    contest.status === 'Đang diễn ra' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}>
                    ● {contest.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-blue-600 uppercase">{contest.category}</p>
                  <h3 className="font-black text-slate-900 text-lg">{contest.title}</h3>
                  <p className="text-xs text-slate-400 font-bold">📅 {contest.dateRange}</p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedContest(contest)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition cursor-pointer shadow-sm active:scale-95"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm">Trạng thái bài dự thi</h3>
            <button onClick={() => onNavigate && onNavigate('my-entries')} className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80"
              alt="Mùa hè bên bờ biển"
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="space-y-1">
              <h4 className="font-black text-xs text-slate-900">Mùa hè bên bờ biển</h4>
              <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">
                ● Đang chờ duyệt
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="font-black text-slate-900 text-sm">AI Module Kiểm Tra & Xác Thực</h3>
          </div>
          <div className="space-y-2 text-xs font-bold">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-600">Duplicate check</span>
              <span className="text-emerald-600 font-black">✔ Hoàn tất (0.0%)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-600">AI-generated detection</span>
              <span className="text-emerald-600 font-black">✔ Hoàn tất</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-black text-slate-900 text-sm">Thông Báo Hệ Thống</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-800">● Cuộc thi Analog Moments 2025 đã mở đăng ký.</p>
              <p className="text-[10px] text-slate-400">2 ngày trước</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-slate-800">● Bài dự thi của bạn đã được duyệt thành công.</p>
              <p className="text-[10px] text-slate-400">5 ngày trước</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}