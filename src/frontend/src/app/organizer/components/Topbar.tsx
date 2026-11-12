import { useState, useEffect } from "react";
import { PortalHeader } from "../../../components/PortalHeader";
import type { OrganizerView } from "../../../types/organizer";
import { readOrganizerProfile } from "../../../services/profileService";

export const ORGANIZER_PAGE_INFO: Record<OrganizerView, { title: string; description: string }> = {
  OVERVIEW: {
    title: "1. Tổng quan",
    description: "Theo dõi nhanh cuộc thi, thí sinh, bài dự thi và giám khảo",
  },
  CONTESTS: {
    title: "2. Quản lý cuộc thi",
    description: "Tổ chức, thiết lập và giám sát các cuộc thi nhiếp ảnh phim",
  },
  PARTICIPANTS: {
    title: "3. Quản lý thí sinh",
    description: "Danh sách và thông tin chi tiết các thí sinh tham gia",
  },
  SUBMISSIONS: {
    title: "4. Quản lý bài dự thi",
    description: "Rà soát, quản lý và kiểm duyệt các bài dự thi gửi về",
  },
  JUDGES: {
    title: "5. Quản lý giám khảo",
    description: "Danh sách hội đồng ban giám khảo chuyên môn",
  },
  ASSIGNMENTS: {
    title: "6. Phân công giám khảo",
    description: "Phân bổ bài thi cho giám khảo và theo dõi tiến độ chấm",
  },
  ARCHIVE: {
    title: "7. Kho dữ liệu",
    description: "Lưu trữ và tra cứu các bài thi và tác phẩm xuất sắc",
  },
  RESULTS: {
    title: "8. Bảng kết quả",
    description: "Tổng hợp kết quả đánh giá và xếp hạng giải thưởng",
  },
  REPORTS: {
    title: "9. Báo cáo thống kê",
    description: "Báo cáo chi tiết các số liệu và thống kê hoạt động",
  },
  SCORING_PUBLISH: {
    title: "10. Chấm điểm & Công bố",
    description: "Theo dõi điểm số từ Giám khảo và công bố kết quả đến giao diện Thí sinh",
  },
  PROFILE: {
    title: "11. Hồ sơ cá nhân",
    description: "Quản lý thông tin tài khoản ban tổ chức",
  },
  CREATE_CONTEST: {
    title: "Tạo cuộc thi mới",
    description: "Thiết lập thông tin và thể lệ cuộc thi nhiếp ảnh phim",
  },
  CONTEST_DETAIL: {
    title: "Chi tiết cuộc thi",
    description: "Thông tin chi tiết, thể lệ và tiến độ cuộc thi",
  },
  SUBMISSION_DETAIL: {
    title: "Chi tiết bài dự thi",
    description: "Thông tin chi tiết tác phẩm dự thi và kết quả chấm điểm",
  },
};

export interface TopbarProps {
  activeView?: OrganizerView;
  organizerName?: string;
  onNavigate?: (view: OrganizerView) => void;
  onGoHome?: () => void;
  onOpenMenu?: () => void;
}

export function Topbar({
  activeView = "OVERVIEW",
  organizerName = "Nguyễn Văn A",
  onNavigate,
  onGoHome,
  onOpenMenu,
}: TopbarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    const prof = readOrganizerProfile();
    return prof.avatarDataUrl || (typeof window !== 'undefined' ? localStorage.getItem('organizer_avatar') : null);
  });

  useEffect(() => {
    const handleProfileSync = () => {
      const prof = readOrganizerProfile();
      setAvatarUrl(prof.avatarDataUrl || (typeof window !== 'undefined' ? localStorage.getItem('organizer_avatar') : null));
    };
    window.addEventListener('organizerProfileUpdated', handleProfileSync);
    window.addEventListener('userNameChanged', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);
    return () => {
      window.removeEventListener('organizerProfileUpdated', handleProfileSync);
      window.removeEventListener('userNameChanged', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  const meta = ORGANIZER_PAGE_INFO[activeView] ?? {
    title: "Ban tổ chức",
    description: "Hệ thống quản lý cuộc thi nhiếp ảnh phim",
  };

  return (
    <PortalHeader
      title={meta.title}
      subtitle={meta.description}
      userName={organizerName}
      userRole="Ban tổ chức"
      avatarUrl={avatarUrl}
      unreadCount={2}
      onOpenProfile={() => onNavigate?.("PROFILE")}
      onGoHome={onGoHome}
      onOpenMenu={onOpenMenu}
    />
  );
}
