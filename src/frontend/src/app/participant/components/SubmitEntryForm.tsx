import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Info, Disc } from 'lucide-react';
import { FilmRoll } from './FilmRollTab';
import { MOCK_CONTESTS } from '../../../mocks/organizerData';

interface SubmitEntryFormProps {
  registeredIds?: string[];
  onSubmitSuccess: () => void;
}

export function SubmitEntryForm({ registeredIds, onSubmitSuccess }: SubmitEntryFormProps) {
  const [rolls, setRolls] = useState<FilmRoll[]>([]);
  const [selectedRollId, setSelectedRollId] = useState<string>('');

  const allContests = MOCK_CONTESTS.map((c) => ({
    id: String(c.id),
    title: c.name
  }));

  const [activeContests, setActiveContests] = useState<{ id: string; title: string }[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    filmBrand: 'Kodak Portra 400',
    iso: 400,
    cameraBody: 'Canon AE-1',
    lens: '50mm f/1.8',
    filmFormat: '35mm',
    frameNumber: 1,
    shootingLocation: 'Quận 1, TP. Hồ Chí Minh',
    developingLab: 'Llab Studio Saigon',
    scanningSpecs: 'Noritsu HS-1800 (2000x3000px)',
    negativeContactSheet: 'Có (Negative Scan chuẩn)',
  });

  const loadRegistered = () => {
    let savedIds: string[] = [];
    
    // Lấy trực tiếp từ tất cả các key localStorage có thể được dùng ở tab Cuộc thi
    const rawContests = localStorage.getItem('participant_registered_contests');
    const rawParticipant = localStorage.getItem('participant_registered');
    
    let parsed: Record<string, unknown>[] = [];
    try {
      if (rawContests) parsed = JSON.parse(rawContests);
      else if (rawParticipant) parsed = JSON.parse(rawParticipant);
    } catch (e) {
      console.error(e);
    }

    if (Array.isArray(parsed)) {
      savedIds = parsed.map(id => String(id));
    }

    if (registeredIds && registeredIds.length > 0) {
      registeredIds.forEach(id => {
        if (!savedIds.includes(String(id))) savedIds.push(String(id));
      });
    }

    const filtered = allContests.filter(c => savedIds.includes(c.id));
    setActiveContests(filtered);

    if (filtered.length > 0) {
      // Nếu chưa chọn hoặc ID đã chọn không nằm trong danh sách đăng ký thì gán mặc định phần tử đầu
      if (!selectedContestId || !filtered.some(c => c.id === selectedContestId)) {
        setSelectedContestId(filtered[0].id);
      }
    } else {
      setSelectedContestId('');
    }
  };

  useEffect(() => {
    loadRegistered();
    window.addEventListener('storage', loadRegistered);
    window.addEventListener('contestRegistrationChanged', loadRegistered);

    const interval = setInterval(loadRegistered, 500); // Tự động đồng bộ liên tục khi chuyển tab

    return () => {
      window.removeEventListener('storage', loadRegistered);
      window.removeEventListener('contestRegistrationChanged', loadRegistered);
      clearInterval(interval);
    };
  }, [registeredIds]);

  useEffect(() => {
    const savedRolls = localStorage.getItem('participant_film_rolls');
    if (savedRolls) {
      try {
        const parsed: FilmRoll[] = JSON.parse(savedRolls);
        setRolls(parsed);
        if (parsed.length > 0) {
          setSelectedRollId(parsed[0].id);
          setForm(prev => ({
            ...prev,
            filmBrand: parsed[0].filmBrand,
            iso: parsed[0].iso,
            cameraBody: parsed[0].cameraBody,
            lens: parsed[0].lens,
            filmFormat: parsed[0].filmFormat || '35mm',
            developingLab: parsed[0].developingLab,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleRollChange = (rollId: string) => {
    setSelectedRollId(rollId);
    const found = rolls.find(r => r.id === rollId);
    if (found) {
      setForm(prev => ({
        ...prev,
        filmBrand: found.filmBrand,
        iso: found.iso,
        cameraBody: found.cameraBody,
        lens: found.lens,
        filmFormat: found.filmFormat || '35mm',
        developingLab: found.developingLab,
      }));
    }
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContestId) {
      alert('Bạn chưa chọn cuộc thi hoặc chưa đăng ký cuộc thi nào!');
      return;
    }
    if (!form.title.trim()) {
      alert('Vui lòng nhập Tiêu đề tác phẩm!');
      return;
    }
    if (!photoUrl) {
      alert('Vui lòng tải ảnh scan lên!');
      return;
    }

    const newSubmission = {
      ...form,
      id: `sub-${Date.now()}`,
      contestId: selectedContestId,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
      submittedAt: new Date().toLocaleDateString('vi-VN'),
      status: 'Đang chờ duyệt',
      aiFlag: 'Hợp lệ (An toàn - Không phát hiện bất thường)',
      similarityScore: '1.2% (Độc bản cao)',
      aiKeywords: ['Analog', 'Film Stock', 'Saigon', 'Vintage'],
      feedback: 'Hệ thống đã tiếp nhận bài dự thi và thông số metadata.',
    };

    const existing = JSON.parse(localStorage.getItem('participant_submissions') || '[]');
    localStorage.setItem('participant_submissions', JSON.stringify([newSubmission, ...existing]));

    alert('Gửi bài dự thi thành công!');
    onSubmitSuccess();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Nộp Ảnh & Metadata Kỹ Thuật</h2>
        <p className="text-slate-600 text-sm">Điền đầy đủ thông tin metadata ảnh phim và tải file ảnh scan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn Cuộc Thi Đã Đăng Ký *</label>
          <select
            value={selectedContestId}
            onChange={(e) => setSelectedContestId(e.target.value)}
            className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white font-medium cursor-pointer"
          >
            {activeContests.length > 0 ? (
              activeContests.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))
            ) : (
              <option value="">-- Bạn chưa đăng ký cuộc thi nào (Vui lòng bấm Đăng ký ở mục Cuộc thi) --</option>
            )}
          </select>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" /> 1. Thông tin tác phẩm
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Tác Phẩm *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Hơi Thở Sài Gòn Xưa..."
              className="w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô Tả & Thông Điệp</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Chia sẻ câu chuyện đằng sau bức ảnh phim..."
              className="w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <Disc className="w-4 h-4 text-blue-600" /> 2. 10 Trường Metadata Bắt Buộc Của Ảnh Phim
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn Từ Cuộn Phim Đã Khai Báo (Tự động điền nhanh)</label>
            <select
              value={selectedRollId}
              onChange={(e) => handleRollChange(e.target.value)}
              className="w-full px-3.5 py-2 border rounded-xl text-sm bg-white cursor-pointer"
            >
              <option value="">-- Hoặc tự nhập bên dưới --</option>
              {rolls.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.rollCode} - {r.filmBrand} (ISO {r.iso}) - {r.cameraBody}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Film brand / film stock *</label>
              <input
                type="text"
                required
                value={form.filmBrand}
                onChange={(e) => setForm({ ...form, filmBrand: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ISO *</label>
              <input
                type="number"
                required
                value={form.iso}
                onChange={(e) => setForm({ ...form, iso: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Camera body *</label>
              <input
                type="text"
                required
                value={form.cameraBody}
                onChange={(e) => setForm({ ...form, cameraBody: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lens *</label>
              <input
                type="text"
                required
                value={form.lens}
                onChange={(e) => setForm({ ...form, lens: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Film format *</label>
              <input
                type="text"
                required
                value={form.filmFormat}
                onChange={(e) => setForm({ ...form, filmFormat: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Frame number *</label>
              <input
                type="number"
                required
                value={form.frameNumber}
                onChange={(e) => setForm({ ...form, frameNumber: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shooting location *</label>
              <input
                type="text"
                required
                value={form.shootingLocation}
                onChange={(e) => setForm({ ...form, shootingLocation: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Developing laboratory *</label>
              <input
                type="text"
                required
                value={form.developingLab}
                onChange={(e) => setForm({ ...form, developingLab: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scanning specifications *</label>
              <input
                type="text"
                required
                value={form.scanningSpecs}
                onChange={(e) => setForm({ ...form, scanningSpecs: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Negative / Contact sheet *</label>
              <input
                type="text"
                required
                value={form.negativeContactSheet}
                onChange={(e) => setForm({ ...form, negativeContactSheet: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" /> 3. Tải File Ảnh Scan
          </h3>
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 relative hover:bg-slate-100 transition cursor-pointer">
            <input
              type="file"
              accept="image/*"
              required
              onChange={handleSimulateUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {photoUrl ? (
              <div className="space-y-2">
                <img src={photoUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-sm" />
                <span className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Tải ảnh scan thành công! Bấm để thay đổi
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">Bấm hoặc kéo thả file ảnh scan vào đây</p>
                <p className="text-xs text-slate-500">Hỗ trợ định dạng JPG, PNG chất lượng cao</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-200 text-sm cursor-pointer"
        >
          Gửi Bài Dự Thi Ngay
        </button>
      </form>
    </div>
  );
}