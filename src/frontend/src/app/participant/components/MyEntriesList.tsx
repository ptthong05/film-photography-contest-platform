import React, { useState, useEffect } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, Clock, Eye,
  ArrowLeft, Cpu, Disc, Award, Sparkles, AlertCircle, X, MapPin, Camera, Sliders, ShieldCheck, Layers, EyeOff, Printer, Edit3, Trash2, Plus, RotateCcw
} from 'lucide-react';

export interface EntryDetail {
  id: string;
  contestId: string;
  contestTitle?: string;
  title: string;
  description: string;
  photoUrl: string;
  submittedAt: string;
  status: 'Đang chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Đã chấm' | 'Đã xóa' | string;
  rejectReason?: string;
  aiAnalysis?: {
    summary: string;
    grainQuality: string;
    lightingIssue: string;
    compositionReview: string;
    recommendation: string;
  };
  filmBrand?: string;
  iso?: number | string;
  cameraBody?: string;
  lens?: string;
  shutterSpeed?: string;
  aperture?: string;
  focalLength?: string;
  shootingLocation?: string;
  developingLab?: string;
}

const INITIAL_ENTRIES: EntryDetail[] = [
  {
    id: 'sub-004',
    contestId: '2',
    contestTitle: 'CUỘC THI PHIM 2026 • FILM & CITY',
    title: 'Thành phố lúc hoàng hôn',
    description: 'Sài Gòn chuyển mình trong khoảnh khắc giao thòa giữa ngày và đêm.',
    photoUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=85&w=1000&auto=format&fit=crop',
    submittedAt: '15/10/2026',
    status: 'Từ chối',
    rejectReason: 'Ảnh scan bị lóa sáng phần rìa trái, thông số Metadata không khớp với định dạng chuẩn của dòng máy cơ.',
    aiAnalysis: {
      summary: 'Hệ thống AI computer vision đã quét và phát hiện bất thường quang học trên bản scan.',
      grainQuality: 'Hạt grain bị bết ở vùng tối (shadows) do quá trình tráng thuốc thiếu nhiệt độ.',
      lightingIssue: 'Xuất hiện hiện tượng lóa sáng (light leak) do nắp lưng máy cơ đóng không khít khi chụp.',
      compositionReview: 'Bố cục đường phố góc rộng tốt, cân bằng đối xứng nhưng vi phạm quy chuẩn kỹ thuật scan âm bản.',
      recommendation: 'Cần mang cuộn film ra lab uy tín để scan lại khung hình hoặc chụp bù sáng ở cuộn tiếp theo.'
    },
    filmBrand: 'Ilford HP5 Plus 400',
    iso: 400,
    cameraBody: 'Leica M6',
    lens: 'Summicron 35mm f/2.0',
    shootingLocation: 'Quận 1, TP. Hồ Chí Minh'
  },
  {
    id: 'sub-001',
    contestId: '1',
    contestTitle: 'CUỘC THI PHIM 2025 • ANALOG MOMENTS',
    title: 'NIỀM VUI KHÔNG LỜI',
    description: 'Giữa thảm cỏ xanh trải dài dưới ánh sáng dịu dàng, một chú chó nhỏ đứng lặng.',
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=1000&auto=format&fit=crop',
    submittedAt: '22/10/2026',
    status: 'Đang chờ duyệt',
    filmBrand: 'Kodak Portra 400',
    iso: 400,
    cameraBody: 'Canon AE-1 Program',
    lens: 'Canon FD 50mm f/1.8',
    shootingLocation: 'Đồi chè Cầu Đất, Lâm Đồng'
  }
];

export function MyEntriesList() {
  const [entries, setEntries] = useState<EntryDetail[]>([]);
  const [trashEntries, setTrashEntries] = useState<EntryDetail[]>([]);

  const [selectedEntry, setSelectedEntry] = useState<EntryDetail | null>(null);
  const [editingEntry, setEditingEntry] = useState<EntryDetail | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [filterTab, setFilterTab] = useState<'Tất cả' | 'Đang chờ duyệt' | 'Đã duyệt / Đã chấm' | 'Từ chối' | 'Lịch sử xóa'>('Tất cả');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const syncCountToDashboard = (currentEntries: EntryDetail[]) => {
    localStorage.setItem('participant_total_entries_count', currentEntries.length.toString());
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    try {
      const savedTrash = localStorage.getItem('participant_trash_entries');
      const trashList: EntryDetail[] = savedTrash ? JSON.parse(savedTrash) : [];
      setTrashEntries(trashList);

      const savedEntries = localStorage.getItem('participant_entries');
      if (savedEntries) {
        const parsed: EntryDetail[] = JSON.parse(savedEntries);
        setEntries(parsed);
        syncCountToDashboard(parsed);
      } else {
        const trashIds = trashList.map(t => t.id);
        const initialFiltered = INITIAL_ENTRIES.filter(item => !trashIds.includes(item.id));
        setEntries(initialFiltered);
        localStorage.setItem('participant_entries', JSON.stringify(initialFiltered));
        syncCountToDashboard(initialFiltered);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    if (editingEntry.status === 'Đã chấm') {
      alert('Bài dự thi đã được chấm điểm chính thức, không thể thay đổi thông tin!');
      setEditingEntry(null);
      return;
    }

    const updated = entries.map(item => item.id === editingEntry.id ? editingEntry : item);
    setEntries(updated);
    localStorage.setItem('participant_entries', JSON.stringify(updated));
    syncCountToDashboard(updated);
    setEditingEntry(null);
    showToast('Đã lưu và cập nhật toàn bộ thông tin bài dự thi thành công!');
  };

  const handleDeleteEntry = (id: string) => {
    const itemToDelete = entries.find(item => item.id === id);
    if (!itemToDelete) return;

    const updatedEntries = entries.filter(item => item.id !== id);
    const updatedTrash = [itemToDelete, ...trashEntries];

    setEntries(updatedEntries);
    setTrashEntries(updatedTrash);

    localStorage.setItem('participant_entries', JSON.stringify(updatedEntries));
    localStorage.setItem('participant_trash_entries', JSON.stringify(updatedTrash));
    syncCountToDashboard(updatedEntries);

    setDeleteId(null);
    showToast('Đã chuyển bài dự thi vào Lịch sử xóa (Thùng rác)!');
  };

  const handleRestoreEntry = (id: string) => {
    const itemToRestore = trashEntries.find(item => item.id === id);
    if (!itemToRestore) return;

    const updatedTrash = trashEntries.filter(item => item.id !== id);
    const updatedEntries = [itemToRestore, ...entries];

    setTrashEntries(updatedTrash);
    setEntries(updatedEntries);

    localStorage.setItem('participant_trash_entries', JSON.stringify(updatedTrash));
    localStorage.setItem('participant_entries', JSON.stringify(updatedEntries));
    syncCountToDashboard(updatedEntries);

    showToast('Đã khôi phục bài dự thi thành công!');
  };

  const handlePermanentDelete = (id: string) => {
    const updatedTrash = trashEntries.filter(item => item.id !== id);
    setTrashEntries(updatedTrash);
    localStorage.setItem('participant_trash_entries', JSON.stringify(updatedTrash));
    setDeleteId(null);
    showToast('Đã xóa vĩnh viễn bài dự thi!');
  };

  const countAll = entries.length;
  const countPending = entries.filter(e => e.status === 'Đang chờ duyệt').length;
  const countApproved = entries.filter(e => e.status === 'Đã duyệt' || e.status === 'Đã chấm').length;
  const countRejected = entries.filter(e => e.status === 'Từ chối').length;
  const countTrash = trashEntries.length;

  const filteredEntries = filterTab === 'Lịch sử xóa'
    ? trashEntries
    : entries.filter(item => {
        if (filterTab === 'Tất cả') return true;
        if (filterTab === 'Đang chờ duyệt') return item.status === 'Đang chờ duyệt';
        if (filterTab === 'Đã duyệt / Đã chấm') return item.status === 'Đã duyệt' || item.status === 'Đã chấm';
        if (filterTab === 'Từ chối') return item.status === 'Từ chối';
        return true;
      });

  if (editingEntry) {
    return (
      <form onSubmit={handleSaveFullEdit} className="space-y-8 max-w-7xl mx-auto pb-24 animate-fade-in font-sans text-slate-900">
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={() => setEditingEntry(null)}
            className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-extrabold rounded-2xl border border-slate-200 text-xs transition cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Hủy bỏ & Quay lại
          </button>
          <button
            type="submit"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg transition cursor-pointer active:scale-95"
          >
            Lưu Tất Cả Thay Đổi
          </button>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3.5 py-1.5 rounded-full inline-block border border-indigo-200">
            ● CHẾ ĐỘ CHỈNH SỬA TÁC PHẨM: {editingEntry.contestTitle || 'CUỘC THI PHIM'}
          </span>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400">Tiêu đề tác phẩm *</label>
            <input
              type="text"
              value={editingEntry.title || ''}
              onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
              className="w-full text-3xl md:text-4xl font-black text-slate-900 px-6 py-4 rounded-2xl border-2 border-indigo-200 focus:outline-none focus:border-indigo-600 bg-slate-50"
              required
            />
          </div>
          <p className="text-xs font-bold text-slate-400">📅 Ngày nộp: {editingEntry.submittedAt} • Mã hồ sơ: {editingEntry.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-8">
            <div className="bg-slate-900 rounded-3xl p-5 shadow-2xl overflow-hidden border border-slate-800 space-y-4">
              <div className="w-full h-auto max-h-[450px] overflow-hidden rounded-2xl bg-black flex items-center justify-center">
                <img
                  src={editingEntry.photoUrl}
                  alt={editingEntry.title}
                  className="w-full h-full object-contain max-h-[450px]"
                />
              </div>

              <label className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                <Camera className="w-4 h-4" /> Tải lên / Thay ảnh dự thi mới
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (uploadEvent) => {
                        if (uploadEvent.target?.result) {
                          setEditingEntry({ ...editingEntry, photoUrl: uploadEvent.target.result as string });
                          showToast('Đã thay đổi ảnh mới thành công!');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-3 border-b border-slate-100 pb-4">
                <FileText className="w-6 h-6 text-indigo-600" /> Chỉnh sửa mô tả & Thông điệp nghệ thuật
              </h3>
              <textarea
                rows={6}
                value={editingEntry.description || ''}
                onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                className="w-full text-sm md:text-base text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-serif"
                placeholder="Nhập thông điệp nghệ thuật..."
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                  <Disc className="w-6 h-6 text-indigo-600" /> Chỉnh Sửa Hồ Sơ Kỹ Thuật Máy & Phim Chi Tiết
                </h3>
              </div>

              <div className="max-h-[620px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5 shadow-sm">
                  <label className="text-slate-400 text-xs uppercase font-black tracking-wider">1. Loại Phim (Film Stock) & ISO</label>
                  <input
                    type="text"
                    value={editingEntry.filmBrand || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, filmBrand: e.target.value })}
                    className="w-full font-black text-slate-900 text-base bg-white px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="text-slate-400 text-xs uppercase font-black tracking-wider">2. Thân Máy (Body)</label>
                    <input
                      type="text"
                      value={editingEntry.cameraBody || ''}
                      onChange={(e) => setEditingEntry({ ...editingEntry, cameraBody: e.target.value })}
                      className="w-full font-extrabold text-slate-800 text-sm bg-white px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-1.5">
                    <label className="text-slate-400 text-xs uppercase font-black tracking-wider">3. Ống Kính (Lens)</label>
                    <input
                      type="text"
                      value={editingEntry.lens || ''}
                      onChange={(e) => setEditingEntry({ ...editingEntry, lens: e.target.value })}
                      className="w-full font-extrabold text-slate-800 text-sm bg-white px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="text-slate-400 text-xs uppercase font-black tracking-wider">4. Địa điểm bấm máy</label>
                  <input
                    type="text"
                    value={editingEntry.shootingLocation || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, shootingLocation: e.target.value })}
                    className="w-full font-black text-slate-900 text-sm bg-white px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }

  if (selectedEntry) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-fade-in font-sans text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => setSelectedEntry(null)}
            className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-extrabold rounded-2xl border border-slate-200 text-xs transition cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài nộp
          </button>
          <span className={`px-5 py-2.5 rounded-full text-xs font-black ${
            selectedEntry.status === 'Từ chối' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
          }`}>
            ● {selectedEntry.status}
          </span>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full inline-block border border-blue-200">
            {selectedEntry.contestTitle || 'CUỘC THI PHIM'}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">{selectedEntry.title}</h1>
          <p className="text-xs md:text-sm font-bold text-slate-400">📅 Ngày nộp chính thức: {selectedEntry.submittedAt} • Mã hồ sơ tác phẩm: <strong className="text-slate-700">{selectedEntry.id}</strong></p>
        </div>

        {/* NẾU LÀ BÀI BỊ TỪ CHỐI -> HIỂN THỊ KHUNG NGUYÊN NHÂN VÀ AI PHÂN TÍCH ẢNH NGAY TRONG TRANG CHI TIẾT */}
        {selectedEntry.status === 'Từ chối' && (
          <div className="space-y-6">
            <div className="bg-rose-50 border-2 border-rose-200 p-8 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center gap-3 text-rose-700">
                <AlertTriangle className="w-7 h-7 flex-shrink-0" />
                <h3 className="text-xl font-black uppercase tracking-tight">Nguyên nhân từ chối chính thức</h3>
              </div>
              <p className="text-sm md:text-base font-bold text-rose-950 leading-relaxed bg-white p-5 rounded-2xl border border-rose-200 shadow-inner">
                {selectedEntry.rejectReason || 'Không đạt tiêu chuẩn kỹ thuật quét ảnh phim của Ban tổ chức.'}
              </p>
            </div>

            <div className="bg-purple-900 text-white p-8 md:p-10 rounded-3xl shadow-xl space-y-6 border border-purple-700">
              <div className="flex items-center gap-3 border-b border-purple-800 pb-4">
                <Cpu className="w-8 h-8 text-purple-400 animate-pulse" />
                <div>
                  <h3 className="text-2xl font-black">AI Phân Tích Ảnh Bài Thi (Computer Vision Report)</h3>
                  <p className="text-xs text-purple-300">Báo cáo đánh giá chi tiết lỗi hình ảnh và thông số quang học</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="bg-purple-950/70 p-6 rounded-2xl border border-purple-800/80 space-y-2">
                  <p className="text-xs font-black text-purple-300 uppercase tracking-wider">🔬 Đánh giá hạt Film (Grain)</p>
                  <p className="font-semibold text-purple-100 leading-relaxed">{selectedEntry.aiAnalysis?.grainQuality || 'Cấu trúc hạt film ổn định nhưng độ bão hòa màu chưa tối ưu.'}</p>
                </div>
                <div className="bg-purple-950/70 p-6 rounded-2xl border border-purple-800/80 space-y-2">
                  <p className="text-xs font-black text-purple-300 uppercase tracking-wider">💡 Phân tích ánh sáng (Lighting)</p>
                  <p className="font-semibold text-purple-100 leading-relaxed">{selectedEntry.aiAnalysis?.lightingIssue || 'Phát hiện vùng chói sáng gắt và hiện tượng lóa quang học cục bộ.'}</p>
                </div>
                <div className="bg-purple-950/70 p-6 rounded-2xl border border-purple-800/80 space-y-2">
                  <p className="text-xs font-black text-purple-300 uppercase tracking-wider">🖼 Đánh giá bố cục (Composition)</p>
                  <p className="font-semibold text-purple-100 leading-relaxed">{selectedEntry.aiAnalysis?.compositionReview || 'Đường dẫn hướng khung hình tốt nhưng điểm rơi chủ thể bị lệch góc.'}</p>
                </div>
                <div className="bg-purple-950/70 p-6 rounded-2xl border border-purple-800/80 space-y-2">
                  <p className="text-xs font-black text-purple-300 uppercase tracking-wider">🛠 Khuyến nghị khắc phục</p>
                  <p className="font-semibold text-purple-100 leading-relaxed">{selectedEntry.aiAnalysis?.recommendation || 'Kiểm tra lại cơ chế buồng tối máy ảnh và thực hiện scan lại frame.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-8">
            <div className="bg-slate-900 rounded-3xl p-5 shadow-2xl overflow-hidden border border-slate-800">
              <img
                src={selectedEntry.photoUrl}
                alt={selectedEntry.title}
                className="w-full h-auto max-h-[650px] object-contain rounded-2xl mx-auto shadow-2xl"
              />
            </div>
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-3 border-b border-slate-100 pb-4">
                <FileText className="w-6 h-6 text-blue-600" /> Mô tả tác phẩm & Thông điệp nghệ thuật
              </h3>
              <div className="text-sm md:text-base text-slate-700 leading-relaxed italic bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-inner font-serif">
                "{selectedEntry.description}"
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-3 border-b border-slate-100 pb-4">
                <Disc className="w-6 h-6 text-blue-600" /> Hồ Sơ Kỹ Thuật Máy & Phim Chi Tiết
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1">
                  <p className="text-slate-400 text-xs uppercase font-black">Loại Phim (Film Stock)</p>
                  <p className="font-black text-slate-900 text-base">{selectedEntry.filmBrand || 'Fujifilm C200'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
                    <p className="text-slate-400 text-xs uppercase font-black">Thân Máy (Body)</p>
                    <p className="font-extrabold text-slate-800 text-sm mt-1">{selectedEntry.cameraBody || 'Nikon FM2'}</p>
                  </div>
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
                    <p className="text-slate-400 text-xs uppercase font-black">Ống Kính (Lens)</p>
                    <p className="font-extrabold text-slate-800 text-sm mt-1">{selectedEntry.lens || '35mm'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1800px] mx-auto pb-20 relative font-sans text-slate-900">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-sm font-bold">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl border border-slate-200 p-8 space-y-6 animate-fade-in text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Xác Nhận Xóa Bài Dự Thi</h3>
              <p className="text-sm font-medium text-slate-500">Bài dự thi sẽ được chuyển vào mục Lịch sử xóa (Thùng rác).</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-black text-xs rounded-xl cursor-pointer">
                Hủy bỏ
              </button>
              <button onClick={() => handleDeleteEntry(deleteId)} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow cursor-pointer">
                Chuyển vào thùng rác
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
        <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
          ● PARTICIPANT PORTAL
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Bài Dự Thi Của Tôi</h1>
        <p className="text-sm text-slate-500">Quản lý, theo dõi, xem chi tiết nguyên nhân từ chối và báo cáo AI phân tích ảnh</p>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-3 overflow-x-auto">
        <button
          onClick={() => setFilterTab('Tất cả')}
          className={`px-6 py-3 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            filterTab === 'Tất cả' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          Tất cả ({countAll})
        </button>
        <button
          onClick={() => setFilterTab('Đang chờ duyệt')}
          className={`px-6 py-3 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            filterTab === 'Đang chờ duyệt' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          Đang chờ duyệt ({countPending})
        </button>
        <button
          onClick={() => setFilterTab('Đã duyệt / Đã chấm')}
          className={`px-6 py-3 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            filterTab === 'Đã duyệt / Đã chấm' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          Đã duyệt / Đã chấm ({countApproved})
        </button>
        <button
          onClick={() => setFilterTab('Từ chối')}
          className={`px-6 py-3 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            filterTab === 'Từ chối' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          Từ chối ({countRejected})
        </button>
        <button
          onClick={() => setFilterTab('Lịch sử xóa')}
          className={`px-6 py-3 rounded-2xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            filterTab === 'Lịch sử xóa' ? 'bg-rose-600 text-white shadow-md' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" /> Lịch sử xóa ({countTrash})
        </button>
      </div>

      <div className="space-y-6">
        {filteredEntries.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-black text-slate-700">Không có bài dự thi nào trong mục này</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white p-8 md:p-9 rounded-3xl border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition space-y-6"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                <div className="flex items-center gap-6">
                  <img
                    src={entry.photoUrl}
                    alt={entry.title}
                    className="w-36 h-36 md:w-40 md:h-40 object-cover rounded-2xl shadow-md border border-slate-200 flex-shrink-0 bg-slate-100"
                  />
                  <div className="space-y-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{entry.contestTitle || 'CUỘC THI PHIM'}</span>
                    <h3 className="font-black text-slate-900 text-xl md:text-2xl">{entry.title}</h3>
                    <p className="text-xs md:text-sm text-slate-600 line-clamp-2 max-w-4xl leading-relaxed font-medium">{entry.description}</p>

                    {entry.status === 'Từ chối' && (
                      <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-2.5 max-w-3xl">
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-rose-900 leading-relaxed">
                          <strong className="uppercase">Nguyên nhân từ chối:</strong> {entry.rejectReason || 'Không đạt tiêu chuẩn kỹ thuật quét ảnh phim.'}
                        </p>
                      </div>
                    )}

                    <p className="text-xs font-bold text-slate-400 pt-1">📅 Nộp ngày: {entry.submittedAt} • Mã: {entry.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap">
                  <span className={`px-5 py-2.5 rounded-full text-xs font-black shadow-sm ${
                    entry.status === 'Đã duyệt'
                      ? 'bg-emerald-100 text-emerald-800'
                      : entry.status === 'Đã chấm'
                      ? 'bg-indigo-100 text-indigo-800'
                      : entry.status === 'Từ chối'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    ● {entry.status}
                  </span>

                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="flex items-center gap-1.5 px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-2xl transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Eye className="w-4 h-4" /> Xem chi tiết
                  </button>

                  {entry.status !== 'Đã chấm' && entry.status !== 'Từ chối' && (
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="flex items-center gap-1.5 px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-2xl transition cursor-pointer active:scale-95 shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" /> Sửa
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteId(entry.id)}
                    className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl transition cursor-pointer active:scale-95 shadow-sm"
                    title="Xóa bài dự thi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}