import React from "react";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import AppPagination from "../../components/Pagination/Pagination";
import { motion as Motion } from "framer-motion";
import { AdminTableSkeleton, AdminActionLoader } from "./AdminLoading";

/**
 * Generic Table component for Admin Management pages
 * Now with Elite Loading system integrated
 */
const GenericAdminTable = ({
  title,
  subtitle,
  icon: Icon,
  columns,
  data = [],
  loading,
  actionLoading,
  actionMessage,
  searchTerm,
  onSearchChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  page,
  totalPages,
  onPageChange,
  addLabel = "Thêm mới",
  searchPlaceholder = "Tìm kiếm...",
  renderActions,
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  return (
    <div className="space-y-4 sm:space-y-8 p-2.5 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Action Loader Overlay */}
      {actionLoading && <AdminActionLoader message={actionMessage} />}

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        <div>
          <div className="tt-eyebrow mb-1">
            <span className="size-1.5 rounded-full bg-lime-500"></span>
            <span>OPERATIONS DATABASE // RECORD VIEW</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs shrink-0 text-base">
              {Icon && (typeof Icon === "function" ? <Icon /> : Icon)}
            </div>
            <span className="truncate">{title}</span>
          </h1>
          {subtitle && (
            <p className="text-slate-500 dark:text-dark-text-secondary font-mono text-xs uppercase tracking-wider mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="relative group w-full sm:w-64 md:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors text-sm" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="tt-input w-full pl-9 pr-9 text-xs sm:text-sm font-medium"
              value={searchTerm || ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Xóa ô tìm kiếm"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <FiX size={12} />
              </button>
            )}
          </div>

          <button
            onClick={onAddClick}
            className="tt-button tt-button-primary group px-4 py-2 flex items-center justify-center gap-2 cursor-pointer shrink-0 text-xs sm:text-sm font-bold uppercase tracking-wider"
          >
            <FiPlus className="text-base group-hover:rotate-90 transition-transform duration-200" />
            <span>{addLabel}</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="tt-card bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[550px] md:min-w-full">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
                {safeColumns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-4 py-3 md:px-6 md:py-3.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="px-4 py-3 md:px-6 md:py-3.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td
                    colSpan={safeColumns.length + 1}
                    className="px-4 py-8 md:px-6"
                  >
                    <AdminTableSkeleton rows={8} cols={safeColumns.length + 1} />
                  </td>
                </tr>
              ) : safeData.length === 0 ? (
                <tr>
                  <td
                    colSpan={safeColumns.length + 1}
                    className="px-4 py-16 md:px-6 text-center"
                  >
                    <div className="max-w-xs mx-auto">
                      <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 mx-auto mb-3">
                        <FiSearch size={22} />
                      </div>
                      <p className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider font-mono">Dữ liệu trống</p>
                      <p className="text-xs text-slate-400 mt-1">Không có bản ghi nào phù hợp với điều kiện tìm kiếm.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                safeData.map((item, rowIdx) => (
                  <Motion.tr
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIdx * 0.02 }}
                    key={item.id || rowIdx}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors group"
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`px-4 py-3 md:px-6 md:py-3 text-xs md:text-sm ${col.className || ""}`}
                      >
                        {col.render ? (
                          col.render(item)
                        ) : (
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {item[col.accessor]}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 md:px-6 md:py-3 text-right">
                      {renderActions ? (
                        renderActions(item)
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-70 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onEditClick(item)}
                            className="size-8 text-primary dark:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:border-primary transition-all cursor-pointer flex items-center justify-center active:scale-95"
                            title="Chỉnh sửa"
                            aria-label="Chỉnh sửa bản ghi"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteClick(item)}
                            className="size-8 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                            title="Xóa"
                            aria-label="Xóa bản ghi"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </Motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Area */}
        {totalPages > 1 && (
          <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-center">
            <AppPagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericAdminTable;
