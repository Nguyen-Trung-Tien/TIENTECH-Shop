export const QUICK_ACTIONS = [
  "⚡ Tìm laptop đồ họa",
  "🔥 Điện thoại giảm giá sâu",
  "📦 Tra cứu đơn hàng",
  "🛡️ Chính sách bảo hành",
];

export const formatChatTime = (date) => {
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};
