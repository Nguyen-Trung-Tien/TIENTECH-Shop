const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const UserService = require("../../src/services/user/UserService");
const AuthService = require("../../src/services/user/AuthService");
const OrderService = require("../../src/services/order/OrderService");
const UserController = require("../../src/controllers/UserController");
const { validate } = require("../../src/middleware/zodMiddleware");
const { registerSchema, updateUserSchema } = require("../../src/utils/zodSchemas");
const db = require("../../src/models");
const app = require("../../src/app");

describe("Targeted Security Vulnerability Fixes & Hardening Tests", () => {
  let customerUser;
  let otherCustomerUser;

  beforeAll(async () => {
    customerUser = await db.User.create({
      username: `sec_cust_${Date.now()}`,
      email: `sec_cust_${Date.now()}@tientech.test`,
      password: "Password123!",
      role: "customer",
      isActive: true,
    });

    otherCustomerUser = await db.User.create({
      username: `sec_other_${Date.now()}`,
      email: `sec_other_${Date.now()}@tientech.test`,
      password: "Password123!",
      role: "customer",
      isActive: true,
    });
  });

  afterAll(async () => {
    try {
      const userIds = [customerUser?.id, otherCustomerUser?.id].filter(Boolean);
      if (userIds.length > 0) {
        await db.User.destroy({ where: { id: userIds } });
      }
    } catch (e) {
      console.error(e);
    }
  });

  describe("SEC-CRIT-01: Registration Privilege Escalation Prevention", () => {
    test("Public registration strictly ignores and overrides requested role to 'customer'", async () => {
      const testEmail = `priv_escalation_${Date.now()}@tientech.test`;
      const result = await UserService.createNewUser({
        email: testEmail,
        password: "StrongPassword123!",
        username: "hacker_admin",
        role: "admin", // Attacker attempts to become admin
        isActive: true, // Attacker attempts to bypass verification
        creatorRole: "customer",
      });

      expect(result.errCode).toBe(0);
      expect(result.data.role).toBe("customer");

      // Verify in DB directly
      const createdUser = await db.User.findOne({ where: { email: testEmail } });
      expect(createdUser.role).toBe("customer");

      // Cleanup
      await createdUser.destroy();
    });
  });

  describe("SEC-CRIT-04: User Profile Mass Assignment Protection", () => {
    test("updateUserSchema rejects disallowed fields such as role, points, rank, password", async () => {
      const forbiddenPayload = {
        role: "admin",
        points: 999999,
        rank: "DIAMOND",
        password: "NewHackedPassword123!",
      };

      const parsed = updateUserSchema.safeParse({ body: forbiddenPayload });
      expect(parsed.success).toBe(false);
      const errorKeys = parsed.error.issues.flatMap((i) => i.keys || i.path);
      expect(errorKeys).toContain("role");
      expect(errorKeys).toContain("points");
      expect(errorKeys).toContain("rank");
      expect(errorKeys).toContain("password");
    });

    test("UserService.updateUser ignores sensitive fields if passed directly to service", async () => {
      const beforeUser = await db.User.findByPk(customerUser.id);
      const originalRole = beforeUser.role;

      const updateResult = await UserService.updateUser(
        customerUser.id,
        {
          username: "valid_new_username",
          role: "admin",
          points: 50000,
        },
        "customer"
      );

      expect(updateResult.errCode).toBe(0);

      const afterUser = await db.User.findByPk(customerUser.id);
      expect(afterUser.username).toBe("valid_new_username");
      expect(afterUser.role).toBe(originalRole); // Did NOT elevate to admin
    });
  });

  describe("SEC-CRIT-02: BOLA / IDOR Protection on Order Retrieval", () => {
    test("Customer cannot retrieve an order belonging to another customer", async () => {
      // Mock order owned by otherCustomerUser
      const mockOrder = {
        id: 8888,
        userId: otherCustomerUser.id,
        totalAmount: 500000,
        status: "pending",
        toJSON: () => ({ id: 8888, userId: otherCustomerUser.id }),
      };

      jest.spyOn(db.Order, "findByPk").mockResolvedValue(mockOrder);

      // Customer attempts to view otherCustomerUser's order
      const result = await OrderService.getOrderById(8888, {
        id: customerUser.id,
        role: "customer",
      });

      expect(result.errCode).toBe(403);
      expect(result.errMessage).toContain("Bạn không có quyền");

      // Admin CAN view any order
      const adminResult = await OrderService.getOrderById(8888, {
        id: 9999,
        role: "admin",
      });
      expect(adminResult.errCode).toBe(0);

      db.Order.findByPk.mockRestore();
    });
  });

  describe("SEC-CRIT-03: OrderItem Route Access Control", () => {
    test("Direct OrderItem modification endpoint rejects unauthenticated access with 401", async () => {
      const res = await request(app).post("/api/v1/order-item/create-new-order-item").send({
        orderId: 1,
        productId: 1,
        quantity: 10,
        price: 1000,
      });

      expect(res.status).toBe(401);
    });
  });

  describe("CSRF Protection against Query-String Bypass", () => {
    test("Query-string injection such as ?bypass=/webhook does NOT bypass CSRF for authenticated cookie requests", async () => {
      const res = await request(app)
        .post("/api/v1/user/update?bypass=/webhook")
        .set("Cookie", ["accessToken=fake-jwt-token"])
        .set("Origin", "https://malicious-attacker-site.com")
        .send({ username: "attacker_change" });

      expect(res.status).toBe(403);
      expect(res.body.errMessage).toContain("CSRF");
    });
  });

  describe("Auth & Session Revocation on Password Reset", () => {
    test("resetPassword rejects expired reset tokens", async () => {
      const { hashToken } = require("../../src/services/user/AuthHelper");
      const rawToken = "raw_test_token_123";

      const expiredUser = await db.User.create({
        username: `exp_user_${Date.now()}`,
        email: `exp_user_${Date.now()}@tientech.test`,
        password: "Password123!",
        role: "customer",
        isActive: true,
        resetToken: hashToken(rawToken),
        resetTokenExpiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
      });

      const result = await AuthService.resetPassword(expiredUser.email, rawToken, "NewPassword123!");
      expect(result.errCode).toBe(2);
      expect(result.errMessage).toContain("hết hạn");

      await expiredUser.destroy();
    });
  });
});
