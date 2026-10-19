import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  MessageSquare,
  Phone,
  Rocket,
  Eye,
  ArrowRight,
  X,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  views?: string;
}

  const INITIAL_VIEWS: Record<number, number> = {
    7: 2850,
    6: 2140,
    8: 1980,
    5: 1560,
    1: 1420,
    2: 1250,
    3: 1180,
    4: 1090,
    9: 980,
    10: 920,
  };

  const popularShortTitles: Record<number, string> = {
    7: 'Ảnh dự thi có được chỉnh sửa không?',
    6: 'Tôi có thể nộp bao nhiêu tác phẩm?',
    8: 'Làm thế nào để biết tác phẩm đã được duyệt?',
    5: 'Thời gian nộp tác phẩm là khi nào?',
    1: 'Film stock nào được chấp nhận?',
  };

const FAQ_VIEWS_STORAGE_KEY = 'film_contest_faq_views_map';
const FAQ_OPEN_ID_STORAGE_KEY = 'film_contest_faq_open_id';

export function FaqSection() {
  const [openId, setOpenId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(FAQ_OPEN_ID_STORAGE_KEY);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return 1; // Default open first question like in mockup
  });

  const [viewsMap, setViewsMap] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(FAQ_VIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_VIEWS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load FAQ views:', e);
    }
    return INITIAL_VIEWS;
  });
  const [recentlyIncrementedId, setRecentlyIncrementedId] = useState<number | null>(null);
  const [showAllPopular, setShowAllPopular] = useState<boolean>(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [copiedHotline, setCopiedHotline] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Xin chào! Chào mừng bạn đến với FilmContest. Bạn cần hỗ trợ gì về các cuộc thi ảnh phim hoặc kỹ thuật nộp bài hôm nay?',
      time: 'Vừa xong',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChatMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: textToSend, time: now };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let reply = 'Cảm ơn bạn đã nhắn tin! Chuyên viên hỗ trợ của FilmContest đang tiếp nhận thông tin và sẽ phản hồi chi tiết cho bạn ngay.';
      const lower = textToSend.toLowerCase();
      if (lower.includes('quy định') || lower.includes('nộp ảnh')) {
        reply = 'Ảnh dự thi cần được chụp bằng máy ảnh cơ/phim thực tế, cho phép cân bằng sáng cơ bản khi scan, nghiêm cấm chỉnh sửa AI hoặc ghép ảnh.';
      } else if (lower.includes('chấm') || lower.includes('kết quả')) {
        reply = 'Kết quả chấm giải thường được công bố sau khi cổng nhận bài đóng từ 5-7 ngày làm việc trên trang Kho ảnh đạt giải!';
      } else if (lower.includes('nhân viên') || lower.includes('hotline')) {
        reply = 'Bạn có thể gọi trực tiếp tới hotline +84 123 456 789 (8:00 - 22:00) để được hỗ trợ tức thì nhé!';
      }
      setChatMessages((prev) => [
        ...prev,
        { sender: 'bot', text: reply, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
      ]);
    }, 700);
  };

  const handleSendChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendChatMessage(chatInput);
  };

  const faqs: FaqItem[] = [
    {
      id: 1,
      question: 'FilmContest là gì?',
      answer:
        'FilmContest là nền tảng tổ chức và quản lý các cuộc thi nhiếp ảnh phim, nơi người yêu nhiếp ảnh có thể tham gia, chia sẻ tác phẩm, học hỏi kinh nghiệm và tôn vinh giá trị nhiếp ảnh truyền thống. Hệ thống tích hợp công nghệ AI để hỗ trợ nhận diện film stock, kiểm duyệt và đảm bảo tính trung thực của tác phẩm.',
    },
    {
      id: 2,
      question: 'Ai có thể tham gia cuộc thi?',
      answer:
        'Mọi cá nhân có niềm đam mê với nhiếp ảnh phim từ 16 tuổi trở lên, bao gồm cả nhiếp ảnh gia chuyên nghiệp lẫn người mới bắt đầu đều có thể đăng ký tài khoản và tham gia các cuộc thi đang mở.',
    },
    {
      id: 3,
      question: 'Tôi có cần trả phí để tham gia không?',
      answer:
        'Hầu hết các cuộc thi định kỳ và chủ đề cộng đồng trên FilmContest là hoàn toàn MIỄN PHÍ. Một số cuộc thi có sự tài trợ đặc biệt hoặc giải thưởng lớn có thể có quy định riêng được thông báo minh bạch trong thể lệ.',
    },
    {
      id: 4,
      question: 'Chủ đề cuộc thi được quy định như thế nào?',
      answer:
        'Mỗi cuộc thi sẽ có chủ đề rõ ràng (chân dung, phong cảnh, ảnh đời thường, kiến trúc hoặc thể nghiệm). Tác phẩm dự thi cần bám sát tinh thần chủ đề và được chụp bằng máy ảnh cơ/phim quang học.',
    },
    {
      id: 5,
      question: 'Thời gian nộp tác phẩm là bao lâu?',
      answer:
        'Thời gian nhận bài thông thường kéo dài từ 3 đến 6 tuần kể từ ngày công bố. Bạn có thể theo dõi đồng hồ đếm ngược trực tiếp trên trang chi tiết của từng cuộc thi.',
    },
    {
      id: 6,
      question: 'Tôi có thể nộp bao nhiêu tác phẩm cho một cuộc thi?',
      answer:
        'Tùy thể lệ từng cuộc thi, thông thường mỗi tác giả được gửi tối đa từ 3 đến 5 tác phẩm đơn lẻ hoặc 1 bộ ảnh phóng sự/series theo quy định.',
    },
    {
      id: 7,
      question: 'Ảnh dự thi có được chỉnh sửa không?',
      answer:
        'Chỉ cho phép cân bằng sáng, cân chỉnh màu cơ bản và khử bụi khi scan phim. Nghiêm cấm mọi hành vi ghép ảnh làm sai lệch bối cảnh thực tế hoặc sử dụng ảnh do AI tạo sinh.',
    },
    {
      id: 8,
      question: 'Làm thế nào để biết tác phẩm của tôi đã được duyệt?',
      answer:
        'Sau khi gửi bài, hệ thống AI sẽ quét sơ bộ và ban kiểm duyệt sẽ phản hồi kết quả trong vòng 24 - 48 giờ. Bạn sẽ nhận được thông báo trạng thái qua email và chuông thông báo trên tài khoản.',
    },
    {
      id: 9,
      question: 'Kết quả cuộc thi được công bố khi nào?',
      answer:
        'Kết quả chính thức do Ban giám khảo chấm điểm và bình chọn cộng đồng sẽ được công bố vào ngày kết thúc sự kiện, đồng thời vinh danh trong mục "Kho ảnh đạt giải".',
    },
    {
      id: 10,
      question: 'Tôi sẽ nhận giải thưởng như thế nào?',
      answer:
        'Ban tổ chức sẽ liên hệ trực tiếp với thí sinh đoạt giải qua email và số điện thoại đã xác minh để tiến hành trao hiện vật (máy ảnh, cuộn film) hoặc chuyển khoản giải thưởng tiền mặt.',
    },
  ];

  const incrementView = (id: number) => {
    setViewsMap((prev) => {
      const updated = {
        ...prev,
        [id]: (prev[id] || 0) + 1,
      };
      try {
        localStorage.setItem(FAQ_VIEWS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save FAQ views:', err);
      }
      return updated;
    });
    setRecentlyIncrementedId(id);
    setTimeout(() => {
      setRecentlyIncrementedId((current) => (current === id ? null : current));
    }, 1500);
  };

  const handleToggleFaq = (id: number) => {
    if (openId === id) {
      setOpenId(null);
      try {
        localStorage.removeItem(FAQ_OPEN_ID_STORAGE_KEY);
      } catch {}
    } else {
      setOpenId(id);
      try {
        localStorage.setItem(FAQ_OPEN_ID_STORAGE_KEY, id.toString());
      } catch {}
      incrementView(id);
    }
  };

  const handleSelectPopular = (id: number) => {
    setOpenId(id);
    try {
      localStorage.setItem(FAQ_OPEN_ID_STORAGE_KEY, id.toString());
    } catch {}
    incrementView(id);
    const element = document.getElementById(`faq-item-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const formatViews = (count: number) => {
    return count.toLocaleString('vi-VN') + ' lượt xem';
  };

  // Dynamically sort questions by view count
  const sortedFaqs = [...faqs].sort(
    (a, b) => (viewsMap[b.id] || 0) - (viewsMap[a.id] || 0)
  );

  let displayedPopularList: FaqItem[];
  if (showAllPopular) {
    displayedPopularList = sortedFaqs;
  } else {
    const top5 = sortedFaqs.slice(0, 5);
    const isOpenInTop5 = top5.some((item) => item.id === openId);
    if (openId !== null && !isOpenInTop5) {
      const currentActiveItem = faqs.find((f) => f.id === openId);
      displayedPopularList = currentActiveItem
        ? [...sortedFaqs.slice(0, 4), currentActiveItem]
        : top5;
    } else {
      displayedPopularList = top5;
    }
  }

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactModalOpen(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 2000);
  };

  return (
    <section id="faq-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQ Accordion List (8 cols) */}
        <div className="lg:col-span-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
            Câu hỏi thường gặp
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className={`transition-colors ${
                    isOpen ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50/70'
                  }`}
                >
                  <button
                    onClick={() => handleToggleFaq(faq.id)}
                    className="w-full py-4 sm:py-4.5 px-4 sm:px-5 flex items-center justify-between gap-3.5 text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {faq.id}
                      </div>
                      <span
                        className={`text-sm sm:text-base font-bold transition-colors truncate sm:whitespace-normal ${
                          isOpen ? 'text-blue-700' : 'text-slate-800 hover:text-slate-900'
                        }`}
                      >
                        {faq.question}
                      </span>
                    </div>

                    <div className="shrink-0 text-slate-400">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 pl-13 sm:pl-14 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Support & Most Viewed Questions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Support Inquiry Card */}
          <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white rounded-2xl border border-blue-100/90 p-5 sm:p-6 shadow-xs relative overflow-hidden">
            {/* Decorative bubble dots icon */}
            <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-blue-400 blur-xl" />
            </div>

            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                  Bạn vẫn còn thắc mắc?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Đội ngũ hỗ trợ luôn sẵn sàng giải đáp cho bạn.
                </p>
              </div>
            </div>

            {/* Support CTA Button */}
            <button
              onClick={() => setContactModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mb-5"
            >
              <Rocket className="w-4 h-4" />
              <span>Liên hệ hỗ trợ</span>
            </button>

            {/* 3 Contact Channels - All Clickable */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-4 border-t border-blue-100/80 text-center">
              {/* 1. Gửi email */}
              <a
                href="mailto:support@filmcontest.vn?subject=FilmContest%20-%20Y%C3%AAu%20c%E1%BA%A7u%20h%E1%BB%97%20tr%E1%BB%A3"
                className="flex flex-col items-center p-2 rounded-xl hover:bg-white/90 hover:shadow-2xs transition-all cursor-pointer group active:scale-95"
                title="Bấm để gửi email tới support@filmcontest.vn"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-1.5 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-2xs">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Gửi email
                </span>
                <span
                  className="text-[10px] text-slate-400 truncate max-w-[85px] block mt-0.5 group-hover:text-slate-600"
                  title="support@filmcontest.vn"
                >
                  support@filmcon...
                </span>
              </a>

              {/* 2. Chat trực tuyến */}
              <button
                type="button"
                onClick={() => setChatModalOpen(true)}
                className="flex flex-col items-center p-2 rounded-xl hover:bg-white/90 hover:shadow-2xs transition-all cursor-pointer group active:scale-95 w-full"
                title="Bấm để mở khung chat trực tuyến"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-1.5 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-2xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Chat trực tuyến
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 group-hover:text-slate-600">
                  8:00 - 22:00
                </span>
              </button>

              {/* 3. Hotline */}
              <a
                href="tel:+84123456789"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText('+84 123 456 789');
                  }
                  setCopiedHotline(true);
                  setTimeout(() => setCopiedHotline(false), 2500);
                }}
                className="flex flex-col items-center p-2 rounded-xl hover:bg-white/90 hover:shadow-2xs transition-all cursor-pointer group active:scale-95"
                title="Bấm để gọi hotline +84 123 456 789 (hoặc sao chép)"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-1.5 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-2xs">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Hotline
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 group-hover:text-slate-600">
                  {copiedHotline ? 'Đã sao chép!' : '+84 123 456 789'}
                </span>
              </a>
            </div>
          </div>

          {/* Card 2: Most Viewed Questions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                <span>🔥</span>
                <span>Câu hỏi được xem nhiều nhất</span>
              </h3>
              <button
                onClick={() => setShowAllPopular(!showAllPopular)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>{showAllPopular ? 'Thu gọn' : 'Xem tất cả'}</span>
                <ArrowRight className={`w-3 h-3 transition-transform ${showAllPopular ? '-rotate-90' : ''}`} />
              </button>
            </div>

            <div className="space-y-1">
              {displayedPopularList.map((pop, idx) => {
                const count = viewsMap[pop.id] || 0;
                const isRecentlyUpdated = recentlyIncrementedId === pop.id;
                const isCurrentlyOpen = openId === pop.id;
                const title = popularShortTitles[pop.id] || pop.question;

                return (
                  <div
                    key={pop.id}
                    onClick={() => handleSelectPopular(pop.id)}
                    className={`py-2 px-2.5 -mx-2 rounded-xl flex items-center justify-between gap-3 group cursor-pointer transition-all duration-200 ${
                      isCurrentlyOpen ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                          isCurrentlyOpen
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`text-xs truncate transition-colors ${
                          isCurrentlyOpen
                            ? 'text-blue-700 font-bold'
                            : 'text-slate-700 group-hover:text-blue-600 font-medium'
                        }`}
                      >
                        {title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Eye
                        className={`w-3 h-3 transition-all duration-300 ${
                          isRecentlyUpdated ? 'text-blue-600 scale-125' : 'text-slate-400'
                        }`}
                      />
                      <span
                        className={`text-[11px] transition-all duration-300 ${
                          isRecentlyUpdated
                            ? 'text-blue-600 font-black scale-105'
                            : isCurrentlyOpen
                            ? 'text-blue-700 font-bold'
                            : 'text-slate-400 font-medium'
                        }`}
                      >
                        {formatViews(count)}
                      </span>
                      {isRecentlyUpdated && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded shadow-2xs animate-in zoom-in-75 duration-200">
                          +1
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Support Interactive Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {contactSent ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-900 mb-1">Gửi yêu cầu thành công!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Đội ngũ FilmContest đã ghi nhận và sẽ phản hồi qua email của bạn trong thời gian sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">Gửi câu hỏi hỗ trợ</h4>
                    <p className="text-xs text-slate-400">Chúng tôi thường phản hồi trong vòng 15 phút</p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên</label>
                    <input
                      required
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email liên hệ</label>
                    <input
                      required
                      type="email"
                      placeholder="your.email@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung thắc mắc</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Mô tả chi tiết câu hỏi hoặc vấn đề của bạn..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi tin nhắn ngay</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Live Chat Interactive Modal */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 p-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-6 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Hỗ trợ trực tuyến FilmContest
                  </h4>
                  <p className="text-[11px] text-blue-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đang hoạt động (8:00 - 22:00)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setChatModalOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px]">
              <button
                type="button"
                onClick={() => handleSendChatMessage('Quy định nộp ảnh thế nào?')}
                className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium whitespace-nowrap cursor-pointer transition-colors"
              >
                Quy định nộp ảnh?
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage('Thời gian chấm giải khi nào?')}
                className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium whitespace-nowrap cursor-pointer transition-colors"
              >
                Thời gian chấm giải?
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage('Cần gặp nhân viên hỗ trợ')}
                className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium whitespace-nowrap cursor-pointer transition-colors"
              >
                Gặp nhân viên
              </button>
            </div>

            {/* Message Input Footer */}
            <form onSubmit={handleSendChatSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                placeholder="Nhập câu hỏi của bạn..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-2xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification for Hotline Copy */}
      {copiedHotline && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-4 duration-200 border border-slate-700">
          <Phone className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>Đã sao chép hotline: <strong>+84 123 456 789</strong> (Đang chuyển tiếp cuộc gọi...)</span>
        </div>
      )}
    </section>
  );
}
