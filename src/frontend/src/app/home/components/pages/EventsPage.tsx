import React, { useState } from 'react';
import type { Portal } from '../../../../types/portal';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  ArrowRight,
  Tag,
  Sparkles,
  Ticket,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
} from 'lucide-react';
import { validateVietnamesePhone } from '../../../../utils/phoneValidator';

interface EventsPageProps {
  onGoHome: () => void;
  onSelectPortal?: (portal: Portal) => void;
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER') => void;
}

export interface FilmEventItem {
  id: string;
  title: string;
  category: 'Photowalk' | 'Workshop' | 'Triển lãm' | 'Gala trao giải';
  date: string;
  time: string;
  location: string;
  address: string;
  thumbnail: string;
  fee: string;
  currentSlots: number;
  maxSlots: number;
  unit: string;
  slots: string;
  status: 'Đang mở đăng ký' | 'Sắp diễn ra' | 'Đã hết chỗ';
  description: string;
  speaker?: string;
}

const EVENTS_STORAGE_KEY = 'film_contest_events_data_v2';
const REGISTERED_EVENTS_KEY = 'film_contest_user_registered_events';

// Dữ liệu sự kiện mẫu khởi tạo
export const EVENTS_PAGE_CONTENT: {
  title: string;
  subtitle: string;
  events: FilmEventItem[];
} = {
  title: 'Sự kiện & Hoạt động Analog',
  subtitle:
    'Tham gia chuỗi sự kiện photowalk dạo phố, workshop kỹ thuật phòng tối và các buổi triển lãm nghệ thuật nhiếp ảnh phim quy mô toàn quốc.',
  events: [
    {
      id: 'ev-1',
      title: 'Workshop: Nghệ thuật tráng & rọi ảnh phim Đen Trắng thủ công',
      category: 'Workshop',
      date: '25/11/2025',
      time: '09:00 - 15:30',
      location: 'TP. Hồ Chí Minh',
      address: 'Darkroom Studio, 42 Nguyễn Huệ, Quận 1',
      thumbnail:
        'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80',
      fee: '350.000 VNĐ (Bao gồm hóa chất & giấy rọi)',
      currentSlots: 19,
      maxSlots: 20,
      unit: 'chỗ',
      slots: '19/20 chỗ',
      status: 'Đang mở đăng ký',
      description:
        'Trực tiếp tự tay pha hóa chất, tráng cuộn film 35mm B&W và thực hành rọi bức ảnh đầu tiên trên máy phóng ảnh cơ học dưới ánh đèn đỏ phòng tối.',
      speaker: 'NSNA. Nguyễn Văn Minh',
    },
    {
      id: 'ev-2',
      title: 'Hanoi Autumn Photowalk 2025: Bắt trọn khoảnh khắc phố cổ',
      category: 'Photowalk',
      date: '02/12/2025',
      time: '06:30 - 11:00',
      location: 'Hà Nội',
      address: 'Xuất phát từ Vườn hoa Lý Thái Tổ, Hoàn Kiếm',
      thumbnail:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      fee: 'Miễn phí tham gia',
      currentSlots: 78,
      maxSlots: 80,
      unit: 'người',
      slots: '78/80 người',
      status: 'Đang mở đăng ký',
      description:
        'Cùng hơn 80 người yêu nhiếp ảnh lang thang qua từng góc phố mùa thu Hà Nội, thưởng thức cà phê trứng và trao đổi cuộn phim cùng kinh nghiệm đo sáng.',
      speaker: 'CLB Film Hà Nội & FilmContest',
    },
    {
      id: 'ev-3',
      title: 'Triển lãm ảnh phim nghệ thuật: "Hạt Phim & Thời Gian"',
      category: 'Triển lãm',
      date: '15/12 - 22/12/2025',
      time: '08:30 - 20:00 hàng ngày',
      location: 'Đà Nẵng',
      address: 'Trung tâm Văn hóa & Nghệ thuật Đương đại, Đường Bạch Đằng',
      thumbnail:
        'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80',
      fee: 'Miễn phí vào cửa',
      currentSlots: 145,
      maxSlots: 150,
      unit: 'vé',
      slots: '145/150 vé',
      status: 'Đang mở đăng ký',
      description:
        'Trưng bày 120 tác phẩm phim tiêu biểu đạt giải thưởng cao nhất từ các mùa thi FilmContest, in rọi khổ lớn trên giấy mỹ thuật cao cấp.',
      speaker: 'Hội đồng Giám khảo FilmContest',
    },
    {
      id: 'ev-4',
      title: 'Đêm Gala Vinh danh & Trao giải Cuộc thi Ảnh Phim 2025',
      category: 'Gala trao giải',
      date: '28/12/2025',
      time: '18:30 - 22:00',
      location: 'TP. Hồ Chí Minh',
      address: 'Grand Ballroom, Khách sạn Nikko Saigon',
      thumbnail:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      fee: 'Thư mời & Khách danh dự',
      currentSlots: 120,
      maxSlots: 120,
      unit: 'khách mời',
      slots: '120/120 khách mời',
      status: 'Đã hết chỗ',
      description:
        'Đêm tiệc trang trọng công bố những nhiếp ảnh gia xuất sắc nhất năm, đấu giá từ thiện các bức ảnh phim đạt giải Nhất và giao lưu cùng chuyên gia quốc tế.',
      speaker: 'Ban Tổ chức FilmContest',
    },
  ],
};

export function EventsPage({ onGoHome, onSelectPortal, onOpenAuth }: EventsPageProps) {
  const content = EVENTS_PAGE_CONTENT;
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');

  // Quản lý danh sách sự kiện với số chỗ có thể tăng/giảm khi đăng ký
  const [events, setEvents] = useState<FilmEventItem[]>(() => {
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return EVENTS_PAGE_CONTENT.events;
  });

  // Danh sách ID các sự kiện người dùng hiện tại đã đăng ký
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_EVENTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  const [selectedEvent, setSelectedEvent] = useState<FilmEventItem | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Form đăng ký state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const categories = ['Tất cả', 'Workshop', 'Photowalk', 'Triển lãm', 'Gala trao giải'];

  const filteredEvents =
    activeCategory === 'Tất cả'
      ? events
      : events.filter((e) => e.category === activeCategory);

  // Xử lý khi người dùng ấn nút "Xác nhận đăng ký tham gia"
  const handleRegisterEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    // Nếu sự kiện đã đủ số lượng thì không thể đăng ký
    if (selectedEvent.currentSlots >= selectedEvent.maxSlots) {
      return;
    }

    // Kiểm tra số điện thoại Việt Nam 10 số
    const phoneCheck = validateVietnamesePhone(phone);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.error);
      return;
    }
    setPhoneError('');

    // Tăng số lượng người đăng ký lên 1
    const updatedCurrentSlots = selectedEvent.currentSlots + 1;
    const isNowFull = updatedCurrentSlots >= selectedEvent.maxSlots;
    const updatedStatus: FilmEventItem['status'] = isNowFull ? 'Đã hết chỗ' : selectedEvent.status;
    const updatedSlotsStr = `${updatedCurrentSlots}/${selectedEvent.maxSlots} ${selectedEvent.unit}`;

    const updatedEvent: FilmEventItem = {
      ...selectedEvent,
      currentSlots: updatedCurrentSlots,
      status: updatedStatus,
      slots: updatedSlotsStr,
    };

    const nextEvents = events.map((ev) => (ev.id === selectedEvent.id ? updatedEvent : ev));
    const nextRegisteredIds = [...registeredEventIds, selectedEvent.id];

    setEvents(nextEvents);
    setSelectedEvent(updatedEvent);
    setRegisteredEventIds(nextRegisteredIds);
    setRegisteredSuccess(true);

    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(nextEvents));
      localStorage.setItem(REGISTERED_EVENTS_KEY, JSON.stringify(nextRegisteredIds));
    } catch {}
  };

  // Hủy đăng ký để hoàn lại chỗ trống (tiện cho việc test)
  const handleCancelRegistration = (eventId: string) => {
    const target = events.find((ev) => ev.id === eventId);
    if (!target) return;

    const updatedCurrentSlots = Math.max(0, target.currentSlots - 1);
    const updatedStatus: FilmEventItem['status'] = 'Đang mở đăng ký';
    const updatedSlotsStr = `${updatedCurrentSlots}/${target.maxSlots} ${target.unit}`;

    const updatedEvent: FilmEventItem = {
      ...target,
      currentSlots: updatedCurrentSlots,
      status: updatedStatus,
      slots: updatedSlotsStr,
    };

    const nextEvents = events.map((ev) => (ev.id === eventId ? updatedEvent : ev));
    const nextRegisteredIds = registeredEventIds.filter((id) => id !== eventId);

    setEvents(nextEvents);
    setSelectedEvent(updatedEvent);
    setRegisteredEventIds(nextRegisteredIds);
    setRegisteredSuccess(false);

    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(nextEvents));
      localStorage.setItem(REGISTERED_EVENTS_KEY, JSON.stringify(nextRegisteredIds));
    } catch {}
  };

  // Đặt lại dữ liệu mẫu ban đầu để test
  const handleResetData = () => {
    try {
      localStorage.removeItem(EVENTS_STORAGE_KEY);
      localStorage.removeItem(REGISTERED_EVENTS_KEY);
    } catch {}
    setEvents(EVENTS_PAGE_CONTENT.events);
    setRegisteredEventIds([]);
    setRegisteredSuccess(false);
    if (selectedEvent) {
      const original = EVENTS_PAGE_CONTENT.events.find((e) => e.id === selectedEvent.id);
      setSelectedEvent(original || null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar
        activeTab=""
        onGoHome={onGoHome}
        onSelectPortal={onSelectPortal}
        onOpenContests={() => onSelectPortal?.('CONTESTS')}
        onLoginClick={() => onOpenAuth('LOGIN')}
        onRegisterClick={() => onOpenAuth('REGISTER')}
      />

      <main className="flex-1 w-full">
        {/* Banner */}
        <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white py-12 sm:py-16 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200/80 mb-4 font-medium">
              <button onClick={onGoHome} className="hover:text-white transition-colors cursor-pointer">
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
              <span className="text-white font-semibold">Sự kiện & Workshop</span>
            </div>

            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Không gian kết nối đời thực</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                {content.title}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {content.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Filter Categories & Reset */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Nút đặt lại dữ liệu mẫu cho tiện test */}
            <button
              onClick={handleResetData}
              title="Khôi phục lại số lượng chỗ ban đầu để kiểm tra"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Đặt lại số chỗ ban đầu</span>
            </button>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {filteredEvents.map((item) => {
              const isFull = item.currentSlots >= item.maxSlots;
              const isRegistered = registeredEventIds.includes(item.id);
              const remainingSlots = Math.max(0, item.maxSlots - item.currentSlots);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold shadow-xs">
                          {item.category}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs ${
                            isFull
                              ? 'bg-rose-600 text-white'
                              : item.status === 'Đang mở đăng ký'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800/90 text-white'
                          }`}
                        >
                          {isFull ? 'Đã hết chỗ' : item.status}
                        </span>
                        {isRegistered && (
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã đăng ký
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="font-bold text-lg sm:text-xl text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      <div className="pt-2 space-y-2 text-xs text-slate-600 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{item.date} • {item.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                          <span className="truncate">{item.address} ({item.location})</span>
                        </div>

                        {/* Thông tin phí và số chỗ đăng ký */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="font-semibold text-slate-800">{item.fee}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-slate-800 font-bold">
                              {item.currentSlots}/{item.maxSlots} {item.unit}
                            </span>
                            {isFull ? (
                              <span className="text-rose-600 text-[11px] font-bold ml-1">
                                (Đã đủ số lượng)
                              </span>
                            ) : (
                              <span className="text-emerald-600 text-[11px] font-semibold ml-1">
                                (Còn {remainingSlots} chỗ)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => {
                        setSelectedEvent(item);
                        setRegisteredSuccess(false);
                      }}
                      className={`w-full py-2.5 px-4 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                        isFull
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-slate-900 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <span>
                        {isFull
                          ? 'Xem chi tiết (Đã hết chỗ)'
                          : isRegistered
                          ? 'Xem chi tiết (Đã đăng ký)'
                          : 'Xem chi tiết & Đăng ký'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Modal chi tiết & đăng ký sự kiện */}
      {selectedEvent && (() => {
        const isFull = selectedEvent.currentSlots >= selectedEvent.maxSlots;
        const isRegistered = registeredEventIds.includes(selectedEvent.id);
        const remainingSlots = Math.max(0, selectedEvent.maxSlots - selectedEvent.currentSlots);
        const percentFilled = Math.min(100, Math.round((selectedEvent.currentSlots / selectedEvent.maxSlots) * 100));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setRegisteredSuccess(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                    {selectedEvent.category}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      isFull
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isFull ? 'Đã đủ số lượng / Hết chỗ' : 'Đang mở đăng ký'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {selectedEvent.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedEvent.date} lúc {selectedEvent.time}
                </p>
              </div>

              {/* Hộp trạng thái số lượng chỗ */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Tình trạng chỗ tham gia:</span>
                  <span className="font-bold text-slate-900">
                    {selectedEvent.currentSlots}/{selectedEvent.maxSlots} {selectedEvent.unit}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isFull ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Đã đăng ký {percentFilled}%</span>
                  {isFull ? (
                    <span className="text-rose-600 font-bold">Đã kín chỗ (0 chỗ trống)</span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">
                      Còn {remainingSlots} chỗ trống
                    </span>
                  )}
                </div>
              </div>

              {/* Thông tin sự kiện */}
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí tham gia:</span>
                  <span className="font-bold text-slate-900">{selectedEvent.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Địa điểm:</span>
                  <span className="text-slate-900 font-medium text-right max-w-[240px] truncate">
                    {selectedEvent.address}
                  </span>
                </div>
                {selectedEvent.speaker && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Diễn giả / Hướng dẫn:</span>
                    <span className="text-slate-900 font-medium">{selectedEvent.speaker}</span>
                  </div>
                )}
              </div>

              {/* TRƯỜNG HỢP 1: Vừa đăng ký thành công */}
              {registeredSuccess ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-base">Đăng ký thành công!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Số lượng người đăng ký đã tăng lên 1 (hiện tại:{' '}
                    <strong>
                      {selectedEvent.currentSlots}/{selectedEvent.maxSlots} {selectedEvent.unit}
                    </strong>
                    ). Vé tham gia và hướng dẫn chi tiết đã được gửi tới email của bạn.
                  </p>
                  {isFull && (
                    <div className="p-2.5 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-medium">
                      Sự kiện này hiện đã <strong>đạt đủ số lượng tối đa</strong> và đóng cổng đăng ký!
                    </div>
                  )}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent(null);
                        setRegisteredSuccess(false);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors shadow-xs"
                    >
                      Hoàn tất & Đóng
                    </button>
                  </div>
                </div>
              ) : isRegistered ? (
                /* TRƯỜNG HỢP 2: Người dùng này đã đăng ký trước đó */
                <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span>Bạn đã đăng ký tham gia sự kiện này</span>
                  </div>
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    Mã vé xác nhận của bạn là:{' '}
                    <span className="font-mono font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      #FC-{selectedEvent.id.toUpperCase()}-2025
                    </span>
                    . Vui lòng kiểm tra email để xem mã QR vào cổng.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCancelRegistration(selectedEvent.id)}
                      className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      Hủy đăng ký (Hoàn lại 1 chỗ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(null)}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : isFull ? (
                /* TRƯỜNG HỢP 3: Sự kiện ĐÃ ĐỦ SỐ LƯỢNG -> KHÔNG CÓ NÚT ĐĂNG KÝ NỮA */
                <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Sự kiện đã đủ số lượng ({selectedEvent.currentSlots}/{selectedEvent.maxSlots})</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Cảm ơn bạn đã quan tâm. Sự kiện này hiện đã <strong>nhận đủ số lượng đăng ký tối đa</strong>. Cổng đăng ký đã chính thức đóng nên hiện tại không còn nút đăng ký. Bạn vui lòng theo dõi hoặc lựa chọn các sự kiện khác của cộng đồng!
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors shadow-xs"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                /* TRƯỜNG HỢP 4: Sự kiện còn chỗ -> HIỂN THỊ FORM VÀ NÚT ĐĂNG KÝ */
                <form onSubmit={handleRegisterEvent} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên của bạn *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email nhận vé xác nhận *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Số điện thoại *
                      </label>
                      <span className="text-[11px] text-slate-400">10 số (03, 05, 07, 08, 09)</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) {
                          const check = validateVietnamesePhone(e.target.value);
                          if (check.isValid) setPhoneError('');
                        }
                      }}
                      onBlur={() => {
                        if (phone.trim()) {
                          const check = validateVietnamesePhone(phone);
                          if (!check.isValid) setPhoneError(check.error);
                        }
                      }}
                      placeholder="Ví dụ: 0912 345 678"
                      className={`w-full px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none transition-all ${
                        phoneError
                          ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                          : 'border-slate-200 focus:border-blue-600'
                      }`}
                    />
                    {phoneError && (
                      <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>

                  {/* Nút đăng ký - hiển thị rõ số chỗ còn lại */}
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Xác nhận đăng ký tham gia (Còn {remainingSlots} chỗ)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        );
      })()}

      <Footer onSelectPortal={onSelectPortal} onGoHome={onGoHome} />
    </div>
  );
}
