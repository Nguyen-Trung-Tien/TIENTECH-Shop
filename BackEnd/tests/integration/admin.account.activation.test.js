const request = require("supertest");
const express = require("express");
const db = require("../../src/models");
const UserService = require("../../src/services/user/UserService");
const UserRouter = require("../../src/routes/UserRouter");
const { generateAccessToken } = require("../../src/utils/jwtHelper");
const { getCache, setCache } = require("../../src/config/redis");
const { getRefreshTokenKey } = require("../../src/services/user/AuthHelper");

const app = express();
app.use(express.json());
app.use("/api/v1/user", UserRouter);

describe("Admin Account Activation & Status Management Integration Tests", () => {
  let adminUser;
  let normalUser;
  let adminToken;
  let customerToken;

  beforeAll(async () => {
    try {
      if (db.AuditLog) await db.AuditLog.destroy({ where: {} });
      await db.User.destroy({ where: { email: { [db.Sequelize.Op.like]: "%@tientech.test" } } });
      await db.User.destroy({ where: { username: { [db.Sequelize.Op.in]: ["admin_test_activation", "customer_test_activation", "bulk_u1", "bulk_u2"] } } });
    } catch (e) {}

    // Create admin user
    adminUser = await db.User.create({
      username: "admin_test_activation",
      email: "admin_activation@tientech.test",
      password: "hashed_password",
      role: "admin",
      isActive: true,
    });

    // Create target customer
    normalUser = await db.User.create({
      username: "customer_test_activation",
      email: "customer_activation@tientech.test",
      password: "hashed_password",
      role: "customer",
      isActive: false,
      verificationToken: "sample_hashed_token",
      verificationTokenExpiresAt: new Date(Date.now() + 86400000),
    });

    adminToken = generateAccessToken({
      id: adminUser.id,
      email: adminUser.email,
      role: "admin",
    });

    customerToken = generateAccessToken({
      id: normalUser.id,
      email: normalUser.email,
      role: "customer",
    });
  });

  afterAll(async () => {
    try {
      await db.AuditLog.destroy({ where: { adminId: adminUser.id } });
      if (adminUser) await db.User.destroy({ where: { id: adminUser.id } });
      if (normalUser) await db.User.destroy({ where: { id: normalUser.id } });
      await db.User.destroy({ where: { email: { [db.Sequelize.Op.like]: "%@tientech.test" } } });
    } catch (e) {
      // Ignore cleanup error
    }
  });

  describe("Access Control & Security", () => {
    it("should reject unauthenticated request to /admin/status with 401", async () => {
      const res = await request(app)
        .put("/api/v1/user/admin/status")
        .send({ userId: normalUser.id, status: "active" });

      expect(res.status).toBe(401);
    });

    it("should reject customer request to /admin/status with 403 Forbidden", async () => {
      const res = await request(app)
        .put("/api/v1/user/admin/status")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ userId: normalUser.id, status: "active" });

      expect(res.status).toBe(403);
    });

    it("should prevent admin from deactivating their own account", async () => {
      const res = await request(app)
        .put("/api/v1/user/admin/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ userId: adminUser.id, status: "inactive" });

      expect(res.body.errCode).toBe(1);
      expect(res.body.errMessage).toContain("không thể tự thay đổi trạng thái của chính mình");
    });
  });

  describe("Account Activation & Suspension Flow", () => {
    it("should successfully activate a pending customer account", async () => {
      const res = await request(app)
        .put("/api/v1/user/admin/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          userId: normalUser.id,
          status: "active",
          reason: "Kích hoạt kiểm thử hệ thống",
        });

      expect(res.status).toBe(200);
      expect(res.body.errCode).toBe(0);
      expect(res.body.data.isActive).toBe(true);
      expect(res.body.data.accountStatus).toBe("active");

      // Verify DB state
      const updated = await db.User.findByPk(normalUser.id);
      expect(updated.isActive).toBe(true);
      expect(updated.verificationToken).toBeNull();

      // Verify Audit Log was recorded
      const log = await db.AuditLog.findOne({
        where: { targetUserId: normalUser.id, action: "ACCOUNT_ACTIVATED" },
      });
      expect(log).toBeTruthy();
      expect(log.adminId).toBe(adminUser.id);
      expect(log.reason).toBe("Kích hoạt kiểm thử hệ thống");
    });

    it("should handle activating already active user idempotently", async () => {
      const res = await request(app)
        .put("/api/v1/user/admin/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ userId: normalUser.id, status: "active" });

      expect(res.status).toBe(200);
      expect(res.body.errCode).toBe(0);
      expect(res.body.errMessage).toContain("đã ở trạng thái hoạt động");
    });

    it("should successfully suspend an active customer account and evict session", async () => {
      // Simulate active refresh session in Redis
      await setCache(getRefreshTokenKey(normalUser.id), { hash: "dummy" }, 3600);

      const res = await request(app)
        .put("/api/v1/user/admin/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          userId: normalUser.id,
          status: "suspended",
          reason: "Tạm khóa do vi phạm chính sách",
        });

      expect(res.status).toBe(200);
      expect(res.body.errCode).toBe(0);
      expect(res.body.data.isActive).toBe(false);
      expect(res.body.data.accountStatus).toBe("suspended");

      // Verify DB and cache state
      const updated = await db.User.findByPk(normalUser.id);
      expect(updated.isActive).toBe(false);
      expect(updated.refreshTokenHash).toBeNull();

      const cached = await getCache(getRefreshTokenKey(normalUser.id));
      expect(cached).toBeNull();

      // Verify Audit Log
      const log = await db.AuditLog.findOne({
        where: { targetUserId: normalUser.id, action: "ACCOUNT_DEACTIVATED" },
      });
      expect(log).toBeTruthy();
      expect(log.reason).toBe("Tạm khóa do vi phạm chính sách");
    });
  });

  describe("Bulk Actions & Metrics", () => {
    let bulkUser1;
    let bulkUser2;

    beforeAll(async () => {
      bulkUser1 = await db.User.create({
        username: "bulk_u1",
        email: "bulk1@tientech.test",
        password: "hashed",
        role: "customer",
        isActive: false,
      });
      bulkUser2 = await db.User.create({
        username: "bulk_u2",
        email: "bulk2@tientech.test",
        password: "hashed",
        role: "customer",
        isActive: false,
      });
    });

    afterAll(async () => {
      if (bulkUser1) await db.User.destroy({ where: { id: bulkUser1.id } });
      if (bulkUser2) await db.User.destroy({ where: { id: bulkUser2.id } });
    });

    it("should perform bulk activation on multiple users", async () => {
      const res = await request(app)
        .post("/api/v1/user/admin/bulk-status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          userIds: [bulkUser1.id, bulkUser2.id, adminUser.id], // includes adminId to test skipping self
          status: "active",
          reason: "Kích hoạt hàng loạt thử nghiệm",
        });

      expect(res.status).toBe(200);
      expect(res.body.errCode).toBe(0);
      expect(res.body.data.successCount).toBe(2);
      expect(res.body.data.failureCount).toBe(1); // admin self skipped

      const u1 = await db.User.findByPk(bulkUser1.id);
      const u2 = await db.User.findByPk(bulkUser2.id);
      expect(u1.isActive).toBe(true);
      expect(u2.isActive).toBe(true);
    });

    it("should retrieve system user metrics accurately", async () => {
      const res = await request(app)
        .get("/api/v1/user/admin/metrics")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.errCode).toBe(0);
      expect(res.body.data).toHaveProperty("totalUsers");
      expect(res.body.data).toHaveProperty("activeUsers");
      expect(res.body.data).toHaveProperty("suspendedUsers");
      expect(res.body.data).toHaveProperty("adminUsers");
      expect(res.body.data.adminUsers).toBeGreaterThanOrEqual(1);
    });

    it("should retrieve audit logs with pagination", async () => {
      const res = await request(app)
        .get("/api/v1/user/admin/audit-logs?limit=5")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.errCode).toBe(0);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.pagination).toBeDefined();
    });
  });
});
