import { useCallback, useState } from "react";
import { Activity, Camera, CheckCircle2, Images, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { contestService } from "../../../services/contestService";
import { reportService } from "../../../services/reportService";
import type { CountItem } from "../../../types/report";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

type Period = "30" | "90" | "year";

const CATEGORY_COLORS = ["#2563eb", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981"];
const STATUS_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

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

function TrendChart({ items }: { items: CountItem[] }) {
  const series = { labels: items.map((item) => item.label), values: items.map((item) => item.count) };
  const width = 680;
  const height = 250;
  const left = 48;
  const right = 14;
  const top = 18;
  const bottom = 38;
  const displayValues = series.values;
  const maxValue = Math.max(3, Math.ceil(Math.max(0, ...displayValues) / 3) * 3);
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
  const [contestId, setContestId] = useState("all");
  const fetchReport = useCallback(() => reportService.getReport(contestId === "all" ? undefined : contestId), [contestId]);
  const stats = useFetch(fetchReport);
  const [period, setPeriod] = useState<Period>("90");
  const selectedContest = contests.data?.find((contest) => contest.id === contestId);
  const report = stats.data;
  const toPercentItems = (items: CountItem[], colors: string[]) => {
    const total = items.reduce((sum, item) => sum + item.count, 0);
    return items.map((item, index) => ({ label: item.label, percent: total ? Math.round(item.count / total * 100) : 0, color: colors[index % colors.length] }));
  };
  const categoryItems = toPercentItems(report?.categoryDistribution ?? [], CATEGORY_COLORS);
  const filmStockItems = toPercentItems(report?.filmStockDistribution ?? [], CATEGORY_COLORS);
  const statusItems = toPercentItems([
    { label: "Đã xác minh", count: report?.verifiedSubmissions ?? 0 },
    { label: "Chờ xác minh", count: report?.pendingSubmissions ?? 0 },
    { label: "Đã từ chối", count: report?.rejectedSubmissions ?? 0 },
  ], STATUS_COLORS);
  const verifiedPercent = report?.submissions ? Math.round(report.verifiedSubmissions / report.submissions * 100) : 0;
  const trendItems = period === "30" ? report?.submissionsLast30Days : period === "90" ? report?.submissionsLast6Months : report?.submissionsThisYear;
  const periodLabel = period === "30" ? "30 ngày gần đây" : period === "90" ? "6 tháng gần đây" : "Từ đầu năm";

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
            <option value="30">30 ngày gần đây</option><option value="90">6 tháng gần đây</option><option value="year">Từ đầu năm</option>
          </select>
        </div>} />

      {(contests.error || stats.error) && <StateMessage message={contests.error ?? stats.error ?? "Không thể tải báo cáo."} isError />}
      {(contests.isLoading || stats.isLoading) && <StateMessage message="Đang tổng hợp báo cáo..." />}

      {!stats.isLoading && !stats.error && (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard label="Thí sinh tham gia" value={(report?.participants ?? 0).toLocaleString("vi-VN")} icon={Users} tone="bg-emerald-50 text-emerald-700" hint="Thí sinh" />
            <MetricCard label="Bài dự thi" value={(report?.submissions ?? 0).toLocaleString("vi-VN")} icon={Images} tone="bg-blue-50 text-blue-700" hint="Tổng số" />
            <MetricCard label="Giám khảo" value={(report?.judges ?? 0).toLocaleString("vi-VN")} icon={Camera} tone="bg-amber-50 text-amber-700" hint="Được phân công" />
            <MetricCard label="Bài đã xác minh" value={`${verifiedPercent}%`} icon={CheckCircle2} tone="bg-violet-50 text-violet-700" hint={`${report?.verifiedSubmissions ?? 0} bài`} />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-start justify-between gap-3"><div><h2 className="font-bold text-[#0B356B]">Số lượng bài dự thi theo thời gian</h2><p className="mt-1 text-xs text-slate-500">{selectedContest?.name ?? "Tất cả cuộc thi"} · {periodLabel}</p></div><span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"><Activity size={13} aria-hidden="true" /> Xu hướng</span></div>
              <TrendChart items={trendItems ?? []} />
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="font-bold text-[#0B356B]">Phân bố theo thể loại</h2><p className="mt-1 text-xs text-slate-500">Tỷ lệ bài dự thi theo chủ đề</p>
              {categoryItems.length ? (
                <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-around"><DonutChart label="Tỷ lệ thể loại bài dự thi" items={categoryItems} /><ul className="w-full space-y-3 sm:max-w-xs">{categoryItems.map((item) => <li key={item.label} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="min-w-0 flex-1 truncate text-slate-600">{item.label}</span><span className="font-semibold text-slate-800">{item.percent}%</span></li>)}</ul></div>
              ) : <StateMessage message="Chưa có dữ liệu thể loại." />}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="font-bold text-[#0B356B]">Loại phim được dùng nhiều</h2><p className="mt-1 text-xs text-slate-500">Theo thông tin thí sinh khai báo khi nộp bài</p>
              {filmStockItems.length ? <div className="mt-5 space-y-4">{filmStockItems.map((item) => <div key={item.label} className="grid grid-cols-[7rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm"><span className="truncate text-slate-600" title={item.label}>{item.label}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${item.percent}%` }} /></div><span className="text-right text-xs font-semibold text-slate-500">{item.percent}%</span></div>)}</div> : <StateMessage message="Chưa có dữ liệu loại phim." />}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="font-bold text-[#0B356B]">Trạng thái bài dự thi</h2><p className="mt-1 text-xs text-slate-500">Tỷ lệ xác minh trong cuộc thi</p>
              <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-around"><DonutChart label="Tỷ lệ trạng thái bài dự thi" items={statusItems} /><ul className="w-full space-y-4 sm:max-w-xs">{statusItems.map((item) => <li key={item.label} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="min-w-0 flex-1 text-slate-600">{item.label}</span><span className="font-bold text-slate-800">{item.percent}%</span></li>)}</ul></div>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
