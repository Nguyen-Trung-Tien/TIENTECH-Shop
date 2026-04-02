import React from "react";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import AppPagination from "../../components/Pagination/Pagination";
import { motion } from "framer-motion";

/**
 * Generic Table component for Admin Management pages
 */
const GenericAdminTable = ({
  title,
  subtitle,
  icon: Icon,
  columns,
  data,
  loading,
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
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              {Icon && <Icon />}
            </div>
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group w-64">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-11 text-sm font-bold focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
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
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className={`px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FiRefreshCw className="text-4xl text-indigo-600 animate-spin" />
                      <p className="text-slate-400 font-bold text-sm">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold">Không tìm thấy dữ liệu</p>
                  </td>
                </tr>
              ) : (
                data.map((item, rowIdx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIdx * 0.05 }}
                    key={item.id || rowIdx} 
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-8 py-5 ${col.className || ""}`}>
                        {col.render ? col.render(item) : (
                          <span className="text-sm font-bold text-slate-700">
                            {item[col.accessor]}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-8 py-5 text-right">
                      {renderActions ? renderActions(item) : (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditClick(item)}
                            className="p-2.5 text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => onDeleteClick(item)}
                            className="p-2.5 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                            title="Xóa"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-8 border-t border-slate-50 bg-slate-50/30">
            <AppPagination
              currentPage={page}
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
