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
  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Action Loader Overlay */}
      {actionLoading && <AdminActionLoader message={actionMessage} />}

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              {Icon && <Icon />}
            </div>
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-500 dark:text-dark-text-secondary font-bold text-xs uppercase tracking-widest mt-2 ml-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group w-64">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-text-secondary group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full h-12 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl pl-11 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button
            onClick={onAddClick}
            className="btn-modern-primary group h-12 px-6 flex items-center gap-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            <FiPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
            <span>{addLabel}</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white dark:bg-dark-surface rounded-[40px] border border-slate-100 dark:border-dark-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-dark-bg/50 border-b border-slate-100 dark:border-dark-border">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-8 py-8"
                  >
                    <AdminTableSkeleton rows={8} cols={columns.length + 1} />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-8 py-20 text-center"
                  >
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-dark-bg rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-4">
                        <FiSearch size={32} />
                      </div>
                      <p className="text-slate-900 dark:text-white font-bold">Không tìm thấy dữ liệu</p>
                      <p className="text-xs text-slate-400 dark:text-dark-text-secondary mt-1">Vui lòng điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, rowIdx) => (
                  <Motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIdx * 0.03 }}
                    key={item.id || rowIdx}
                    className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-colors group"
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`px-8 py-5 ${col.className || ""}`}
                      >
                        {col.render ? (
                          col.render(item)
                        ) : (
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {item[col.accessor]}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-8 py-5 text-right">
                      {renderActions ? (
                        renderActions(item)
                      ) : (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditClick(item)}
                            className="p-2.5 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-xl hover:shadow-lg transition-all"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => onDeleteClick(item)}
                            className="p-2.5 text-rose-600 dark:text-rose-400 bg-white dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-xl hover:shadow-lg transition-all"
                            title="Xóa"
                          >
                            <FiTrash2 />
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
          <div className="p-8 border-t border-slate-50 dark:border-dark-border bg-slate-50/20 dark:bg-dark-bg/20">
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
