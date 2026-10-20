import React, { useState, useEffect } from 'react';
import { Plus, Disc, Camera, MapPin, Edit3, Trash2 } from 'lucide-react';

export interface FilmRoll {
  id: string;
  rollCode: string;
  filmBrand: string;
  iso: number;
  filmFormat: string;
  cameraBody: string;
  lens: string;
  developingLab: string;
  totalFrames: number;
}

export function FilmRollTab() {
  const [rolls, setRolls] = useState<FilmRoll[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    rollCode: '',
    filmBrand: 'Kodak Portra 400',
    iso: 400,
    filmFormat: '35mm',
    cameraBody: 'Canon AE-1',
    lens: '50mm f/1.8',
    developingLab: 'Llab Studio Saigon',
    totalFrames: 36
  });

  useEffect(() => {
    const saved = localStorage.getItem('participant_film_rolls');
    if (saved) {
      try { setRolls(JSON.parse(saved)); } catch (e) { console.error(e); }
    } else {
      const defaultRolls: FilmRoll[] = [
        {
          id: 'roll-1',
          rollCode: 'ROLL-2026-01',
          filmBrand: 'Kodak Portra 400',
          iso: 400,
          filmFormat: '35mm',
          cameraBody: 'Leica M6',
          lens: 'Summicron 35mm f/2',
          developingLab: 'Llab Saigon',
          totalFrames: 36
        }
      ];
      setRolls(defaultRolls);
      localStorage.setItem('participant_film_rolls', JSON.stringify(defaultRolls));
    }
  }, []);

  const handleSaveRoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rollCode) {
      alert('Vui lòng nhập Mã cuộn phim!');
      return;
    }

    if (editingId) {
      const updated = rolls.map(r => r.id === editingId ? { ...r, ...formData } : r);
      setRolls(updated);
      localStorage.setItem('participant_film_rolls', JSON.stringify(updated));
      alert('Cập nhật thông tin cuộn phim thành công!');
    } else {
      const newRoll: FilmRoll = { id: `roll-${Date.now()}`, ...formData };
      const updated = [newRoll, ...rolls];
      setRolls(updated);
      localStorage.setItem('participant_film_rolls', JSON.stringify(updated));
      alert('Thêm cuộn phim mới thành công!');
    }

    setShowModal(false);
    setEditingId(null);
    setFormData({
      rollCode: '',
      filmBrand: 'Kodak Portra 400',
      iso: 400,
      filmFormat: '35mm',
      cameraBody: 'Canon AE-1',
      lens: '50mm f/1.8',
      developingLab: 'Llab Studio Saigon',
      totalFrames: 36
    });
  };

  const handleEdit = (roll: FilmRoll) => {
    setEditingId(roll.id);
    setFormData({
      rollCode: roll.rollCode,
      filmBrand: roll.filmBrand,
      iso: roll.iso,
      filmFormat: roll.filmFormat,
      cameraBody: roll.cameraBody,
      lens: roll.lens,
      developingLab: roll.developingLab,
      totalFrames: roll.totalFrames
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa cuộn phim này không?')) {
      const updated = rolls.filter(r => r.id !== id);
      setRolls(updated);
      localStorage.setItem('participant_film_rolls', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Film Roll & Khung Hình</h2>
          <p className="text-slate-600 text-sm">Thêm mới, chỉnh sửa hoặc xóa thông tin cuộn phim</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              rollCode: `ROLL-2026-${rolls.length + 1}`,
              filmBrand: 'Kodak Portra 400',
              iso: 400,
              filmFormat: '35mm',
              cameraBody: 'Canon AE-1',
              lens: '50mm f/1.8',
              developingLab: 'Llab Studio Saigon',
              totalFrames: 36
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Khai Báo Cuộn Phim Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rolls.map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{r.rollCode}</span>
                <span className="text-xs text-slate-500 font-medium">{r.filmFormat}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Disc className="w-5 h-5 text-amber-500" /> {r.filmBrand} (ISO {r.iso})
              </h3>
              <div className="text-xs space-y-1.5 text-slate-600">
                <p className="flex items-center gap-2"><Camera className="w-3.5 h-3.5 text-slate-400" /> {r.cameraBody} + {r.lens}</p>
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Lab: {r.developingLab}</p>
              </div>
              <div className="pt-1 text-xs font-semibold text-slate-500">
                Tổng số khung hình: <span className="text-slate-900">{r.totalFrames} frames</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleEdit(r)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Sửa
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900">
              {editingId ? 'Chỉnh Sửa Cuộn Phim' : 'Khai Báo Cuộn Phim Mới'}
            </h3>
            <form onSubmit={handleSaveRoll} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Cuộn Phim *</label>
                <input
                  type="text"
                  required
                  value={formData.rollCode}
                  onChange={(e) => setFormData({ ...formData, rollCode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thương Hiệu Phim</label>
                  <input
                    type="text"
                    value={formData.filmBrand}
                    onChange={(e) => setFormData({ ...formData, filmBrand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISO</label>
                  <input
                    type="number"
                    value={formData.iso}
                    onChange={(e) => setFormData({ ...formData, iso: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thân Máy (Body)</label>
                  <input
                    type="text"
                    value={formData.cameraBody}
                    onChange={(e) => setFormData({ ...formData, cameraBody: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ống Kính (Lens)</label>
                  <input
                    type="text"
                    value={formData.lens}
                    onChange={(e) => setFormData({ ...formData, lens: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng Lab Tráng Phim</label>
                <input
                  type="text"
                  value={formData.developingLab}
                  onChange={(e) => setFormData({ ...formData, developingLab: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl text-slate-600 bg-slate-100 font-semibold text-sm hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-white bg-blue-600 font-semibold text-sm hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  {editingId ? 'Cập Nhật' : 'Lưu Cuộn Phim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}