import { useState } from 'react';
import {
  CalendarDays, CheckCircle2, ClipboardCheck, Clock3, FileImage,
  Images, ShieldAlert, Trophy, UserRoundCheck, Users, type LucideIcon,
} from 'lucide-react';
import type { AdminView } from '../components/AdminSidebar';

// Dữ liệu minh họa để dựng UI; KHÔNG phải dữ liệu trả về từ Java/MongoDB.
// Khi tích hợp API, thay đối tượng này bằng dữ liệu từ service của nhóm.
interface DashboardData {
  users: number;
  contests: number;
  submissions: number;
  judges: number;
  monthly: number[];
  statuses: { pending: number; approved: number; rejected: number; judging: number };
}

const MOCK_DASHBOARD: Record<string, DashboardData> = {
  '2025': {
    users: 1248, contests: 12, submissions: 3642, judges: 28,
    monthly: [75, 90, 82, 125, 150, 122, 165, 190, 232, 284, 267, 325],
    statuses: { pending: 1120, approved: 1980, rejected: 342, judging: 200 },
  },
  '2026': {
    users: 1386, contests: 15, submissions: 4250, judges: 31,
    monthly: [115, 130, 158, 174, 205, 223, 260, 289, 310, 334, 352, 378],
    statuses: { pending: 1200, approved: 2380, rejected: 410, judging: 260 },
  },
};

const SAMPLE_CONTESTS = [
  { name: 'Analog Moments', participants: 342, status: 'Đang diễn ra' },
  { name: 'Film & City', participants: 285, status: 'Đang diễn ra' },
  { name: 'The Vintage Look', participants: 198, status: 'Đang diễn ra' },
];

const SAMPLE_ACTIVITIES = [
  { icon: FileImage, color: 'text-blue-600 bg-blue-50', text: 'Nguyễn Văn B đã nộp bài dự thi', time: '2 giờ trước' },
  { icon: Trophy, color: 'text-amber-600 bg-amber-50', text: 'Cuộc thi Film & City đã kết thúc nhận bài', time: '30 phút trước' },
  { icon: Users, color: 'text-emerald-600 bg-emerald-50', text: 'Trần Thị C được phê duyệt tài khoản', time: '1 giờ trước' },
  { icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50', text: 'Bài dự thi FC2025-001 được duyệt', time: '2 giờ trước' },
  { icon: ShieldAlert, color: 'text-rose-600 bg-rose-50', text: 'Phát hiện ảnh trùng lặp (AI)', time: '3 giờ trước' },
];

interface DashboardViewProps {
  onNavigate: (view: AdminView) => void;
}

interface StatCardProps {
  label: string;
  value: number;
  change: string;
  icon: LucideIcon;
  color: string;
}

function StatCard({ label, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold leading-tight text-[#0B356B]">{value.toLocaleString('en-US')}</p>
        <p className="text-xs font-semibold text-emerald-600">{change}</p>
      </div>
    </div>
  );
}

function MonthlyChart({ data, year }: { data: number[]; year: string }) {
  const max = Math.max(400, ...data);
  const points = data.map((count, index) => {
    const x = 44 + (index * 522) / 11;
    const y = 177 - (count / max) * 150;
    return { x, y, count };
  });
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
  const area = `${line} L566 177 L44 177 Z`;

  return (
    <svg viewBox="0 0 600 218" className="w-full" role="img"
      aria-label={`Biểu đồ số lượt bài dự thi theo 12 tháng năm ${year}`}>
      <defs>
        <linearGradient id="admin-dashboard-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 100, 200, 300, 400].map((tick) => {
        const y = 177 - (tick / max) * 150;
        return (
          <g key={tick}>
            <line x1="44" x2="566" y1={y} y2={y} stroke="#E2E8F0" strokeDasharray="4 4" />
            <text x="34" y={y + 4} fill="#64748B" textAnchor="end" fontSize="11">{tick}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#admin-dashboard-area)" />
      <path d={line} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((point, index) => (
        <g key={index}>
          <circle cx={point.x} cy={point.y} r="3" fill="#2563EB" />
          <title>{`Tháng ${index + 1}: ${point.count} lượt`}</title>
          <text x={point.x} y="201" textAnchor="middle" fill="#64748B" fontSize="10">
            {index + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StatusChart({ data }: { data: DashboardData }) {
  const statusItems = [
    { label: 'Chờ duyệt', count: data.statuses.pending, color: '#3B82F6' },
    { label: 'Đã duyệt', count: data.statuses.approved, color: '#34C38F' },
    { label: 'Bị từ chối', count: data.statuses.rejected, color: '#FB7185' },
    { label: 'Đang chấm', count: data.statuses.judging, color: '#F59E0B' },
  ];
  let offset = 0;
  const stops = statusItems.map(({ count, color }) => {
    const start = (offset / data.submissions) * 100;
    offset += count;
    return `${color} ${start}% ${(offset / data.submissions) * 100}%`;
  });
  return (
    <div className="flex flex-col items-center gap-5 xl:flex-row">
      <div className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
        role="img" aria-label="Biểu đồ tròn tỷ lệ trạng thái bài dự thi">
        <div className="flex h-[114px] w-[114px] flex-col items-center justify-center rounded-full bg-white">
          <span className="text-2xl font-bold text-[#0B356B]">{data.submissions.toLocaleString('en-US')}</span>
          <span className="text-[10px] text-slate-500">Tổng bài dự thi</span>
        </div>
      </div>
      <div className="w-full min-w-0 space-y-3">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 flex-1 text-slate-600">{item.label}</span>
            <span className="font-semibold text-[#0B356B]">
              {item.count.toLocaleString('en-US')} ({Math.round((item.count / data.submissions) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const [selectedYear, setSelectedYear] = useState('2025');
  const data = MOCK_DASHBOARD[selectedYear];
  const metrics = [
    { label: 'Người dùng', value: data.users, change: '↑ 12%', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Cuộc thi', value: data.contests, change: '↑ 2', icon: CalendarDays, color: 'bg-violet-100 text-violet-600' },
    { label: 'Bài dự thi', value: data.submissions, change: '↑ 18%', icon: Images, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Giám khảo', value: data.judges, change: '↑ 4', icon: UserRoundCheck, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <section aria-label="Tổng quan quản trị" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
          Dữ liệu mẫu – chưa kết nối API
        </span>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <CalendarDays size={16} className="text-blue-600" aria-hidden="true" />
          <span className="sr-only">Chọn năm thống kê</span>
          <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}
            className="cursor-pointer bg-transparent outline-none" aria-label="Chọn năm thống kê">
            {Object.keys(MOCK_DASHBOARD).map((year) => <option key={year} value={year}>Năm {year}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-[#0B356B]">Lượt bài dự thi theo tháng</h2>
          <MonthlyChart data={data.monthly} year={selectedYear} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-bold text-[#0B356B]">Tình trạng bài dự thi</h2>
          <StatusChart data={data} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0B356B]">Cuộc thi đang diễn ra</h2>
            <button type="button" onClick={() => onNavigate('contests')}
              className="text-xs font-semibold text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="divide-y divide-slate-100">
            {SAMPLE_CONTESTS.map((contest) => (
              <div key={contest.name} className="flex items-center gap-3 py-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Trophy size={20} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{contest.name} {selectedYear}</p>
                  <span className="text-xs text-emerald-700">{contest.status}</span>
                </div>
                <span className="text-xs text-slate-500">{contest.participants} người</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0B356B]">Hoạt động gần đây</h2>
            <button type="button" onClick={() => onNavigate('logs')}
              className="text-xs font-semibold text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-3">
            {SAMPLE_ACTIVITIES.map(({ text, time, icon: Icon, color }, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}>
                  <Icon size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">{text}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock3 size={11} aria-hidden="true" />{time} (minh họa)
                  </p>
                </div>
                {index === 0 && <CheckCircle2 size={16} className="text-emerald-500" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
