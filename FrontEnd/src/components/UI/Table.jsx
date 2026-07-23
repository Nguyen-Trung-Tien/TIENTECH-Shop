import clsx from "clsx";
import UnifiedSpinner from "../Loading/UnifiedSpinner";

const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  className = "",
  emptyText = "Không có dữ liệu",
}) => {
  return (
    <div
      className={clsx(
        "overflow-x-auto custom-scrollbar bg-white dark:bg-dark-surface rounded-3xl shadow-soft border border-slate-100 dark:border-dark-border",
        className,
      )}
    >
      <table className="w-full min-w-[580px] md:min-w-[640px] text-left text-sm text-slate-700 dark:text-slate-300 border-collapse">
        <thead className="bg-slate-50/60 dark:bg-dark-bg/60 text-slate-400 dark:text-dark-text-secondary text-[10px] md:text-[11px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-dark-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor || col.header}
                className="px-4 py-3.5 md:px-6 md:py-4"
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
                colSpan={columns.length}
                className="px-6 py-12 text-center text-slate-400 dark:text-dark-text-secondary font-medium"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <UnifiedSpinner size="md" variant="primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đang tải dữ liệu...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-slate-400 dark:text-dark-text-secondary font-medium"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                className="hover:bg-slate-50/50 dark:hover:bg-dark-bg/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.accessor || col.header}
                    className="px-4 py-3.5 md:px-6 md:py-4 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {col.cell ? col.cell(row) : (row[col.accessor] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export { Table };
export default Table;
