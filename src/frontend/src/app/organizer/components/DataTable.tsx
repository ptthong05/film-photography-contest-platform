import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T, index: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  footer?: string;
}

export function DataTable<T>({ columns, rows, getKey, footer }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            {columns.map((column) => (
              <th key={column.header} scope="col" className={`whitespace-nowrap px-4 py-3 ${column.headerClassName ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getKey(row)} className="border-b border-slate-100 transition-colors hover:bg-blue-50/40 last:border-0">
              {columns.map((column) => (
                <td key={column.header} className={`px-4 py-3 ${column.cellClassName ?? ""}`}>
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer && <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">{footer}</p>}
    </div>
  );
}
