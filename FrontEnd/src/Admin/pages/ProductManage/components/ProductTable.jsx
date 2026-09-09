import React from "react";
import {
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCpu,
  FiTag,
  FiZap,
  FiLayers,
} from "react-icons/fi";
import { AdminTableSkeleton } from "../../../components/AdminLoading";

const ProductTable = ({
  products = [],
  loadingTable,
  limit,
  handleShowModal,
  setConfirmModal,
}) => {
  return (
    <div className="w-full">
      {/* ================= DESKTOP & TABLET TABLE VIEW (sm and up) ================= */}
      <div className="hidden sm:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-dark-bg/40 border-b border-slate-200/80 dark:border-dark-border">
              <th className="px-3 sm:px-4 md:px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
                Sản phẩm
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
                Phân loại
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary text-right">
                Giá bán
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary text-center">
                Tồn kho
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary text-center">
                Trạng thái
              </th>
              <th className="sticky right-0 bg-slate-50/95 dark:bg-dark-bg/95 backdrop-blur-xs px-3 sm:px-4 md:px-6 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary text-right border-l border-slate-200/50 dark:border-dark-border/50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10">
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
                  <td className="px-3 sm:px-4 md:px-6 py-3.5">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="size-12 sm:size-14 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg p-1.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                        <img
                          src={p.image}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate max-w-[160px] sm:max-w-[220px]">
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
                  <td className="px-3 sm:px-4 md:px-6 py-3.5">
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
                  <td className="px-3 sm:px-4 md:px-6 py-3.5 text-right">
                    <p className="text-xs font-black text-slate-900 dark:text-white whitespace-nowrap">
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
                  <td className="px-3 sm:px-4 md:px-6 py-3.5 text-center">
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
                  <td className="px-3 sm:px-4 md:px-6 py-3.5 text-center">
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

                  {/* Actions (Sticky Right Column) */}
                  <td className="sticky right-0 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xs group-hover:bg-slate-50/95 dark:group-hover:bg-dark-bg/95 px-3 sm:px-4 md:px-6 py-3.5 text-right border-l border-slate-100 dark:border-dark-border/50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleShowModal(p)}
                        className="size-9 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                        title="Chỉnh sửa sản phẩm"
                        aria-label="Chỉnh sửa sản phẩm"
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
                        className="size-9 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                        title="Xóa sản phẩm"
                        aria-label="Xóa sản phẩm"
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

      {/* ================= MOBILE CARDS VIEW (under sm) ================= */}
      <div className="block sm:hidden divide-y divide-slate-100 dark:divide-dark-border">
        {loadingTable ? (
          Array(Math.min(limit || 4, 4))
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-3.5 animate-pulse space-y-3">
                <div className="flex gap-3">
                  <div className="size-16 bg-slate-100 dark:bg-dark-bg rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-4 bg-slate-100 dark:bg-dark-bg rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-dark-bg rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-50 dark:bg-dark-bg rounded-xl" />
              </div>
            ))
        ) : products.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="size-12 bg-slate-100 dark:bg-dark-bg rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <FiSearch size={22} />
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-xs">
              Không tìm thấy sản phẩm phù hợp
            </p>
            <p className="text-[11px] text-slate-400">
              Thử thay đổi bộ lọc hoặc nhập từ khóa tìm kiếm khác.
            </p>
          </div>
        ) : (
          products.map((p) => {
            const currentStock = p.totalStock ?? p.stock ?? 0;
            return (
              <div
                key={p.id}
                className="p-3.5 space-y-3 bg-white dark:bg-dark-surface"
              >
                {/* Header: Thumbnail + Name + Category */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-14 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg p-1 shrink-0 overflow-hidden shadow-2xs">
                    <img
                      src={p.image}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate line-clamp-2 leading-snug">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400">
                        SKU: {p.sku || "—"}
                      </span>
                      {p.brand?.name && (
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded truncate max-w-[90px]">
                          {p.brand.name}
                        </span>
                      )}
                      {p.hasVariants && (
                        <span className="text-[8px] font-black text-indigo-500 uppercase flex items-center gap-0.5">
                          <FiLayers size={8} /> Biến thể
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price, Stock & Status Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-dark-bg/60 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      Giá bán
                    </p>
                    <p className="font-black text-slate-900 dark:text-white mt-0.5 whitespace-nowrap">
                      {Number(p.basePrice || p.price || 0).toLocaleString()} đ
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {p.discount > 0 && (
                        <span className="text-[9px] font-black text-rose-500">
                          -{p.discount}%
                        </span>
                      )}
                      {p.isFlashSale && (
                        <span className="text-[8px] font-black text-orange-500 flex items-center gap-0.5">
                          <FiZap size={8} /> FlashSale
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      Tồn kho / Trạng thái
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          currentStock <= 5
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        }`}
                      >
                        Kho: {currentStock}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {p.isActive ? "Bán" : "Ẩn"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => handleShowModal(p)}
                    className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                  >
                    <FiEdit2 size={13} /> Chỉnh sửa
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
                    className="size-9 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
                    title="Xóa sản phẩm"
                    aria-label="Xóa sản phẩm"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductTable;
