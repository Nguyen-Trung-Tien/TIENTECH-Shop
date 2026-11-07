import React, { useState } from "react";
import { FiX, FiPrinter, FiCheckCircle, FiXCircle, FiAlertCircle, FiCalendar, FiUser, FiPhone, FiMapPin, FiPackage, FiClock } from "react-icons/fi";
import { StatusBadge } from "../../../utils/StatusBadge";
import { statusMap, paymentStatusMap } from "../../../utils/StatusMap";
import { printInvoice } from "../../../pages/OrderDetail/printInvoice";
import { processReturn } from "../../../api/orderItemApi";
import { updateOrderStatus } from "../../../api/orderApi";
import { showSuccessToast, showErrorToast } from "../../../utils/toastHelper";
import UnifiedSpinner from "../../../components/Loading/UnifiedSpinner";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const AdminOrderDetailModal = ({ order, isOpen, onClose, onOrderUpdated }) => {
  const [processingAction, setProcessingAction] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!isOpen || !order) return null;

  const handleApproveCancel = async () => {
    setProcessingAction(true);
    try {
      const res = await updateOrderStatus(
        order.id,
        "cancelled",
        "Admin duyệt yêu cầu hủy đơn",
      );
      if (res?.errCode === 0) {
        showSuccessToast("Đã chấp nhận hủy đơn và hoàn tồn kho!");
        if (onOrderUpdated) onOrderUpdated();
        onClose();
      } else {
        showErrorToast(res?.errMessage, "Không thể hủy đơn hàng");
      }
    } catch (err) {
      showErrorToast(err, "Lỗi kết nối máy chủ");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectCancel = async () => {
    setProcessingAction(true);
    try {
      const res = await updateOrderStatus(
        order.id,
        "confirmed",
        rejectReason || "Admin từ chối yêu cầu hủy đơn",
      );
      if (res?.errCode === 0) {
        showSuccessToast(
          "Đã từ chối yêu cầu hủy đơn và chuyển về Đã xác nhận!",
        );
        if (onOrderUpdated) onOrderUpdated();
        onClose();
      } else {
        showErrorToast(res?.errMessage, "Lỗi khi từ chối yêu cầu");
      }
    } catch (err) {
      showErrorToast(err, "Lỗi kết nối máy chủ");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleProcessItemReturn = async (itemId, approve) => {
    setProcessingAction(true);
    try {
      const status = approve ? "completed" : "rejected";
      const res = await processReturn(itemId, status);
      if (res?.errCode === 0) {
        showSuccessToast(
          approve
            ? "Đã duyệt và nhập lại kho sản phẩm!"
            : "Đã từ chối yêu cầu trả hàng!",
        );
        if (onOrderUpdated) onOrderUpdated();
      } else {
        showErrorToast(res?.errMessage, "Lỗi khi xử lý trả hàng");
      }
    } catch (err) {
      showErrorToast(err, "Lỗi kết nối máy chủ");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleBatchReturn = async (approve) => {
    const requestedItems =
      order.orderItems?.filter((item) => item.returnStatus === "requested") || [];
    if (requestedItems.length === 0) return;

    setProcessingAction(true);
    try {
      const status = approve ? "completed" : "rejected";
      for (const item of requestedItems) {
        await processReturn(item.id, status);
      }
      showSuccessToast(
        approve
          ? `Đã duyệt trả hàng cho ${requestedItems.length} sản phẩm (Kho đã cập nhật)!`
          : `Đã từ chối yêu cầu trả hàng của ${requestedItems.length} sản phẩm!`,
      );
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      showErrorToast(err, "Lỗi kết nối máy chủ");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDirectStatusChange = async (newStatus) => {
    setProcessingAction(true);
    try {
      const res = await updateOrderStatus(
        order.id,
        newStatus,
        `Admin chuyển trạng thái sang ${newStatus}`,
      );
      if (res?.errCode === 0) {
        showSuccessToast(`Đã chuyển đơn hàng sang trạng thái "${newStatus}"!`);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        showErrorToast(res?.errMessage, "Không thể cập nhật trạng thái");
      }
    } catch (err) {
      showErrorToast(err, "Lỗi kết nối máy chủ");
    } finally {
      setProcessingAction(false);
    }
  };

  const hasReturnRequests = order.orderItems?.some(
    (item) => item.returnStatus === "requested",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/70 dark:bg-dark-bg/60 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Đơn Hàng #{order.orderCode}
              </h2>
              <StatusBadge map={statusMap} status={order.status} />
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  order.paymentStatus === "paid"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                    : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40"
                }`}
              >
                {paymentStatusMap[order.paymentStatus]?.text ||
                  order.paymentStatus}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 dark:text-dark-text-secondary mt-1 flex items-center gap-1.5">
              <FiCalendar /> Đặt lúc: {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => printInvoice(order)}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-700 dark:text-dark-text-primary hover:text-primary hover:border-primary transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              title="In phiếu xuất kho / Hóa đơn"
            >
              <FiPrinter />
              <span className="hidden sm:inline">In hóa đơn</span>
            </button>
            <button
              onClick={onClose}
              className="size-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors cursor-pointer"
              title="Đóng modal"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Cancel Requested Banner */}
          {order.status === "cancel_requested" && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
              <div className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <FiAlertCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                    Khách hàng gửi yêu cầu hủy đơn
                  </h3>
                  <p className="text-xs text-rose-600/90 dark:text-rose-300 mt-1 break-words [overflow-wrap:anywhere]">
                    <span className="font-bold">Lý do:</span>{" "}
                    {order.cancelReason || "Không nêu lý do"}
                  </p>

                  <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                    <button
                      onClick={handleApproveCancel}
                      disabled={processingAction}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {processingAction ? (
                        <UnifiedSpinner size="xs" />
                      ) : (
                        <FiCheckCircle />
                      )}
                      Duyệt Hủy Đơn (Hoàn Kho)
                    </button>
                    {!showRejectInput ? (
                      <button
                        onClick={() => setShowRejectInput(true)}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-700 dark:text-dark-text-primary text-xs font-bold hover:bg-slate-100 dark:hover:bg-dark-bg transition-all cursor-pointer"
                      >
                        Từ Chối Yêu Cầu...
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 w-full mt-2">
                        <input
                          type="text"
                          placeholder="Nhập lý do từ chối hủy..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="tt-input text-xs py-1.5 flex-1"
                        />
                        <button
                          onClick={handleRejectCancel}
                          disabled={processingAction}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors shrink-0"
                        >
                          Xác nhận
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Return Requested Banner */}
          {hasReturnRequests && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <div className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <FiAlertCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-wide">
                    Khách hàng gửi yêu cầu trả hàng
                  </h3>
                  <p className="text-xs text-amber-700/90 dark:text-amber-300 mt-1">
                    Đơn hàng có{" "}
                    <span className="font-bold">
                      {
                        order.orderItems?.filter(
                          (i) => i.returnStatus === "requested",
                        ).length
                      }
                    </span>{" "}
                    sản phẩm đang chờ duyệt trả hàng.
                  </p>
                  <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                    <button
                      onClick={() => handleBatchReturn(true)}
                      disabled={processingAction}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {processingAction ? (
                        <UnifiedSpinner size="xs" />
                      ) : (
                        <FiCheckCircle />
                      )}
                      Duyệt Tất Cả Trả Hàng (Nhập Kho)
                    </button>
                    <button
                      onClick={() => handleBatchReturn(false)}
                      disabled={processingAction}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {processingAction ? (
                        <UnifiedSpinner size="xs" />
                      ) : (
                        <FiXCircle />
                      )}
                      Từ Chối Tất Cả
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer & Delivery Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-dark-bg/40 border border-slate-100 dark:border-dark-border space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary flex items-center gap-2">
                <FiUser className="text-primary" /> Thông tin khách hàng
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-dark-text-primary">
                <p className="font-bold text-slate-900 dark:text-white">
                  {order.receiverName ||
                    order.user?.username ||
                    "Khách vãng lai"}
                </p>
                <p className="flex items-center gap-1.5 text-slate-500 dark:text-dark-text-secondary">
                  <FiPhone size={13} />{" "}
                  {order.receiverPhone || order.shippingPhone || "Chưa có SĐT"}
                </p>
                <p className="text-slate-500 dark:text-dark-text-secondary">
                  Email: {order.user?.email || "N/A"}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-dark-bg/40 border border-slate-100 dark:border-dark-border space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary flex items-center gap-2">
                <FiMapPin className="text-primary" /> Địa chỉ giao hàng
              </h4>
              <p className="text-xs text-slate-700 dark:text-dark-text-primary font-medium leading-relaxed break-words [overflow-wrap:anywhere]">
                {order.shippingAddress || "Chưa cập nhật địa chỉ"}
              </p>
              {order.note && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                  <span className="font-bold">Ghi chú:</span> {order.note}
                </p>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary flex items-center gap-2">
              <FiPackage className="text-primary" /> Danh sách sản phẩm (
              {order.orderItems?.length || 0})
            </h4>

            <div className="border border-slate-100 dark:border-dark-border rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-dark-border">
              {order.orderItems?.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/50 dark:hover:bg-dark-bg/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-14 rounded-xl bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border p-1 shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-dark-text-secondary mt-0.5">
                        {item.variantName
                          ? `Phân loại: ${item.variantName} • `
                          : ""}
                        Đơn giá: {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-17 sm:pl-0">
                    <span className="text-xs font-bold text-slate-600 dark:text-dark-text-secondary">
                      SL:{" "}
                      <span className="text-primary font-black">
                        x{item.quantity}
                      </span>
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white min-w-[90px] text-right">
                      {formatCurrency(
                        item.subtotal || item.price * item.quantity,
                      )}
                    </span>
                  </div>

                  {/* Return Request inline action */}
                  {item.returnStatus === "requested" && (
                    <div className="w-full sm:w-auto p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          Yêu cầu trả hàng:
                        </span>
                        <p className="text-[11px] text-amber-600 truncate">
                          {item.returnReason || "Không nêu lý do"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleProcessItemReturn(item.id, true)}
                          disabled={processingAction}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() =>
                            handleProcessItemReturn(item.id, false)
                          }
                          disabled={processingAction}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-dark-bg/40 border border-slate-100 dark:border-dark-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-xs text-slate-500 dark:text-dark-text-secondary space-y-1">
              <p>
                <span className="font-bold text-slate-700 dark:text-dark-text-primary">
                  Phương thức:
                </span>{" "}
                <span className="uppercase font-black">
                  {order.paymentMethod || "COD"}
                </span>
              </p>
              {order.voucherCode && (
                <p>
                  <span className="font-bold text-slate-700 dark:text-dark-text-primary">
                    Mã giảm giá:
                  </span>{" "}
                  <span className="text-primary font-bold">
                    {order.voucherCode}
                  </span>
                </p>
              )}
            </div>

            <div className="text-right self-end sm:self-auto space-y-1">
              <p className="text-xs text-slate-400 dark:text-dark-text-secondary font-medium uppercase">
                Tổng thanh toán
              </p>
              <p className="text-xl sm:text-2xl font-black text-primary">
                {formatCurrency(order.totalPrice)}
              </p>
            </div>
          </div>

          {/* Quick Status Workflow Progression */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-dark-border space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary">
              Chuyển nhanh trạng thái xử lý
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "completed",
              ].map((st) => (
                <button
                  key={st}
                  onClick={() => handleDirectStatusChange(st)}
                  disabled={processingAction || order.status === st}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    order.status === st
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary hover:border-primary hover:text-primary"
                  } disabled:opacity-50`}
                >
                  {st === "confirmed" && "Xác nhận"}
                  {st === "processing" && "Đóng gói / Xử lý"}
                  {st === "shipped" && "Bàn giao vận chuyển"}
                  {st === "delivered" && "Đã giao hàng"}
                  {st === "completed" && "Hoàn tất"}
                </button>
              ))}
            </div>
          </div>

          {/* Audit History Timeline */}
          {Array.isArray(order.confirmationHistory) &&
            order.confirmationHistory.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-dark-bg/40 border border-slate-100 dark:border-dark-border space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-dark-text-secondary flex items-center gap-2">
                  <FiClock className="text-primary" /> Nhật ký lịch sử đơn hàng
                </h4>
                <div className="space-y-2.5 pl-2 border-l-2 border-slate-200 dark:border-dark-border ml-1">
                  {order.confirmationHistory.map((hist, idx) => (
                    <div key={idx} className="relative pl-4 text-xs">
                      <span className="absolute -left-[21px] top-1 size-2 rounded-full bg-primary ring-4 ring-white dark:ring-dark-surface" />
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {hist.status || hist.action || "Cập nhật trạng thái"}
                        {hist.reason ? ` - ${hist.reason}` : ""}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {hist.time
                          ? formatDate(hist.time)
                          : hist.by
                            ? `Bởi: ${hist.by}`
                            : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 sm:px-8 sm:py-4 border-t border-slate-100 dark:border-dark-border flex justify-end bg-slate-50/50 dark:bg-dark-bg/40 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-dark-card border border-transparent dark:border-dark-border text-slate-700 dark:text-dark-text-primary text-xs font-bold hover:bg-slate-300 dark:hover:bg-dark-surface transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailModal;
