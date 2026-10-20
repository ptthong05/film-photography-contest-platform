import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, CheckCircle2 } from 'lucide-react';

export function ProfileTab() {
  const [fullName, setFullName] = useState<string>('Nguyễn Văn A');
  const [email, setEmail] = useState<string>('thien@gmail.com');
  const [phone, setPhone] = useState<string>('0348498595');
  const [equipment, setEquipment] = useState<string>('Leica M6, Canon AE-1, Nikon FM2');
  const [bio, setBio] = useState<string>('Nhiếp ảnh gia phim nghiệp dư, đam mê hệ máy Leica và dòng phim màu Kodak Portra.');
  const [successMessage, setSuccessMessage] = useState<boolean>(false);

  useEffect(() => {
    const savedName = localStorage.getItem('participant_user_name');
    const savedEmail = localStorage.getItem('participant_user_email');
    const savedPhone = localStorage.getItem('participant_user_phone');
    const savedEq = localStorage.getItem('participant_user_equipment');
    const savedBio = localStorage.getItem('participant_user_bio');

    if (savedName) setFullName(savedName);
    if (savedEmail) setEmail(savedEmail);
    if (savedPhone) setPhone(savedPhone);
    if (savedEq) setEquipment(savedEq);
    if (savedBio) setBio(savedBio);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Lưu thông tin vào bộ nhớ trình duyệt
    localStorage.setItem('participant_user_name', fullName);
    localStorage.setItem('participant_user_email', email);
    localStorage.setItem('participant_user_phone', phone);
    localStorage.setItem('participant_user_equipment', equipment);
    localStorage.setItem('participant_user_bio', bio);

    // Kích hoạt tín hiệu để cập nhật ngay lập tức tên ở thanh tiêu đề bên trên
    window.dispatchEvent(new Event('userNameChanged'));

    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Quản Lý Hồ Sơ Cá Nhân</h2>
        <p className="text-slate-600 text-sm">Cập nhật thông tin định danh và thiết bị nhiếp ảnh của bạn</p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Đã lưu thay đổi hồ sơ thành công! Tên hiển thị đã được cập nhật.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Họ và Tên *</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email liên hệ *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Số điện thoại *</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thiết bị sở hữu (Camera / Lens)</label>
          <div className="relative">
            <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tiểu sử ngắn / Giới thiệu</label>
          <div className="relative">
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition text-sm cursor-pointer"
        >
          Lưu Thay Đổi Hồ Sơ
        </button>
      </form>
    </div>
  );
}