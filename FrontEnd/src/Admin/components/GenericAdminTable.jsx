import React from "react";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
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
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <div className="size-10 sm:size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              {Icon && <Icon />}
            </div>
            <span className="truncate">{title}</span>
          </h1>
          {subtitle && (
            <p className="text-slate-500 dark:text-dark-text-secondary font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-1 sm:mt-1.5 ml-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="relative group w-full sm:w-64 md:w-80 transition-all duration-300">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-text-secondary group-focus-within:text-primary transition-colors text-base" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full min-h-[44px] bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border/60 rounded-2xl pl-11 pr-10 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
              value={searchTerm || ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 size-7 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Xóa ô tìm kiếm"
              >
                <FiX size={13} />
              </button>
            )}
          </div>

          <button
            onClick={onAddClick}
            className="btn-modern-primary group min-h-[44px] px-5 flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0 text-sm font-bold"
          >
            <FiPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
            <span>{addLabel}</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl sm:rounded-[40px] border border-slate-100 dark:border-dark-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar touch-pan-x">
          <table className="w-full text-left border-collapse min-w-[550px] md:min-w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-dark-bg/50 border-b border-slate-100 dark:border-dark-border">
                {safeColumns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-3 py-3 md:px-8 md:py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="px-3 py-3 md:px-8 md:py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={safeColumns.length + 1}
                    className="px-3 py-8 md:px-8"
                  >
                    <AdminTableSkeleton rows={8} cols={safeColumns.length + 1} />
                  </td>
                </tr>
              ) : safeData.length === 0 ? (
                <tr>
                  <td
                    colSpan={safeColumns.length + 1}
                    className="px-3 py-16 md:px-8 text-center"
                  >
                    <div className="max-w-xs mx-auto">
                      <div className="size-16 bg-slate-50 dark:bg-dark-bg rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-4">
                        <FiSearch size={32} />
                      </div>
                      <p className="text-slate-900 dark:text-white font-bold">Không tìm thấy dữ liệu</p>
                      <p className="text-xs text-slate-400 dark:text-dark-text-secondary mt-1">Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                safeData.map((item, rowIdx) => (
                  <Motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIdx * 0.03 }}
                    key={item.id || rowIdx}
                    className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors group"
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`px-3 py-3 md:px-8 md:py-5 ${col.className || ""}`}
                      >
                        {col.render ? (
                          col.render(item)
                        ) : (
                          <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                            {item[col.accessor]}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-3 md:px-8 md:py-5 text-right">
                      {renderActions ? (
                        renderActions(item)
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditClick(item)}
                            className="size-9 sm:size-10 text-primary dark:text-primary-light bg-slate-50 dark:bg-dark-bg border border-slate-200/60 dark:border-dark-border/40 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all cursor-pointer flex items-center justify-center active:scale-95"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            onClick={() => onDeleteClick(item)}
                            className="size-9 sm:size-10 text-rose-600 dark:text-rose-400 bg-slate-50 dark:bg-dark-bg border border-slate-200/60 dark:border-dark-border/40 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all cursor-pointer flex items-center justify-center active:scale-95"
                            title="Xóa"
                          >
                            <FiTrash2 size={15} />
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
          <div className="p-4 sm:p-8 border-t border-slate-50 dark:border-dark-border bg-slate-50/20 dark:bg-dark-bg/20 flex justify-center">
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
