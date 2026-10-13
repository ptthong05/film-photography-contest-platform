import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';

export function ProfileTab() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [profileData, setProfileData] = useState({
    fullName: 'Nguyễn Văn A',
    role: 'Nhiếp ảnh gia phim',
    email: 'nguyenvana@gmail.com',
    phone: '0901 234 567',
    address: 'Quận 1, TP. Hồ Chí Minh',
    joinDate: '15/05/2025'
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdate = () => {
    setIsEditing(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Hồ sơ cá nhân</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-sm transition-all border border-blue-200 shadow-sm"
          >
            Chỉnh sửa
          </button>
        ) : (
          <button
            onClick={handleUpdate}
            className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold text-sm transition-all shadow-md"
          >
            Cập nhật
          </button>
        )}
      </div>

      {isSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="font-bold text-sm">Cập nhật hồ sơ thành công!</p>
        </div>
      )}

      <div className="flex items-center gap-8 pb-8 border-b border-slate-200">
        <div className="w-24 h-24 rounded-full bg-[#1A6EDB] text-white font-extrabold text-3xl flex items-center justify-center border-4 border-blue-100 shadow-md">
          NV
        </div>
        <div className="space-y-1">
          {isEditing ? (
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="text-2xl font-extrabold text-slate-900 border border-slate-300 rounded-xl px-3 py-1 bg-white w-full"
            />
          ) : (
            <h2 className="text-2xl font-extrabold text-slate-900">{profileData.fullName}</h2>
          )}
          <p className="text-sm font-semibold text-blue-600">{profileData.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="w-full">
            <p className="text-xs text-slate-400 font-bold">Email</p>
            {isEditing ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full mt-1 px-2 py-1 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 text-sm"
              />
            ) : (
              <p className="font-semibold text-slate-800">{profileData.email}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="w-full">
            <p className="text-xs text-slate-400 font-bold">Số điện thoại</p>
            {isEditing ? (
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full mt-1 px-2 py-1 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 text-sm"
              />
            ) : (
              <p className="font-semibold text-slate-800">{profileData.phone}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="w-full">
            <p className="text-xs text-slate-400 font-bold">Địa chỉ</p>
            {isEditing ? (
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full mt-1 px-2 py-1 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 text-sm"
              />
            ) : (
              <p className="font-semibold text-slate-800">{profileData.address}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400 font-bold">Ngày tham gia</p>
            <p className="font-semibold text-slate-800">{profileData.joinDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}