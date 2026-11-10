import React, { useState, useEffect, useRef } from 'react';
import { Upload, Sparkles, CheckCircle2, Disc, Camera, MapPin, FileText, RefreshCw, AlertCircle, Clock, ChevronDown, Trophy, Check } from 'lucide-react';
import { getUnifiedParticipantContests } from '../../../services/unifiedContestService';
import { isSubmissionDeadlinePassed, getAllUnifiedContests } from '../../../services/contestSyncService';
import type { Contest } from '../../../types/contest';

interface SubmitEntryFormProps {
  onSubmitSuccess?: () => void;
  setActiveTab?: (tab: string) => void;
}

export function SubmitEntryForm({ setActiveTab }: SubmitEntryFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [registeredContests, setRegisteredContests] = useState<{ id: string; title: string; status: string; endDate?: string }[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>('');
  const [isContestDropdownOpen, setIsContestDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshContests = () => {
    try {
      const unified = getUnifiedParticipantContests();
      const allUnified = getAllUnifiedContests();
      const allContests = unified.map(c => {
        const found = allUnified.find(u => u.id === c.id);
        return {
          id: c.id,
          title: c.title,
          status: c.status,
          endDate: found?.endDate || c.dateRange,
        };
      });
      const savedIds = localStorage.getItem('participant_registered_contests');
      const ids: string[] = savedIds ? JSON.parse(savedIds) : [];
      const filtered = allContests.filter(c => ids.includes(c.id));
      if (filtered.length > 0) {
        setRegisteredContests(filtered);
        setSelectedContestId(prev => prev || filtered[0].id);
      } else if (allContests.length > 0) {
        setRegisteredContests(allContests);
        setSelectedContestId(prev => prev || allContests[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshContests();
    window.addEventListener('filmcontest:contests-updated', refreshContests);
    window.addEventListener('storage', refreshContests);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsContestDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('filmcontest:contests-updated', refreshContests);
      window.removeEventListener('storage', refreshContests);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedContestObj = registeredContests.find(c => c.id === selectedContestId) || registeredContests[0];
  const isDeadlinePassed = selectedContestObj ? isSubmissionDeadlinePassed(selectedContestObj) : false;

  const [filmRoll, setFilmRoll] = useState('ROLL-2026-03 - Fujifilm C200 (ISO 400) - Minolta SRT 101');
  const [filmBrand, setFilmBrand] = useState('Fujifilm C200');
  const [iso, setIso] = useState('400');
  const [cameraBody, setCameraBody] = useState('Minolta SRT 101');
  const [lens, setLens] = useState('50mm f/1.8');
  const [filmFormat, setFilmFormat] = useState('35mm');
  const [frameNumber, setFrameNumber] = useState('1');
  const [location, setLocation] = useState('Quận 1, TP. Hồ Chí Minh');
  const [lab, setLab] = useState('Atomic Lab');
  const [scanningSpecs, setScanningSpecs] = useState('Noritsu HS-1800 (2000x3000px)');
  const [negativeSheet, setNegativeSheet] = useState('Có (Negative Scan chuẩn)');

  // BỎ ẢNH MẶC ĐỊNH: Khởi tạo giá trị ban đầu là null
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [successToast, setSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
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

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setUploadedImage(compressedBase64);
          };
          img.src = uploadEvent.target?.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeadlinePassed) {
      alert('⏰ Cuộc thi này đã kết thúc thời hạn nhận bài! Hệ thống đã khóa cổng nộp bài.');
      return;
    }
    if (!title.trim()) {
      alert('Vui lòng nhập tên tác phẩm!');
      return;
    }
    if (!uploadedImage) {
      alert('Vui lòng tải lên file ảnh scan!');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedContestObj = registeredContests.find(c => c.id === selectedContestId) || registeredContests[0];
      const author = localStorage.getItem('participant_user_name') || 'Hồ Thanh Bình (Thí sinh)';
      const timestamp = Date.now();
      const submissionId = `sub-${timestamp}`;
      const nowIsoDate = new Date().toISOString().slice(0, 10);
      const nowIsoTime = new Date().toISOString();

      const newEntry = {
        id: submissionId,
        code: `SUB-${timestamp.toString().slice(-6).toUpperCase()}`,
        contestId: selectedContestObj?.id || 'CT-2026-001',
        contestTitle: selectedContestObj?.title || 'Analog Moments 2026',
        contestName: selectedContestObj?.title || 'Analog Moments 2026',
        authorName: author,
        title,
        description: description || 'Tác phẩm nhiếp ảnh phim lưu giữ khoảnh khắc độc bản.',
        photoUrl: uploadedImage,
        imageUrl: uploadedImage,
        submittedAt: nowIsoDate,
        createdAt: nowIsoTime,
        status: 'Đang chờ duyệt',
        filmBrand,
        iso,
        cameraBody,
        lens,
        filmFormat,
        frameNumber,
        shootingLocation: location,
        developingLab: lab,
        scanningSpecs,
        negativeContactSheet: negativeSheet,
        aiFlag: 'Hợp lệ (Đang kiểm định AI)',
        similarityScore: '0.9% (Độc bản cao)'
      };

      const existingEntries = localStorage.getItem('participant_entries');
      let entryList = [];
      if (existingEntries) {
        try {
          entryList = JSON.parse(existingEntries);
        } catch (err) {
          console.error(err);
        }
      }
      entryList.unshift(newEntry);
      localStorage.setItem('participant_entries', JSON.stringify(entryList));

      window.dispatchEvent(new Event('entrySubmitted'));
      window.dispatchEvent(new Event('filmcontest:submissions-updated'));
      window.dispatchEvent(new Event('assignmentChanged'));
      window.dispatchEvent(new Event('storage'));

      setSuccessToast(true);

      // RESET TRANG VỀ TRẠNG THÁI TRỐNG BAN ĐẦU ĐỂ NỘP TIẾP TÁC PHẨM KHÁC
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessToast(false);
        setTitle('');
        setDescription('');
        setUploadedImage(null);
        setImageFileName('');
      }, 1200);

    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Có lỗi xảy ra khi lưu bài nộp. Dung lượng ảnh có thể quá lớn.');
    }
  };

  return (
    <div className="space-y-5 w-full pb-16 font-sans text-slate-900">
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 font-black text-sm animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <span>Nộp tác phẩm thành công! Đã reset form để nộp tác phẩm tiếp theo.</span>
        </div>
      )}

      {/* Header Form */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
        <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-block">
          ● HỆ THỐNG GỬI BÀI DỰ THI TRỰC TUYẾN
        </span>
        <h1 className="text-xl md:text-2xl font-bold text-[#0B356B] tracking-tight">Nộp Ảnh & Metadata Kỹ Thuật</h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Điền đầy đủ thông tin metadata ảnh phim và tải file ảnh scan chất lượng cao theo tiêu chuẩn của Ban tổ chức.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">

        {/* Chọn cuộc thi đã đăng ký */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Chọn Cuộc Thi Đã Đăng Ký <span className="text-rose-500">*</span>
          </label>

          <button
            type="button"
            onClick={() => setIsContestDropdownOpen((prev) => !prev)}
            className="w-full px-4 py-2.5 bg-slate-50 hover:bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-left flex items-center justify-between transition cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <Trophy className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {selectedContestObj?.title || "Chọn cuộc thi..."}
              </span>
              {selectedContestObj && (
                <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedContestObj.status === 'Đang diễn ra'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : selectedContestObj.status === 'Sắp diễn ra'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  ● {selectedContestObj.status}
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${isContestDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {isContestDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl space-y-1">
              {registeredContests.map((c) => {
                const isSelected = c.id === selectedContestId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedContestId(c.id);
                      setIsContestDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs sm:text-sm cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        c.status === 'Đang diễn ra' ? 'bg-emerald-500' : c.status === 'Sắp diễn ra' ? 'bg-blue-500' : 'bg-slate-400'
                      }`} />
                      <span className="truncate">{c.title}</span>
                      <span className="text-[11px] text-slate-400 shrink-0 font-normal">({c.status})</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isDeadlinePassed && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm">⏰ ĐÃ HẾT HẠN NỘP BÀI DỰ THI</h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                Cuộc thi &quot;{selectedContestObj?.title}&quot; đã kết thúc thời hạn nhận bài theo cấu hình thời gian thật của Ban tổ chức. Cổng nộp bài hiện đã bị khóa, bạn không thể gửi bài dự thi cho cuộc thi này nữa.
              </p>
            </div>
          </div>
        )}

        {/* 1. Thông tin tác phẩm */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> 1. Thông tin tác phẩm
          </h3>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Tên Tác Phẩm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Hơi Thở Sài Gòn Xưa..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Mô Tả & Thông Điệp Tác Phẩm
            </label>
            <textarea
              rows={3}
              placeholder="Chia sẻ câu chuyện đằng sau bức ảnh phim của bạn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition"
            />
          </div>
        </div>

        {/* 2. 10 Trường Metadata Bắt Buộc */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Disc className="w-4 h-4 text-blue-600" /> 2. 10 Trường Metadata Bắt Buộc Của Ảnh Phim
            </h3>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              ⚡ Tự động điền từ cuộn film đã khai báo
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Chọn Từ Cuộn Phim Đã Khai Báo
            </label>
            <select
              value={filmRoll}
              onChange={(e) => setFilmRoll(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            >
              <option>ROLL-2026-03 - Fujifilm C200 (ISO 400) - Minolta SRT 101</option>
              <option>ROLL-2026-02 - Kodak Portra 400 (ISO 400) - Canon AE-1</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Film brand / film stock *</label>
              <input type="text" value={filmBrand} onChange={(e) => setFilmBrand(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">ISO *</label>
              <input type="text" value={iso} onChange={(e) => setIso(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Camera body *</label>
              <input type="text" value={cameraBody} onChange={(e) => setCameraBody(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Lens *</label>
              <input type="text" value={lens} onChange={(e) => setLens(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Film format *</label>
              <input type="text" value={filmFormat} onChange={(e) => setFilmFormat(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Frame number *</label>
              <input type="text" value={frameNumber} onChange={(e) => setFrameNumber(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Shooting location *</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Developing laboratory *</label>
              <input type="text" value={lab} onChange={(e) => setLab(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Scanning specifications *</label>
              <input type="text" value={scanningSpecs} onChange={(e) => setScanningSpecs(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Negative / Contact sheet *</label>
              <input type="text" value={negativeSheet} onChange={(e) => setNegativeSheet(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* 3. Tải File Ảnh Scan từ máy tính */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" /> 3. Tải File Ảnh Scan Từ Máy Tính
          </h3>

          <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-6 text-center space-y-3 hover:bg-blue-50 transition relative">
            {uploadedImage ? (
              <div className="space-y-3 w-full flex flex-col items-center">
                <div className="relative w-full max-w-sm h-60 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-black">
                  <img src={uploadedImage} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <p className="text-xs font-bold text-slate-800">📎 Đã chọn tệp: <span className="text-blue-600">{imageFileName}</span></p>

                <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95">
                  <RefreshCw className="w-3.5 h-3.5" /> Chọn ảnh khác
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-800">Bấm hoặc kéo thả file ảnh scan vào đây</p>
                  <p className="text-xs text-slate-400">Hỗ trợ định dạng JPG, PNG chất lượng cao</p>
                </div>

                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 font-semibold text-xs rounded-lg shadow-xs hover:bg-blue-50 transition cursor-pointer border border-blue-200 active:scale-95">
                  <span>Chọn tệp từ máy tính</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Button Nộp Bài */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isDeadlinePassed ? (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Cuộc thi đã đóng cổng nhận bài. Không thể gửi tác phẩm.
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              * Ảnh scan và thông số kỹ thuật sẽ được gửi đến Ban tổ chức để kiểm duyệt.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isDeadlinePassed}
            title={isDeadlinePassed ? 'Cuộc thi đã hết hạn nộp bài' : 'Xác nhận nộp tác phẩm'}
            className={`px-6 py-2.5 font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-2 ${
              isDeadlinePassed
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isSubmitting ? 'Đang nộp tác phẩm...' : isDeadlinePassed ? 'Đã hết hạn nộp bài' : 'Xác Nhận Nộp Tác Phẩm'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}