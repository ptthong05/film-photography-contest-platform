import {
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  MoreVertical,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';
import { ROLE_INFO, STATUS_INFO, type AdminUser, type UserStatus } from '../types/adminUser';

interface UserManagementTableProps {
  users: AdminUser[]; // Các dòng của trang hiện tại (đã lọc, sắp xếp, phân trang)
  selectedIds: ReadonlySet<string>;
  allPageSelected: boolean;
  openMenuId: string | null;
  currentPage: number;
  pageCount: number;
  totalCount: number; // Tổng số dòng sau khi lọc, không phải toàn bộ dữ liệu gốc
  pageSize: number;
  onTogglePageSelection: () => void;
  onToggleSelected: (id: string) => void;
  onToggleMenu: (id: string) => void;
  onEdit: (user: AdminUser) => void;
  onChangeStatus: (id: string, status: UserStatus) => void;
  onDelete: (user: AdminUser) => void;
  onPageChange: (page: number) => void;
}

function formatDate(date: string): string {
  if (!date) return '—';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function getInitials(fullName: string): string {
  return fullName.trim().split(/\s+/).slice(-2).map((word) => word[0]).join('').toUpperCase();
}

/**
 * Bảng người dùng chỉ HIỂN THỊ dữ liệu và thông báo hành động.
 * UsersView chịu trách nhiệm giữ state, lọc, gọi hàm thêm/sửa/xóa.
 */
export function UserManagementTable({
  users: pageUsers,
  selectedIds,
  allPageSelected,
  openMenuId,
  currentPage,
  pageCount,
  totalCount,
  pageSize,
  onTogglePageSelection,
  onToggleSelected,
  onToggleMenu,
  onEdit,
  onChangeStatus,
  onDelete,
  onPageChange,
}: UserManagementTableProps) {
  return (
    <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr className="border-y border-slate-200">
                <th scope="col" className="w-12 px-4 py-3">
                  <input type="checkbox" checked={allPageSelected} onChange={onTogglePageSelection}
                    disabled={pageUsers.length === 0} aria-label="Chọn tất cả người dùng trên trang"
                    className="h-4 w-4 cursor-pointer accent-blue-600" />
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">Họ và tên</th>
                <th scope="col" className="px-3 py-3 font-semibold">Email</th>
                <th scope="col" className="px-3 py-3 font-semibold">Vai trò</th>
                <th scope="col" className="px-3 py-3 text-center font-semibold">Số cuộc thi</th>
                <th scope="col" className="px-3 py-3 font-semibold">Trạng thái</th>
                <th scope="col" className="px-3 py-3 font-semibold">Ngày đăng ký</th>
                <th scope="col" className="px-3 py-3 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pageUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/40">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => onToggleSelected(user.id)}
                      aria-label={`Chọn ${user.fullName}`} className="h-4 w-4 cursor-pointer accent-blue-600" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {getInitials(user.fullName) || <UserRound size={16} />}
                      </span>
                      <span className="font-semibold text-[#0B356B]">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">{user.email}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${ROLE_INFO[user.role].classes}`}>
                      {ROLE_INFO[user.role].label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">{user.contestCount ?? '—'}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${STATUS_INFO[user.status].classes}`}>
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                      {STATUS_INFO[user.status].label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs">{formatDate(user.joinedAt)}</td>
                  <td className="relative px-3 py-3 text-center">
                    <button type="button" aria-label={`Thao tác với ${user.fullName}`} aria-expanded={openMenuId === user.id}
                      onClick={() => onToggleMenu(user.id)}
                      className="rounded-lg border border-slate-200 p-1.5 text-blue-600 hover:bg-blue-50">
                      <MoreVertical size={17} aria-hidden="true" />
                    </button>
                    {openMenuId === user.id && (
                      <div className="absolute right-10 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white p-1 text-left shadow-xl">
                        <button type="button" onClick={() => onEdit(user)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-slate-100">
                          <Pencil size={15} /> Chỉnh sửa
                        </button>
                        <button type="button" onClick={() => onChangeStatus(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-slate-100">
                          <LockKeyhole size={15} /> {user.status === 'ACTIVE' ? 'Tạm khóa' : 'Kích hoạt'}
                        </button>
                        <button type="button" onClick={() => onDelete(user)}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                          <Trash2 size={15} /> Xóa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {pageUsers.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-14 text-center text-sm text-slate-500">
                  Không tìm thấy tài khoản phù hợp với bộ lọc.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Hiển thị {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} / {totalCount} người dùng
          </span>
          <nav aria-label="Phân trang người dùng" className="flex flex-wrap items-center gap-1">
            <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}
              aria-label="Trang trước" className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" aria-label={`Trang ${number}`} aria-current={currentPage === number ? 'page' : undefined}
                onClick={() => onPageChange(number)}
                className={`min-w-8 rounded-md border px-2.5 py-2 font-semibold ${currentPage === number
                  ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                {number}
              </button>
            ))}
            <button type="button" disabled={currentPage === pageCount} onClick={() => onPageChange(currentPage + 1)}
              aria-label="Trang sau" className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
    </>
  );
}
