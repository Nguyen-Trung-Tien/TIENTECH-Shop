const cron = require("node-cron");
const InventoryService = require("../services/common/InventoryService");
const { acquireCronLock, releaseLock } = require("../config/redis");

// Chạy hàng ngày vào lúc 8:00 sáng (kèm distributed lock)
const initInventoryCron = () => {
  return cron.schedule("0 8 * * *", async () => {
    const lockToken = await acquireCronLock("inventory_alert", 300);
    if (!lockToken) return;

    console.log("[Cron] Đang kiểm tra tồn kho...");
    try {
      await InventoryService.checkInventoryAndAlert();
    } catch (error) {
      console.error("[Cron] Error in inventory check job:", error);
    } finally {
      await releaseLock("cron:inventory_alert", lockToken);
    }
  });
};

module.exports = { initInventoryCron };
