import React from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiRefreshCcw, FiRotateCcw } from "react-icons/fi";
import { StatusBadge } from "../../../utils/StatusBadge";
import { returnStatusMap } from "../../../utils/StatusMap";
import { formatCurrency } from "../../../utils/format";

const isWithin12Hours = (dateString) => {
  if (!dateString) return false;
  const requestedAt = new Date(dateString);
  const now = new Date();
  const diffHours = (now - requestedAt) / (1000 * 60 * 60);
  return diffHours <= 12;
};

const OrderItemsList = ({ order, onOpenReturnModal, onCancelReturn }) => {
  if (!order || !order.orderItems) return null;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-[32px] border border-surface-200 dark:border-dark-border shadow-sm overflow-hidden print:border print:shadow-none print:avoid-break">
      <div className="p-8 border-b border-surface-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/50 flex items-center gap-3">
        <FiPackage className="text-primary" size={20} />
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
          Danh mục sản phẩm
        </h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-dark-border">
        {order.orderItems.map((item) => (
          <div
            key={item.id}
            className="p-8 flex flex-col gap-6 group hover:bg-slate-50/50 dark:hover:bg-dark-bg/20 transition-all"
          >
            <div className="flex gap-6">
              <div className="size-24 rounded-2xl bg-white dark:bg-dark-bg border border-slate-100 dark:border-dark-border p-2 flex-shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={item.image}
                  alt=""
                  className="w-full h-full object-contain dark:mix-blend-normal"
                />
              </div>
              <div className="flex-grow min-w-0">
                <Link
                  to={`/product-detail/${item.product?.slug}`}
                  className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-1 mb-1"
                >
                  {item.productName}
                </Link>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-dark-text-secondary font-medium mb-3">
                  <span>Số lượng: {item.quantity}</span>
                  <span>•</span>
                  <span>Đơn giá: {formatCurrency(item.price)}</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <StatusBadge
                    map={returnStatusMap}
                    status={item.returnStatus}
                  />
                  {["delivered", "completed"].includes(order.status) &&
                    (!item.returnStatus || item.returnStatus === "none") && (
                      <button
                        onClick={() => onOpenReturnModal(item.id)}
                        className="text-[10px] font-black uppercase tracking-widest text-warning hover:underline"
                      >
                        Yêu cầu trả hàng
                      </button>
                    )}
                  {item.returnStatus === "requested" &&
                    isWithin12Hours(item.returnRequestedAt) && (
                      <button
                        onClick={() => onCancelReturn(item.id)}
                        className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <FiRefreshCcw size={10} /> Thu hồi yêu cầu
                      </button>
                    )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>

            {/* Return Reason for item */}
            {item.returnStatus !== "none" && item.returnReason && (
              <div className="mt-2 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
                <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <FiRotateCcw size={12} /> Lý do trả hàng
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium italic">
                  "{item.returnReason}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItemsList;
