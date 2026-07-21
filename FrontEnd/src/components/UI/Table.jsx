import clsx from "clsx";

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
        "overflow-x-auto bg-white dark:bg-dark-surface rounded-2xl shadow-soft border border-slate-100 dark:border-dark-border",
        className,
      )}
    >
      <table className="w-full min-w-[640px] text-left text-sm text-slate-700 dark:text-slate-300">
        <thead className="bg-slate-50/50 dark:bg-dark-bg/50 text-slate-500 dark:text-dark-text-secondary text-[11px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-dark-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor || col.header}
                className="px-6 py-4"
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
                className="px-6 py-8 text-center text-slate-400 dark:text-dark-text-secondary font-medium"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="size-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <span>Đang tải dữ liệu...</span>
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
                    className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300"
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
