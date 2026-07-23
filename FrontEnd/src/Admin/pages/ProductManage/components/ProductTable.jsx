import React from "react";
import { FiEdit2, FiTrash2, FiSearch, FiCpu, FiTag, FiZap, FiLayers } from "react-icons/fi";
import { AdminTableSkeleton } from "../../../components/AdminLoading";

const ProductTable = ({
  products = [],
  loadingTable,
  limit,
  handleShowModal,
  setConfirmModal,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-dark-bg/40 border-b border-slate-200/80 dark:border-dark-border">
            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
              Sản phẩm
            </th>
            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
              Phân loại
            </th>
            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary text-right">
              Giá bán
            </th>
            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary text-center">
              Tồn kho
            </th>
            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary text-center">
              Trạng thái
            </th>
            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary text-right">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
          {loadingTable ? (
            <tr>
              <td colSpan={6} className="px-6 py-8">
                <AdminTableSkeleton rows={limit} cols={6} />
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center">
                <div className="max-w-xs mx-auto space-y-3">
                  <div className="size-14 bg-slate-100 dark:bg-dark-bg rounded-full flex items-center justify-center text-slate-400 dark:text-dark-text-secondary mx-auto">
                    <FiSearch size={28} />
                  </div>
                  <p className="text-slate-900 dark:text-dark-text-primary font-bold text-sm">
                    Không tìm thấy sản phẩm phù hợp
                  </p>
                  <p className="text-xs text-slate-400 dark:text-dark-text-secondary">
                    Thử thay đổi bộ lọc hoặc nhập từ khóa tìm kiếm khác.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50/60 dark:hover:bg-dark-bg/30 transition-all group"
              >
                {/* Product Info & Thumbnail */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg p-1.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                      <img
                        src={p.image}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate max-w-[220px]">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-mono text-slate-400 dark:text-dark-text-secondary">
                          SKU: {p.sku || "—"}
                        </p>
                        {p.embedding && (
                          <span
                            className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-tighter flex items-center gap-0.5"
                            title="Đã đồng bộ Vector AI"
                          >
                            <FiCpu size={8} /> AI READY
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category & Brand */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-dark-text-secondary">
                      <FiTag className="text-indigo-400" /> {p.brand?.name || "—"}
                    </div>
                    <div className="px-2 py-0.5 bg-slate-100 dark:bg-dark-bg text-[9px] font-black uppercase text-slate-500 dark:text-dark-text-secondary rounded w-fit">
                      {p.category?.name || "—"}
                    </div>
                  </div>
                </td>

                {/* Pricing & Discounts */}
                <td className="px-6 py-4 text-right">
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    {Number(p.basePrice || p.price || 0).toLocaleString()} đ
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    {p.discount > 0 && (
                      <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[9px] font-black rounded">
                        -{p.discount}%
                      </span>
                    )}
                    {p.isFlashSale && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] font-black rounded uppercase animate-pulse">
                        <FiZap size={9} /> FS
                      </span>
                    )}
                  </div>
                </td>

                {/* Stock Level */}
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-xl border text-xs font-black ${
                        (p.totalStock ?? p.stock ?? 0) <= 5
                          ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 text-rose-600 dark:text-rose-400"
                          : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {p.totalStock ?? p.stock ?? 0}
                    </div>
                    <span className="text-[9px] font-bold uppercase text-slate-400">
                      Đã bán: {p.sold || 0}
                    </span>
                  </div>
                </td>

                {/* Business Status & Has Variants indicator */}
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        p.isActive
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {p.isActive ? "Đang bán" : "Tạm ẩn"}
                    </span>
                    {p.hasVariants && (
                      <span className="text-[8px] font-black text-indigo-500 uppercase flex items-center gap-0.5">
                        <FiLayers size={8} /> Biến thể
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleShowModal(p)}
                      className="size-9 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center cursor-pointer"
                      title="Chỉnh sửa sản phẩm"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmModal({
                          show: true,
                          productId: p.id,
                          name: p.name,
                        })
                      }
                      className="size-9 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center cursor-pointer"
                      title="Xóa sản phẩm"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
