const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");
const OrderService = require("../services/OrderService");

/**
 * Tự động hủy các đơn hàng chưa thanh toán (unpaid) sau một khoảng thời gian (VD: 30 phút)
 * để giải phóng tồn kho.
 */
const initOrderCron = () => {
  // Chạy mỗi 10 phút
  cron.schedule("*/10 * * * *", async () => {
    console.log("[Cron] Checking for expired unpaid orders...");
    try {
      const expirationTime = new Date(Date.now() - 30 * 60 * 1000); // 30 phút trước

      const expiredOrders = await db.Order.findAll({
        where: {
          status: "pending",
          paymentStatus: "unpaid",
          createdAt: { [Op.lt]: expirationTime },
        },
      });

      if (expiredOrders.length > 0) {
        console.log(`[Cron] Found ${expiredOrders.length} expired orders. Cancelling...`);
        for (const order of expiredOrders) {
          await OrderService.updateOrderStatus(
            order.id,
            "cancelled",
            null, // Không có user (system thực hiện)
            "Hệ thống tự động hủy do quá thời hạn thanh toán."
          );
          console.log(`[Cron] Cancelled order ID: ${order.id}`);
        }
      }
    } catch (error) {
      console.error("[Cron] Error in unpaid order cleanup job:", error);
    }
  });
};

module.exports = { initOrderCron };
