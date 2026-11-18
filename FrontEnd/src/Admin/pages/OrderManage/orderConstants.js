import {
  FiClock,
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";

export const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xử lý" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "processing", label: "Đang xử lý" },
  { id: "shipped", label: "Đang giao" },
  { id: "delivered", label: "Đã giao" },
  { id: "completed", label: "Hoàn tất" },
  { id: "cancel_requested", label: "Duyệt hủy đơn" },
  { id: "return_requested", label: "Duyệt trả hàng" },
  { id: "cancelled", label: "Đã hủy" },
];

export const STATUS_FLOW = [
  {
    key: "pending",
    label: "Chờ xử lý",
    icon: FiClock,
    desc: "Đơn hàng mới tạo, chờ xác nhận",
  },
  {
    key: "confirmed",
    label: "Đã xác nhận",
    icon: FiCheckCircle,
    desc: "Đã xác nhận thông tin đơn hàng",
  },
  {
    key: "processing",
    label: "Đang xử lý",
    icon: FiPackage,
    desc: "Đang đóng gói và chuẩn bị sản phẩm",
  },
  {
    key: "shipped",
    label: "Đang giao",
    icon: FiTruck,
    desc: "Đang bàn giao cho đơn vị vận chuyển",
  },
  {
    key: "delivered",
    label: "Đã giao",
    icon: FiCheckCircle,
    desc: "Khách hàng đã nhận hàng thành công",
  },
  {
    key: "completed",
    label: "Hoàn tất",
    icon: FiCheckCircle,
    desc: "Đơn hàng hoàn tất giao dịch",
  },
  {
    key: "cancelled",
    label: "Đã hủy",
    icon: FiXCircle,
    desc: "Hủy đơn hàng và hoàn stock",
  },
];

export const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
  cancel_requested: ["confirmed", "processing", "cancelled"],
};
