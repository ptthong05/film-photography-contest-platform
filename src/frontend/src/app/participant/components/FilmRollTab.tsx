import React, { useState, useEffect } from 'react';
import { Plus, Disc, Camera, Sparkles, Edit3, Trash2, ArrowLeft, CheckCircle2, Clock, RotateCcw, AlertTriangle, Layers, Sliders, FileText } from 'lucide-react';

export interface FilmRollItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  iso: number;
  format: string;
  cameraBody: string;
  lens?: string;
  totalFrames: number;
  usedFrames: number;
  status: 'Đang sử dụng' | 'Chưa dùng' | 'Đã dùng hết';
  usedFrameNumbers: number[];
  frameNotes?: Record<number, string>;
  loadedDate?: string;
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
    lens: 'FD 50mm f/1.8',
    totalFrames: 36,
    usedFrames: 12,
    status: 'Đang sử dụng',
    usedFrameNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 14, 15],
    frameNotes: {
      1: 'Chụp chân dung hoàng hôn, f/2.0, 1/250s',
      2: 'Góc phố cà phê sáng, f/4.0, 1/125s',
      3: 'Tĩnh vật hoa tulip, f/2.8, 1/60s',
      4: 'Mặt hồ gợn sóng, f/8.0, 1/500s'
    },
    loadedDate: '15/10/2026'
  },
  {
    id: 'roll-002',
    code: 'ROLL #002',
    name: 'Fuji Superia 400',
    brand: 'Fujifilm',
    iso: 400,
    format: '35mm',
    cameraBody: 'Nikon FM2',
    lens: 'Nikkor 35mm f/2.0',
    totalFrames: 36,
    usedFrames: 0,
    status: 'Chưa dùng',
    usedFrameNumbers: [],
    frameNotes: {},
    loadedDate: '20/10/2026'
  },
  {
    id: 'roll-003',
    code: 'ROLL #003',
    name: 'Ilford HP5 Plus',
    brand: 'Ilford',
    iso: 400,
    format: '35mm',
    cameraBody: 'Canon AE-1',
    lens: 'FD 28mm f/2.8',
    totalFrames: 36,
    usedFrames: 36,
    status: 'Đã dùng hết',
    usedFrameNumbers: Array.from({ length: 36 }, (_, i) => i + 1),
    frameNotes: {},
    loadedDate: '01/10/2026'
  }
];

export function FilmRollTab() {
  const [rolls, setRolls] = useState<FilmRollItem[]>(() => {
    try {
      const saved = localStorage.getItem('participant_film_rolls');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            usedFrameNumbers: Array.isArray(item.usedFrameNumbers) ? item.usedFrameNumbers : [],
            frameNotes: item.frameNotes || {}
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FILM_ROLLS;
  });

  const [selectedRollId, setSelectedRollId] = useState<string>(() => rolls[0]?.id || 'roll-001');
  const [selectedFrameNumber, setSelectedFrameNumber] = useState<number>(1);
  const [currentFrameNote, setCurrentFrameNote] = useState<string>('');

  // Page View Mode: LIST (danh sách), CREATE (trang thêm mới), EDIT (trang chỉnh sửa)
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editingRoll, setEditingRoll] = useState<FilmRollItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State cho Thêm / Sửa
  const [formName, setFormName] = useState('Kodak Gold 200');
  const [formBrand, setFormBrand] = useState('Kodak');
  const [formIso, setFormIso] = useState(200);
  const [formFormat, setFormFormat] = useState('35mm');
  const [formCamera, setFormCamera] = useState('Minolta SRT 101');
  const [formLens, setFormLens] = useState('Rokkor 50mm f/1.7');
  const [formTotalFrames, setFormTotalFrames] = useState(36);
  const [formLoadedDate, setFormLoadedDate] = useState(() => new Date().toLocaleDateString('vi-VN'));

  const selectedRoll = rolls.find(r => r.id === selectedRollId) || rolls[0] || INITIAL_FILM_ROLLS[0];

  // Khi chuyển roll hoặc chọn frame, load note của frame đó
  useEffect(() => {
    if (selectedRoll) {
      const notes = selectedRoll.frameNotes || {};
      setCurrentFrameNote(notes[selectedFrameNumber] || '');
    }
  }, [selectedRollId, selectedFrameNumber, selectedRoll]);

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

  const handleOpenAddPage = () => {
    setFormName('Kodak Gold 200');
    setFormBrand('Kodak');
    setFormIso(200);
    setFormFormat('35mm');
    setFormCamera('Minolta SRT 101');
    setFormLens('Rokkor 50mm f/1.7');
    setFormTotalFrames(36);
    setFormLoadedDate(new Date().toLocaleDateString('vi-VN'));
    setEditingRoll(null);
    setViewMode('CREATE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditPage = (roll: FilmRollItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRoll(roll);
    setFormName(roll.name);
    setFormBrand(roll.brand);
    setFormIso(roll.iso);
    setFormFormat(roll.format);
    setFormCamera(roll.cameraBody);
    setFormLens(roll.lens || '');
    setFormTotalFrames(roll.totalFrames);
    setFormLoadedDate(roll.loadedDate || new Date().toLocaleDateString('vi-VN'));
    setViewMode('EDIT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoll) {
      const updated = rolls.map(r => {
        if (r.id === editingRoll.id) {
          const usedNums = Array.isArray(r.usedFrameNumbers) ? r.usedFrameNumbers : [];
          const usedCount = usedNums.filter(n => n <= formTotalFrames).length;
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
            lens: formLens,
            totalFrames: Number(formTotalFrames),
            usedFrames: usedCount,
            status: newStatus,
            usedFrameNumbers: usedNums.filter(n => n <= formTotalFrames),
            loadedDate: formLoadedDate
          };
        }
        return r;
      });
      setRolls(updated);
      setViewMode('LIST');
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
        lens: formLens,
        totalFrames: Number(formTotalFrames),
        usedFrames: 0,
        status: 'Chưa dùng',
        usedFrameNumbers: [],
        frameNotes: {},
        loadedDate: formLoadedDate
      };

      const updatedRolls = [newRoll, ...rolls];
      setRolls(updatedRolls);
      setSelectedRollId(newRoll.id);
      setSelectedFrameNumber(1);
      setViewMode('LIST');
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
      setSelectedFrameNumber(1);
    }
    setDeleteConfirmId(null);
    showToast('Đã xóa cuộn phim khỏi hệ thống!');
  };

  const toggleFrameUsage = (frameNum: number) => {
    if (!selectedRoll) return;
    setRolls(prevRolls => prevRolls.map(roll => {
      if (roll.id !== selectedRoll.id) return roll;

      const currentUsed = Array.isArray(roll.usedFrameNumbers) ? roll.usedFrameNumbers : [];
      const isUsed = currentUsed.includes(frameNum);
      let updatedFrames = [...currentUsed];

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

  const handleSaveFrameNote = () => {
    if (!selectedRoll) return;
    setRolls(prevRolls => prevRolls.map(roll => {
      if (roll.id !== selectedRoll.id) return roll;
      const notes = { ...(roll.frameNotes || {}) };
      notes[selectedFrameNumber] = currentFrameNote;
      return {
        ...roll,
        frameNotes: notes
      };
    }));
    showToast(`Đã lưu ghi chú cho Frame #${String(selectedFrameNumber).padStart(2, '0')}!`);
  };

  // =========================================================================
  // VIEW MODE: CREATE / EDIT (TRANG RIÊNG BIỆT - KHÔNG DÙNG MODAL GIỮA MÀN HÌNH)
  // =========================================================================
  if (viewMode === 'CREATE' || viewMode === 'EDIT') {
    return (
      <div className="space-y-6 w-full max-w-5xl mx-auto pb-20 font-sans text-slate-900 animate-fade-in">
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Thanh điều hướng trang (Header bar with Back button) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('LIST')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer active:scale-95 border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách cuộn phim
          </button>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            ● {viewMode === 'CREATE' ? 'KHAI BÁO FILM ROLL MỚI' : `CHỈNH SỬA CUỘN PHIM • ${editingRoll?.code}`}
          </span>
        </div>

        {/* Form Trang Khai Báo / Chỉnh Sửa */}
        <form onSubmit={handleSaveRoll} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0B356B]">
                {viewMode === 'CREATE' ? 'Khai Báo Cuộn Phim Mới' : `Chỉnh Sửa Thông Số Cuộn Phim: ${editingRoll?.code}`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Khai báo đầy đủ các thông số phim, độ nhạy sáng ISO, body máy và ống kính để theo dõi chuẩn xác từng khung hình và đối chiếu dữ liệu EXIF.
              </p>
            </div>

            {/* Mục 1: Thông tin cuộn film */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Disc className="w-4 h-4 text-blue-600" /> 1. Thông Tin Cuộn Film
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tên cuộn phim (Film Stock) *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Kodak Portra 400, Fujifilm C200, Ilford HP5 Plus..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Hãng sản xuất (Brand) *</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="VD: Kodak, Fujifilm, Ilford, Cinestill..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Độ nhạy sáng (ISO) *</label>
                  <select
                    value={formIso}
                    onChange={(e) => setFormIso(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
                  >
                    <option value={50}>ISO 50</option>
                    <option value={100}>ISO 100</option>
                    <option value={160}>ISO 160</option>
                    <option value={200}>ISO 200</option>
                    <option value={400}>ISO 400</option>
                    <option value={800}>ISO 800</option>
                    <option value={1600}>ISO 1600</option>
                    <option value={3200}>ISO 3200</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Định dạng phim (Format) *</label>
                  <select
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
                  >
                    <option value="35mm">35mm (Chuẩn 135)</option>
                    <option value="120mm">120 (Medium Format 6x4.5 / 6x6 / 6x7)</option>
                    <option value="APS">APS (Advanced Photo System)</option>
                    <option value="Large Format">Large Format (4x5)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Số lượng khung hình (Frames) *</label>
                  <select
                    value={formTotalFrames}
                    onChange={(e) => setFormTotalFrames(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
                  >
                    <option value={36}>36 Frame (Chuẩn cuộn 135)</option>
                    <option value={24}>24 Frame (Cuộn ngắn)</option>
                    <option value={16}>16 Frame (Medium 6x4.5)</option>
                    <option value={12}>12 Frame (Medium 6x6)</option>
                    <option value={10}>10 Frame (Medium 6x7)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mục 2: Thiết bị chụp đi kèm */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" /> 2. Thiết Bị & Thời Gian Nạp Phim
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Thân máy ảnh (Camera Body) *</label>
                  <input
                    type="text"
                    value={formCamera}
                    onChange={(e) => setFormCamera(e.target.value)}
                    placeholder="VD: Canon AE-1, Nikon FM2, Leica M6, Olympus OM-1..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Ống kính gắn kèm (Lens)</label>
                  <input
                    type="text"
                    value={formLens}
                    onChange={(e) => setFormLens(e.target.value)}
                    placeholder="VD: 50mm f/1.8, 35mm f/2.0..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Ngày nạp phim vào máy</label>
                  <input
                    type="text"
                    value={formLoadedDate}
                    onChange={(e) => setFormLoadedDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer active:scale-95"
              >
                {viewMode === 'CREATE' ? 'Xác Nhận Khai Báo Cuộn Phim' : 'Lưu Thay Đổi Thông Số'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: LIST (DANH SÁCH CUỘN PHIM & BẢNG CHI TIẾT FRAME TƯƠNG TÁC)
  // =========================================================================
  const usedNums = Array.isArray(selectedRoll?.usedFrameNumbers) ? selectedRoll.usedFrameNumbers : [];
  const isSelectedFrameUsed = usedNums.includes(selectedFrameNumber);
  const selectedRollTotalFrames = selectedRoll?.totalFrames || 36;

  return (
    <div className="space-y-5 w-full pb-16 font-sans text-slate-900">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Banner xác nhận xóa inline (Không popup modal giữa màn hình) */}
      {deleteConfirmId && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">Xác nhận xóa cuộn phim?</h4>
              <p className="text-xs text-rose-700">
                Bạn có chắc chắn muốn xóa cuộn phim <strong>{rolls.find(r => r.id === deleteConfirmId)?.code} - {rolls.find(r => r.id === deleteConfirmId)?.name}</strong> khỏi hệ thống quản lý?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Đồng ý xóa
            </button>
          </div>
        </div>
      )}

      {/* Header trang quản lý */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-block">
            ● PARTICIPANT PORTAL • QUẢN LÝ FILM ROLL
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-[#0B356B] tracking-tight">Khai Báo & Quản Lý Cuộn Phim</h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Chọn khung hình 01, 02, 03... để xem chi tiết, đổi trạng thái chụp và ghi chú thông số cho từng frame phim
          </p>
        </div>

        <button
          onClick={handleOpenAddPage}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" /> Khai Báo Cuộn Phim Mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cột trái: Danh sách cuộn phim */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Disc className="w-5 h-5 text-blue-600" /> Cuộn phim của bạn ({rolls.length})
            </h2>
            <span className="text-xs text-slate-400">Nhấp chọn để quản lý</span>
          </div>

          <div className="space-y-3">
            {rolls.map((roll) => {
              const countUsed = Array.isArray(roll.usedFrameNumbers) ? roll.usedFrameNumbers.length : (roll.usedFrames || 0);
              const percentage = roll.totalFrames > 0 ? Math.round((countUsed / roll.totalFrames) * 100) : 0;
              const isSelected = roll.id === selectedRoll.id;

              return (
                <div
                  key={roll.id}
                  onClick={() => {
                    setSelectedRollId(roll.id);
                    setSelectedFrameNumber(1);
                  }}
                  className={`bg-white p-3.5 sm:p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden group ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-xs bg-blue-50/20'
                      : 'border-slate-200 shadow-xs hover:border-blue-300'
                  }`}
                >
                  {/* Mô phỏng canister cuộn phim */}
                  <div className="w-14 h-20 bg-gradient-to-b from-amber-400 to-amber-600 rounded-xl flex-shrink-0 shadow-xs flex flex-col items-center justify-between p-1.5 border border-amber-300">
                    <div className="w-full h-2 bg-slate-900 rounded-xs" />
                    <span className="text-[10px] font-bold text-slate-900 tracking-tight uppercase text-center leading-none">
                      {roll.brand}
                    </span>
                    <div className="w-full h-3.5 bg-slate-900 rounded-xs text-[8px] text-amber-400 font-mono text-center flex items-center justify-center font-bold">
                      ISO {roll.iso}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5 w-full min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                        {roll.code} - {roll.name}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                        roll.status === 'Đang sử dụng'
                          ? 'bg-emerald-100 text-emerald-800'
                          : roll.status === 'Đã dùng hết'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {roll.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700">{roll.totalFrames} frame ({roll.format})</span> •
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Camera className="w-3.5 h-3.5 text-blue-600" /> {roll.cameraBody}
                      </span>
                    </p>

                    <div className="space-y-1 pt-0.5">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500">
                        <span>{percentage}% hoàn thành</span>
                        <span>{countUsed} / {roll.totalFrames} frame đã chụp</span>
                      </div>
                    </div>
                  </div>

                  {/* Nút Sửa & Xóa cuộn phim */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => handleOpenEditPage(roll, e)}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition cursor-pointer shadow-xs"
                      title="Chỉnh sửa cuộn phim (Mở trang riêng)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteRoll(roll.id, e)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer shadow-xs"
                      title="Xóa cuộn phim"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cột phải: Lưới Frame & Khối Chi Tiết Frame Tương Tác */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" /> Khung Hình ({selectedRoll?.code} - {selectedRoll?.name})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click vào ô số 01, 02, 03... để chọn xem và cập nhật chi tiết từng khung hình bên dưới
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {selectedRoll?.cameraBody} {selectedRoll?.lens ? `• ${selectedRoll.lens}` : ''}
              </span>
            </div>

            {/* Lưới chọn frame: 01, 02, 03... */}
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2.5">
              {Array.from({ length: selectedRollTotalFrames }, (_, i) => i + 1).map((num) => {
                const isUsed = usedNums.includes(num);
                const isSelected = num === selectedFrameNumber;

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedFrameNumber(num)}
                    className={`h-14 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer border-2 relative ${
                      isSelected
                        ? 'ring-4 ring-blue-500/20 border-blue-600 bg-blue-50/80 scale-105 z-10 shadow-sm text-blue-900'
                        : isUsed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                    title={`Click để xem chi tiết Frame #${num}`}
                  >
                    <span className="text-sm font-black">{String(num).padStart(2, '0')}</span>
                    <span className="text-[9px] font-semibold leading-none mt-0.5 opacity-80">
                      {isUsed ? 'Đã chụp' : 'Trống'}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ghi chú chú thích trạng thái màu */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-600 inline-block shadow-xs" />
                <span className="text-slate-800 font-semibold">Đã chụp ({usedNums.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300 inline-block" />
                <span className="text-slate-500 font-semibold">Chưa chụp ({selectedRollTotalFrames - usedNums.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-blue-50 border-2 border-blue-600 inline-block" />
                <span className="text-blue-700 font-bold">Đang xem chi tiết</span>
              </div>
            </div>

            {/* BẢNG CHI TIẾT FRAME ĐƯỢC CHỌN (Frame Detail Panel) */}
            <div className="mt-4 p-5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-slate-50 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-mono font-black text-lg flex items-center justify-center shadow-xs">
                    {String(selectedFrameNumber).padStart(2, '0')}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      Chi Tiết Khung Hình #{String(selectedFrameNumber).padStart(2, '0')}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Thuộc cuộn <strong>{selectedRoll?.code}</strong> ({selectedRoll?.name}) • ISO {selectedRoll?.iso}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelectedFrameUsed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã chụp (Exposed)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                      <Clock className="w-4 h-4 text-slate-500" /> Chưa chụp (Unexposed)
                    </span>
                  )}
                </div>
              </div>

              {/* Thông số kỹ thuật của frame */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Thiết bị chụp</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-blue-600" /> {selectedRoll?.cameraBody}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Ống kính (Lens)</span>
                  <span className="font-bold text-slate-800">
                    {selectedRoll?.lens || 'Tiêu cự chuẩn 50mm'}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Vị trí trong cuộn</span>
                  <span className="font-bold text-slate-800">
                    Khung {selectedFrameNumber} / {selectedRollTotalFrames}
                  </span>
                </div>
              </div>

              {/* Ghi chú thông số chụp cho frame này */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Ghi chú thông số cho Frame #{String(selectedFrameNumber).padStart(2, '0')}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentFrameNote}
                    onChange={(e) => setCurrentFrameNote(e.target.value)}
                    placeholder="VD: Khẩu f/2.8, tốc độ 1/250s, ánh sáng tự nhiên ngược nắng..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveFrameNote}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition cursor-pointer shrink-0"
                  >
                    Lưu ghi chú
                  </button>
                </div>
              </div>

              {/* Nút hành động đổi trạng thái trực tiếp của frame */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Thao tác trạng thái nhanh cho khung hình này:
                </span>
                <button
                  type="button"
                  onClick={() => toggleFrameUsage(selectedFrameNumber)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
                    isSelectedFrameUsed
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600'
                  }`}
                >
                  {isSelectedFrameUsed ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" /> Hủy chụp (Đổi thành chưa chụp)
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đánh dấu ĐÃ CHỤP frame này
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
