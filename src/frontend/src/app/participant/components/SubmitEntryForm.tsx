import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface Contest {
  id: number;
  title: string;
}

interface SubmitEntryFormProps {
  registeredContests: Contest[];
  onSubmitSuccess: () => void;
}

export function SubmitEntryForm({ registeredContests, onSubmitSuccess }: SubmitEntryFormProps) {
  const [submitStep, setSubmitStep] = useState<number>(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">Nộp ảnh dự thi</h1>
        <span className="font-bold text-blue-600">Bước {submitStep} / 4</span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
        <div className={`p-2 rounded ${submitStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>1. Cuộc thi</div>
        <div className={`p-2 rounded ${submitStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>2. Tải ảnh</div>
        <div className={`p-2 rounded ${submitStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>3. Metadata</div>
        <div className={`p-2 rounded ${submitStep === 4 ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>4. Xác nhận</div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {submitStep === 1 && (
        <div>
          <label className="font-bold block mb-2 text-slate-700">Chọn cuộc thi đã đăng ký</label>
          <select className="w-full p-3 border border-slate-300 rounded-xl bg-white font-semibold text-slate-800">
            {registeredContests.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      )}

      {submitStep === 2 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-3 border-dashed border-blue-300 p-10 text-center cursor-pointer bg-blue-50/50 rounded-2xl hover:bg-blue-100/50 transition-all"
        >
          {uploadedImage ? (
            <img src={uploadedImage} alt="Preview" className="max-h-40 mx-auto rounded shadow-md" />
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 mx-auto text-blue-600" />
              <p className="font-bold text-blue-700">Tải lên ảnh scan phim từ máy tính</p>
            </div>
          )}
        </div>
      )}

      {submitStep === 3 && (
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Film brand (Kodak Portra 400)" className="p-3 border border-slate-300 rounded-xl" />
          <input type="text" placeholder="ISO (400)" className="p-3 border border-slate-300 rounded-xl" />
        </div>
      )}

      {submitStep === 4 && (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-800">
          Xác nhận hoàn tất gửi bài dự thi
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-slate-200">
        {submitStep > 1 ? (
          <button onClick={() => setSubmitStep(submitStep - 1)} className="px-6 py-2 bg-slate-200 rounded-xl font-bold">Quay lại</button>
        ) : <div />}

        {submitStep < 4 ? (
          <button onClick={() => setSubmitStep(submitStep + 1)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Tiếp tục →</button>
        ) : (
          <button onClick={onSubmitSuccess} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold">Gửi bài</button>
        )}
      </div>
    </div>
  );
}