const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");
const OrderService = require("../services/order/OrderService");
const { acquireCronLock, releaseLock } = require("../config/redis");

/**
 * Tự động hủy các đơn hàng chưa thanh toán (unpaid) sau một khoảng thời gian (30 phút)
 * để giải phóng tồn kho. Có distributed lock chống chạy trùng giữa các instance.
 */
const initOrderCron = () => {
  return cron.schedule("*/10 * * * *", async () => {
    const lockToken = await acquireCronLock("order_cleanup", 540);
    if (!lockToken) return;

    console.log("[Cron] Checking for expired unpaid orders...");
    try {
      const expirationTime = new Date(Date.now() - 30 * 60 * 1000);

      const expiredOrders = await db.Order.findAll({
        where: {
          status: "pending",
          paymentStatus: "unpaid",
          paymentMethod: { [Op.in]: ["vnpay", "paypal", "momo"] },
          createdAt: { [Op.lt]: expirationTime },
        },
      });

      if (expiredOrders.length > 0) {
        console.log(`[Cron] Found ${expiredOrders.length} expired orders. Cancelling...`);
        for (const order of expiredOrders) {
          await OrderService.updateOrderStatus(
            order.id,
            "cancelled",
            null,
            "Hệ thống tự động hủy do quá thời hạn thanh toán."
          );
          console.log(`[Cron] Cancelled order ID: ${order.id}`);
        }
      }
    } catch (error) {
      console.error("[Cron] Error in unpaid order cleanup job:", error);
    } finally {
      await releaseLock("cron:order_cleanup", lockToken);
    }
  });
};

module.exports = { initOrderCron };
