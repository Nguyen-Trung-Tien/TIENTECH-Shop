export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
};

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  REFUNDED: "refunded",
};

export const orderStatusMap = {
  [ORDER_STATUS.PENDING]: { label: "Chờ xác nhận", variant: "warning" },
  [ORDER_STATUS.CONFIRMED]: { label: "Đã xác nhận", variant: "info" },
  [ORDER_STATUS.SHIPPING]: { label: "Đang giao hàng", variant: "primary" },
  [ORDER_STATUS.DELIVERED]: { label: "Đã giao hàng", variant: "success" },
  [ORDER_STATUS.CANCELLED]: { label: "Đã hủy", variant: "danger" },
  [ORDER_STATUS.RETURNED]: { label: "Trả hàng", variant: "secondary" },
};

export const paymentStatusMap = {
  [PAYMENT_STATUS.UNPAID]: { label: "Chưa thanh toán", variant: "danger" },
  [PAYMENT_STATUS.PAID]: { label: "Đã thanh toán", variant: "success" },
  [PAYMENT_STATUS.REFUNDED]: { label: "Đã hoàn tiền", variant: "info" },
};
