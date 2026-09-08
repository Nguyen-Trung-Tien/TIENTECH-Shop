const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const OrderController = require("../../src/controllers/OrderController");
const OrderService = require("../../src/services/order/OrderService");
const db = require("../../src/models");

// Create minimal express app for testing OrderController
const app = express();
app.use(express.json());
app.use(cookieParser());

// Mock auth middleware simulating authenticated user
let mockUser = { id: 1, role: "customer" };
app.use((req, res, next) => {
  req.user = mockUser;
  next();
});

app.post("/api/order/create-new-order", OrderController.handleCreateOrder);

describe("Order Ownership & Access Control Tests", () => {
  let customerA;
  let customerB;
  let adminUser;

  beforeAll(async () => {
    customerA = await db.User.create({
      username: `custA_${Date.now()}`,
      email: `custA_${Date.now()}@tientech.test`,
      password: "Password123!",
      role: "customer",
    });

    customerB = await db.User.create({
      username: `custB_${Date.now()}`,
      email: `custB_${Date.now()}@tientech.test`,
      password: "Password123!",
      role: "customer",
    });

    adminUser = await db.User.create({
      username: `admin_${Date.now()}`,
      email: `admin_${Date.now()}@tientech.test`,
      password: "Password123!",
      role: "admin",
    });
  });

  afterAll(async () => {
    try {
      const userIds = [customerA?.id, customerB?.id, adminUser?.id].filter(Boolean);
      if (userIds.length > 0) {
        await db.User.destroy({
          where: { id: userIds },
        });
      }
    } catch (e) {
      console.error(e);
    }
  });

  test("Customer cannot forge userId in request body; userId is forced to req.user.id", async () => {
    mockUser = { id: customerA.id, role: "customer" };

    const spyCreateOrder = jest
      .spyOn(OrderService, "createOrder")
      .mockImplementation(async (orderData) => {
        return {
          errCode: 0,
          errMessage: "Order created successfully",
          data: { id: 999, ...orderData },
        };
      });

    // Customer A submits order, maliciously trying to assign userId = Customer B's id
    const res = await request(app)
      .post("/api/order/create-new-order")
      .send({
        userId: customerB.id, // Forged userId
        items: [{ productId: 1, quantity: 1, price: 100000 }],
        shippingAddress: "456 Test Street",
        paymentMethod: "cod",
      });

    expect(res.status).toBe(201);
    expect(spyCreateOrder).toHaveBeenCalled();

    // Verify the arguments passed to OrderService: userId MUST be customerA.id, NOT customerB.id
    const passedArg = spyCreateOrder.mock.calls[0][0];
    expect(passedArg.userId).toBe(customerA.id);

    spyCreateOrder.mockRestore();
  });

  test("Admin can create order on behalf of another user if explicitly provided", async () => {
    mockUser = { id: adminUser.id, role: "admin" };

    const spyCreateOrder = jest
      .spyOn(OrderService, "createOrder")
      .mockImplementation(async (orderData) => {
        return {
          errCode: 0,
          errMessage: "Order created successfully",
          data: { id: 1000, ...orderData },
        };
      });

    const res = await request(app)
      .post("/api/order/create-new-order")
      .send({
        userId: customerB.id, // Admin creates on behalf of customer B
        items: [{ productId: 1, quantity: 1, price: 100000 }],
        shippingAddress: "789 Admin Street",
        paymentMethod: "cod",
      });

    expect(res.status).toBe(201);
    const passedArg = spyCreateOrder.mock.calls[0][0];
    expect(passedArg.userId).toBe(customerB.id);

    spyCreateOrder.mockRestore();
  });
});
