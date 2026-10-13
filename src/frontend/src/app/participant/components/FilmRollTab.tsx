import React, { useState } from 'react';
import { Film, Plus } from 'lucide-react';

export function FilmRollTab() {
  const [selectedRoll, setSelectedRoll] = useState<number>(1);

  const filmRolls = [
    { id: 1, name: 'Roll #001 - Kodak Portra 400', specs: '36 frame • 35mm • Máy: Canon AE-1', status: 'Đang sử dụng', count: 12 },
    { id: 2, name: 'Roll #002 - Fuji Superia 400', specs: '36 frame • 35mm • Máy: Nikon FM2', status: 'Chưa dùng', count: 0 },
    { id: 3, name: 'Roll #003 - Ilford HP5+', specs: '36 frame • 35mm • Máy: Canon AE-1', status: 'Đã dùng hết', count: 36 }
  ];

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Film Roll & Frame</h1>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1A6EDB] hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Thêm cuộn phim
        </button>
      </div>

      <div className="space-y-4">
        {filmRolls.map((roll) => (
          <div
            key={roll.id}
            onClick={() => setSelectedRoll(roll.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
              selectedRoll === roll.id ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <Film className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{roll.name}</h3>
                <p className="text-xs text-slate-500">{roll.specs}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              {roll.count} / 36 frame đã dùng
            </span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <h3 className="font-extrabold text-base text-slate-900 mb-4">
          Chi tiết frame (Roll #{selectedRoll.toString().padStart(3, '0')})
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {Array.from({ length: 36 }).map((_, idx) => {
            const frameNumber = idx + 1;
            const isUsed = frameNumber <= (selectedRoll === 1 ? 12 : selectedRoll === 3 ? 36 : 0);
            return (
              <div
                key={idx}
                className={`h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                  isUsed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {frameNumber}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}