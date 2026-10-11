import React from 'react';
import { X, Heart, Eye, Share2, Camera, Film, Aperture, Clock, Award } from 'lucide-react';

export interface PhotoDetailData {
  id: string;
  title: string;
  author: string;
  image: string;
  award?: string;
  contestName?: string;
  filmStock?: string;
  camera?: string;
  lens?: string;
  likes?: number;
  views?: number;
}

interface PhotoDetailModalProps {
  photo: PhotoDetailData | null;
  onClose: () => void;
}

export function PhotoDetailModal({ photo, onClose }: PhotoDetailModalProps) {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Main Photo Area */}
          <div className="lg:col-span-8 bg-black flex items-center justify-center relative min-h-[350px] lg:min-h-[500px]">
            <img
              src={photo.image}
              alt={photo.title}
              className="max-h-[500px] w-auto object-contain"
            />
            {photo.award && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-lg">
                  <Award className="w-3.5 h-3.5" />
                  {photo.award}
                </span>
              </div>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className="lg:col-span-4 p-6 flex flex-col justify-between bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800">
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{photo.title}</h3>
                <p className="text-sm text-slate-400 mt-1">Tác giả: <span className="text-white font-medium">{photo.author}</span></p>
                {photo.contestName && (
                  <p className="text-xs text-blue-400 mt-0.5">{photo.contestName}</p>
                )}
              </div>

              {/* Film Technical Specs */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Thông số tác phẩm</div>

                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Film className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Cuộn phim: <strong className="text-white">{photo.filmStock || 'Kodak Portra 400'}</strong></span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Camera className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Máy ảnh: <strong className="text-white">{photo.camera || 'Canon AE-1 Program'}</strong></span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Aperture className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ống kính: <strong className="text-white">{photo.lens || 'FD 50mm f/1.4'}</strong></span>
                </div>
              </div>
            </div>

            {/* Interaction Footer */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{photo.views || 450}</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <Heart className="w-4 h-4 fill-rose-400" />
                  <span>{photo.likes || 120}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
