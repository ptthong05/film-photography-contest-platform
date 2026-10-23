import { ShieldAlert } from 'lucide-react';
import type { Role } from '../types/user';
import { ROLE_LABEL } from '../utils/rolePortal';

interface AccessDeniedProps {
  role: Role;
  onGoToMyPortal: () => void;
  onGoHome: () => void;
  onLogout: () => void;
}

/** Hiện khi đã đăng nhập nhưng mở trang quản lý của role khác (vd. Thí sinh gõ #/admin). */
export function AccessDenied({ role, onGoToMyPortal, onGoHome, onLogout }: AccessDeniedProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Bạn không có quyền truy cập trang này</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tài khoản của bạn là <span className="font-semibold text-slate-700">{ROLE_LABEL[role]}</span>. Hãy đăng
          nhập bằng tài khoản khác nếu bạn cần vào trang này.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onGoToMyPortal}
            className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Về trang {ROLE_LABEL[role]}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onGoHome}
              className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Trang chủ
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
