import React, { useState } from 'react';
import { X, Calendar, Users, Award, ShieldCheck, MapPin, Share2, Info, FileText, CheckCircle2 } from 'lucide-react';
import type { ContestItem } from './LiveContestsSection';

interface ContestDetailModalProps {
  contest: ContestItem | null;
  onClose: () => void;
  onRegisterSubmit?: (contestId: string) => void;
}

export function ContestDetailModal({ contest, onClose, onRegisterSubmit }: ContestDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'rules' | 'prizes' | 'faq'>('info');

  if (!contest) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={contest.image}
            alt={contest.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Banner content */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
                {contest.statusLabel}
              </span>
              {contest.categories.map((c, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full text-xs bg-white/20 backdrop-blur-md text-white">
                  {c}
                </span>
              ))}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {contest.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Thời gian: {contest.startDate} - {contest.endDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{contest.participantsCount} tác giả đã đăng ký</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation tabs inside modal */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/60">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Thông tin cuộc thi
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Thể lệ & Quy định
          </button>
          <button
            onClick={() => setActiveTab('prizes')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'prizes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Cơ cấu giải thưởng
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 max-h-[45vh] overflow-y-auto space-y-4 text-slate-700 text-sm">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Mục đích & Ý nghĩa</h4>
                <p className="text-slate-600 leading-relaxed">
                  {contest.description || 'Ghi lại những khoảnh khắc của thời đại nhiếp ảnh phim. Khám phá vẻ đẹp thuần khiết từ các cuộn phim cổ điển, lan toả niềm đam mê chụp ảnh phim cơ học truyền thống đến cộng đồng trẻ.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Hạn nộp bài</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{contest.endDate}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Thời gian mở cổng chấm: 01/10/2025</div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="text-xs font-semibold text-blue-600 uppercase">Tổng giá trị giải thưởng</div>
                  <div className="text-base font-bold text-blue-900 mt-1">{contest.prizePool}</div>
                  <div className="text-xs text-blue-600 mt-0.5">Bao gồm hiện kim & cuộn phim độc quyền</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-base">Tiêu chí hợp lệ</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Ảnh phải được chụp bằng máy ảnh phim (Film 35mm, 120 Medium Format, Large Format).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cho phép scan file âm bản chất lượng cao, giữ nguyên độ hạt tự nhiên của film.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Không chấp nhận ảnh kỹ thuật số giả lập màu phim hoặc ảnh can thiệp AI tạo sinh.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mỗi thí sinh được gửi tối đa 5 tác phẩm đơn hoặc 1 bộ ảnh (tối đa 8 ảnh).</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'prizes' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-900">🥇 Giải Nhất (1 giải)</div>
                  <div className="text-xs text-amber-700">20.000.000 VNĐ tiền mặt + Máy ảnh Leica M6 + Cúp vàng lưu niệm</div>
                </div>
                <Award className="w-7 h-7 text-amber-500" />
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">🥈 Giải Nhì (2 giải)</div>
                  <div className="text-xs text-slate-600">10.000.000 VNĐ + 20 cuộn phim Kodak Portra 400 + Bằng khen</div>
                </div>
                <Award className="w-6 h-6 text-slate-400" />
              </div>
              <div className="p-3.5 rounded-xl border border-amber-100 bg-orange-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-orange-900">🥉 Giải Ba (3 giải)</div>
                  <div className="text-xs text-orange-700">5.000.000 VNĐ + 10 cuộn phim Fujifilm 200 + Bằng khen</div>
                </div>
                <Award className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 hidden sm:block">
            Tất cả tác phẩm dự thi được AI xác thực tính trung thực film stock.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onRegisterSubmit?.(contest.id);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              Đăng ký dự thi ngay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
