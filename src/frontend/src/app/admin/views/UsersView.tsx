import { useMemo, useCallback, useState } from 'react';
import { ArrowUpDown, CheckCircle2, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { UserManagementTable } from '../components/UserManagementTable';
import { UserModal } from '../components/UserModal';
import { ROLE_INFO, STATUS_INFO, type AdminUser, type UserDraft, type UserRole, type UserStatus } from '../types/adminUser';

// Dữ liệu minh họa phục vụ xây dựng giao diện, CHƯA kết nối Spring Boot/MongoDB.
type RoleFilter = UserRole | 'ALL';
type StatusFilter = UserStatus | 'ALL';
type SortOrder = 'newest' | 'oldest' | 'name';

const PAGE_SIZE = 8;

const INITIAL_USERS: AdminUser[] = [
  { id: 'U01', fullName: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'ADMIN', contestCount: 8, status: 'ACTIVE', joinedAt: '2025-01-10' },
  { id: 'U02', fullName: 'Trần Thị Bình', email: 'tranthibinh@example.com', role: 'PARTICIPANT', contestCount: 12, status: 'ACTIVE', joinedAt: '2025-02-12' },
  { id: 'U03', fullName: 'Lê Minh Công', email: 'leminhcong@example.com', role: 'JUDGE', contestCount: 5, status: 'ACTIVE', joinedAt: '2025-02-15' },
  { id: 'U04', fullName: 'Phạm Thị Dung', email: 'phamthidung@example.com', role: 'ORGANIZER', contestCount: 4, status: 'ACTIVE', joinedAt: '2025-03-01' },
  { id: 'U05', fullName: 'Hoàng Văn E', email: 'hoangvane@example.com', role: 'PARTICIPANT', contestCount: 6, status: 'SUSPENDED', joinedAt: '2025-03-05' },
  { id: 'U06', fullName: 'Nguyễn Thị F', email: 'nguyenthif@example.com', role: 'PARTICIPANT', contestCount: 3, status: 'ACTIVE', joinedAt: '2025-03-10' },
  { id: 'U07', fullName: 'Đỗ Minh G', email: 'dominhg@example.com', role: 'JUDGE', contestCount: 2, status: 'ACTIVE', joinedAt: '2025-03-12' },
  { id: 'U08', fullName: 'Trần Văn H', email: 'tranvanh@example.com', role: 'PARTICIPANT', contestCount: 1, status: 'LOCKED', joinedAt: '2025-03-18' },
  { id: 'U09', fullName: 'Võ Thị I', email: 'vothii@example.com', role: 'ORGANIZER', contestCount: 7, status: 'ACTIVE', joinedAt: '2025-04-01' },
  { id: 'U10', fullName: 'Bùi Văn K', email: 'buivank@example.com', role: 'PARTICIPANT', contestCount: 2, status: 'ACTIVE', joinedAt: '2025-04-07' },
  { id: 'U11', fullName: 'Lý Thị L', email: 'lythil@example.com', role: 'JUDGE', contestCount: 3, status: 'ACTIVE', joinedAt: '2025-04-15' },
  { id: 'U12', fullName: 'Ngô Văn M', email: 'ngovanm@example.com', role: 'ADMIN', contestCount: 2, status: 'ACTIVE', joinedAt: '2025-04-21' },
  { id: 'U13', fullName: 'Phan Thị N', email: 'phanthin@example.com', role: 'PARTICIPANT', contestCount: 4, status: 'SUSPENDED', joinedAt: '2025-05-02' },
  { id: 'U14', fullName: 'Dương Văn P', email: 'duongvanp@example.com', role: 'PARTICIPANT', contestCount: 6, status: 'ACTIVE', joinedAt: '2025-05-08' },
  { id: 'U15', fullName: 'Mai Thị Q', email: 'maithiq@example.com', role: 'PARTICIPANT', contestCount: 2, status: 'ACTIVE', joinedAt: '2025-05-20' },
];

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PARTICIPANT', label: 'Người tham gia' },
  { value: 'JUDGE', label: 'Giám khảo' },
  { value: 'ORGANIZER', label: 'Ban tổ chức' },
  { value: 'ADMIN', label: 'Quản trị viên' },
];

const EMPTY_DRAFT: UserDraft = {
  fullName: '',
  email: '',
  role: 'PARTICIPANT',
  status: 'ACTIVE',
};

/** Màn hình Admin > Quản lý người dùng; tất cả thay đổi hiện chỉ ở bộ nhớ trình duyệt. */
export function UsersView() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState<RoleFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editorId, setEditorId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draft, setDraft] = useState<UserDraft>(EMPTY_DRAFT);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('vi');
    return users.filter((user) =>
      (activeTab === 'ALL' || user.role === activeTab) &&
      (roleFilter === 'ALL' || user.role === roleFilter) &&
      (statusFilter === 'ALL' || user.status === statusFilter) &&
      (!term || `${user.fullName} ${user.email} ${ROLE_INFO[user.role].label}`.toLocaleLowerCase('vi').includes(term))
    ).sort((a, b) => {
      if (sortOrder === 'name') return a.fullName.localeCompare(b.fullName, 'vi');
      return sortOrder === 'oldest'
        ? a.joinedAt.localeCompare(b.joinedAt)
        : b.joinedAt.localeCompare(a.joinedAt);
    });
  }, [users, activeTab, roleFilter, statusFilter, search, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allPageSelected = pageUsers.length > 0 && pageUsers.every((user) => selectedIds.has(user.id));

  const changeFilters = () => { setPage(1); setSelectedIds(new Set()); setOpenMenuId(null); };

  const openCreate = () => {
    setDraft({ ...EMPTY_DRAFT });
    setEditorId(null);
    setFormError('');
    setIsEditorOpen(true);
  };
  const openEdit = (user: AdminUser) => {
    setDraft({ fullName: user.fullName, email: user.email, role: user.role, status: user.status });
    setEditorId(user.id);
    setFormError('');
    setOpenMenuId(null);
    setIsEditorOpen(true);
  };
  const closeEditor = useCallback(() => { setIsEditorOpen(false); setFormError(''); }, []);

  const saveUser = () => {
    const fullName = draft.fullName.trim();
    const email = draft.email.trim().toLowerCase();
    if (fullName.length < 2 || fullName.length > 80) {
      setFormError('Họ và tên phải có từ 2 đến 80 ký tự.');
      return;
    }
    if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Vui lòng nhập email hợp lệ (tối đa 120 ký tự).');
      return;
    }
    if (users.some((user) => user.email.toLowerCase() === email && user.id !== editorId)) {
      setFormError('Email này đã tồn tại trong danh sách mẫu.');
      return;
    }
    if (editorId) {
      setUsers((previous) => previous.map((user) => user.id === editorId
        ? { ...user, ...draft, fullName, email } : user));
      setNotice('Đã cập nhật người dùng trong dữ liệu mẫu (chưa lưu máy chủ).');
    } else {
      const newUser: AdminUser = {
        id: `LOCAL-${Date.now()}`,
        fullName, email, role: draft.role, status: draft.status,
        contestCount: 0,
        joinedAt: new Date().toLocaleDateString('sv-SE'),
      };
      setUsers((previous) => [newUser, ...previous]);
      setNotice('Đã thêm người dùng vào dữ liệu mẫu (chưa lưu máy chủ).');
    }
    setActiveTab('ALL'); setRoleFilter('ALL'); setStatusFilter('ALL'); setSearch(''); setPage(1);
    closeEditor();
  };

  const changeStatus = (id: string, status: UserStatus) => {
    setUsers((previous) => previous.map((user) => user.id === id ? { ...user, status } : user));
    setNotice('Đã thay đổi trạng thái trong dữ liệu mẫu (chưa lưu máy chủ).');
    setOpenMenuId(null);
  };
  const deleteUser = (user: AdminUser) => {
    if (!window.confirm(`Xóa "${user.fullName}" khỏi danh sách dữ liệu mẫu?`)) return;
    setUsers((previous) => previous.filter((item) => item.id !== user.id));
    setSelectedIds((previous) => { const next = new Set(previous); next.delete(user.id); return next; });
    setNotice('Đã xóa khỏi dữ liệu mẫu (chưa thay đổi cơ sở dữ liệu).');
    setOpenMenuId(null);
  };
  const updateSelectedStatus = (status: UserStatus) => {
    setUsers((previous) => previous.map((user) => selectedIds.has(user.id) ? { ...user, status } : user));
    setSelectedIds(new Set());
    setNotice('Đã cập nhật các tài khoản được chọn trong dữ liệu mẫu.');
  };
  const toggleSelected = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const togglePageSelection = () => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      pageUsers.forEach((user) => { if (allPageSelected) next.delete(user.id); else next.add(user.id); });
      return next;
    });
  };

  return (
    <section aria-label="Quản lý người dùng" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Dữ liệu minh họa ({users.length} tài khoản) — chưa kết nối API
        </p>
        <button type="button" onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          <Plus size={17} aria-hidden="true" /> Thêm người dùng
        </button>
      </div>

      {notice && (
        <div role="status" className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex items-center gap-2"><CheckCircle2 size={17} aria-hidden="true" />{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Đóng thông báo"><X size={17} /></button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-3" role="tablist" aria-label="Lọc theo vai trò">
          {ROLE_TABS.map((tab) => {
            const count = tab.value === 'ALL' ? users.length : users.filter((user) => user.role === tab.value).length;
            return (
              <button key={tab.value} type="button" role="tab" aria-selected={activeTab === tab.value}
                onClick={() => { setActiveTab(tab.value); changeFilters(); }}
                className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:text-sm ${activeTab === tab.value
                  ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-blue-600'}`}>
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Tìm người dùng theo tên hoặc email</span>
            <input value={search} onChange={(event) => { setSearch(event.target.value); changeFilters(); }}
              placeholder="Tìm kiếm theo tên, email, vai trò..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="admin-users-role">Lọc theo vai trò</label>
            <select id="admin-users-role" value={roleFilter}
              onChange={(event) => { setRoleFilter(event.target.value as RoleFilter); changeFilters(); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
              <option value="ALL">Tất cả vai trò</option>
              {Object.entries(ROLE_INFO).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}
            </select>
            <label className="sr-only" htmlFor="admin-users-status">Lọc theo trạng thái</label>
            <select id="admin-users-status" value={statusFilter}
              onChange={(event) => { setStatusFilter(event.target.value as StatusFilter); changeFilters(); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(STATUS_INFO).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}
            </select>
            <button type="button" onClick={() => setShowAdvanced((previous) => !previous)}
              aria-expanded={showAdvanced}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium ${showAdvanced
                ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <SlidersHorizontal size={16} aria-hidden="true" /> Bộ lọc
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <ArrowUpDown size={16} className="text-slate-500" aria-hidden="true" />
            <label htmlFor="admin-users-sort" className="text-sm text-slate-700">Sắp xếp:</label>
            <select id="admin-users-sort" value={sortOrder} onChange={(event) => { setSortOrder(event.target.value as SortOrder); changeFilters(); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="newest">Ngày đăng ký mới nhất</option>
              <option value="oldest">Ngày đăng ký cũ nhất</option>
              <option value="name">Tên (A–Z)</option>
            </select>
            <button type="button" onClick={() => { setActiveTab('ALL'); setRoleFilter('ALL'); setStatusFilter('ALL'); setSearch(''); setSortOrder('newest'); changeFilters(); }}
              className="text-sm font-medium text-blue-600 hover:underline">Xóa bộ lọc</button>
          </div>
        )}

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-blue-50 px-4 py-3 text-xs text-blue-900 sm:text-sm">
            <span className="mr-2 font-semibold">Đã chọn {selectedIds.size} tài khoản</span>
            <button type="button" onClick={() => updateSelectedStatus('SUSPENDED')} className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 hover:bg-blue-100">Tạm khóa</button>
            <button type="button" onClick={() => updateSelectedStatus('ACTIVE')} className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 hover:bg-blue-100">Kích hoạt</button>
            <button type="button" onClick={() => setSelectedIds(new Set())} className="ml-auto text-blue-700 underline">Bỏ chọn</button>
          </div>
        )}

        <UserManagementTable
          users={pageUsers}
          selectedIds={selectedIds}
          allPageSelected={allPageSelected}
          openMenuId={openMenuId}
          currentPage={currentPage}
          pageCount={pageCount}
          totalCount={filteredUsers.length}
          pageSize={PAGE_SIZE}
          onTogglePageSelection={togglePageSelection}
          onToggleSelected={toggleSelected}
          onToggleMenu={(id) => setOpenMenuId((previous) => previous === id ? null : id)}
          onEdit={openEdit}
          onChangeStatus={changeStatus}
          onDelete={deleteUser}
          onPageChange={setPage}
        />
      </div>

      {isEditorOpen && (
        <UserModal draft={draft} isEditing={editorId !== null} error={formError}
          onChange={(nextDraft) => { setDraft(nextDraft); setFormError(''); }}
          onSave={saveUser} onClose={closeEditor} />
      )}
    </section>
  );
}
