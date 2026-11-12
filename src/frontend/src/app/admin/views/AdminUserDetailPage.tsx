import { ArrowLeft, Award, Calendar, CheckCircle2, Clock, FileImage, LockKeyhole, Mail, Trophy, UserCheck, UserRound } from 'lucide-react';
import { ROLE_INFO, STATUS_INFO, type AdminUser, type UserStatus } from '../types/adminUser';

interface AdminUserDetailPageProps {
  user: AdminUser;
  onBack: () => void;
  onEdit: () => void;
  onChangeStatus: (id: string, status: UserStatus) => void;
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function getInitials(fullName: string): string {
  return fullName.trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase();
}

// Danh sách cuộc thi mẫu dùng để hiển thị lịch sử
const MOCK_CONTEST_POOL = [
  { name: 'Analog Moments 2026', category: 'Đời sống · Chân dung', date: 'Tháng 10/2026' },
  { name: 'Film & City 2026', category: 'Đường phố · Kiến trúc', date: 'Tháng 09/2026' },
  { name: 'The Vintage Look', category: 'Chân dung · Nghệ thuật', date: 'Tháng 08/2026' },
  { name: 'Black & White Stories', category: 'Đen trắng · Phim 35mm', date: 'Tháng 06/2026' },
  { name: 'Nature on Film', category: 'Phong cảnh · Thiên nhiên', date: 'Tháng 05/2026' },
  { name: 'Golden Hour Film', category: 'Phong cảnh · Hoàng hôn', date: 'Tháng 04/2026' },
  { name: 'Frames of Everyday Life', category: 'Đời sống thường nhật', date: 'Tháng 03/2026' },
  { name: 'Classic Street Photography', category: 'Đường phố analog', date: 'Tháng 01/2026' },
];

export function AdminUserDetailPage({ user, onBack, onEdit, onChangeStatus }: AdminUserDetailPageProps) {
  const roleInfo = ROLE_INFO[user.role];
  const statusInfo = STATUS_INFO[user.status];

  const isJudge = user.role === 'JUDGE';
  const isParticipant = user.role === 'PARTICIPANT';
  const isOrganizer = user.role === 'ORGANIZER';

  // Lấy danh sách cuộc thi tương ứng với contestCount của user
  const historyItems = MOCK_CONTEST_POOL.slice(0, Math.min(user.contestCount, MOCK_CONTEST_POOL.length));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Quay lại danh sách người dùng"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Chi tiết người dùng</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Mã: {user.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B356B]">{user.fullName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Chỉnh sửa thông tin
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cột trái: Thẻ người dùng */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
              {getInitials(user.fullName) || <UserRound size={32} />}
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#0B356B]">{user.fullName}</h2>
            <p className="mt-1 text-sm text-slate-600 flex items-center justify-center gap-1.5">
              <Mail size={15} className="text-slate-400" />
              {user.email}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${roleInfo.classes}`}>
                {roleInfo.label}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${statusInfo.classes}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusInfo.label}
              </span>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">
                  {isJudge ? 'Cuộc thi chấm' : isOrganizer ? 'Cuộc thi tổ chức' : 'Số cuộc thi'}
                </p>
                <p className="mt-1 text-xl font-bold text-[#0B356B]">{user.contestCount}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Ngày tham gia</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{formatDate(user.joinedAt)}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-[#0B356B]">Thao tác trạng thái nhanh</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onChangeStatus(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LockKeyhole size={14} />
                {user.status === 'ACTIVE' ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản'}
              </button>
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin chi tiết */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#0B356B]">Hồ sơ tài khoản & Quyền hạn</h2>
            <dl className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <dt className="text-xs font-medium text-slate-500">Mã tài khoản</dt>
                <dd className="mt-1 text-sm font-bold text-slate-800">{user.id}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <dt className="text-xs font-medium text-slate-500">Email đăng nhập</dt>
                <dd className="mt-1 text-sm font-bold text-slate-800">{user.email}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <dt className="text-xs font-medium text-slate-500">Vai trò hệ thống</dt>
                <dd className="mt-1 text-sm font-bold text-slate-800">{roleInfo.label}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <dt className="text-xs font-medium text-slate-500">Trạng thái xác thực</dt>
                <dd className="mt-1 text-sm font-bold text-emerald-700">Đã kích hoạt</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <dt className="text-xs font-medium text-slate-500">Ngày đăng ký</dt>
                <dd className="mt-1 text-sm font-bold text-slate-800">{formatDate(user.joinedAt)}</dd>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <dt className="text-xs font-medium text-slate-500">Xác thực 2 bước (2FA)</dt>
                <dd className="mt-1 text-sm font-bold text-slate-700">Chưa thiết lập</dd>
              </div>
            </dl>
          </div>

          {/* Khối lịch sử: Lịch sử chấm điểm (với Giám khảo) hoặc Lịch sử tham gia cuộc thi (với Người tham gia / vai trò khác) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-[#0B356B]">
              {isJudge ? 'Lịch sử chấm điểm' : 'Lịch sử tham gia cuộc thi gần đây'}
            </h2>

            {user.contestCount === 0 || historyItems.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
                {isJudge
                  ? 'Giám khảo chưa được phân công hoặc chưa có dữ liệu chấm điểm cuộc thi nào.'
                  : 'Người dùng chưa có lịch sử tham gia hoặc nộp bài tại cuộc thi nào.'}
              </div>
            ) : (
              <div className="space-y-3">
                {historyItems.map((item, idx) => {
                  const evalCount = 18 + (idx * 11) % 40;
                  const entriesCount = 1 + (idx % 3);
                  return (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                          {isJudge ? <Trophy size={17} /> : <FileImage size={17} />}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-[#0B356B]">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.category} • {item.date}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        {isJudge ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            <CheckCircle2 size={13} />
                            Đã chấm {evalCount} bài
                          </span>
                        ) : isParticipant ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                            Đã nộp {entriesCount} tác phẩm
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                            Tham gia quản lý
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
