import React from "react";
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
        "overflow-x-auto bg-white rounded-xl shadow-sm border border-neutral-200/70",
        className,
      )}
    >
      <table className="w-full min-w-[640px] text-left text-sm text-neutral-700">
        <thead className="bg-slate-50 text-neutral-600 text-xs uppercase tracking-wider">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor || col.header}
                className="px-4 py-3 border-b border-neutral-200"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-neutral-500"
              >
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-neutral-500"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                className="odd:bg-white even:bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.accessor || col.header}
                    className="px-4 py-3 border-b border-neutral-200"
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

export default Table;
