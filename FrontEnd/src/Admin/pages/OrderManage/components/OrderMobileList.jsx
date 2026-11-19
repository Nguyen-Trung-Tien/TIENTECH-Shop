import React from "react";
import {
  Calendar,
  User,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCcw,
  Ban,
  Trash2,
} from "lucide-react";
import { statusMap } from "../../../../utils/StatusMap";
import { StatusBadge } from "../../../../utils/StatusBadge";
import { formatOrderCurrency, formatOrderDate } from "../hooks/useAdminOrders";

const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing", "shipped"];

const OrderMobileList = ({
  orders,
  loading,
  onSelectDetail,
  onOpenStatusModal,
  onOpenConfirmModal,
}) => {
  return (
    <div className="block lg:hidden divide-y divide-slate-100 dark:divide-dark-border">
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 animate-pulse space-y-3">
            <div className="h-6 bg-slate-100 dark:bg-dark-bg rounded-lg w-1/2" />
            <div className="h-10 bg-slate-100 dark:bg-dark-bg rounded-lg w-full" />
          </div>
        ))
      ) : orders.length > 0 ? (
        orders.map((order) => {
          const returnCount =
            order.orderItems?.filter((i) => i.returnStatus === "requested")
              .length || 0;
          return (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <span className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider block truncate">
                    #{order.orderCode}
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                    <Calendar className="size-3" /> {formatOrderDate(order.createdAt)}
                  </p>
                  {order.cancelReason && (
                    <p className="mt-1 text-[10px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/30 break-words [overflow-wrap:anywhere]">
                      Lý do hủy: {order.cancelReason}
                    </p>
                  )}
                  {returnCount > 0 && (
                    <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/30 flex items-center gap-1">
                      <RotateCcw className="size-2.5" /> Yêu cầu trả ({returnCount} SP)
                    </p>
                  )}
                </div>
                <StatusBadge
                  map={statusMap}
                  status={order.status}
                  className="text-[10px] px-2.5 py-1 font-bold rounded-lg shrink-0"
                />
              </div>

              <div className="bg-slate-50 dark:bg-dark-bg/60 p-3 rounded-xl flex items-center justify-between gap-2 text-xs min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="size-7 rounded-full bg-slate-200 dark:bg-dark-surface flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">
                    {order.user?.username ? (
                      order.user.username.charAt(0).toUpperCase()
                    ) : (
                      <User className="size-3" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {order.user?.username || "Ẩn danh"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {order.user?.phone || "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-rose-600">
                    {formatOrderCurrency(order.totalPrice)}
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    {order.paymentMethod || "COD"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {order.orderItems?.slice(0, 2).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-dark-bg/60 rounded-xl border border-slate-100 dark:border-dark-border min-w-0"
                  >
                    <div className="size-8 rounded-lg bg-white dark:bg-dark-surface p-0.5 border border-slate-200 dark:border-dark-border shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        SL: <span className="text-primary font-black">x{item.quantity}</span>{" "}
                        • {formatOrderCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
                {order.orderItems?.length > 2 && (
                  <p className="text-[10px] font-bold text-primary text-center pt-0.5">
                    + {order.orderItems.length - 2} sản phẩm khác
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-dark-border/60 flex-wrap">
                {order.status === "cancel_requested" && (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenConfirmModal("approve_cancel", order)}
                      className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="size-3" /> Duyệt hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenConfirmModal("reject_cancel", order)}
                      className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="size-3" /> Từ chối
                    </button>
                  </>
                )}
                {returnCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onOpenConfirmModal("process_return", order)}
                    className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="size-3" /> Duyệt trả
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectDetail(order)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="size-3" /> Chi tiết
                </button>
                <button
                  type="button"
                  onClick={() => onOpenStatusModal(order)}
                  className="px-2.5 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCcw className="size-3" /> Cập nhật TT
                </button>
                {CANCELLABLE_STATUSES.includes(order.status) && (
                  <button
                    type="button"
                    onClick={() => onOpenConfirmModal("admin_cancel", order)}
                    className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Ban className="size-3" /> Hủy đơn
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpenConfirmModal("delete", order)}
                  className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-lg text-[10px] cursor-pointer"
                  title="Xóa đơn"
                  aria-label={`Xóa đơn hàng ${order.orderCode}`}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-12 text-center text-slate-400 text-xs font-semibold">
          Không tìm thấy đơn hàng nào
        </div>
      )}
    </div>
  );
};

export default OrderMobileList;
