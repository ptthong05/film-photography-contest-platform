import React, { useState, useEffect } from 'react';
import { Plus, Disc, Camera, Sparkles, Edit3, Trash2 } from 'lucide-react';

export interface FilmRollItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  iso: number;
  format: string;
  cameraBody: string;
  totalFrames: number;
  usedFrames: number;
  status: 'Đang sử dụng' | 'Chưa dùng' | 'Đã dùng hết';
  usedFrameNumbers: number[];
}

const INITIAL_FILM_ROLLS: FilmRollItem[] = [
  {
    id: 'roll-001',
    code: 'ROLL #001',
    name: 'Kodak Portra 400',
    brand: 'Kodak',
    iso: 400,
    format: '35mm',
    cameraBody: 'Canon AE-1',
    totalFrames: 36,
    usedFrames: 12,
    status: 'Đang sử dụng',
    usedFrameNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 14, 15]
  },
  {
    id: 'roll-002',
    code: 'ROLL #002',
    name: 'Fuji Superia 400',
    brand: 'Fujifilm',
    iso: 400,
    format: '35mm',
    cameraBody: 'Nikon FM2',
    totalFrames: 36,
    usedFrames: 0,
    status: 'Chưa dùng',
    usedFrameNumbers: []
  },
  {
    id: 'roll-003',
    code: 'ROLL #003',
    name: 'Ilford HP5 Plus',
    brand: 'Ilford',
    iso: 400,
    format: '35mm',
    cameraBody: 'Canon AE-1',
    totalFrames: 36,
    usedFrames: 36,
    status: 'Đã dùng hết',
    usedFrameNumbers: Array.from({ length: 36 }, (_, i) => i + 1)
  }
];

export function FilmRollTab() {
  const [rolls, setRolls] = useState<FilmRollItem[]>(() => {
    try {
      const saved = localStorage.getItem('participant_film_rolls');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FILM_ROLLS;
  });

  const [selectedRollId, setSelectedRollId] = useState<string>(() => rolls[0]?.id || 'roll-001');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoll, setEditingRoll] = useState<FilmRollItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State cho Thêm / Sửa
  const [formName, setFormName] = useState('Kodak Gold 200');
  const [formBrand, setFormBrand] = useState('Kodak');
  const [formIso, setFormIso] = useState(200);
  const [formFormat, setFormFormat] = useState('35mm');
  const [formCamera, setFormCamera] = useState('Minolta SRT 101');
  const [formTotalFrames, setFormTotalFrames] = useState(36);

  const selectedRoll = rolls.find(r => r.id === selectedRollId) || rolls[0] || INITIAL_FILM_ROLLS[0];

  useEffect(() => {
    try {
      localStorage.setItem('participant_film_rolls', JSON.stringify(rolls));
    } catch (e) {
      console.error(e);
    }
  }, [rolls]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setFormName('Kodak Gold 200');
    setFormBrand('Kodak');
    setFormIso(200);
    setFormFormat('35mm');
    setFormCamera('Minolta SRT 101');
    setFormTotalFrames(36);
    setEditingRoll(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (roll: FilmRollItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRoll(roll);
    setFormName(roll.name);
    setFormBrand(roll.brand);
    setFormIso(roll.iso);
    setFormFormat(roll.format);
    setFormCamera(roll.cameraBody);
    setFormTotalFrames(roll.totalFrames);
    setShowAddModal(true);
  };

  const handleSaveRoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoll) {
      const updated = rolls.map(r => {
        if (r.id === editingRoll.id) {
          const usedCount = r.usedFrameNumbers.filter(n => n <= formTotalFrames).length;
          let newStatus: FilmRollItem['status'] = r.status;
          if (usedCount === 0) newStatus = 'Chưa dùng';
          else if (usedCount >= formTotalFrames) newStatus = 'Đã dùng hết';
          else newStatus = 'Đang sử dụng';

          return {
            ...r,
            name: formName,
            brand: formBrand,
            iso: Number(formIso),
            format: formFormat,
            cameraBody: formCamera,
            totalFrames: Number(formTotalFrames),
            usedFrames: usedCount,
            status: newStatus,
            usedFrameNumbers: r.usedFrameNumbers.filter(n => n <= formTotalFrames)
          };
        }
        return r;
      });
      setRolls(updated);
      setShowAddModal(false);
      showToast(`Đã cập nhật thông tin cuộn phim ${editingRoll.code} thành công!`);
    } else {
      const newRoll: FilmRollItem = {
        id: `roll-${Date.now()}`,
        code: `ROLL #${String(rolls.length + 1).padStart(3, '0')}`,
        name: formName,
        brand: formBrand,
        iso: Number(formIso),
        format: formFormat,
        cameraBody: formCamera,
        totalFrames: Number(formTotalFrames),
        usedFrames: 0,
        status: 'Chưa dùng',
        usedFrameNumbers: []
      };

      const updatedRolls = [newRoll, ...rolls];
      setRolls(updatedRolls);
      setSelectedRollId(newRoll.id);
      setShowAddModal(false);
      showToast(`Đã khai báo thành công cuộn phim ${newRoll.code} - ${newRoll.name}!`);
    }
  };

  const handleDeleteRoll = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const remaining = rolls.filter(r => r.id !== deleteConfirmId);
    if (remaining.length === 0) {
      showToast('Cần giữ lại ít nhất một cuộn phim trong hệ thống!');
      setDeleteConfirmId(null);
      return;
    }
    setRolls(remaining);
    if (selectedRollId === deleteConfirmId) {
      setSelectedRollId(remaining[0].id);
    }
    setDeleteConfirmId(null);
    showToast('Đã xóa cuộn phim khỏi hệ thống!');
  };

  const toggleFrameUsage = (frameNum: number) => {
    setRolls(prevRolls => prevRolls.map(roll => {
      if (roll.id !== selectedRoll.id) return roll;

      const isUsed = roll.usedFrameNumbers.includes(frameNum);
      let updatedFrames = [...roll.usedFrameNumbers];

      if (isUsed) {
        updatedFrames = updatedFrames.filter(n => n !== frameNum);
      } else {
        updatedFrames.push(frameNum);
      }

      const usedCount = updatedFrames.length;
      let newStatus: FilmRollItem['status'] = 'Đang sử dụng';
      if (usedCount === 0) newStatus = 'Chưa dùng';
      if (usedCount >= roll.totalFrames) newStatus = 'Đã dùng hết';

      return {
        ...roll,
        usedFrames: usedCount,
        status: newStatus,
        usedFrameNumbers: updatedFrames.sort((a, b) => a - b)
      };
    }));
  };

  return (
    <div className="space-y-8 max-w-[1800px] mx-auto pb-20 font-sans text-slate-900">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl border border-slate-200 p-8 space-y-6 animate-fade-in text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Xác Nhận Xóa Cuộn Phim</h3>
              <p className="text-sm font-medium text-slate-500">Bạn có chắc chắn muốn xóa cuộn phim này khỏi danh sách quản lý không?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-black text-xs rounded-xl cursor-pointer">
                Hủy bỏ
              </button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow cursor-pointer">
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="space-y-2">
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
            ● PARTICIPANT PORTAL • QUẢN LÝ FILM ROLL
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Khai Báo & Quản Lý Cuộn Phim</h1>
          <p className="text-sm text-slate-500">Thêm mới, chỉnh sửa thông số kỹ thuật, theo dõi tiến độ chụp và chi tiết từng frame</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-5 h-5" /> Khai Báo Cuộn Phim Mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-5">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Disc className="w-6 h-6 text-blue-600" /> Danh sách cuộn phim của bạn ({rolls.length})
          </h2>

          <div className="space-y-5">
            {rolls.map((roll) => {
              const percentage = roll.totalFrames > 0 ? Math.round((roll.usedFrames / roll.totalFrames) * 100) : 0;
              const isSelected = roll.id === selectedRoll.id;

              return (
                <div
                  key={roll.id}
                  onClick={() => setSelectedRollId(roll.id)}
                  className={`bg-white p-7 rounded-3xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden group ${
                    isSelected
                      ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg'
                      : 'border-slate-200/90 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div className="w-20 h-28 bg-gradient-to-b from-amber-400 to-amber-600 rounded-2xl flex-shrink-0 shadow-lg flex flex-col items-center justify-between p-2 border-2 border-amber-300">
                    <div className="w-full h-3 bg-slate-900 rounded-sm" />
                    <span className="text-[11px] font-black text-slate-900 tracking-tight uppercase text-center leading-none">
                      {roll.brand}
                    </span>
                    <div className="w-full h-4 bg-slate-900 rounded-md text-[9px] text-amber-400 font-mono text-center flex items-center justify-center font-bold">
                      ISO {roll.iso}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-lg">
                        {roll.code} - {roll.name}
                      </h3>
                      <span className={`px-3.5 py-1.5 rounded-full text-xs font-black ${
                        roll.status === 'Đang sử dụng'
                          ? 'bg-emerald-100 text-emerald-800'
                          : roll.status === 'Đã dùng hết'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {roll.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-500 flex flex-wrap items-center gap-3">
                      <span className="font-bold text-slate-800">{roll.totalFrames} frame ({roll.format})</span> •
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <Camera className="w-4 h-4 text-blue-600" /> {roll.cameraBody}
                      </span>
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs font-black text-slate-600">
                        <span>{percentage}% hoàn thành</span>
                        <span>{roll.usedFrames} / {roll.totalFrames} frame đã dùng</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => handleOpenEditModal(roll, e)}
                      className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition cursor-pointer shadow-sm"
                      title="Chỉnh sửa cuộn phim"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteRoll(roll.id, e)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer shadow-sm"
                      title="Xóa cuộn phim"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Chi tiết frame ({selectedRoll?.code})
              </h3>
              <p className="text-xs text-slate-500 mt-1">Bấm vào ô số để chọn hoặc hủy trạng thái đã chụp</p>
            </div>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
              {selectedRoll?.name} ({selectedRoll?.cameraBody})
            </span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-9 gap-3">
            {Array.from({ length: selectedRoll?.totalFrames || 36 }, (_, i) => i + 1).map((num) => {
              const isUsed = selectedRoll?.usedFrameNumbers?.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => toggleFrameUsage(num)}
                  className={`h-16 rounded-2xl text-sm font-black transition flex items-center justify-center cursor-pointer border-2 ${
                    isUsed
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-sm hover:bg-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={`Frame #${num}: ${isUsed ? 'Đã dùng' : 'Chưa dùng'}`}
                >
                  {String(num).padStart(2, '0')}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-8 pt-6 border-t border-slate-100 text-xs font-black">
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-600 inline-block shadow-sm" />
              <span className="text-slate-800">Đã dùng ({selectedRoll?.usedFrames || 0})</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-300 inline-block" />
              <span className="text-slate-500">Chưa dùng ({(selectedRoll?.totalFrames || 36) - (selectedRoll?.usedFrames || 0)})</span>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 md:p-10 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-black text-slate-900">
                {editingRoll ? `Chỉnh Sửa Cuộn Phim (${editingRoll.code})` : 'Khai Báo Cuộn Phim Mới'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Nhập đầy đủ thông tin chi tiết để quản lý thông số máy & phim chính xác</p>
            </div>

            <form onSubmit={handleSaveRoll} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700 uppercase tracking-wider">Tên cuộn film / Film Stock *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Kodak Gold 200"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-black text-slate-700 uppercase tracking-wider">Hãng phim (Brand) *</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="VD: Kodak, Fujifilm..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700 uppercase tracking-wider">Độ nhạy sáng ISO *</label>
                  <input
                    type="number"
                    value={formIso}
                    onChange={(e) => setFormIso(Number(e.target.value))}
                    placeholder="400"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-black text-slate-700 uppercase tracking-wider">Định dạng phim *</label>
                  <select
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 cursor-pointer"
                  >
                    <option value="35mm">35mm (135)</option>
                    <option value="120mm">120mm (Medium Format)</option>
                    <option value="APS">APS</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-black text-slate-700 uppercase tracking-wider">Số lượng frame *</label>
                  <select
                    value={formTotalFrames}
                    onChange={(e) => setFormTotalFrames(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 cursor-pointer"
                  >
                    <option value={36}>36 Frame (Chuẩn)</option>
                    <option value={24}>24 Frame</option>
                    <option value={12}>12 Frame</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-black text-slate-700 uppercase tracking-wider">Dòng máy ảnh (Camera Body) *</label>
                <input
                  type="text"
                  value={formCamera}
                  onChange={(e) => setFormCamera(e.target.value)}
                  placeholder="VD: Minolta SRT 101, Nikon FM2..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl cursor-pointer text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-md cursor-pointer text-xs"
                >
                  {editingRoll ? 'Lưu Thay Đổi' : 'Xác Nhận Khai Báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}