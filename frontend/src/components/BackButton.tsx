import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label: string;
  onClick: () => void;
}

/** Component dùng chung mẫu: nút quay lại cố định góc trên bên trái. */
export function BackButton({ label, onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 text-xs font-semibold text-zinc-200 shadow-xl backdrop-blur transition-all hover:bg-zinc-800 cursor-pointer"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
