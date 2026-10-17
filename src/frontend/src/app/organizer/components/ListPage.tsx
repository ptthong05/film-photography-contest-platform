import { useState } from "react";
import { Plus } from "lucide-react";
import { SearchInput } from "../../../components/SearchInput";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { DataTable, type Column } from "./DataTable";
import { DetailModal, type DetailInfo } from "./DetailModal";

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
}: ListPageProps<T>) {
  const { data, isLoading, error } = useFetch(fetcher);
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<DetailInfo | null>(null);

  const tableColumns: Column<T>[] = getDetail
    ? [
        ...columns,
        {
          header: "Thao tác",
          render: (row) => (
            <button type="button" className="btn-outline" onClick={() => setDetail(getDetail(row))}>
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
    <section>
      <h1 className="mb-4 text-2xl font-bold text-navy-900">{title}</h1>
      <div className="mb-4 flex gap-3">
        <SearchInput value={keyword} onChange={setKeyword} placeholder={searchPlaceholder} />
        {actionLabel && (
          <button type="button" className="btn-primary" onClick={onAction}>
            <Plus size={16} aria-hidden />
            {actionLabel}
          </button>
        )}
      </div>
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}
      {data && (
        <DataTable columns={tableColumns} rows={rows} getKey={getKey} footer={`Hiển thị ${rows.length} ${unit}`} />
      )}
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}
