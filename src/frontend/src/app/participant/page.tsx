import React, { useState, useRef } from 'react';

interface ParticipantPageProps {
  onGoHome?: () => void;
}

interface Contest {
  id: number;
  title: string;
  categories: string[];
  startDate: string;
  endDate: string;
  image: string;
  location: string;
  description: string;
  rules: string[];
}

export default function ParticipantPage({ onGoHome }: ParticipantPageProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'contests' | 'my-registrations' | 'submit' | 'film-roll' | 'my-entries' | 'results'>('dashboard');
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [registeredContestIds, setRegisteredContestIds] = useState<number[]>([1, 2]);

  // Quy trình 4 bước Nộp ảnh
  const [submitStep, setSubmitStep] = useState<number>(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sub-tab cho trang Kết quả (Kết quả của tôi / Lịch sử)
  const [resultsSubTab, setResultsSubTab] = useState<'result' | 'history'>('result');

  // Film Roll
  const filmFileInputRef = useRef<HTMLInputElement | null>(null);
  const [viewingImageModal, setViewingImageModal] = useState<string | null>(null);

  const contestsData: Contest[] = [
    {
      id: 1,
      title: "Analog Moments 2026",
      categories: ["Phong cảnh", "Chân dung", "Đời sống"],
      startDate: "30/11/2026",
      endDate: "10/12/2026",
      image: "images.jpg",
      location: "Online",
      description: "Cuộc thi Analog Moments 2026 là nơi dành cho những người yêu thích nhiếp ảnh phim, cùng nhau lưu giữ những khoảnh khắc chân thực, đậm chất nghệ thuật.",
      rules: ["Tất cả các nhiếp ảnh gia sử dụng máy ảnh phim.", "Không giới hạn độ tuổi."]
    },
    {
      id: 2,
      title: "Film & City",
      categories: ["Đường phố", "Kiến trúc", "Đời sống"],
      startDate: "05/12/2026",
      endDate: "20/12/2026",
      image: "images (3).jpg",
      location: "TP. Hồ Chí Minh & Hà Nội",
      description: "Khám phá nhịp sống đô thị qua ống kính film cổ điển. Tôn vinh vẻ đẹp góc phố, kiến trúc và con người.",
      rules: ["Ảnh chụp trên khổ phim 35mm hoặc Medium Format.", "Yêu cầu cung cấp thông tin Film Roll."]
    },
    {
      id: 3,
      title: "Sony World Photography Awards",
      categories: ["Nghệ thuật", "Chân dung", "Sáng tạo"],
      startDate: "10/12/2026",
      endDate: "30/12/2026",
      image: "images (2).jpg",
      location: "Toàn cầu / Online",
      description: "Hạng mục danh giá tôn vinh các tác phẩm nhiếp ảnh phim xuất sắc nhất toàn cầu năm 2026.",
      rules: ["Chấp nhận mọi dòng máy phim.", "Ảnh quét chất lượng cao tối thiểu 300 DPI."]
    }
  ];

  const toggleRegistration = (contestId: number) => {
    if (registeredContestIds.includes(contestId)) {
      setRegisteredContestIds(registeredContestIds.filter(id => id !== contestId));
    } else {
      setRegisteredContestIds([...registeredContestIds, contestId]);
    }
  };

  const searchResults = contestsData.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans text-base">
      {/* Sidebar */}
      <aside className="w-72 bg-[#004282] text-white p-5 space-y-6 flex-shrink-0 min-h-screen shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-[#1A6EDB] hover:bg-[#155BB8] text-white rounded-xl font-bold text-base transition-all shadow-md"
            >
              <span className="text-xl">🌐</span>
              <span>Về Trang Chủ System</span>
            </button>
          )}

          <div className="flex items-center space-x-3.5 pb-4 border-b border-blue-400/30">
            <div className="w-12 h-12 rounded-full bg-[#1A6EDB] border-2 border-white/40 flex items-center justify-center font-bold text-white text-base shadow-md flex-shrink-0">
              NV
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-base text-white truncate">Nguyễn Văn A</p>
              <p className="text-xs text-blue-200">Nhiếp ảnh gia phim</p>
            </div>
          </div>

          <nav className="space-y-2 text-base font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'dashboard' ? 'bg-[#1A6EDB] text-white shadow-lg font-bold' : 'text-blue-100 hover:bg-blue-800/40'
              }`}
            >
              <span className="text-xl">🏠</span> <span>Tổng quan</span>
            </button>

            <button
              onClick={() => { setActiveTab('contests'); setSelectedContest(null); }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'contests' ? 'bg-[#1A6EDB] text-white shadow-lg font-bold' : 'text-blue-100 hover:bg-blue-800/40'
              }`}
            >
              <span className="text-xl">🏆</span> <span>Cuộc thi</span>
            </button>

            <button
              onClick={() => setActiveTab('my-registrations')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'my-registrations' ? 'bg-[#1A6EDB] text-white shadow-lg font-bold' : 'text-blue-100 hover:bg-blue-800/40'
              }`}
            >
              <span className="text-xl">📍</span> <span>Đăng ký của tôi</span>
            </button>

            <button
              onClick={() => setActiveTab('submit')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'submit' ? 'bg-[#1A6EDB] text-white shadow-lg font-bold' : 'text-blue-100 hover:bg-blue-800/40'
              }`}
            >
              <span className="text-xl">📷</span> <span>Nộp ảnh</span>
            </button>

            <button
              onClick={() => setActiveTab('film-roll')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'film-roll' ? 'bg-[#1A6EDB] text-white shadow-lg font-bold' : 'text-blue-100 hover:bg-blue-800/40'
              }`}
            >
              <span className="text-xl">🎞️</span> <span>Film Roll & Frame</span>
            </button>

            <button
              onClick={() => setActiveTab('my-entries')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'my-entries' ? 'bg-[#1A6EDB] text-white shadow-lg font-bold' : 'text-blue-100 hover:bg-blue-800/40'
              }`}
            >
              <span className="text-xl">🖼️</span> <span>Bài dự thi</span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'results' ? 'bg-[#1A6EDB] text-white shadow-lg font-bold' : 'text-blue-100 hover:bg-blue-800/40'
              }`}
            >
              <span className="text-xl">📊</span> <span>Kết quả</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'profile' ? 'bg-[#1A6EDB] text-white shadow-lg font-bold' : 'text-blue-100 hover:bg-blue-800/40'
              }`}
            >
              <span className="text-xl">👤</span> <span>Hồ sơ cá nhân</span>
            </button>
          </nav>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-center space-y-2 border border-blue-300/30 shadow-lg">
          <div className="text-2xl">⚙️</div>
          <p className="font-bold text-sm text-white leading-tight">Film Photography Smarter with AI</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between gap-6 flex-shrink-0 z-20">
          <div className="relative flex-1 max-w-xl">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm cuộc thi, bài dự thi, nhiếp ảnh gia..."
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />

            {isSearchOpen && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-30">
                <p className="text-xs font-bold text-slate-400 px-3 py-1 uppercase">Gợi ý cuộc thi</p>
                {searchResults.length > 0 ? (
                  searchResults.map((contest) => (
                    <div
                      key={contest.id}
                      onClick={() => {
                        setSelectedContest(contest);
                        setActiveTab('contests');
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-all"
                    >
                      <img src={contest.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-sm text-slate-900">{contest.title}</p>
                        <p className="text-xs text-slate-500">🗓️ {contest.startDate} - {contest.endDate}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-sm text-slate-500 text-center">Không tìm thấy cuộc thi</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-all"
            >
              <span className="text-lg">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>

            {/* Popup Thông báo */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-bold text-slate-900 text-sm">Thông báo hệ thống</h4>
                  <span className="text-xs text-blue-600 font-bold cursor-pointer" onClick={() => setIsNotificationOpen(false)}>Đóng</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="p-2.5 bg-blue-50 rounded-xl">🔹 Cuộc thi <strong>Sony World Photography Awards</strong> đã mở đăng ký!</p>
                  <p className="p-2.5 bg-slate-50 rounded-xl">🔹 Bài dự thi của bạn đã được duyệt bởi AI.</p>
                </div>
              </div>
            )}

            <div className="h-6 w-px bg-slate-200"></div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">Nguyễn Văn A</p>
              <p className="text-xs text-slate-500 font-medium">Participant Portal</p>
            </div>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <div className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* 1. Dashboard / Tổng quan */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h1 className="text-3xl font-extrabold text-slate-900">Xin chào, Nguyễn Văn A! 👋</h1>
                <p className="text-slate-600 text-base mt-2">Cùng khám phá các cuộc thi nhiếp ảnh phim và lưu giữ những khoảnh khắc tuyệt vời.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                  <div 
                    onClick={() => { setActiveTab('contests'); setSelectedContest(null); }}
                    className="p-6 bg-blue-50/70 hover:bg-blue-100/80 rounded-2xl border border-blue-100 flex items-center space-x-4 cursor-pointer transition-all shadow-xs"
                  >
                    <span className="text-3xl">🏆</span>
                    <div>
                      <p className="text-3xl font-extrabold text-blue-900">{contestsData.length}</p>
                      <p className="text-sm font-bold text-blue-600 mt-0.5">Cuộc thi đang mở</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('my-registrations')}
                    className="p-6 bg-sky-50/70 hover:bg-sky-100/80 rounded-2xl border border-sky-100 flex items-center space-x-4 cursor-pointer transition-all shadow-xs"
                  >
                    <span className="text-3xl">📍</span>
                    <div>
                      <p className="text-3xl font-extrabold text-sky-900">{registeredContestIds.length}</p>
                      <p className="text-sm font-bold text-sky-600 mt-0.5">Đã đăng ký</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('my-entries')}
                    className="p-6 bg-amber-50/70 hover:bg-amber-100/80 rounded-2xl border border-amber-100 flex items-center space-x-4 cursor-pointer transition-all shadow-xs"
                  >
                    <span className="text-3xl">⏳</span>
                    <div>
                      <p className="text-3xl font-extrabold text-amber-900">1</p>
                      <p className="text-sm font-bold text-amber-600 mt-0.5">Bài dự thi chờ duyệt</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('my-entries')}
                    className="p-6 bg-indigo-50/70 hover:bg-indigo-100/80 rounded-2xl border border-indigo-100 flex items-center space-x-4 cursor-pointer transition-all shadow-xs"
                  >
                    <span className="text-3xl">📁</span>
                    <div>
                      <p className="text-3xl font-extrabold text-indigo-900">5</p>
                      <p className="text-sm font-bold text-indigo-600 mt-0.5">Tổng bài dự thi</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Cuộc thi đang mở</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">Giai đoạn: 30/11/2026 - 30/12/2026</p>
                    </div>
                    <button onClick={() => { setActiveTab('contests'); setSelectedContest(null); }} className="text-sm font-bold text-blue-600 hover:underline">Xem tất cả →</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {contestsData.map((contest) => {
                      const isRegistered = registeredContestIds.includes(contest.id);
                      return (
                        <div key={contest.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
                          <div>
                            <div className="h-44 bg-slate-200 overflow-hidden relative">
                              <img src={contest.image} alt={contest.title} className="w-full h-full object-cover" />
                              {isRegistered && (
                                <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
                                  ✓ Đã đăng ký
                                </span>
                              )}
                            </div>
                            <div className="p-5 space-y-3">
                              <h3 className="font-bold text-slate-900 text-base truncate">{contest.title}</h3>
                              <div className="flex gap-1.5 flex-wrap">
                                {contest.categories.map((cat, i) => (
                                  <span key={i} className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded text-xs font-semibold border border-blue-100">{cat}</span>
                                ))}
                              </div>
                              <p className="text-xs font-semibold text-slate-500">🗓️ {contest.startDate} - {contest.endDate}</p>
                            </div>
                          </div>
                          <div className="p-5 pt-0">
                            <button
                              onClick={() => {
                                setSelectedContest(contest);
                                setActiveTab('contests');
                              }}
                              className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
                            >
                              {isRegistered ? 'Xem chi tiết' : 'Đăng ký ngay'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">🤖 AI Module</h2>
                  <div className="space-y-4 text-base">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-800 font-semibold">Duplicate check</span>
                      <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">✓ Hoàn tất</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-800 font-semibold">AI-generated detection</span>
                      <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">✓ Hoàn tất</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-800 font-semibold">Auto categorization</span>
                      <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">✓ Hoàn tất</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm">🔔 Thông báo</h3>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="p-3 bg-blue-50/60 rounded-xl">🔹 Cuộc thi <strong>Sony World Photography Awards</strong> đã mở đăng ký!</p>
                      <p className="p-3 bg-slate-50 rounded-xl">🔹 Bài dự thi của bạn đã được kiểm duyệt thành công.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Hồ sơ cá nhân */}
          {activeTab === 'profile' && (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-8">
              <h1 className="text-3xl font-extrabold text-slate-900">Hồ sơ cá nhân</h1>
              <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-200">
                <div className="w-28 h-28 rounded-full bg-blue-600 text-white font-bold text-4xl flex items-center justify-center shadow-lg">NV</div>
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-900">Nguyễn Văn A</h2>
                  <p className="text-base text-slate-600">Nhiếp ảnh gia phim</p>
                  <button className="mt-2 px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50">Chỉnh sửa</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><span className="text-slate-500 font-medium">Email:</span> <span className="font-bold text-slate-900 ml-2">nguyenvana@gmail.com</span></div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><span className="text-slate-500 font-medium">Số điện thoại:</span> <span className="font-bold text-slate-900 ml-2">0901 234 567</span></div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><span className="text-slate-500 font-medium">Địa chỉ:</span> <span className="font-bold text-slate-900 ml-2">Quận 1, TP. Hồ Chí Minh</span></div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><span className="text-slate-500 font-medium">Ngày tham gia:</span> <span className="font-bold text-slate-900 ml-2">15/05/2025</span></div>
              </div>
            </div>
          )}

          {/* 3. Danh sách cuộc thi */}
          {activeTab === 'contests' && (
            <div className="max-w-6xl mx-auto space-y-8">
              {selectedContest === null ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                  <h1 className="text-3xl font-extrabold text-slate-900">Danh sách cuộc thi</h1>
                  <div className="flex gap-3 border-b border-slate-200 pb-4">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-base font-bold shadow-sm">Tất cả cuộc thi</button>
                    <button className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-xl text-base font-bold">Đang mở đăng ký</button>
                  </div>

                  <div className="space-y-6">
                    {contestsData.map((contest) => {
                      const isRegistered = registeredContestIds.includes(contest.id);
                      return (
                        <div key={contest.id} className="p-6 border border-slate-200 rounded-3xl flex flex-col md:flex-row gap-6 items-center bg-white shadow-xs">
                          <div className="w-full md:w-56 h-36 bg-slate-200 rounded-2xl overflow-hidden flex-shrink-0">
                            <img src={contest.image} alt={contest.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-3 w-full">
                            <div className="flex items-center gap-3">
                              <h2 className="font-bold text-slate-900 text-xl">{contest.title}</h2>
                              {isRegistered && (
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">Đã đăng ký</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {contest.categories.map((cat, idx) => (
                                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100 font-bold">{cat}</span>
                              ))}
                            </div>
                            <p className="text-sm font-semibold text-slate-600">🗓️ {contest.startDate} - {contest.endDate}</p>
                          </div>
                          <button
                            onClick={() => setSelectedContest(contest)}
                            className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-base font-bold hover:bg-blue-700 shadow-sm"
                          >
                            Xem chi tiết →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                  <button onClick={() => setSelectedContest(null)} className="text-base font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
                    ← Quay lại danh sách cuộc thi
                  </button>

                  <div className="h-64 bg-slate-200 rounded-3xl overflow-hidden">
                    <img src={selectedContest.image} alt={selectedContest.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-extrabold text-slate-900">{selectedContest.title}</h2>
                    <p className="text-base text-slate-600 mt-1">{selectedContest.description}</p>
                  </div>

                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h3 className="font-bold text-slate-900 text-base">Thể lệ cuộc thi:</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-base">
                      {selectedContest.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    {registeredContestIds.includes(selectedContest.id) ? (
                      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                        <span className="text-base font-bold text-emerald-900">✅ Bạn đã đăng ký thành công cuộc thi này!</span>
                        <div className="flex gap-3">
                          <button
                            onClick={() => toggleRegistration(selectedContest.id)}
                            className="px-6 py-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl text-sm font-bold transition-all"
                          >
                            Hủy đăng ký
                          </button>
                          <button
                            onClick={() => setActiveTab('submit')}
                            className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-bold transition-all shadow-sm"
                          >
                            Nộp bài ngay
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleRegistration(selectedContest.id)}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-md"
                      >
                        Đăng ký tham gia ngay
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Đăng ký của tôi */}
          {activeTab === 'my-registrations' && (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-8">
              <h1 className="text-3xl font-extrabold text-slate-900">Cuộc thi tôi đã đăng ký</h1>
              <div className="space-y-6">
                {contestsData
                  .filter(c => registeredContestIds.includes(c.id))
                  .map(contest => (
                    <div key={contest.id} className="p-6 border border-slate-200 rounded-2xl flex justify-between items-center bg-white shadow-xs">
                      <div className="flex items-center gap-6">
                        <img src={contest.image} alt="" className="w-24 h-24 rounded-xl object-cover" />
                        <div>
                          <h2 className="font-bold text-slate-900 text-xl">{contest.title}</h2>
                          <p className="text-sm text-slate-500 mt-1">🗓️ {contest.startDate} - {contest.endDate}</p>
                          <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Trạng thái: Đã xác nhận</span>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('submit')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">Nộp bài dự thi</button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 5. Nộp ảnh dự thi (Theo chuẩn 4 bước trên ảnh) */}
          {activeTab === 'submit' && (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-8">
              <div className="flex justify-between items-center border-b pb-6">
                <h1 className="text-3xl font-extrabold text-slate-900">Nộp ảnh dự thi</h1>
                <span className="text-sm font-bold text-blue-600">Bước {submitStep} / 4</span>
              </div>

              {/* Tiến trình 4 bước */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                <div className={`p-2 rounded-lg ${submitStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>1. Thông tin cuộc thi</div>
                <div className={`p-2 rounded-lg ${submitStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>2. Thông tin ảnh</div>
                <div className={`p-2 rounded-lg ${submitStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>3. Metadata</div>
                <div className={`p-2 rounded-lg ${submitStep === 4 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>4. Xác nhận</div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {submitStep === 1 && (
                <div className="space-y-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Chọn cuộc thi đã đăng ký thành công</label>
                  <select className="w-full p-4 border rounded-xl text-base bg-white font-semibold">
                    {contestsData
                      .filter(c => registeredContestIds.includes(c.id))
                      .map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              )}

              {submitStep === 2 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-3 border-dashed border-blue-300 bg-blue-50/50 rounded-3xl p-10 text-center space-y-4 cursor-pointer hover:bg-blue-100/50 transition-all"
                >
                  {uploadedImage ? (
                    <div className="flex flex-col items-center">
                      <img src={uploadedImage} alt="Preview" className="max-h-64 rounded-xl shadow-lg mb-3" />
                      <p className="text-sm font-bold text-emerald-700">✓ Chọn ảnh thành công!</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-5xl">📤</div>
                      <p className="text-lg font-bold text-slate-800">Tải lên ảnh scan phim từ máy tính</p>
                      <p className="text-sm text-slate-600">Định dạng JPG, PNG, TIFF - Tối đa 10MB</p>
                      <button className="px-8 py-3.5 bg-blue-600 text-white rounded-xl text-base font-bold shadow-md">Chọn ảnh</button>
                    </>
                  )}
                </div>
              )}

              {submitStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                  <div><label className="font-bold text-sm">Film Brand</label><input type="text" defaultValue="Kodak Portra 400" className="w-full p-3 border rounded-xl mt-1" /></div>
                  <div><label className="font-bold text-sm">ISO</label><input type="text" defaultValue="400" className="w-full p-3 border rounded-xl mt-1" /></div>
                  <div><label className="font-bold text-sm">Camera Body</label><input type="text" defaultValue="Canon AE-1" className="w-full p-3 border rounded-xl mt-1" /></div>
                  <div><label className="font-bold text-sm">Lens</label><input type="text" defaultValue="50mm f/1.8" className="w-full p-3 border rounded-xl mt-1" /></div>
                </div>
              )}

              {submitStep === 4 && (
                <div className="p-6 bg-slate-50 border rounded-2xl text-center space-y-3">
                  <h3 className="font-bold text-xl text-slate-900">Xác nhận thông tin nộp bài dự thi</h3>
                  <p className="text-slate-600 text-sm">Mọi thông tin kỹ thuật và ảnh đã được AI kiểm duyệt thành công.</p>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t">
                {submitStep > 1 ? (
                  <button onClick={() => setSubmitStep(submitStep - 1)} className="px-6 py-3 bg-slate-200 rounded-xl font-bold">Quay lại</button>
                ) : <div></div>}
                
                {submitStep < 4 ? (
                  <button onClick={() => setSubmitStep(submitStep + 1)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">Tiếp tục →</button>
                ) : (
                  <button onClick={() => { alert("Đã nộp bài thành công!"); setActiveTab('my-entries'); }} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold">Xác nhận gửi bài</button>
                )}
              </div>
            </div>
          )}

          {/* 6. Film Roll & Frame */}
          {activeTab === 'film-roll' && (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-8">
              <input type="file" ref={filmFileInputRef} onChange={() => alert("Đã thêm cuộn phim mới!")} multiple accept="image/*" className="hidden" />

              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900">Quản lý Film Roll & Frame</h1>
                <button onClick={() => filmFileInputRef.current?.click()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md">+ Thêm cuộn phim</button>
              </div>

              <div className="p-8 border rounded-3xl bg-slate-50 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-slate-900 text-xl">Roll #001 - Kodak Portra 400</h2>
                    <p className="text-sm text-slate-600">36 frame • 35mm • Canon AE-1</p>
                  </div>
                  <span className="text-sm bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full font-bold">Đang sử dụng</span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-3">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} onClick={() => setViewingImageModal(`Frame #${i + 1}`)} className="h-12 bg-white border rounded-xl flex items-center justify-center font-bold cursor-pointer hover:bg-blue-50">
                      {i + 1 < 10 ? `0${i + 1}` : i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {viewingImageModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white p-8 rounded-3xl max-w-lg w-full space-y-6 text-center shadow-2xl">
                    <h3 className="font-bold text-xl">{viewingImageModal}</h3>
                    <div className="h-64 bg-slate-200 rounded-2xl flex items-center justify-center"><img src="images.jpg" alt="" className="w-full h-full object-cover rounded-xl" /></div>
                    <button onClick={() => setViewingImageModal(null)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Đóng</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. Bài dự thi của tôi */}
          {activeTab === 'my-entries' && (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-8">
              <h1 className="text-3xl font-extrabold text-slate-900">Bài dự thi của tôi</h1>
              <div className="p-6 border rounded-2xl flex justify-between items-center bg-white shadow-xs">
                <div className="flex gap-6 items-center">
                  <img src="images.jpg" alt="" className="w-24 h-24 rounded-xl object-cover" />
                  <div>
                    <h2 className="font-bold text-slate-900 text-xl">Khoảnh khắc chân dung</h2>
                    <p className="text-sm text-slate-600">Cuộc thi: Analog Moments 2026</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">🗓️ Nộp ngày: 01/12/2026</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-amber-50 text-amber-800 border rounded-full text-sm font-bold">Đang chờ duyệt</span>
              </div>
            </div>
          )}

          {/* 8. Kết quả và Phản hồi (Bổ sung Nhận xét của giám khảo + Lịch sử) */}
          {activeTab === 'results' && (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-8">
              {/* Sub-tab Kết quả của tôi / Lịch sử */}
              <div className="flex gap-4 border-b pb-4">
                <button onClick={() => setResultsSubTab('result')} className={`px-6 py-2.5 rounded-xl font-bold text-base ${resultsSubTab === 'result' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Kết quả của tôi</button>
                <button onClick={() => setResultsSubTab('history')} className={`px-6 py-2.5 rounded-xl font-bold text-base ${resultsSubTab === 'history' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Lịch sử thi</button>
              </div>

              {resultsSubTab === 'result' ? (
                <div className="space-y-8">
                  <div className="text-center space-y-3 border-b pb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">Kết quả cuộc thi</h1>
                    <p className="text-base text-slate-600">Sony World Photography Awards</p>
                    <div className="inline-block px-8 py-3 bg-amber-50 text-amber-900 border rounded-full font-extrabold text-xl mt-2">
                      🏆 Giải Nhất (Hạng 1 / 25) • Điểm tổng: 86.5/100
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="font-bold text-slate-900 text-base">Chi tiết điểm đánh giá từ Giám khảo</h2>
                    <div className="space-y-3 text-base">
                      <div className="flex justify-between py-3 border-b"><span>Bố cục</span><span className="font-bold">18.5 / 20</span></div>
                      <div className="flex justify-between py-3 border-b"><span>Ánh sáng</span><span className="font-bold">17.5 / 20</span></div>
                      <div className="flex justify-between py-3 border-b"><span>Nội dung</span><span className="font-bold">17.0 / 20</span></div>
                      <div className="flex justify-between py-3 border-b"><span>Kỹ thuật (film & scan)</span><span className="font-bold">16.5 / 20</span></div>
                      <div className="flex justify-between py-3"><span>Tính sáng tạo</span><span className="font-bold">17.0 / 20</span></div>
                    </div>
                  </div>

                  {/* Nhận xét của giám khảo */}
                  <div className="bg-slate-50 p-6 rounded-2xl border space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Nhận xét của giám khảo</h3>
                    <p className="text-base text-slate-700 italic">"Bức ảnh có bố cục tốt, ánh sáng hài hòa và thể hiện được cảm xúc rất chân thực."</p>
                    <p className="text-sm text-slate-500 text-right font-bold">— Giám khảo: Lê Minh Tuấn</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">Lịch sử tham gia các mùa giải trước</h2>
                  <div className="p-4 border rounded-2xl flex justify-between items-center bg-slate-50">
                    <div>
                      <p className="font-bold text-base text-slate-800">Analog Moments 2025</p>
                      <p className="text-xs text-slate-500">Đạt giải Nhì • Điểm: 84.0/100</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">Đã hoàn thành</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}