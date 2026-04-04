import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Column<T> = {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  className,
  rowKey,
  rowClassName
}: {
  columns: Column<T>[];
  data: T[];
  className?: string;
  rowKey?: (item: T, index: number) => string | number;
  rowClassName?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[1.55rem] border border-white/8 bg-card/92 shadow-panel", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.04]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground first:pl-6 last:pr-6"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={rowKey ? rowKey(item, index) : index}
                className={cn("border-t border-white/6 transition-colors hover:bg-white/[0.03]", rowClassName)}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-5 py-4 align-middle first:pl-6 last:pr-6", column.className)}>
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
