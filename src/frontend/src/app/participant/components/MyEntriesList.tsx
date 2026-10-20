import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, MessageSquare, FileText, Cpu, Tag, Edit3, Trash2 } from 'lucide-react';

interface SubmissionItem {
  id: string;
  title: string;
  description: string;
  photoUrl: string;
  submittedAt: string;
  status: string;
  aiFlag: string;
  similarityScore: string;
  aiKeywords: string[];
  filmBrand: string;
  iso: number;
  cameraBody: string;
  lens: string;
  filmFormat: string;
  frameNumber: number;
  shootingLocation: string;
  developingLab: string;
  scanningSpecs: string;
  feedback?: string;
}

export function MyEntriesList() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SubmissionItem | null>(null);
  const [editingItem, setEditingItem] = useState<SubmissionItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('participant_submissions');
    if (saved) {
      try {
        setSubmissions(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultSubmissions: SubmissionItem[] = [
        {
          id: 'sub-1',
          title: 'Hoàng Hôn Cầu Ba Son',
          description: 'Ghi lại ánh sáng chiều buông trên sông Sài Gòn bằng máy cơ.',
          photoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
          submittedAt: '12/10/2026',
          status: 'Đã duyệt',
          aiFlag: 'Hợp lệ (An toàn - Không phải AI)',
          similarityScore: '1.2% (Độc bản cao)',
          aiKeywords: ['Urban', 'Sunset', 'Saigon', 'Analog 35mm'],
          filmBrand: 'Kodak Portra 400',
          iso: 400,
          cameraBody: 'Leica M6',
          lens: 'Summicron 35mm',
          filmFormat: '35mm',
          frameNumber: 14,
          shootingLocation: 'Sài Gòn',
          developingLab: 'Llab Saigon',
          scanningSpecs: 'Noritsu HS-1800',
          feedback: 'Bức ảnh có độ tương phản và màu sắc phim rất tuyệt vời!',
        },
      ];
      setSubmissions(defaultSubmissions);
      localStorage.setItem('participant_submissions', JSON.stringify(defaultSubmissions));
    }
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài dự thi này không?')) {
      const updated = submissions.filter(s => s.id !== id);
      setSubmissions(updated);
      localStorage.setItem('participant_submissions', JSON.stringify(updated));
    }
  };

  const handleUpdateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = submissions.map(s => s.id === editingItem.id ? editingItem : s);
    setSubmissions(updated);
    localStorage.setItem('participant_submissions', JSON.stringify(updated));
    setEditingItem(null);
    alert('Cập nhật bài dự thi thành công!');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Bài Dự Thi Của Tôi</h2>
        <p className="text-slate-600 text-sm">Quản lý bài nộp (Sửa, Xóa) và xem kết quả kiểm duyệt, phân tích AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {submissions.map((sub) => (
          <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-5 space-y-3">
              <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100">
                <img src={sub.photoUrl} alt={sub.title} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                    sub.status === 'Đã duyệt'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg">{sub.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5" /> Ngày nộp: {sub.submittedAt}
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1.5 text-xs text-slate-700">
                <p className="flex items-center gap-1.5 font-bold text-blue-800">
                  <Cpu className="w-4 h-4 text-blue-600" /> Kết quả phân tích AI:
                </p>
                <p>• Trạng thái AI: <span className="font-semibold text-emerald-700">{sub.aiFlag || 'Hợp lệ'}</span></p>
                <p>• Độ tương đồng: <span className="font-semibold">{sub.similarityScore || 'Thấp (1.5%)'}</span></p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                  {sub.aiKeywords?.map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 rounded-md text-[10px] font-medium">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedItem(sub)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> Xem Chi Tiết Metadata
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingItem(sub)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 border rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Sửa
                </button>
                <button
                  onClick={() => handleDelete(sub.id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900">Chỉnh Sửa Bài Dự Thi</h3>
            <form onSubmit={handleUpdateSubmission} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Tác Phẩm *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô Tả</label>
                <textarea
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Địa Điểm Chụp</label>
                  <input
                    type="text"
                    value={editingItem.shootingLocation}
                    onChange={(e) => setEditingItem({ ...editingItem, shootingLocation: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số Frame</label>
                  <input
                    type="number"
                    value={editingItem.frameNumber}
                    onChange={(e) => setEditingItem({ ...editingItem, frameNumber: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 rounded-xl text-slate-600 bg-slate-100 font-semibold text-sm hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-white bg-blue-600 font-semibold text-sm hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-slate-900">{selectedItem.title}</h3>
            <img src={selectedItem.photoUrl} alt="Detail" className="w-full h-40 object-cover rounded-xl" />
            <div className="text-xs space-y-2 text-slate-700 border-t pt-3">
              <p className="font-bold text-blue-600">Thông tin tác phẩm:</p>
              <p><strong>Mô tả:</strong> {selectedItem.description || 'Không có mô tả'}</p>
              <p><strong>Trạng thái:</strong> {selectedItem.status}</p>

              <p className="font-bold text-blue-600 pt-2">Kết quả AI Phân tích:</p>
              <div className="p-3 bg-blue-50 rounded-xl space-y-1">
                <p>• <strong>AI Check:</strong> {selectedItem.aiFlag}</p>
                <p>• <strong>Similarity Check:</strong> {selectedItem.similarityScore}</p>
                <p>• <strong>Keywords:</strong> {selectedItem.aiKeywords?.join(', ')}</p>
              </div>

              <p className="font-bold text-blue-600 pt-2">Metadata ảnh phim:</p>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <p>• Film brand: {selectedItem.filmBrand}</p>
                <p>• ISO: {selectedItem.iso}</p>
                <p>• Camera body: {selectedItem.cameraBody}</p>
                <p>• Lens: {selectedItem.lens}</p>
                <p>• Film format: {selectedItem.filmFormat}</p>
                <p>• Frame number: #{selectedItem.frameNumber}</p>
                <p>• Location: {selectedItem.shootingLocation}</p>
                <p>• Lab: {selectedItem.developingLab}</p>
                <p>• Scanning: {selectedItem.scanningSpecs}</p>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl mt-3">
                <p className="font-bold flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Nhận xét / Feedback:</p>
                <p className="mt-1">{selectedItem.feedback || 'Đang chờ đánh giá từ Ban Giám Khảo.'}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}