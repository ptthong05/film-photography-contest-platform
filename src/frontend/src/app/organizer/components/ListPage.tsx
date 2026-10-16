import { useState } from "react";
import { Plus } from "lucide-react";
import { SearchInput } from "../../../components/SearchInput";
import { StateMessage } from "../../../components/StateMessage";
import { useFetch } from "../../../hooks/useFetch";
import { DataTable, type Column } from "./DataTable";

interface ListPageProps<T> {
  title: string;
  searchPlaceholder: string;
  unit: string;
  fetcher: () => Promise<T[]>;
  columns: Column<T>[];
  getKey: (row: T) => string;
  getSearchText: (row: T) => string;
  actionLabel?: string;
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
}: ListPageProps<T>) {
  const { data, isLoading, error } = useFetch(fetcher);
  const [keyword, setKeyword] = useState("");

  const normalizedKeyword = keyword.trim().toLowerCase();
  const rows = (data ?? []).filter((row) => getSearchText(row).toLowerCase().includes(normalizedKeyword));

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold text-navy-900">{title}</h1>
      <div className="mb-4 flex gap-3">
        <SearchInput value={keyword} onChange={setKeyword} placeholder={searchPlaceholder} />
        {actionLabel && (
          <button type="button" className="btn-primary">
            <Plus size={16} aria-hidden />
            {actionLabel}
          </button>
        )}
      </div>
      {isLoading && <StateMessage message="Đang tải dữ liệu..." />}
      {error && <StateMessage message={error} isError />}
      {data && (
        <DataTable columns={columns} rows={rows} getKey={getKey} footer={`Hiển thị ${rows.length} ${unit}`} />
      )}
    </section>
  );
}
