import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { reportService } from "../../../services/reportService";

export function ReportsView() {
  const { data, isLoading, error } = useFetch(reportService.getTypeDistribution);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold text-navy-900">Báo cáo</h1>
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}
      {data && (
        <div className="card flex max-w-xl flex-col gap-4 p-5">
          <h2 className="font-semibold text-navy-900">Phân bố bài dự thi theo thể loại</h2>
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-sm">
              <span className="w-24 text-slate-600">{item.label}</span>
              <div className="h-2.5 flex-1 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-brand-500" style={{ width: `${item.percent}%` }} />
              </div>
              <span className="w-10 text-right text-slate-500">{item.percent}%</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
