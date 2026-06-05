const cron = require("node-cron");
const InventoryService = require("../services/InventoryService");

// Chạy hàng ngày vào lúc 8:00 sáng
const initInventoryCron = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("[Cron] Đang kiểm tra tồn kho...");
    await InventoryService.checkInventoryAndAlert();
  });
};

module.exports = { initInventoryCron };
