import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit3, Plus, Sparkles, Trophy, CheckCircle2, ArrowRight, ExternalLink, Users, MessageSquare, X, Send, Award, Film, Image as ImageIcon, Trash2 } from 'lucide-react';

interface ParticipantEntryItem {
  id?: string;
  contestTitle?: string;
  title?: string;
  status?: string;
  submittedAt?: string;
  description?: string;
}

interface ContestDetail {
  id: string;
  title: string;
  artworkTitle?: string;
  role: string;
  status: string;
  date: string;
  badge: string;
  description: string;
  artisticConcept: string;
  rules: string;
  prizePool: string;
}

interface AchievementDetail {
  id: string;
  title: string;
  contest: string;
  prize: string;
  date: string;
  description: string;
  issuedBy: string;
}

interface FriendItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  mutualContests: number;
  email: string;
  phone: string;
  equipment: string;
  bio: string;
  recentPhotos: string[];
}

export function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [selectedContest, setSelectedContest] = useState<ContestDetail | null>(null);
  const [selectedAward, setSelectedAward] = useState<AchievementDetail | null>(null);
  const [chatFriend, setChatFriend] = useState<FriendItem | null>(null);
  const [viewProfileFriend, setViewProfileFriend] = useState<FriendItem | null>(null);

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const [profile, setProfile] = useState({
    name: 'Hồ Thanh Bình',
    role: 'Nhiếp ảnh gia phim',
    email: 'hothanhbinh.film@gmail.com',
    phone: '0348498595',
    address: 'Quận 1, TP. Hồ Chí Minh',
    joinDate: '15/05/2025',
    equipment: 'Leica M6, Canon AE-1, Nikon FM2',
    bio: 'Nhiếp ảnh gia phim nghiệp dư, đam mê hệ máy Leica và dòng phim màu Kodak Portra.',
    avatarUrl: ''
  });

  const [portfolioImages, setPortfolioImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80'
  ]);

  const [joinedContests, setJoinedContests] = useState<ContestDetail[]>([]);
  const [achievements, setAchievements] = useState<AchievementDetail[]>([]);

  useEffect(() => {
    const loadProfileData = () => {
      try {
        const savedProfile = localStorage.getItem('participant_profile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setProfile(prev => ({ ...prev, ...parsed }));
        }
        const savedPortfolio = localStorage.getItem('participant_portfolio');
        if (savedPortfolio) {
          const parsedPortfolio = JSON.parse(savedPortfolio);
          if (Array.isArray(parsedPortfolio)) {
            setPortfolioImages(parsedPortfolio);
          }
        }

        const savedEntries = localStorage.getItem('participant_entries');
        if (savedEntries) {
          const parsed: ParticipantEntryItem[] = JSON.parse(savedEntries);
          if (Array.isArray(parsed)) {
            const graded = parsed.filter((item: ParticipantEntryItem) => item.status === 'Đã chấm');

            const mappedContests: ContestDetail[] = graded.map((item: ParticipantEntryItem, idx: number) => ({
              id: item.id || `graded-${idx}`,
              title: item.contestTitle || 'CUỘC THI PHIM ANALOG',
              artworkTitle: item.title,
              role: 'Thí sinh dự thi chính thức',
              status: 'Đã hoàn thành',
              date: item.submittedAt ? `Tháng ${item.submittedAt.slice(3)}` : 'Tháng 10/2026',
              badge: 'Completed',
              description: item.description || 'Tác phẩm đã hoàn thành quá trình chấm điểm từ hội đồng giám khảo.',
              artisticConcept: 'Nhiếp ảnh phim truyền thống nguyên bản.',
              rules: 'Tuân thủ quy chế kỹ thuật phòng tối.',
              prizePool: 'Đã hoàn thành chấm điểm chính thức'
            }));

            const mappedAchievements: AchievementDetail[] = graded.map((item: ParticipantEntryItem, idx: number) => ({
              id: `ach-${idx}`,
              title: `Tác phẩm: ${item.title || 'Không tên'}`,
              contest: item.contestTitle || 'CUỘC THI PHIM ANALOG',
              prize: 'Đã hoàn thành chấm điểm • Top Đánh Giá',
              date: '2026',
              description: item.description || 'Được hội đồng giám khảo đánh giá cao về mặt cảm xúc.',
              issuedBy: 'Hội đồng Giám khảo'
            }));

            const defaultBaSonContest: ContestDetail = {
              id: 'res-01',
              title: 'ANALOG MOMENTS 2025',
              artworkTitle: 'Hoàng Hôn Cầu Ba Son',
              role: 'Thí sinh dự thi chính thức',
              status: 'Đã hoàn thành',
              date: 'Tháng 06/2025',
              badge: 'Completed',
              description: 'Cuộc thi nhiếp ảnh phim nhựa quy mô lớn nhất năm 2025, tìm kiếm những khoảnh khắc chân thực và cảm xúc nhất.',
              artisticConcept: 'Tôn vinh hạt film (grain), độ tương phản và nghệ thuật kể chuyện.',
              rules: 'Sử dụng máy ảnh phim analog (35mm, Medium Format).',
              prizePool: 'Giải Nhì • 15,000,000 VNĐ'
            };

            const defaultBaSonAchievement: AchievementDetail = {
              id: 'a1',
              title: 'Giải Nhì - Hoàng Hôn Cầu Ba Son',
              contest: 'ANALOG MOMENTS 2025',
              prize: 'Hạng 2 / 25 • Điểm: 86.5 / 100',
              date: '2025',
              description: 'Tác phẩm có bố cục tốt, ánh sáng hài hòa và thể hiện được cảm xúc rất chân thực.',
              issuedBy: 'Ban Tổ Chức Analog Moments'
            };

            const finalContests = [defaultBaSonContest, ...mappedContests];
            const finalAchievements = [defaultBaSonAchievement, ...mappedAchievements];

            setJoinedContests(finalContests);
            setAchievements(finalAchievements);
          }
        } else {
          setJoinedContests([
            {
              id: 'res-01',
              title: 'ANALOG MOMENTS 2025',
              artworkTitle: 'Hoàng Hôn Cầu Ba Son',
              role: 'Thí sinh dự thi chính thức',
              status: 'Đã hoàn thành',
              date: 'Tháng 06/2025',
              badge: 'Completed',
              description: 'Cuộc thi nhiếp ảnh phim nhựa quy mô lớn nhất năm 2025, tìm kiếm những khoảnh khắc chân thực và cảm xúc nhất.',
              artisticConcept: 'Tôn vinh hạt film (grain), độ tương phản và nghệ thuật kể chuyện.',
              rules: 'Sử dụng máy ảnh phim analog (35mm, Medium Format).',
              prizePool: 'Giải Nhì • 15,000,000 VNĐ'
            }
          ]);
          setAchievements([
            {
              id: 'a1',
              title: 'Giải Nhì - Hoàng Hôn Cầu Ba Son',
              contest: 'ANALOG MOMENTS 2025',
              prize: 'Hạng 2 / 25 • Điểm: 86.5 / 100',
              date: '2025',
              description: 'Tác phẩm có bố cục tốt, ánh sáng hài hòa và thể hiện được cảm xúc rất chân thực.',
              issuedBy: 'Ban Tổ Chức Analog Moments'
            }
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadProfileData();
    window.addEventListener('storage', loadProfileData);
    window.addEventListener('avatarChanged', loadProfileData);

    return () => {
      window.removeEventListener('storage', loadProfileData);
      window.removeEventListener('avatarChanged', loadProfileData);
    };
  }, []);

  const [friendsList] = useState<FriendItem[]>([
    {
      id: 'f1',
      name: 'Nguyễn Minh Khôi',
      role: 'Chuyên gia rửa phim B&W',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
      status: 'Đang hoạt động',
      mutualContests: 2,
      email: 'khoi.bw@gmail.com',
      phone: '0901234567',
      equipment: 'Leica M3, Hasselblad 500CM',
      bio: 'Đam mê hoài cổ với nghệ thuật tráng phim thủ công đen trắng.',
      recentPhotos: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'f2',
      name: 'Trần Hải Nam',
      role: 'Nhiếp ảnh gia Street Life',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80',
      status: 'Hoạt động 2 giờ trước',
      mutualContests: 1,
      email: 'hainam.street@gmail.com',
      phone: '0918888999',
      equipment: 'Contax T2, Leica MP',
      bio: 'Săn tìm những khoảnh khắc đời thường qua ống kính rangefinder.',
      recentPhotos: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80'
      ]
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    localStorage.setItem('participant_profile', JSON.stringify(profile));
    localStorage.setItem('participant_user_name', profile.name);
    window.dispatchEvent(new Event('userNameChanged'));
    showToast('Đã cập nhật thông tin hồ sơ cá nhân thành công!');
  };

  const compressImage = (file: File, callback: (result: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        callback(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      compressImage(file, (compressedBase64) => {
        const updatedProfile = { ...profile, avatarUrl: compressedBase64 };
        setProfile(updatedProfile);

        localStorage.setItem('participant_profile', JSON.stringify(updatedProfile));
        localStorage.setItem('participant_avatar', compressedBase64);
        localStorage.setItem('participant_user_name', profile.name);

        window.dispatchEvent(new Event('avatarChanged'));
        window.dispatchEvent(new Event('userNameChanged'));
        showToast('Đã cập nhật và lưu vĩnh viễn ảnh đại diện!');
      });
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedProfile = { ...profile, avatarUrl: '' };
    setProfile(updatedProfile);
    localStorage.setItem('participant_profile', JSON.stringify(updatedProfile));
    localStorage.removeItem('participant_avatar');
    window.dispatchEvent(new Event('avatarChanged'));
    window.dispatchEvent(new Event('userNameChanged'));
    showToast('Đã xóa ảnh đại diện!');
  };

  const handleAddPortfolioImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      compressImage(file, (compressedBase64) => {
        const updatedList = [compressedBase64, ...portfolioImages];
        setPortfolioImages(updatedList);
        localStorage.setItem('participant_portfolio', JSON.stringify(updatedList));
        showToast('Đã thêm ảnh vào Portfolio và lưu thành công!');
      });
    }
  };

  const handleRemovePortfolioImage = (indexToRemove: number) => {
    const updatedList = portfolioImages.filter((_, idx) => idx !== indexToRemove);
    setPortfolioImages(updatedList);
    localStorage.setItem('participant_portfolio', JSON.stringify(updatedList));
    showToast('Đã xóa ảnh khỏi Portfolio!');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, `Bạn: ${chatMessage}`]);
    setChatMessage('');
  };

  return (
    <div className="space-y-8 w-full px-4 md:px-10 pb-20 font-sans text-slate-900 relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 w-full">
        <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
          ● PARTICIPANT PROFILE & NETWORK
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Hồ Sơ Cá Nhân & Mạng Lưới Bạn Bè</h1>
        <p className="text-base text-slate-500 font-medium">Quản lý toàn diện thông tin định danh, portfolio, cuộc thi, thành tích và kết nối cùng cộng đồng nhiếp ảnh gia.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 w-full">
            <div className="flex flex-col items-center text-center space-y-4 pb-6 border-b border-slate-100">

              <div className="relative group cursor-pointer" title="Click để thay đổi ảnh đại diện">
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-slate-100 bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile.name.charAt(0)
                  )}
                </div>

                <div
                  onClick={() => document.getElementById('avatar-input')?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
                >
                  <Camera className="w-8 h-8" />
                </div>

                {profile.avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    title="Xóa ảnh đại diện"
                    className="absolute top-0 right-0 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 z-10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">{profile.name}</h2>
                <p className="text-sm font-extrabold text-blue-600 uppercase tracking-wider">{profile.role}</p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-sm rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-sm"
              >
                <Edit3 className="w-4 h-4" /> {isEditing ? 'Đang chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
              </button>
            </div>

            <div className="space-y-4 text-sm font-bold text-slate-700">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="flex items-center gap-3 text-slate-400"><Mail className="w-5 h-5 text-blue-600" /> Email</span>
                <span className="font-extrabold text-slate-900">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="flex items-center gap-3 text-slate-400"><Phone className="w-5 h-5 text-blue-600" /> Số điện thoại</span>
                <span className="font-extrabold text-slate-900">{profile.phone}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="flex items-center gap-3 text-slate-400"><MapPin className="w-5 h-5 text-blue-600" /> Địa chỉ</span>
                <span className="font-extrabold text-slate-900">{profile.address}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="flex items-center gap-3 text-slate-400"><Calendar className="w-5 h-5 text-blue-600" /> Ngày tham gia</span>
                <span className="font-extrabold text-slate-900">{profile.joinDate}</span>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 space-y-2">
              <p className="text-xs font-black uppercase text-indigo-700 tracking-wider">Thiết bị sở hữu (Camera / Lens)</p>
              <p className="text-sm font-extrabold text-indigo-950">{profile.equipment}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">

          {isEditing && (
            <div className="bg-white p-8 rounded-3xl border border-blue-300 shadow-md space-y-6 animate-fade-in w-full">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-slate-900 text-xl">Cập Nhật Thông Tin Hồ Sơ</h3>
                <button onClick={() => setIsEditing(false)} className="text-sm font-bold text-slate-400 hover:text-slate-700 cursor-pointer">Đóng</button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-sm font-bold">
                <div className="space-y-2">
                  <label className="text-slate-500 uppercase text-xs">Họ và tên *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 font-extrabold text-slate-900 text-base"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-slate-500 uppercase text-xs">Email liên hệ *</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 font-extrabold text-slate-900 text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-500 uppercase text-xs">Số điện thoại *</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 font-extrabold text-slate-900 text-base"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-slate-500 uppercase text-xs">Thiết bị sở hữu (Camera / Lens)</label>
                  <input
                    type="text"
                    value={profile.equipment}
                    onChange={(e) => setProfile({...profile, equipment: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 font-extrabold text-slate-900 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-500 uppercase text-xs">Tiểu sử ngắn / Giới thiệu</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium text-slate-700 text-base"
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-lg transition cursor-pointer active:scale-95">
                  Lưu Thay Đổi Hồ Sơ
                </button>
              </form>
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 w-full">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 text-2xl">Portfolio Của Tôi</h3>
                <p className="text-sm text-slate-400 font-medium">Bộ sưu tập tác phẩm nhiếp ảnh film tiêu biểu</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {portfolioImages.map((imgUrl, index) => (
                <div key={index} className="relative h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group bg-slate-100">
                  <img src={imgUrl} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />

                  <button
                    onClick={() => handleRemovePortfolioImage(index)}
                    title="Xóa ảnh này"
                    className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <label className="h-56 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-blue-600 transition cursor-pointer active:scale-95">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-200">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-black">Thêm ảnh</span>
                <input type="file" accept="image/*" onChange={handleAddPortfolioImage} className="hidden" />
              </label>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 w-full">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 text-2xl">Bạn Bè & Đồng Nghiệp Nhiếp Ảnh</h3>
                <p className="text-sm text-slate-400 font-medium">Kết nối với các nhiếp ảnh gia phim khác trong hệ thống</p>
              </div>
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-full border border-indigo-200 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {friendsList.length} bạn bè
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friendsList.map((friend) => (
                <div key={friend.id} className="p-5 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl border border-slate-200 transition flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                      <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-base text-slate-900">{friend.name}</h4>
                      <p className="text-xs font-bold text-blue-600">{friend.role}</p>
                      <p className="text-[11px] font-semibold text-slate-400">{friend.status} • Chung {friend.mutualContests} cuộc thi</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChatFriend(friend)}
                      title="Nhắn tin"
                      className="p-2.5 bg-white hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewProfileFriend(friend)}
                      title="Xem hồ sơ"
                      className="p-2.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 w-full">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 text-2xl">Cuộc Thi Đã Tham Gia</h3>
                <p className="text-sm text-slate-400 font-medium">Danh sách các cuộc thi nhiếp ảnh phim bạn đã tham gia và có kết quả</p>
              </div>
              <span className="px-4 py-1.5 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-full border border-blue-200">
                {joinedContests.length} cuộc thi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedContests.map((contest) => (
                <div key={contest.id} className="p-6 bg-slate-50 hover:bg-blue-50/40 rounded-2xl border border-slate-200 transition flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black uppercase text-blue-600">{contest.date}</span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-700">
                        {contest.status}
                      </span>
                    </div>
                    <h4 className="font-black text-lg text-slate-900">{contest.title}</h4>
                    <p className="text-xs font-extrabold text-blue-600">Tác phẩm: {contest.artworkTitle}</p>
                    <p className="text-xs font-semibold text-slate-500">Vai trò: {contest.role}</p>
                  </div>

                  <button
                    onClick={() => setSelectedContest(contest)}
                    className="w-full py-2.5 bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    Xem chi tiết cuộc thi <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 w-full">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 text-2xl">Giải Thưởng & Thành Tích</h3>
                <p className="text-sm text-slate-400 font-medium">Các huy hiệu, giải thưởng và chứng nhận đạt được từ kết quả cuộc thi</p>
              </div>
              <Trophy className="w-7 h-7 text-amber-500" />
            </div>

            <div className="space-y-4">
              {achievements.map((item) => (
                <div key={item.id} className="p-5 bg-gradient-to-r from-amber-50/50 via-yellow-50/30 to-white rounded-2xl border border-amber-200/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-base text-slate-900">{item.title}</h4>
                      <p className="text-xs font-bold text-slate-500">Thuộc cuộc thi: <span className="text-blue-600">{item.contest}</span> ({item.date})</p>
                      <p className="text-xs font-extrabold text-amber-700 bg-amber-100/60 px-2.5 py-0.5 rounded-md inline-block">Phần thưởng: {item.prize}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAward(item)}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md flex-shrink-0"
                  >
                    Xem chứng nhận <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 w-full">
            <h3 className="font-black text-slate-900 text-lg">Giới Thiệu Bản Thân</h3>
            <p className="text-sm md:text-base text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed italic">
              "{profile.bio}"
            </p>
          </div>

        </div>

      </div>

      {selectedContest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
            <div className="p-8 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex justify-between items-center flex-shrink-0">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase bg-white/20 px-3.5 py-1 rounded-full text-blue-100 tracking-wider">
                  {selectedContest.date} ● {selectedContest.status}
                </span>
                <h2 className="text-3xl font-black">{selectedContest.title}</h2>
              </div>
              <button onClick={() => setSelectedContest(null)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <p className="text-xs font-black uppercase text-blue-600 tracking-wider">Vai trò tham gia</p>
                  <p className="text-lg font-black text-slate-900">{selectedContest.role}</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <p className="text-xs font-black uppercase text-amber-600 tracking-wider">Kết quả & Giải thưởng</p>
                  <p className="text-lg font-black text-slate-900">{selectedContest.prizePool}</p>
                </div>
              </div>

              <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Film className="w-6 h-6 text-blue-600" /> Tổng quan nghệ thuật cuộc thi
                </h3>
                <p className="text-base text-slate-700 leading-relaxed font-medium">{selectedContest.description}</p>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-200 flex justify-end flex-shrink-0">
              <button onClick={() => setSelectedContest(null)} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg transition cursor-pointer">
                Đóng thông tin
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAward && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-slate-200 p-8 space-y-6 animate-fade-in text-center relative">
            <div className="flex justify-end">
              <button onClick={() => setSelectedAward(null)} className="p-2.5 hover:bg-slate-100 rounded-full cursor-pointer"><X className="w-6 h-6 text-slate-500" /></button>
            </div>
            <div className="w-24 h-24 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-12 h-12" />
            </div>
            <div className="space-y-3">
              <span className="text-xs font-black uppercase bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full border border-amber-200 tracking-wider">Chứng nhận chính thức</span>
              <h2 className="text-3xl font-black text-slate-900">{selectedAward.title}</h2>
              <p className="text-sm font-bold text-slate-500">Cuộc thi: <span className="text-blue-600">{selectedAward.contest}</span> ({selectedAward.date})</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-100 leading-relaxed">{selectedAward.description}</p>
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <p className="text-xs font-black uppercase text-amber-800 tracking-wider">Cấp bởi</p>
                <p className="text-sm font-black text-amber-950">{selectedAward.issuedBy}</p>
              </div>
            </div>
            <button onClick={() => setSelectedAward(null)} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-base rounded-2xl shadow-lg transition cursor-pointer">
              Đã xem chứng nhận
            </button>
          </div>
        </div>
      )}

      {viewProfileFriend && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <img src={viewProfileFriend.avatar} alt={viewProfileFriend.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                <div>
                  <h3 className="text-xl font-black">{viewProfileFriend.name}</h3>
                  <p className="text-xs text-blue-300">{viewProfileFriend.role}</p>
                </div>
              </div>
              <button onClick={() => setViewProfileFriend(null)} className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-400">Email liên hệ</span>
                  <p className="text-slate-900 font-extrabold">{viewProfileFriend.email}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-400">Số điện thoại</span>
                  <p className="text-slate-900 font-extrabold">{viewProfileFriend.phone}</p>
                </div>
              </div>

              <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-1">
                <p className="text-xs font-black uppercase text-indigo-700">Thiết bị sở hữu</p>
                <p className="text-sm font-extrabold text-indigo-950">{viewProfileFriend.equipment}</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs font-black uppercase text-slate-400">Giới thiệu bản thân</p>
                <p className="text-sm text-slate-700 italic">"{viewProfileFriend.bio}"</p>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-200 flex justify-end flex-shrink-0">
              <button onClick={() => setViewProfileFriend(null)} className="px-6 py-3 bg-slate-900 text-white font-black text-xs rounded-xl cursor-pointer">
                Đóng trang cá nhân
              </button>
            </div>
          </div>
        </div>
      )}

      {chatFriend && (
        <div className="fixed bottom-6 right-6 z-50 bg-white w-96 rounded-[28px] shadow-2xl border border-slate-200 flex flex-col h-[520px] overflow-hidden animate-fade-in">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <img src={chatFriend.avatar} alt={chatFriend.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
              <div>
                <h4 className="font-bold text-sm">{chatFriend.name}</h4>
                <p className="text-[10px] text-emerald-400">{chatFriend.status}</p>
              </div>
            </div>
            <button onClick={() => setChatFriend(null)} className="p-1.5 hover:bg-slate-800 rounded-full cursor-pointer"><X className="w-5 h-5 text-white" /></button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-700 shadow-sm max-w-[85%]">
              Xin chào! Rất vui được trò chuyện cùng bạn về nhiếp ảnh film.
            </div>
            {chatHistory.map((msg, idx) => (
              <div key={idx} className="p-3 bg-blue-600 text-white rounded-2xl text-xs shadow-sm max-w-[85%] ml-auto">
                {msg}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}