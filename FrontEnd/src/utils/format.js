/**
 * Định dạng số thành tiền tệ Việt Nam (VNĐ)
 * @param {number|string} amount 
 * @returns {string} 
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "0 ₫";
  return Number(amount).toLocaleString("vi-VN") + " ₫";
};

/**
 * Định dạng ngày tháng
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
