import React from "react";
import {
  Calendar,
  User,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Eye,
  RefreshCcw,
  Ban,
  Trash2,
} from "lucide-react";
import { statusMap } from "../../../../utils/StatusMap";
import { StatusBadge } from "../../../../utils/StatusBadge";
import OrderItemsPreview from "./OrderItemsPreview";
import { formatOrderCurrency, formatOrderDate } from "../hooks/useAdminOrders";

const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing", "shipped"];

const OrderDesktopTable = ({
  orders,
  loading,
  loadingId,
  onSelectDetail,
  onOpenStatusModal,
  onOpenConfirmModal,
}) => {
  return (
    <div className="hidden lg:block overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-dark-bg/60 border-b border-slate-100 dark:border-dark-border text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
            <th className="px-5 py-4">Mã đơn &amp; Ngày tạo</th>
            <th className="px-5 py-4">Khách hàng</th>
            <th className="px-5 py-4">Sản phẩm</th>
            <th className="px-5 py-4 text-right">Tổng tiền &amp; PTTT</th>
            <th className="px-5 py-4 text-center">Trạng thái</th>
            <th className="px-5 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-dark-border/60 text-xs">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan="6" className="px-5 py-6 animate-pulse">
                  <div className="h-10 bg-slate-100 dark:bg-dark-bg rounded-xl w-full" />
                </td>
              </tr>
            ))
          ) : orders.length > 0 ? (
            orders.map((order) => {
              const returnCount =
                order.orderItems?.filter((i) => i.returnStatus === "requested")
                  .length || 0;
              return (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-dark-bg/40 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => onSelectDetail(order)}
                        className="text-left font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs hover:text-primary transition-colors cursor-pointer"
                      >
                        #{order.orderCode}
                      </button>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-dark-text-secondary mt-0.5 flex items-center gap-1">
                        <Calendar className="size-3 text-slate-400" />
                        {formatOrderDate(order.createdAt)}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-slate-100 dark:bg-dark-bg flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                        {order.user?.username ? (
                          order.user.username.charAt(0).toUpperCase()
                        ) : (
                          <User className="size-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                          {order.user?.username || "Ẩn danh"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {order.user?.phone || "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <OrderItemsPreview
                      items={order.orderItems}
                      formatCurrency={formatOrderCurrency}
                    />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <p className="font-black text-rose-600 dark:text-rose-400">
                      {formatOrderCurrency(order.totalPrice)}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 dark:bg-dark-bg px-1.5 py-0.5 rounded">
                        {order.paymentMethod || "COD"}
                      </span>
                      {order.paymentStatus === "paid" && (
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="size-2.5" /> Đã TT
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <StatusBadge
                        map={statusMap}
                        status={order.status}
                        className="text-[10px] px-3 py-1 font-bold rounded-lg"
                      />
                      {order.cancelReason && (
                        <span
                          className="text-[9px] text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded truncate max-w-[120px]"
                          title={order.cancelReason}
                        >
                          Lý do: {order.cancelReason}
                        </span>
                      )}
                      {returnCount > 0 && (
                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/40 flex items-center gap-1">
                          <RotateCcw className="size-2.5" /> Y/c trả ({returnCount})
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {order.status === "cancel_requested" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenConfirmModal("approve_cancel", order)}
                            title="Duyệt yêu cầu hủy đơn (Hoàn tồn kho)"
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-[11px] font-black flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-900/30 shadow-2xs"
                          >
                            <CheckCircle2 className="size-3.5" /> Duyệt hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenConfirmModal("reject_cancel", order)}
                            title="Từ chối yêu cầu hủy đơn"
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-[11px] font-black flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/30 shadow-2xs"
                          >
                            <XCircle className="size-3.5" /> Từ chối
                          </button>
                        </>
                      )}

                      {returnCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onOpenConfirmModal("process_return", order)}
                          title="Xử lý yêu cầu trả hàng từ khách"
                          className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white transition-all text-[11px] font-black flex items-center gap-1 cursor-pointer border border-amber-200 dark:border-amber-900/30 shadow-2xs"
                        >
                          <RotateCcw className="size-3.5" /> Duyệt trả
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectDetail(order)}
                        title="Chi tiết đơn hàng"
                        aria-label={`Xem chi tiết đơn hàng ${order.orderCode}`}
                        className="size-8 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary hover:bg-primary hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenStatusModal(order)}
                        title="Cập nhật trạng thái"
                        aria-label={`Cập nhật trạng thái đơn hàng ${order.orderCode}`}
                        className="size-8 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary hover:bg-primary hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      >
                        <RefreshCcw
                          className={`size-3.5 ${loadingId === order.id ? "animate-spin" : ""}`}
                        />
                      </button>

                      {CANCELLABLE_STATUSES.includes(order.status) && (
                        <button
                          type="button"
                          onClick={() => onOpenConfirmModal("admin_cancel", order)}
                          title="Admin hủy đơn hàng"
                          aria-label={`Hủy đơn hàng ${order.orderCode}`}
                          className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Ban className="size-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenConfirmModal("delete", order)}
                        title="Xóa đơn hàng"
                        aria-label={`Xóa đơn hàng ${order.orderCode}`}
                        className="size-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="6"
                className="px-5 py-20 text-center text-slate-400 font-semibold"
              >
                Không tìm thấy đơn hàng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDesktopTable;
