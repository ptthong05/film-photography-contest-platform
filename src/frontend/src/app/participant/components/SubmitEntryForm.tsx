import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, CheckCircle2, Disc, Camera, MapPin, FileText, RefreshCw, AlertCircle } from 'lucide-react';

interface SubmitEntryFormProps {
  onSubmitSuccess?: () => void;
  setActiveTab?: (tab: string) => void;
}

export function SubmitEntryForm({ setActiveTab }: SubmitEntryFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const allContests = [
    { id: 'contest-01', title: 'Analog Moments 2025', status: 'Đang diễn ra' },
    { id: 'contest-02', title: 'Film & City', status: 'Đang diễn ra' },
    { id: 'contest-03', title: 'The Vintage Look', status: 'Sắp diễn ra' },
    { id: 'contest-04', title: 'Film Portrait 2025', status: 'Đang diễn ra' },
    { id: 'contest-05', title: 'Góc Phố Film', status: 'Đang diễn ra' },
    { id: 'contest-06', title: 'Nắng Cuối Ngày', status: 'Sắp diễn ra' },
    { id: 'contest-07', title: 'Hơi Thở Analog 2024', status: 'Đã kết thúc' },
    { id: 'contest-08', title: 'Sài Gòn Xưa & Nay', status: 'Đã kết thúc' },
  ];

  const [registeredContests, setRegisteredContests] = useState<{ id: string; title: string; status: string }[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>('');

  useEffect(() => {
    try {
      const savedIds = localStorage.getItem('participant_registered_contests');
      const ids: string[] = savedIds ? JSON.parse(savedIds) : [];
      const filtered = allContests.filter(c => ids.includes(c.id));
      if (filtered.length > 0) {
        setRegisteredContests(filtered);
        setSelectedContestId(filtered[0].id);
      } else {
        setRegisteredContests(allContests.slice(0, 3));
        setSelectedContestId(allContests[0].id);
      }
    } catch (e) {
      console.error(e);
      setRegisteredContests(allContests.slice(0, 3));
      setSelectedContestId(allContests[0].id);
    }
  }, []);

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

      const newEntry = {
        id: `sub-${Date.now().toString().slice(-4)}`,
        contestId: selectedContestObj?.id || 'contest-01',
        contestTitle: selectedContestObj?.title || 'Analog Moments 2025',
        title,
        description: description || 'Tác phẩm nhiếp ảnh phim lưu giữ khoảnh khắc độc bản.',
        photoUrl: uploadedImage,
        submittedAt: new Date().toLocaleDateString('vi-VN'),
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
    <div className="space-y-8 max-w-5xl mx-auto pb-20 font-sans text-slate-900">
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 font-black text-sm animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-white" />
          <span>Nộp tác phẩm thành công! Đã reset form để nộp tác phẩm tiếp theo.</span>
        </div>
      )}

      {/* Header Form */}
      <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
          ● HỆ THỐNG GỬI BÀI DỰ THI TRỰC TUYẾN
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Nộp Ảnh & Metadata Kỹ Thuật</h1>
        <p className="text-base text-slate-600 font-medium">
          Điền đầy đủ thông tin metadata ảnh phim và tải file ảnh scan chất lượng cao theo tiêu chuẩn của Ban tổ chức.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-10">

        {/* Chọn cuộc thi đã đăng ký */}
        <div className="space-y-3">
          <label className="block text-sm font-black text-slate-800 uppercase tracking-wider">
            Chọn Cuộc Thi Đã Đăng Ký <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedContestId}
            onChange={(e) => setSelectedContestId(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
          >
            {registeredContests.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.status})
              </option>
            ))}
          </select>
        </div>

        {/* 1. Thông tin tác phẩm */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <h3 className="font-black text-slate-900 text-xl flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" /> 1. Thông tin tác phẩm
          </h3>

          <div className="space-y-3">
            <label className="block text-sm font-black text-slate-800 uppercase tracking-wider">
              Tên Tác Phẩm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Hơi Thở Sài Gòn Xưa..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-bold transition"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-black text-slate-800 uppercase tracking-wider">
              Mô Tả & Thông Điệp Tác Phẩm
            </label>
            <textarea
              rows={4}
              placeholder="Chia sẻ câu chuyện đằng sau bức ảnh phim của bạn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition"
            />
          </div>
        </div>

        {/* 2. 10 Trường Metadata Bắt Buộc */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <h3 className="font-black text-slate-900 text-xl flex items-center gap-3">
              <Disc className="w-6 h-6 text-blue-600" /> 2. 10 Trường Metadata Bắt Buộc Của Ảnh Phim
            </h3>
            <span className="text-xs font-black text-blue-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
              ⚡ Tự động điền từ cuộn film đã khai báo
            </span>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-black text-slate-800 uppercase tracking-wider">
              Chọn Từ Cuộn Phim Đã Khai Báo
            </label>
            <select
              value={filmRoll}
              onChange={(e) => setFilmRoll(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            >
              <option>ROLL-2026-03 - Fujifilm C200 (ISO 400) - Minolta SRT 101</option>
              <option>ROLL-2026-02 - Kodak Portra 400 (ISO 400) - Canon AE-1</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Film brand / film stock *</label>
              <input type="text" value={filmBrand} onChange={(e) => setFilmBrand(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">ISO *</label>
              <input type="text" value={iso} onChange={(e) => setIso(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Camera body *</label>
              <input type="text" value={cameraBody} onChange={(e) => setCameraBody(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Lens *</label>
              <input type="text" value={lens} onChange={(e) => setLens(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Film format *</label>
              <input type="text" value={filmFormat} onChange={(e) => setFilmFormat(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Frame number *</label>
              <input type="text" value={frameNumber} onChange={(e) => setFrameNumber(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Shooting location *</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Developing laboratory *</label>
              <input type="text" value={lab} onChange={(e) => setLab(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Scanning specifications *</label>
              <input type="text" value={scanningSpecs} onChange={(e) => setScanningSpecs(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">Negative / Contact sheet *</label>
              <input type="text" value={negativeSheet} onChange={(e) => setNegativeSheet(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* 3. Tải File Ảnh Scan từ máy tính */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <h3 className="font-black text-slate-900 text-xl flex items-center gap-3">
            <Upload className="w-6 h-6 text-blue-600" /> 3. Tải File Ảnh Scan Từ Máy Tính
          </h3>

          <div className="border-4 border-dashed border-blue-300 bg-blue-50/40 rounded-3xl p-12 text-center space-y-5 hover:bg-blue-50 transition relative">
            {uploadedImage ? (
              <div className="space-y-5 w-full flex flex-col items-center">
                <div className="relative w-full max-w-md h-80 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-black">
                  <img src={uploadedImage} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <p className="text-base font-black text-slate-800">📎 Đã chọn tệp: <span className="text-blue-600">{imageFileName}</span></p>

                <label className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2 active:scale-95">
                  <RefreshCw className="w-5 h-5" /> Chọn ảnh khác từ máy tính
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/30">
                  <Upload className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-black text-slate-800">Bấm hoặc kéo thả file ảnh scan vào đây</p>
                  <p className="text-sm text-slate-500 font-bold">Hỗ trợ định dạng JPG, PNG chất lượng cao</p>
                </div>

                <label className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-black text-sm rounded-2xl shadow-md hover:bg-blue-50 transition cursor-pointer border border-blue-200 active:scale-95">
                  <span>Chọn tệp từ máy tính</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Button Nộp Bài */}
        <div className="pt-8 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-2xl transition cursor-pointer active:scale-95 flex items-center gap-3 disabled:opacity-50"
          >
            <Sparkles className="w-6 h-6 text-amber-300" />
            <span>{isSubmitting ? 'Đang nộp tác phẩm...' : 'Xác Nhận Nộp Tác Phẩm Dự Thi'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}