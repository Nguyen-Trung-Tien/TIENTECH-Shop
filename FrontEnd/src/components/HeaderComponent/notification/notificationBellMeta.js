export const NOTIFICATION_FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "unread", label: "Chưa đọc" },
  { id: "order", label: "Đơn hàng" },
  { id: "promotion", label: "Ưu đãi" },
];

export const getNotificationTypeMeta = (type) => {
  switch (type) {
    case "order":
      return {
        bg: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/40",
        iconType: "order",
        badge: "Đơn hàng",
      };
    case "promotion":
      return {
        bg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40",
        iconType: "promotion",
        badge: "Ưu đãi",
      };
    case "security":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40",
        iconType: "security",
        badge: "Bảo mật",
      };
    default:
      return {
        bg: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40",
        iconType: "system",
        badge: "Hệ thống",
      };
  }
};
