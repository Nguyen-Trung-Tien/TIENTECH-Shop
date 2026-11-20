require("dotenv").config();
const db = require("../models");
const { runPendingMigrations } = require("../config/autoMigrate");

(async () => {
  try {
    console.log("[runMigrations] Connecting to database...");
    await db.sequelize.authenticate();
    console.log("[runMigrations] Connected successfully. Starting migration run...");
    const result = await runPendingMigrations();
    console.log(`[runMigrations] Completed. Applied: ${result.count} migrations.`);
    await db.sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error("[runMigrations] Fatal migration error:", err?.message || err);
    try {
      await db.sequelize.close();
    } catch (_) {}
    process.exit(1);
  }
})();
