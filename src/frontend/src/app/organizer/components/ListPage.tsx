import { useState } from "react";
import { Plus } from "lucide-react";
import { SearchInput } from "../../../components/SearchInput";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { DataTable, type Column } from "./DataTable";
import { DetailModal, type DetailInfo } from "./DetailModal";
import { OrganizerPageHeader } from "./OrganizerPageHeader";

interface ListPageProps<T> {
  title: string;
  searchPlaceholder: string;
  unit: string;
  fetcher: () => Promise<T[]>;
  columns: Column<T>[];
  getKey: (row: T) => string;
  getSearchText: (row: T) => string;
  actionLabel?: string;
  onAction?: () => void;
  extraRows?: T[];
  getDetail?: (row: T) => DetailInfo;
  onView?: (row: T) => void;
}

export function ListPage<T>({
  title,
  searchPlaceholder,
  unit,
  fetcher,
  columns,
  getKey,
  getSearchText,
  actionLabel,
  onAction,
  extraRows,
  getDetail,
  onView,
}: ListPageProps<T>) {
  const { data, isLoading, error } = useFetch(fetcher);
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<DetailInfo | null>(null);

  const tableColumns: Column<T>[] = getDetail || onView
    ? [
        ...columns,
        {
          header: "Thao tác",
          render: (row) => (
            <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50" onClick={() => (onView ? onView(row) : getDetail && setDetail(getDetail(row)))}>
              Xem
            </button>
          ),
        },
      ]
    : columns;

  const normalizedKeyword = keyword.trim().toLowerCase();
  const rows = [...(extraRows ?? []), ...(data ?? [])].filter((row) =>
    getSearchText(row).toLowerCase().includes(normalizedKeyword),
  );

  return (
    <section className="space-y-5">
      <OrganizerPageHeader title={title} action={actionLabel && <button type="button" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" onClick={onAction}><Plus size={16} aria-hidden="true" />{actionLabel}</button>} />
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <SearchInput value={keyword} onChange={setKeyword} placeholder={searchPlaceholder} />
      </div>
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}
      {data && (
        rows.length ? <DataTable columns={tableColumns} rows={rows} getKey={getKey} footer={`Hiển thị ${rows.length} ${unit}`} /> :
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Không tìm thấy {unit} phù hợp.</div>
      )}
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}
