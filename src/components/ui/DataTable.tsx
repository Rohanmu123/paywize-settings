import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Column<T> = {
  key: string;
  header: ReactNode;
  /** Fixed px width; omit for the flexible column. */
  width?: number;
  align?: "left" | "right" | "center";
  render: (row: T, index: number) => ReactNode;
};

/**
 * Figma "Table": 30px grey header (10px caps, rounded 16 ends), 44px rows
 * with a 0.5px bottom hairline (none on the last row), 16px cell padding.
 */
export function DataTable<T>({ columns, rows, rowKey, caption, className, rowHeight = 44, onRowClick, headerTone = "background" }: { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; caption?: string; className?: string; rowHeight?: number; onRowClick?: (row: T) => void; headerTone?: "background" | "container" }) {
  return (
    <table className={cn("w-full table-fixed border-separate border-spacing-0 bg-surface", className)}>
      {caption && <caption className="sr-only">{caption}</caption>}
      <colgroup>
        {columns.map((c) => (
          <col key={c.key} style={c.width ? { width: c.width } : undefined} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th
              key={c.key}
              scope="col"
              className={cn(
                "h-[30px] py-2", headerTone === "container" ? "bg-container" : "bg-background", " text-[10px] leading-3 font-semibold whitespace-nowrap text-text-primary uppercase",
                i === 0 ? "rounded-l-2xl pr-3 pl-4" : "pr-3 pl-4",
                i === columns.length - 1 && "rounded-r-2xl",
                c.align === "right" ? "pr-4 text-right" : c.align === "center" ? "text-center" : "text-left",
              )}
            >
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={rowKey(row)} className={cn(onRowClick && "cursor-pointer hover:bg-surface-variant")} onClick={onRowClick ? () => onRowClick(row) : undefined}>
            {columns.map((c) => (
              <td
                key={c.key}
                style={{ height: rowHeight }}
                className={cn(
                  "px-4 py-1.5 align-middle type-12m whitespace-nowrap text-text-primary",
                  ri < rows.length - 1 && "border-b-[0.5px] border-border",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                )}
              >
                {c.render(row, ri)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
