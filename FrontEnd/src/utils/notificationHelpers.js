/**
 * notificationHelpers.js - Tiện ích xử lý dữ liệu và trải nghiệm thông báo
 */

/**
 * Trích xuất mã voucher từ tiêu đề hoặc nội dung thông báo nếu có
 * Ví dụ: "Nhập mã TIENAI200 để nhận ưu đãi" -> "TIENAI200"
 */
export const extractVoucherCode = (text) => {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/(?:mã|code|voucher|coupon)[:\s]*([A-Z0-9_-]{4,20})/i);
  return match ? match[1].toUpperCase() : null;
};

/**
 * Trích xuất mã đơn hàng từ tiêu đề hoặc nội dung thông báo
 * Ví dụ: "Đơn hàng #ORD-9876 đang được giao" -> "ORD-9876"
 */
export const extractOrderCode = (text) => {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/(?:đơn\s*hàng\s*#?|order\s*#?)([A-Z0-9-]{4,20})/i);
  return match ? match[1] : null;
};

/**
 * Định dạng thời gian tương đối thân thiện bằng tiếng Việt
 */
export const formatRelativeTimeVi = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 45) return "Vừa xong";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 172800) return "Hôm qua";
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Phân nhóm danh sách thông báo theo mốc thời gian: Hôm nay, Hôm qua, Trước đó
 */
export const groupNotificationsByTimeline = (notifications = []) => {
  const groups = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  const now = new Date();
  const todayDate = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayDate = yesterday.toDateString();

  notifications.forEach((item) => {
    const itemDate = new Date(item.createdAt).toDateString();
    if (itemDate === todayDate) {
      groups.today.push(item);
    } else if (itemDate === yesterdayDate) {
      groups.yesterday.push(item);
    } else {
      groups.earlier.push(item);
    }
  });

  return groups;
};

