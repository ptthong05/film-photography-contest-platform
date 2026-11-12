import type { AdminUser, UserRole, UserStatus } from '../app/admin/types/adminUser';
import type { Judge, Participant } from '../types/organizerUser';
import type { SubmissionStatus } from '../types/submission';

export const UNIFIED_USERS_STORAGE_KEY = 'filmcontest_unified_users_v2';

export interface UnifiedUser extends AdminUser {
  specialty?: string;
  isDefault?: boolean;
  submissionCount?: number;
  recentSubmissions?: {
    id: string;
    title: string;
    contestName: string;
    submittedAt: string;
    status: SubmissionStatus;
  }[];
}

export const INITIAL_UNIFIED_USERS: UnifiedUser[] = [
  // --- QUẢN TRỊ VIÊN (ADMIN) ---
  {
    id: 'U01',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'ADMIN',
    contestCount: 8,
    status: 'ACTIVE',
    joinedAt: '2025-01-10',
  },
  {
    id: 'U12',
    fullName: 'Ngô Văn M',
    email: 'ngovanm@example.com',
    role: 'ADMIN',
    contestCount: 2,
    status: 'ACTIVE',
    joinedAt: '2025-04-21',
  },

  // --- BAN TỔ CHỨC (ORGANIZER) ---
  {
    id: 'org-01',
    fullName: 'Phạm Thị Dung (BTC)',
    email: 'phamthidung@example.com',
    role: 'ORGANIZER',
    contestCount: 4,
    status: 'ACTIVE',
    joinedAt: '2025-03-01',
  },
  {
    id: 'org-02',
    fullName: 'Võ Thị I',
    email: 'vothii@example.com',
    role: 'ORGANIZER',
    contestCount: 7,
    status: 'ACTIVE',
    joinedAt: '2025-04-01',
  },
  {
    id: 'org-03',
    fullName: 'Nguyễn Văn A (Ban tổ chức)',
    email: 'nguyenvana@gmail.com',
    role: 'ORGANIZER',
    contestCount: 5,
    status: 'ACTIVE',
    joinedAt: '2025-01-15',
  },

  // --- HỘI ĐỒNG GIÁM KHẢO (JUDGE - 16 Giám khảo đồng bộ chuẩn với Organizer) ---
  {
    id: 'j-binh',
    fullName: 'Trần Thị Bình',
    email: 'tranthibinh@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh đường phố & tài liệu phim',
    contestCount: 4,
    status: 'ACTIVE',
    isDefault: true,
    joinedAt: '2025-02-10',
  },
  {
    id: 'j-cuong',
    fullName: 'Lê Minh Cường',
    email: 'cuong.lm@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh tài liệu & Phim 35mm',
    contestCount: 5,
    status: 'ACTIVE',
    isDefault: true,
    joinedAt: '2025-02-12',
  },
  {
    id: 'j-huong',
    fullName: 'Đỗ Thị Hương',
    email: 'huong.dt@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Nghệ thuật thị giác & Phòng tối',
    contestCount: 4,
    status: 'ACTIVE',
    isDefault: true,
    joinedAt: '2025-02-14',
  },
  {
    id: 'j-hung',
    fullName: 'Trần Văn Hùng',
    email: 'hung.tv@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh đường phố & Kiến trúc',
    contestCount: 4,
    status: 'ACTIVE',
    isDefault: true,
    joinedAt: '2025-02-16',
  },
  {
    id: 'j-dung',
    fullName: 'Phạm Thị Dung',
    email: 'dung.pt@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Lịch sử nhiếp ảnh & Giám tuyển',
    contestCount: 3,
    status: 'ACTIVE',
    isDefault: true,
    joinedAt: '2025-02-18',
  },
  {
    id: 'j1',
    fullName: 'Trần Quang Huy',
    email: 'huy.tq@gmail.com',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh phim',
    contestCount: 3,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-02-20',
  },
  {
    id: 'j2',
    fullName: 'Lê Thị Mai',
    email: 'mai.lt@gmail.com',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh nghệ thuật',
    contestCount: 2,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-02-22',
  },
  {
    id: 'j3',
    fullName: 'Nguyễn Hoàng Nam',
    email: 'nam.nh@gmail.com',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh phong cảnh',
    contestCount: 4,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-02-25',
  },
  {
    id: 'j4',
    fullName: 'Phạm Thu Trang',
    email: 'trang.pt@gmail.com',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh tài liệu',
    contestCount: 1,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-03-01',
  },
  {
    id: 'j5',
    fullName: 'Đỗ Khánh Quân',
    email: 'quan.dk@gmail.com',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh đường phố',
    contestCount: 1,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-03-05',
  },
  {
    id: 'org-judge-film-01',
    fullName: 'Bùi Minh Khoa',
    email: 'khoa.bm@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh phim',
    contestCount: 2,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-03-10',
  },
  {
    id: 'org-judge-portrait-02',
    fullName: 'Nguyễn Thảo Vy',
    email: 'vy.nt@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh chân dung',
    contestCount: 1,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-03-12',
  },
  {
    id: 'org-judge-street-03',
    fullName: 'Võ Thành Đạt',
    email: 'dat.vt@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh đường phố',
    contestCount: 2,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-03-15',
  },
  {
    id: 'j6',
    fullName: 'Hoàng Minh Khang',
    email: 'khang.hm@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh chân dung & Fine Art',
    contestCount: 2,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-03-18',
  },
  {
    id: 'j7',
    fullName: 'Trương Thu Hà',
    email: 'ha.tt@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh tư liệu & Tráng rọi',
    contestCount: 2,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-03-20',
  },
  {
    id: 'j8',
    fullName: 'Đặng Quốc Bảo',
    email: 'bao.dq@filmcontest.vn',
    role: 'JUDGE',
    specialty: 'Nhiếp ảnh phong cảnh & Kiến trúc',
    contestCount: 1,
    status: 'ACTIVE',
    isDefault: false,
    joinedAt: '2025-03-22',
  },

  // --- DANH SÁCH THÍ SINH (PARTICIPANT - 13 Thí sinh đồng bộ chuẩn với Organizer) ---
  {
    id: 'p-binh',
    fullName: 'Hồ Thanh Bình',
    email: 'thanhbinh.photo@filmcontest.vn',
    role: 'PARTICIPANT',
    submissionCount: 4,
    contestCount: 4,
    status: 'ACTIVE',
    joinedAt: '2025-05-15',
    recentSubmissions: [
      { id: 'ps-binh-1', title: 'Cầu thang xoắn', contestName: 'Film & City 2026', submittedAt: '2025-06-15', status: 'VALID' },
      { id: 'ps-binh-2', title: 'Chiều bên hồ', contestName: 'Analog Moments 2026', submittedAt: '2025-06-20', status: 'VALID' },
      { id: 'ps-binh-3', title: 'Góc phố cổ', contestName: 'The Vintage Look', submittedAt: '2025-07-02', status: 'PENDING' },
    ],
  },
  {
    id: 'p1',
    fullName: 'Trần Minh Quân',
    email: 'quantran@gmail.com',
    role: 'PARTICIPANT',
    submissionCount: 3,
    contestCount: 3,
    status: 'ACTIVE',
    joinedAt: '2025-06-10',
    recentSubmissions: [
      { id: 'ps1', title: 'Ánh nắng cuối ngày', contestName: 'Analog Moments 2025', submittedAt: '2025-06-18', status: 'VALID' },
      { id: 'ps2', title: 'Qua ô cửa cũ', contestName: 'Film & City', submittedAt: '2025-06-14', status: 'PENDING' },
    ],
  },
  {
    id: 'p2',
    fullName: 'Lê Thu Hà',
    email: 'ha.le@gmail.com',
    role: 'PARTICIPANT',
    submissionCount: 2,
    contestCount: 2,
    status: 'ACTIVE',
    joinedAt: '2025-06-12',
    recentSubmissions: [
      { id: 'ps3', title: 'Mùa hè trong veo', contestName: 'The Vintage Look', submittedAt: '2025-06-21', status: 'VALID' },
    ],
  },
  {
    id: 'p3',
    fullName: 'Nguyễn Hoàng Nam',
    email: 'nam.ng@gmail.com',
    role: 'PARTICIPANT',
    submissionCount: 5,
    contestCount: 5,
    status: 'ACTIVE',
    joinedAt: '2025-06-15',
    recentSubmissions: [
      { id: 'ps4', title: 'Một góc bình yên', contestName: 'Nature on Film', submittedAt: '2025-06-24', status: 'PENDING' },
      { id: 'ps5', title: 'Vệt nắng qua phố', contestName: 'Film & City', submittedAt: '2025-06-19', status: 'VALID' },
    ],
  },
  {
    id: 'p4',
    fullName: 'Phạm Thị Dung',
    email: 'dung.pt@gmail.com',
    role: 'PARTICIPANT',
    submissionCount: 2,
    contestCount: 2,
    status: 'LOCKED',
    joinedAt: '2025-06-16',
    recentSubmissions: [
      { id: 'ps6', title: 'Tĩnh lặng', contestName: 'Analog Moments 2025', submittedAt: '2025-06-25', status: 'PENDING' },
    ],
  },
  {
    id: 'p5',
    fullName: 'Đỗ Minh Đức',
    email: 'duc.dm@gmail.com',
    role: 'PARTICIPANT',
    submissionCount: 1,
    contestCount: 1,
    status: 'ACTIVE',
    joinedAt: '2025-06-20',
    recentSubmissions: [
      { id: 'ps7', title: 'Chuyến tàu sớm', contestName: 'Film & City', submittedAt: '2025-06-27', status: 'VALID' },
    ],
  },
  {
    id: 'p6',
    fullName: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    role: 'PARTICIPANT',
    submissionCount: 6,
    contestCount: 6,
    status: 'SUSPENDED',
    joinedAt: '2025-03-05',
    recentSubmissions: [
      { id: 'ps8', title: 'Nắng sớm cao nguyên', contestName: 'Nature on Film', submittedAt: '2025-03-20', status: 'VALID' },
    ],
  },
  {
    id: 'p7',
    fullName: 'Nguyễn Thị F',
    email: 'nguyenthif@example.com',
    role: 'PARTICIPANT',
    submissionCount: 3,
    contestCount: 3,
    status: 'ACTIVE',
    joinedAt: '2025-03-10',
    recentSubmissions: [
      { id: 'ps9', title: 'Chân dung ngư dân', contestName: 'Monochrome Stories 2025', submittedAt: '2025-03-25', status: 'VALID' },
    ],
  },
  {
    id: 'p8',
    fullName: 'Trần Văn H',
    email: 'tranvanh@example.com',
    role: 'PARTICIPANT',
    submissionCount: 1,
    contestCount: 1,
    status: 'LOCKED',
    joinedAt: '2025-03-18',
    recentSubmissions: [
      { id: 'ps10', title: 'Nhịp sống thành phố', contestName: 'Analog Moments 2025', submittedAt: '2025-03-22', status: 'PENDING' },
    ],
  },
  {
    id: 'p9',
    fullName: 'Bùi Văn K',
    email: 'buivank@example.com',
    role: 'PARTICIPANT',
    submissionCount: 2,
    contestCount: 2,
    status: 'ACTIVE',
    joinedAt: '2025-04-07',
    recentSubmissions: [
      { id: 'ps11', title: 'Hoàng hôn trên đồi', contestName: 'Nature on Film', submittedAt: '2025-04-15', status: 'VALID' },
    ],
  },
  {
    id: 'p10',
    fullName: 'Phan Thị N',
    email: 'phanthin@example.com',
    role: 'PARTICIPANT',
    submissionCount: 4,
    contestCount: 4,
    status: 'SUSPENDED',
    joinedAt: '2025-05-02',
    recentSubmissions: [
      { id: 'ps12', title: 'Sắc màu phố cổ', contestName: 'The Vintage Look', submittedAt: '2025-05-12', status: 'VALID' },
    ],
  },
  {
    id: 'p11',
    fullName: 'Dương Văn P',
    email: 'duongvanp@example.com',
    role: 'PARTICIPANT',
    submissionCount: 6,
    contestCount: 6,
    status: 'ACTIVE',
    joinedAt: '2025-05-08',
    recentSubmissions: [
      { id: 'ps13', title: 'Bến thuyền vắng', contestName: 'Black & White Stories', submittedAt: '2025-05-18', status: 'VALID' },
    ],
  },
  {
    id: 'p12',
    fullName: 'Mai Thị Q',
    email: 'maithiq@example.com',
    role: 'PARTICIPANT',
    submissionCount: 2,
    contestCount: 2,
    status: 'ACTIVE',
    joinedAt: '2025-05-20',
    recentSubmissions: [
      { id: 'ps14', title: 'Nụ cười tuổi thơ', contestName: 'Frames of Everyday Life', submittedAt: '2025-05-28', status: 'VALID' },
    ],
  },
];

export const unifiedUserService = {
  /** Lấy toàn bộ danh sách người dùng đã hợp nhất */
  getAllUsers(): UnifiedUser[] {
    if (typeof window === 'undefined') return [...INITIAL_UNIFIED_USERS];
    try {
      const raw = localStorage.getItem(UNIFIED_USERS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(UNIFIED_USERS_STORAGE_KEY, JSON.stringify(INITIAL_UNIFIED_USERS));
        return [...INITIAL_UNIFIED_USERS];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as UnifiedUser[];
      }
      localStorage.setItem(UNIFIED_USERS_STORAGE_KEY, JSON.stringify(INITIAL_UNIFIED_USERS));
      return [...INITIAL_UNIFIED_USERS];
    } catch {
      return [...INITIAL_UNIFIED_USERS];
    }
  },

  /** Lưu toàn bộ danh sách và phát sự kiện đồng bộ toàn hệ thống */
  saveAllUsers(users: UnifiedUser[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(UNIFIED_USERS_STORAGE_KEY, JSON.stringify(users));
      window.dispatchEvent(new Event('usersChanged'));
    } catch (e) {
      console.error('Không thể lưu unified users:', e);
    }
  },

  /** Lấy danh sách Thí sinh (cho Organizer & Admin tab Người tham gia) */
  getParticipants(): Participant[] {
    const all = this.getAllUsers();
    return all
      .filter((user) => user.role === 'PARTICIPANT')
      .map((user): Participant => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        submissionCount: user.submissionCount ?? user.contestCount ?? 0,
        registeredAt: user.joinedAt,
        status: user.status === 'LOCKED' ? 'LOCKED' : 'ACTIVE',
        recentSubmissions: (user.recentSubmissions ?? []).map((sub) => ({
          id: sub.id,
          title: sub.title,
          contestName: sub.contestName,
          submittedAt: sub.submittedAt,
          status: sub.status,
        })),
      }));
  },

  /** Lấy danh sách Giám khảo (cho Organizer & Admin tab Giám khảo) */
  getJudges(): Judge[] {
    const all = this.getAllUsers();
    return all
      .filter((user) => user.role === 'JUDGE')
      .map((user): Judge => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        specialty: user.specialty || 'Nhiếp ảnh phim & Nghệ thuật analog',
        contestCount: user.contestCount || 1,
        status: user.status === 'LOCKED' ? 'LOCKED' : 'ACTIVE',
        isDefault: Boolean(user.isDefault),
      }));
  },

  /** Cập nhật trạng thái người dùng (Hoạt động / Tạm khóa / Bị khóa) */
  updateUserStatus(id: string, status: UserStatus): void {
    const users = this.getAllUsers().map((user) => (user.id === id ? { ...user, status } : user));
    this.saveAllUsers(users);
  },

  /** Cập nhật thông tin chi tiết một người dùng */
  updateUser(id: string, draft: Partial<UnifiedUser>): void {
    const users = this.getAllUsers().map((user) => (user.id === id ? { ...user, ...draft } : user));
    this.saveAllUsers(users);
  },

  /** Thêm người dùng mới (Thí sinh, Giám khảo, BTC hoặc Admin) */
  addUser(newUser: UnifiedUser): void {
    const users = [newUser, ...this.getAllUsers().filter((u) => u.id !== newUser.id)];
    this.saveAllUsers(users);
  },

  /** Xóa một người dùng */
  deleteUser(id: string): void {
    const users = this.getAllUsers().filter((u) => u.id !== id);
    this.saveAllUsers(users);
  },

  /** Chuyển đổi trạng thái Giám khảo mặc định */
  setDefaultJudge(id: string, isDefault: boolean): void {
    const users = this.getAllUsers().map((user) =>
      user.id === id && user.role === 'JUDGE' ? { ...user, isDefault } : user
    );
    this.saveAllUsers(users);
  },
};
