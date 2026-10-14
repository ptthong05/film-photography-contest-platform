import type { ReactNode } from 'react';
import type { AdminView } from './AdminSidebar';

// Tiêu đề và mô tả của 10 màn hình Admin.
// Dùng cùng AdminView với Sidebar để tránh sai lệch tên trang.
const ADMIN_PAGE_INFO: Record<AdminView, { title: string; description: string }> = {
  dashboard: {
    title: '1. Tổng quan',
    description: 'Theo dõi hoạt động và thống kê cuộc thi nhiếp ảnh phim',
  },
  users: {
    title: '2. Quản lý người dùng',
    description: 'Quản lý tài khoản, phân quyền và trạng thái người dùng',
  },
  contests: {
    title: '3. Quản lý cuộc thi',
    description: 'Theo dõi danh sách, cấu hình và trạng thái cuộc thi',
  },
  submissions: {
    title: '4. Quản lý bài dự thi',
    description: 'Theo dõi và xem tình trạng các bài dự thi',
  },
  judges: {
    title: '5. Quản lý giám khảo',
    description: 'Theo dõi danh sách, chuyên môn và hoạt động giám khảo',
  },
  archive: {
    title: '6. Kho dữ liệu',
    description: 'Lưu trữ và tra cứu các bài dự thi đạt giải',
  },
  'ai-settings': {
    title: '7. Cấu hình AI',
    description: 'Thiết lập các tính năng AI hỗ trợ quản lý cuộc thi',
  },
  settings: {
    title: '8. Cài đặt hệ thống',
    description: 'Quản lý cấu hình chung của nền tảng',
  },
  logs: {
    title: '9. Nhật ký log',
    description: 'Theo dõi các hoạt động trong hệ thống',
  },
  profile: {
    title: '10. Hồ sơ cá nhân',
    description: 'Quản lý thông tin tài khoản của bạn',
  },
};

export interface AdminHeaderProps {
  activeView: AdminView;
  // Vùng dành cho nút, bộ lọc hoặc chọn ngày của từng trang.
  // Để trống nếu màn hình không cần thao tác ở góc trên bên phải.
  actions?: ReactNode;
  className?: string;
}

export function AdminHeader({
  activeView,
  actions,
  className = '',
}: AdminHeaderProps) {
  const { title, description } = ADMIN_PAGE_INFO[activeView];

  return (
    <header
      className={`flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-7 ${className}`}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-[#0B356B]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {actions != null && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}
