import clsx from "clsx";
import UnifiedSpinner from "../Loading/UnifiedSpinner";
import { EmptyState } from "./EmptyState";

const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  className = "",
  emptyText = "Không có dữ liệu",
  emptyDescription = "",
  emptyComponent = null,
  onRowClick = null,
  rowClassName = "",
  stickyHeader = false,
  pagination = null,
}) => {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-dark-surface rounded-3xl shadow-soft border border-slate-100 dark:border-dark-border overflow-hidden",
        className,
      )}
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[580px] md:min-w-[640px] text-left text-sm text-slate-700 dark:text-slate-300 border-collapse">
          <thead
            className={clsx(
              "bg-slate-50/80 dark:bg-dark-bg/80 text-slate-400 dark:text-dark-text-secondary text-[10px] md:text-[11px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-dark-border",
              stickyHeader && "sticky top-0 z-10 backdrop-blur-md",
            )}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor || col.header}
                  className={clsx("px-4 py-3.5 md:px-6 md:py-4", col.headerClassName)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={Math.max(1, columns.length)}
                  className="px-6 py-12 text-center text-slate-400 dark:text-dark-text-secondary font-medium"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <UnifiedSpinner size="md" variant="primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Đang tải dữ liệu...
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={Math.max(1, columns.length)} className="p-4">
                  {emptyComponent || (
                    <EmptyState
                      size="sm"
                      title={emptyText}
                      description={emptyDescription}
                      className="border-0 bg-transparent dark:bg-transparent shadow-none"
                    />
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const resolvedRowClass =
                  typeof rowClassName === "function" ? rowClassName(row, rowIndex) : rowClassName;
                return (
                  <tr
                    key={row.id ?? rowIndex}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={clsx(
                      "hover:bg-slate-50/60 dark:hover:bg-dark-bg/50 transition-colors",
                      onRowClick && "cursor-pointer",
                      resolvedRowClass,
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.accessor || col.header}
                        className={clsx(
                          "px-4 py-3.5 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300",
                          col.cellClassName,
                        )}
                      >
                        {col.cell ? col.cell(row) : (row[col.accessor] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/30 flex justify-center">
          {pagination}
        </div>
      )}
    </div>
  );
};

export { Table };
export default Table;
