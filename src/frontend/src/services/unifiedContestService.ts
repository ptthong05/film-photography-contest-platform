import { MOCK_CONTESTS } from '../mocks/organizerData';
import type { Contest } from '../types/contest';
import {
  getOrganizerContestCopies,
  isOrganizerContestDeleted,
  readContestSettings,
  withContestSettings,
} from '../app/organizer/components/contestManagementStorage';
import { formatDate } from '../utils/formatDate';

export interface ParticipantContest {
  id: string;
  title: string;
  category: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  participantsCount: number;
  submissionsCount: number;
  bannerUrl: string;
  status: 'Đang diễn ra' | 'Sắp diễn ra' | 'Đã kết thúc';
  rawStatus: 'ONGOING' | 'UPCOMING' | 'ENDED';
  description: string;
  rules: string[];
  prizes: {
    first: string;
    second: string;
    third: string;
    consolation: string;
  };
  prizesList: { name: string; reward: string }[];
  judgeNames: string[];
  technicalRequirements: string;
  judgingCriteria: string[];
  organizer: string;
}

const DEFAULT_RULES = [
  'Tác phẩm bắt buộc phải được chụp bằng máy ảnh phim analog (35mm, 120mm, Large Format).',
  'Không chấp nhận ảnh kỹ thuật số (Digital) hoặc ảnh giả lập phim qua phần mềm chỉnh sửa.',
  'Mỗi thí sinh được gửi tối đa 05 tác phẩm dự thi kèm theo thông tin Metadata cuộn phim rõ ràng.',
  'Ban tổ chức có quyền yêu cầu thí sinh gửi âm bản gốc (Negative/Slide) để xác thực nếu lọt vào vòng chung khảo.',
];

const DEFAULT_CRITERIA = [
  'Bố cục và góc nhìn nghệ thuật (25%)',
  'Xử lý ánh sáng và độ tương phản tự nhiên (25%)',
  'Nội dung thông điệp truyền tải (25%)',
  'Kỹ thuật tráng scan và độ tinh xảo hạt film (25%)',
];

import { getAllUnifiedContests } from './contestSyncService';

export function getUnifiedParticipantContests(): ParticipantContest[] {
  const uniqueList: Contest[] = getAllUnifiedContests();

  return uniqueList.map((contest, index) => {
    const settings = readContestSettings(contest.id);
    const judgeNames = settings?.judgeNames ?? contest.judgeNames ?? [];

    let statusVi: 'Đang diễn ra' | 'Sắp diễn ra' | 'Đã kết thúc' = 'Đang diễn ra';
    if (contest.status === 'UPCOMING') statusVi = 'Sắp diễn ra';
    else if (contest.status === 'ENDED') statusVi = 'Đã kết thúc';

    const pList = contest.prizes && contest.prizes.length > 0
      ? contest.prizes
      : [
          { name: 'Giải Nhất (Grand Prize)', reward: '25.000.000 VNĐ + Máy ảnh Leica M6' },
          { name: 'Giải Nhì', reward: '12.000.000 VNĐ + 20 cuộn film' },
          { name: 'Giải Ba', reward: '6.000.000 VNĐ + 10 cuộn film' },
          { name: 'Giải Khuyến Khích', reward: '2.000.000 VNĐ + Quà tặng' },
        ];

    const rules = settings?.rules
      ? settings.rules.split('\n').map((r) => r.trim()).filter(Boolean)
      : DEFAULT_RULES;

    const criteria = settings?.criteria && settings.criteria.length > 0
      ? settings.criteria
      : DEFAULT_CRITERIA;

    return {
      id: contest.id,
      title: contest.name,
      category: (contest.tags && contest.tags.length > 0 ? contest.tags.join(' • ') : 'NHIẾP ẢNH PHIM').toUpperCase(),
      dateRange: `${formatDate(contest.startDate)} - ${formatDate(contest.endDate)}`,
      startDate: contest.startDate,
      endDate: contest.endDate,
      participantsCount: contest.participantCount || (250 + index * 37),
      submissionsCount: contest.submissionCount || (120 + index * 24),
      bannerUrl: contest.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=85&w=1000&auto=format&fit=crop',
      status: statusVi,
      rawStatus: contest.status,
      description: contest.description || 'Cuộc thi nhiếp ảnh phim nhựa quy mô toàn quốc, tìm kiếm những khoảnh khắc chân thực và cảm xúc nhất được lưu giữ qua cuộn film analog truyền thống.',
      rules: rules.length > 0 ? rules : DEFAULT_RULES,
      prizes: {
        first: pList[0]?.reward || 'Giải Nhất trị giá 25.000.000 VNĐ',
        second: pList[1]?.reward || 'Giải Nhì trị giá 12.000.000 VNĐ',
        third: pList[2]?.reward || 'Giải Ba trị giá 6.000.000 VNĐ',
        consolation: pList[3]?.reward || 'Giải Khuyến Khích trị giá 2.000.000 VNĐ',
      },
      prizesList: pList,
      judgeNames,
      technicalRequirements: 'Ảnh scan độ phân giải tối thiểu 300 DPI, định dạng JPG/TIFF không đóng khung chữ ký, giữ nguyên hạt grain và thông số quang học gốc.',
      judgingCriteria: criteria,
      organizer: contest.organizer || 'FilmContest Studio',
    };
  });
}
