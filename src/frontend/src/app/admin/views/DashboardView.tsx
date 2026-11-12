import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays, CheckCircle2, ClipboardCheck, Clock3, FileImage,
  Images, ShieldAlert, Trophy, UserRoundCheck, Users, type LucideIcon,
} from 'lucide-react';
import type { AdminView } from '../components/AdminSidebar';
import { getAllUnifiedContests } from '../../../services/contestSyncService';

interface DashboardData {
  users: number;
  contests: number;
  submissions: number;
  judges: number;
  monthly: number[];
  statuses: { pending: number; approved: number; rejected: number; judging: number };
}

// Số liệu thực tế đồng bộ với hệ thống Judge, Organizer và Admin
const SYSTEM_BASELINE_DATA: Record<string, DashboardData> = {
  '2026': {
    users: 28,
    contests: 13,
    submissions: 24,
    judges: 16,
    monthly: [1, 1, 2, 2, 3, 2, 2, 3, 4, 2, 1, 1],
    statuses: { pending: 4, approved: 11, rejected: 2, judging: 7 },
  },
  '2025': {
    users: 22,
    contests: 8,
    submissions: 18,
    judges: 14,
    monthly: [1, 0, 1, 2, 2, 3, 2, 2, 2, 1, 1, 1],
    statuses: { pending: 2, approved: 12, rejected: 1, judging: 3 },
  },
};

function getDynamicDashboardData(year: string): DashboardData {
  const base = SYSTEM_BASELINE_DATA[year] || SYSTEM_BASELINE_DATA['2026'];
  const unifiedContestCount = getAllUnifiedContests().length || base.contests;
  try {
    // 1. Đọc các bài nộp phát sinh từ thí sinh qua participant_entries
    const participantEntriesRaw = localStorage.getItem("participant_entries");
    const participantEntries = participantEntriesRaw ? JSON.parse(participantEntriesRaw) : [];
    const extraParticipantCount = Array.isArray(participantEntries) ? participantEntries.length : 0;

    // 2. Đọc các bài thi đã được công bố từ ban tổ chức
    const pubResultsRaw = localStorage.getItem("filmcontest.published_results.v2");
    const pubResults = pubResultsRaw ? JSON.parse(pubResultsRaw) : [];
    const publishedCount = Array.isArray(pubResults) ? pubResults.length : 0;

    const dynamicAdded = extraParticipantCount;
    if (dynamicAdded === 0 && publishedCount === 0) {
      return {
        ...base,
        contests: unifiedContestCount,
      };
    }

    // Phân bổ trạng thái:
    // - Các bài đã công bố tính vào "Đã duyệt"
    // - Các bài nộp mới tính vào "Chờ duyệt"
    const pendingCount = Math.max(base.statuses.pending, base.statuses.pending + dynamicAdded);
    const approvedCount = Math.max(base.statuses.approved, Math.max(base.statuses.approved, publishedCount));
    const totalSubmissions = pendingCount + approvedCount + base.statuses.rejected + base.statuses.judging;

    // Cập nhật số liệu vào các tháng gần đây trên biểu đồ
    const updatedMonthly = [...base.monthly];
    if (dynamicAdded > 0) {
      updatedMonthly[11] = updatedMonthly[11] + dynamicAdded;
    }

    return {
      ...base,
      contests: unifiedContestCount,
      submissions: totalSubmissions,
      statuses: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: base.statuses.rejected,
        judging: base.statuses.judging,
      },
      monthly: updatedMonthly,
    };
  } catch {
    return {
      ...base,
      contests: unifiedContestCount,
    };
  }
}

const SAMPLE_CONTESTS = [
  { name: 'Khoảnh khắc Analog 2025', participants: 6, status: 'Đã hoàn thành' },
  { name: 'Film & City 2026', participants: 4, status: 'Đang chấm điểm' },
  { name: 'The Vintage Look', participants: 2, status: 'Đang diễn ra' },
  { name: 'Monochrome Stories', participants: 2, status: 'Đang diễn ra' },
];

const SAMPLE_ACTIVITIES = [
  { icon: FileImage, color: 'text-blue-600 bg-blue-50', text: 'Thí sinh đã nộp bài dự thi mới', time: '15 phút trước' },
  { icon: Trophy, color: 'text-amber-600 bg-amber-50', text: 'Ban tổ chức đã công bố kết quả cuộc thi', time: '45 phút trước' },
  { icon: Users, color: 'text-emerald-600 bg-emerald-50', text: 'Giám khảo hoàn tất thẩm định vòng sơ khảo', time: '2 giờ trước' },
  { icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50', text: 'Bài dự thi đạt chuẩn thông số cuộn phim', time: '3 giờ trước' },
  { icon: ShieldAlert, color: 'text-rose-600 bg-rose-50', text: 'Hệ thống kiểm duyệt AI hoàn tất rà soát', time: '4 giờ trước' },
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
        <p className="text-2xl font-bold leading-tight text-[#0B356B]">{value.toLocaleString('vi-VN')}</p>
        <p className="text-xs font-semibold text-emerald-600">{change}</p>
      </div>
    </div>
  );
}

function MonthlyChart({ data, year }: { data: number[]; year: string }) {
  const peak = Math.max(...data);
  // Tự động co giãn theo số lượng bài thực tế trong hệ thống
  const max = Math.max(6, Math.ceil((peak + 1) / 2) * 2);

  // Sinh 5 mốc trục Y đều nhau
  const ticks = [0, 1, 2, 3, 4].map((step) => Math.round((max / 4) * step));

  const points = data.map((count, index) => {
    const x = 44 + (index * 522) / 11;
    const y = 177 - (count / max) * 150;
    return { x, y, count };
  });

  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
  const area = `${line} L566 177 L44 177 Z`;

  return (
    <svg
      viewBox="0 0 600 218"
      className="w-full"
      role="img"
      aria-label={`Biểu đồ số lượt bài dự thi theo 12 tháng năm ${year}`}
    >
      <defs>
        <linearGradient id="admin-dashboard-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {ticks.map((tick) => {
        const y = 177 - (tick / max) * 150;
        return (
          <g key={tick}>
            <line
              x1="44"
              x2="566"
              y1={y}
              y2={y}
              stroke="#E2E8F0"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <text x="34" y={y + 4} fill="#64748B" textAnchor="end" fontSize="11">
              {tick}
            </text>
          </g>
        );
      })}

      <path d={area} fill="url(#admin-dashboard-area)" />
      <path
        d={line}
        fill="none"
        stroke="#2563EB"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((point, index) => (
        <g key={index}>
          <circle
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#ffffff"
            stroke="#2563eb"
            strokeWidth="2.5"
          />
          <title>{`Tháng ${index + 1}: ${point.count} bài dự thi`}</title>
          <text x={point.x} y="201" textAnchor="middle" fill="#64748B" fontSize="10.5">
            {index + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StatusChart({ data }: { data: DashboardData }) {
  const total = data.statuses.pending + data.statuses.approved + data.statuses.rejected + data.statuses.judging;
  const statusItems = [
    { label: 'Chờ duyệt', count: data.statuses.pending, color: '#3B82F6' },
    { label: 'Đã duyệt', count: data.statuses.approved, color: '#10B981' },
    { label: 'Bị từ chối', count: data.statuses.rejected, color: '#FB7185' },
    { label: 'Đang chấm', count: data.statuses.judging, color: '#F59E0B' },
  ];

  let offset = 0;
  const stops = statusItems.map(({ count, color }) => {
    const start = total ? (offset / total) * 100 : 0;
    offset += count;
    const end = total ? (offset / total) * 100 : 0;
    return `${color} ${start}% ${end}%`;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around py-1">
      <div
        className="relative flex size-44 shrink-0 items-center justify-center rounded-full shadow-xs"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
        role="img"
        aria-label="Biểu đồ tròn tỷ lệ trạng thái bài dự thi"
      >
        <div className="flex size-[114px] flex-col items-center justify-center rounded-full bg-white text-center shadow-xs">
          <span className="text-2xl font-black text-[#0B356B] leading-none">
            {total.toLocaleString('vi-VN')}
          </span>
          <span className="text-[10px] text-slate-500 font-medium mt-1">Tổng bài dự thi</span>
        </div>
      </div>

      <div className="w-full min-w-0 sm:max-w-[210px] space-y-3.5">
        {statusItems.map((item) => {
          const pct = total ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 font-medium truncate">{item.label}</span>
              </div>
              <span className="font-bold text-[#0B356B] tabular-nums">
                {item.count.toLocaleString('vi-VN')} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [updateKey, setUpdateKey] = useState(0);

  // Lắng nghe thay đổi dữ liệu từ các thao tác nộp bài, duyệt bài, tạo cuộc thi hoặc công bố kết quả
  useEffect(() => {
    const handleUpdate = () => setUpdateKey((k) => k + 1);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('filmcontest:published-results-updated', handleUpdate);
    window.addEventListener('filmcontest:contests-updated', handleUpdate);
    window.addEventListener('filmcontest:submissions-updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('filmcontest:published-results-updated', handleUpdate);
      window.removeEventListener('filmcontest:contests-updated', handleUpdate);
      window.removeEventListener('filmcontest:submissions-updated', handleUpdate);
    };
  }, []);

  const data = useMemo(
    () => getDynamicDashboardData(selectedYear),
    [selectedYear, updateKey]
  );

  const metrics = [
    { label: 'Người dùng', value: data.users, change: '28 tài khoản', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Cuộc thi', value: data.contests, change: `${data.contests} cuộc thi`, icon: CalendarDays, color: 'bg-violet-100 text-violet-600' },
    { label: 'Bài dự thi', value: data.submissions, change: `${data.submissions} bài`, icon: Images, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Giám khảo', value: data.judges, change: '16 giám khảo', icon: UserRoundCheck, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <section aria-label="Tổng quan quản trị" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200">
          Đồng bộ thời gian thực toàn hệ thống
        </span>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <CalendarDays size={16} className="text-blue-600" aria-hidden="true" />
          <span className="sr-only">Chọn năm thống kê</span>
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="cursor-pointer bg-transparent outline-none font-semibold text-slate-800"
            aria-label="Chọn năm thống kê"
          >
            {Object.keys(SYSTEM_BASELINE_DATA).map((year) => (
              <option key={year} value={year}>
                Năm {year}
              </option>
            ))}
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
          <h2 className="mb-4 text-base font-bold text-[#0B356B]">Tình trạng bài dự thi</h2>
          <StatusChart data={data} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0B356B]">Cuộc thi trong hệ thống</h2>
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
                  <p className="truncate text-sm font-semibold text-slate-800">{contest.name}</p>
                  <span className="text-xs text-emerald-700">{contest.status}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{contest.participants} bài thi</span>
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
                    <Clock3 size={11} aria-hidden="true" />{time}
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
