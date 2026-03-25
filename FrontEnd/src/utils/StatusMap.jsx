export const statusMap = {
  pending: { label: "Chờ xử lý", variant: "warning" },
  confirmed: { label: "Đã xác nhận", variant: "info" },
  processing: { label: "Đang xử lý", variant: "primary" },
  shipped: { label: "Đang giao", variant: "primary" },
  delivered: { label: "Đã giao", variant: "success" },
  cancelled: { label: "Đã hủy", variant: "danger" },
  cancel_requested: { label: "Yêu cầu hủy", variant: "warning" },
};

export const paymentStatusMap = {
  unpaid: { label: "Chưa thanh toán", variant: "secondary" },
  paid: { label: "Đã thanh toán", variant: "success" },
  refunded: { label: "Hoàn tiền", variant: "info" },
};

export const returnStatusMap = {
  none: { label: "Không trả", variant: "secondary" },
  requested: { label: "Đã yêu cầu", variant: "warning" },
  approved: { label: "Được duyệt", variant: "success" },
  rejected: { label: "Bị từ chối", variant: "danger" },
  completed: { label: "Hoàn tất", variant: "primary" },
};
