import { useMemo, useState } from "react";
import { Activity, Camera, CheckCircle2, Images, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { reportService } from "../../../services/reportService";
import { formatDate } from "../../../utils/formatDate";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

type Period = "30" | "90" | "year";

const PERIOD_SERIES: Record<Period, { labels: string[]; values: number[] }> = {
  "30": { labels: ["1", "5", "10", "15", "20", "25", "30"], values: [18, 26, 22, 41, 36, 58, 49] },
  "90": { labels: ["Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"], values: [35, 48, 43, 68, 60, 82] },
  year: { labels: ["Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6", "Thg 7"], values: [22, 31, 42, 37, 58, 72, 88] },
};

const COUNTRY_DISTRIBUTION = [
  { label: "Việt Nam", percent: 45, color: "bg-blue-600" },
  { label: "Nhật Bản", percent: 18, color: "bg-sky-500" },
  { label: "Hàn Quốc", percent: 12, color: "bg-indigo-500" },
  { label: "Pháp", percent: 8, color: "bg-violet-500" },
  { label: "Khác", percent: 17, color: "bg-slate-400" },
];

const CATEGORY_COLORS = ["#2563eb", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981"];
const SUBMISSION_STATUS = [
  { label: "Đã xác minh", percent: 95, color: "#10b981" },
  { label: "Chờ xác minh", percent: 5, color: "#f59e0b" },
];

function MetricCard({ label, value, icon: Icon, tone, hint }: { label: string; value: string; icon: LucideIcon; tone: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={19} aria-hidden="true" /></span>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">{hint}</span>
      </div>
      <p className="mt-3 text-xl font-extrabold tracking-tight text-[#0B356B]">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </article>
  );
}

function TrendChart({ period, submissionCount }: { period: Period; submissionCount: number }) {
  const series = PERIOD_SERIES[period];
  const width = 680;
  const height = 250;
  const left = 48;
  const right = 14;
  const top = 18;
  const bottom = 38;
  const weightTotal = series.values.reduce((sum, value) => sum + value, 0);
  const displayValues = series.values.map((value) => weightTotal ? value / weightTotal * submissionCount : 0);
  const maxValue = Math.ceil(Math.max(...displayValues) / 100) * 100 || 100;
  const points = displayValues.map((value, index) => ({
    x: left + index * ((width - left - right) / Math.max(1, series.values.length - 1)),
    y: top + (1 - value / maxValue) * (height - top - bottom),
    value: Math.round(value),
  }));
  const linePath = points.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${points.at(-1)?.x},${height - bottom} L${left},${height - bottom} Z`;

  return (
    <div className="min-w-0 overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ xu hướng số bài dự thi" className="h-auto min-w-[520px] w-full">
        <defs><linearGradient id="submission-trend-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" /><stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" /></linearGradient></defs>
        {[0, 1, 2, 3].map((step) => {
          const y = top + step * ((height - top - bottom) / 3);
          return <g key={step}><line x1={left} x2={width - right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 5" /><text x={left - 10} y={y + 4} textAnchor="end" className="fill-slate-400" fontSize="10">{Math.round(maxValue * (1 - step / 3))}</text></g>;
        })}
        <path d={areaPath} fill="url(#submission-trend-fill)" />
        <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => <g key={series.labels[index]}><circle cx={point.x} cy={point.y} r="4" fill="white" stroke="#2563eb" strokeWidth="2.5"><title>{`${series.labels[index]}: ${point.value} bài`}</title></circle><text x={point.x} y={height - 12} textAnchor="middle" className="fill-slate-500" fontSize="10">{series.labels[index]}</text></g>)}
      </svg>
    </div>
  );
}

function DonutChart({ items, label }: { items: { label: string; percent: number; color: string }[]; label: string }) {
  let cursor = 0;
  const stops = items.map((item) => {
    const start = cursor;
    cursor += item.percent;
    return `${item.color} ${start}% ${cursor}%`;
  }).join(", ");
  return (
    <div role="img" aria-label={label} className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops})` }}>
      <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
        <span className="text-xl font-extrabold text-[#0B356B]">100%</span>
        <span className="text-[10px] text-slate-500">tổng bài</span>
      </div>
    </div>
  );
}

export function ReportsView() {
  const contests = useFetch(contestService.getContests);
  const stats = useFetch(contestService.getOverviewStats);
  const categories = useFetch(reportService.getTypeDistribution);
  const [contestId, setContestId] = useState("all");
  const [period, setPeriod] = useState<Period>("90");
  const selectedContest = contests.data?.find((contest) => contest.id === contestId);
  const totals = useMemo(() => ({
    submissions: selectedContest?.submissionCount ?? stats.data?.submissions ?? 0,
    participants: selectedContest?.participantCount ?? stats.data?.participants ?? 0,
    judges: stats.data?.judges ?? 0,
  }), [selectedContest, stats.data]);
  const categoryItems = (categories.data ?? []).map((item, index) => ({ ...item, color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }));
  const availableDates = (contests.data ?? []).map((contest) => contest.endDate).sort();
  const anchor = selectedContest?.endDate ?? availableDates.at(-1) ?? "2025-11-30";
  const reportEnd = new Date(`${anchor}T00:00:00`);
  const startDate = new Date(reportEnd);
  if (period === "year") startDate.setFullYear(startDate.getFullYear() - 1);
  else startDate.setDate(startDate.getDate() - Number(period));
  const toLocalIso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const dateLabel = `${formatDate(toLocalIso(startDate))} – ${formatDate(anchor)}`;

  return (
    <section className="space-y-5">
      <OrganizerPageHeader title="Báo cáo" description="Theo dõi tình hình tham gia và chất lượng bài dự thi."
        action={<div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="report-contest">Chọn cuộc thi</label>
          <select id="report-contest" value={contestId} onChange={(event) => setContestId(event.target.value)} className="min-w-52 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="all">Tất cả cuộc thi</option>{(contests.data ?? []).map((contest) => <option key={contest.id} value={contest.id}>{contest.name}</option>)}
          </select>
          <label className="sr-only" htmlFor="report-period">Khoảng thời gian</label>
          <select id="report-period" value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="30">30 ngày gần đây</option><option value="90">90 ngày gần đây</option><option value="year">12 tháng gần đây</option>
          </select>
        </div>} />

      {(contests.error || stats.error || categories.error) && <StateMessage message={contests.error ?? stats.error ?? categories.error ?? "Không thể tải báo cáo."} isError />}
      {(contests.isLoading || stats.isLoading || categories.isLoading) && <StateMessage message="Đang tổng hợp báo cáo..." />}

      {!stats.isLoading && !stats.error && (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard label="Thí sinh tham gia" value={totals.participants.toLocaleString("vi-VN")} icon={Users} tone="bg-emerald-50 text-emerald-700" hint="+12,8%" />
            <MetricCard label="Bài dự thi" value={totals.submissions.toLocaleString("vi-VN")} icon={Images} tone="bg-blue-50 text-blue-700" hint="+8,4%" />
            <MetricCard label="Giám khảo" value={totals.judges.toLocaleString("vi-VN")} icon={Camera} tone="bg-amber-50 text-amber-700" hint="Đang hoạt động" />
            <MetricCard label="Bài đã xác minh" value="95%" icon={CheckCircle2} tone="bg-violet-50 text-violet-700" hint="Ổn định" />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-start justify-between gap-3"><div><h2 className="font-bold text-[#0B356B]">Số lượng bài dự thi theo thời gian</h2><p className="mt-1 text-xs text-slate-500">{selectedContest?.name ?? "Toàn hệ thống"} · {dateLabel}</p></div><span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"><Activity size={13} aria-hidden="true" /> Xu hướng</span></div>
              <TrendChart period={period} submissionCount={totals.submissions} />
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="font-bold text-[#0B356B]">Phân bố theo thể loại</h2><p className="mt-1 text-xs text-slate-500">Tỷ lệ bài dự thi theo chủ đề</p>
              {categories.isLoading ? <StateMessage message="Đang tải dữ liệu..." /> : categoryItems.length ? (
                <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-around"><DonutChart label="Tỷ lệ thể loại bài dự thi" items={categoryItems} /><ul className="w-full space-y-3 sm:max-w-xs">{categoryItems.map((item) => <li key={item.label} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="min-w-0 flex-1 truncate text-slate-600">{item.label}</span><span className="font-semibold text-slate-800">{item.percent}%</span></li>)}</ul></div>
              ) : <StateMessage message="Chưa có dữ liệu thể loại." />}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="font-bold text-[#0B356B]">Top quốc gia tham gia</h2><p className="mt-1 text-xs text-slate-500">Phân bố thí sinh theo khu vực</p>
              <div className="mt-5 space-y-4">{COUNTRY_DISTRIBUTION.map((item) => <div key={item.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm"><span className="truncate text-slate-600">{item.label}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} /></div><span className="text-right text-xs font-semibold text-slate-500">{item.percent}%</span></div>)}</div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="font-bold text-[#0B356B]">Trạng thái bài dự thi</h2><p className="mt-1 text-xs text-slate-500">Tỷ lệ xác minh trong cuộc thi</p>
              <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-around"><DonutChart label="Tỷ lệ trạng thái bài dự thi" items={SUBMISSION_STATUS} /><ul className="w-full space-y-4 sm:max-w-xs">{SUBMISSION_STATUS.map((item) => <li key={item.label} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="min-w-0 flex-1 text-slate-600">{item.label}</span><span className="font-bold text-slate-800">{item.percent}%</span></li>)}</ul></div>
            </article>
          </div>
          <p className="text-xs text-slate-400">Khoảng ngày: {dateLabel}. Biểu đồ xu hướng, quốc gia, trạng thái và tỷ lệ tăng trưởng đang dùng dữ liệu minh họa.</p>
        </>
      )}
    </section>
  );
}
