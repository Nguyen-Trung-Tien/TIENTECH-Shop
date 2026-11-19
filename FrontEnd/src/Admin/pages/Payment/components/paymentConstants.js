import { showInfoToast } from "../../../../utils/toastHelper";

export const STATUS_LABELS = {
  pending: {
    text: "Chờ xử lý",
    class:
      "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
  },
  completed: {
    text: "Đã thanh toán",
    class:
      "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
  },
  failed: {
    text: "Thất bại",
    class:
      "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30",
  },
  refunded: {
    text: "Đã hoàn tiền",
    class:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-dark-card dark:text-dark-text-secondary dark:border-dark-border",
  },
};

export const METHOD_BADGE = {
  vnpay:
    "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30",
  momo: "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-900/30",
  cod: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30",
  paypal:
    "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-900/30",
  bank: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30",
};

export const formatPaymentTxnCode = (payment) =>
  payment.transactionId ||
  (payment.order?.orderCode
    ? `DH${payment.order.orderCode.replace(/^#?ORD/i, "")}`
    : payment.orderId
      ? `DH${payment.orderId}`
      : `TXN${payment.id}`);

export const exportPaymentsCsv = (payments) => {
  if (!payments || payments.length === 0) {
    showInfoToast("Không có dữ liệu để xuất");
    return;
  }
  const headers = [
    "Mã Đơn",
    "Mã Giao Dịch",
    "Ngày",
    "Khách Hàng",
    "Email",
    "Số Tiền (VND)",
    "Phương Thức",
    "Trạng Thái",
  ];
  const csvRows = payments.map((p) => [
    p.order?.orderCode || p.id,
    p.transactionId || "N/A",
    new Date(p.createdAt).toLocaleDateString("vi-VN"),
    `"${p.user?.username || "Ẩn danh"}"`,
    `"${p.user?.email || ""}"`,
    p.amount,
    p.method,
    p.status,
  ]);
  const csvContent = [
    headers.join(","),
    ...csvRows.map((e) => e.join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `payments_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
