import { TrendingUp } from "lucide-react";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

const CATEGORY_DATA = [
  { label: "Phong cảnh", percent: 32, color: "#2563eb" },
  { label: "Đường phố", percent: 27, color: "#06b6d4" },
  { label: "Chân dung", percent: 21, color: "#8b5cf6" },
  { label: "Tài liệu", percent: 12, color: "#f59e0b" },
  { label: "Khác", percent: 8, color: "#10b981" },
];

const COUNTRY_DATA = [
  { label: "Việt Nam", percent: 45, color: "#2563eb" },
  { label: "Nhật Bản", percent: 18, color: "#0284c7" },
  { label: "Hàn Quốc", percent: 12, color: "#6366f1" },
  { label: "Pháp", percent: 8, color: "#a855f7" },
  { label: "Khác", percent: 17, color: "#94a3b8" },
];

const STATUS_DATA = [
  { label: "Đã xác minh", percent: 95, color: "#10b981" },
  { label: "Chờ xác minh", percent: 5, color: "#f59e0b" },
];

function TrendChart() {
  const width = 640;
  const height = 230;
  const left = 45;
  const right = 20;
  const top = 22;
  const bottom = 40;

  // Trục Y có 4 mốc: 500, 333, 167, 0
  const yTicks = [
    { value: 500, y: top },
    { value: 333, y: top + (height - top - bottom) * (1 - 333 / 500) },
    { value: 167, y: top + (height - top - bottom) * (1 - 167 / 500) },
    { value: 0, y: height - bottom },
  ];

  // 6 điểm tương ứng với đường biểu đồ trong ảnh mẫu
  const points = [
    { x: left, yVal: 180, label: "Thg 7" },
    { x: left + 105, yVal: 265, label: "Thg 8" },
    { x: left + 215, yVal: 230, label: "Thg 9" },
    { x: left + 335, yVal: 360, label: "Thg 10" },
    { x: left + 450, yVal: 310, label: "Thg 11" },
    { x: width - right, yVal: 420, label: "" },
  ];

  const svgPoints = points.map((p) => ({
    x: p.x,
    y: top + (height - top - bottom) * (1 - p.yVal / 500),
    label: p.label,
  }));

  const linePath = svgPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${svgPoints[svgPoints.length - 1].x} ${height - bottom} L ${left} ${height - bottom} Z`;

  return (
    <div className="min-w-0 overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Số lượng bài dự thi theo thời gian"
        className="h-auto min-w-[500px] w-full"
      >
        <defs>
          <linearGradient id="trend-area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Các đường gióng ngang và nhãn trục Y */}
        {yTicks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={left}
              x2={width - right}
              y1={tick.y}
              y2={tick.y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <text
              x={left - 10}
              y={tick.y + 3.5}
              textAnchor="end"
              className="fill-slate-400 font-normal"
              fontSize="10"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* Vùng mờ gradient dưới đường kẻ */}
        <path d={areaPath} fill="url(#trend-area-fill)" />

        {/* Đường biểu đồ chính */}
        <path
          d={linePath}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Các chấm tròn tại các điểm mốc và nhãn tháng trục X */}
        {svgPoints.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#ffffff"
              stroke="#2563eb"
              strokeWidth="2.5"
            />
            {pt.label ? (
              <text
                x={pt.x}
                y={height - 15}
                textAnchor="middle"
                className="fill-slate-500 font-medium"
                fontSize="10.5"
              >
                {pt.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({
  items,
  label,
}: {
  items: { label: string; percent: number; color: string }[];
  label: string;
}) {
  let cursor = 0;
  const stops = items
    .map((item) => {
      const start = cursor;
      cursor += item.percent;
      return `${item.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <div
      role="img"
      aria-label={label}
      className="relative size-40 shrink-0 rounded-full shadow-xs"
      style={{ background: `conic-gradient(${stops})` }}
    >
      <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-xs">
        <span className="text-2xl font-black text-[#0B356B] leading-none">100%</span>
        <span className="text-[11px] text-slate-500 font-medium mt-1">tổng bài</span>
      </div>
    </div>
  );
}

export function ReportsView() {
  return (
    <section aria-label="Báo cáo thống kê" className="space-y-5">
      <OrganizerPageHeader
        title="Báo cáo"
        description="Theo dõi tình hình tham gia, phân bố thể loại bài thi và tỷ lệ xác minh theo thời gian thực."
      />

      {/* Lưới 4 sơ đồ theo đúng bố cục 2x2 như ảnh mẫu */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Sơ đồ 1: Số lượng bài dự thi theo thời gian */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0B356B]">
                Số lượng bài dự thi theo thời gian
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Toàn hệ thống · 31/12/2026 – 31/03/2027
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-100">
              <TrendingUp size={14} className="text-blue-600" aria-hidden="true" />
              Xu hướng
            </span>
          </div>
          <TrendChart />
        </article>

        {/* Sơ đồ 2: Phân bổ theo thể loại */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-[#0B356B]">
              Phân bổ theo thể loại
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Tỷ lệ bài dự thi theo chủ đề
            </p>
          </div>
          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-around py-1">
            <DonutChart items={CATEGORY_DATA} label="Phân bổ theo thể loại" />
            <div className="w-full sm:max-w-[210px] space-y-3.5">
              {CATEGORY_DATA.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 font-medium truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {item.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Sơ đồ 3: Top quốc gia tham gia */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0B356B]">
              Top quốc gia tham gia
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Phân bố thí sinh theo khu vực
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {COUNTRY_DATA.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 text-slate-700 font-medium">
                  {item.label}
                </span>
                <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-semibold text-slate-600 tabular-nums">
                  {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* Sơ đồ 4: Trạng thái bài dự thi */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-[#0B356B]">
              Trạng thái bài dự thi
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Tỷ lệ xác minh trong cuộc thi
            </p>
          </div>
          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-around py-1">
            <DonutChart items={STATUS_DATA} label="Trạng thái bài dự thi" />
            <div className="w-full sm:max-w-[210px] space-y-4">
              {STATUS_DATA.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 font-medium truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {item.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* Dòng ghi chú chân trang */}
      <p className="text-xs text-slate-400 mt-2">
        Khoảng ngày: 31/12/2026 – 31/03/2027. Biểu đồ xu hướng, quốc gia, trạng thái và tỷ lệ tăng trưởng đang dùng dữ liệu minh họa.
      </p>
    </section>
  );
}
