import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastNotice {
  id?: number | string;
  type?: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastNotice | string | null;
  onClose: () => void;
  duration?: number;
}

export function Toast({ toast, onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const message = typeof toast === 'string' ? toast : toast.message;
  const type: ToastType = typeof toast === 'string' ? 'success' : (toast.type ?? 'success');

  const borderColor =
    type === 'success' ? '#86efac' : type === 'error' ? '#fca5a5' : '#93c5fd';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-6 right-6 z-50 flex max-w-md items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4"
      style={{ borderColor }}
    >
      {type === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
      {type === 'error' && <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />}
      {type === 'info' && <Info className="h-5 w-5 shrink-0 text-blue-600" />}

      <span className="text-sm font-semibold text-slate-800">{message}</span>

      <button
        type="button"
        onClick={onClose}
        className="ml-1 cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Đóng thông báo"
      >
        <X size={15} />
      </button>
    </div>
  );
}

