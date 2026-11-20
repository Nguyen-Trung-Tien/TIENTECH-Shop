import React from "react";
import {
  Calendar,
  User,
  Info,
  CheckCircle2,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import {
  STATUS_LABELS,
  METHOD_BADGE,
  formatPaymentTxnCode,
} from "./paymentConstants";
import { Badge, EmptyState } from "../../../../components/UI";
import UnifiedSpinner from "../../../../components/Loading/UnifiedSpinner";

const PaymentTable = ({
  payments,
  loading,
  onSelectPayment,
  onCompletePayment,
  onRefundPayment,
  onDeletePayment,
}) => {
  const getBadgeVariant = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      case "refunded":
        return "neutral";
      default:
        return "secondary";
    }
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[720px] md:min-w-full">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-dark-bg/50 border-b border-slate-100 dark:border-dark-border">
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary">
              Giao dịch
            </th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary">
              Mã GD
            </th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary">
              Khách hàng
            </th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary text-right">
              Số tiền
            </th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary text-center">
              Phương thức
            </th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary text-center">
              Trạng thái
            </th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-secondary text-center print:hidden">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
          {loading ? (
            <tr>
              <td colSpan="7" className="px-6 py-24 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <UnifiedSpinner size="lg" variant="primary" />
                  <p className="text-xs font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider">
                    Đang tải dữ liệu giao dịch...
                  </p>
                </div>
              </td>
            </tr>
          ) : payments.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-16 text-center">
                <EmptyState
                  title="Không tìm thấy giao dịch"
                  description="Không có giao dịch thanh toán nào phù hợp với bộ lọc hiện tại."
                  size="sm"
                />
              </td>
            </tr>
          ) : (
            payments.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50/50 dark:hover:bg-dark-bg/50 transition-colors group"
              >
                <td className="px-6 py-5">
                  <p className="text-xs font-black text-slate-900 dark:text-dark-text-primary mb-1 uppercase tracking-wider">
                    #{p.order?.orderCode || p.id}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                    <Calendar className="size-3" />
                    {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg inline-block">
                    {formatPaymentTxnCode(p)}
                  </p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 bg-slate-100 dark:bg-dark-bg rounded-xl flex items-center justify-center text-slate-400 dark:text-dark-text-secondary shrink-0">
                      <User className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-dark-text-primary leading-none mb-1 truncate">
                        {p.user?.username || "Ẩn danh"}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-dark-text-secondary truncate">
                        {p.user?.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {Number(p.amount).toLocaleString("vi-VN")} ₫
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <span
                    className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      METHOD_BADGE[p.method] ||
                      "bg-slate-100 dark:bg-dark-card dark:text-dark-text-secondary"
                    }`}
                  >
                    {p.method}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <Badge
                    variant={getBadgeVariant(p.status)}
                    size="sm"
                    className="font-black uppercase tracking-wider"
                  >
                    {STATUS_LABELS[p.status]?.text || p.status}
                  </Badge>
                  {p.status === "refunded" && (p.refundNote || p.note) && (
                    <p
                      className="text-[10px] text-rose-500 font-medium italic mt-1 max-w-[150px] truncate mx-auto"
                      title={p.refundNote || p.note}
                    >
                      &ldquo;{p.refundNote || p.note}&rdquo;
                    </p>
                  )}
                </td>
                <td className="px-6 py-5 print:hidden">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPayment(p)}
                      aria-label="Xem biên lai giao dịch"
                      className="size-10 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all shadow-sm cursor-pointer active:scale-95"
                    >
                      <Info className="size-4" />
                    </button>

                    {p.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => onCompletePayment(p.id)}
                        aria-label="Xác nhận hoàn tất thanh toán"
                        className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 dark:border-emerald-900/30 cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 className="size-4" />
                      </button>
                    )}

                    {p.status === "completed" && (
                      <button
                        type="button"
                        onClick={() => onRefundPayment(p.id)}
                        aria-label="Hoàn tiền giao dịch"
                        className="size-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100 dark:border-amber-900/30 cursor-pointer active:scale-95"
                      >
                        <ArrowLeft className="size-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeletePayment(p.id)}
                      aria-label="Xóa giao dịch"
                      className="size-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100 dark:border-rose-900/30 cursor-pointer active:scale-95"
                    >
                      <Trash2 className="size-4" />
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

export default PaymentTable;
