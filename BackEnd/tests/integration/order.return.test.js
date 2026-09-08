const OrderItemService = require("../../src/services/order/OrderItemService");
const db = require("../../src/models");

describe("Order Return Flow & Idempotency Tests", () => {
  let customerUser;
  let otherUser;
  let adminUser;
  let product;
  let order;
  let orderItem;

  beforeAll(async () => {
    customerUser = await db.User.create({
      username: `returnCust_${Date.now()}`,
      email: `returnCust_${Date.now()}@tientech.test`,
      password: "Password123!",
      role: "customer",
    });

    otherUser = await db.User.create({
      username: `otherCust_${Date.now()}`,
      email: `otherCust_${Date.now()}@tientech.test`,
      password: "Password123!",
      role: "customer",
    });

    adminUser = await db.User.create({
      username: `returnAdmin_${Date.now()}`,
      email: `returnAdmin_${Date.now()}@tientech.test`,
      password: "Password123!",
      role: "admin",
    });

    product = await db.Product.create({
      name: `Test Return Product ${Date.now()}`,
      slug: `test-return-product-${Date.now()}`,
      sku: `SKU-RET-${Date.now()}`,
      basePrice: 150000,
      totalStock: 50,
      sold: 10,
    });

    order = await db.Order.create({
      userId: customerUser.id,
      orderCode: `ORD-RET-${Date.now()}`,
      totalPrice: 150000,
      shippingAddress: "Return Test Street",
      status: "delivered",
      paymentStatus: "paid",
    });

    orderItem = await db.OrderItem.create({
      orderId: order.id,
      productId: product.id,
      productName: product.name,
      quantity: 2,
      price: 75000,
      subtotal: 150000,
      returnStatus: "none",
    });
  });

  afterAll(async () => {
    try {
      if (orderItem) await db.OrderItem.destroy({ where: { id: orderItem.id } });
      if (order) await db.Order.destroy({ where: { id: order.id } });
      if (product) await db.Product.destroy({ where: { id: product.id } });
      await db.User.destroy({
        where: { id: [customerUser.id, otherUser.id, adminUser.id] },
      });
    } catch (e) {
      console.error(e);
    }
  });

  test("Customer cannot request return on an item belonging to another customer's order", async () => {
    const result = await OrderItemService.requestReturn(
      orderItem.id,
      "Sản phẩm bị lỗi",
      otherUser // Different user tries to request return
    );

    expect(result.errCode).toBe(403);
    expect(result.errMessage).toMatch(/chính mình|không có quyền/i);
  });

  test("Customer requests return on own item -> returnStatus becomes requested", async () => {
    const result = await OrderItemService.requestReturn(
      orderItem.id,
      "Sản phẩm trầy xước vỏ ngoài",
      customerUser
    );

    expect(result.errCode).toBe(0);
    expect(result.data.returnStatus).toBe("requested");
    expect(result.data.returnReason).toBe("Sản phẩm trầy xước vỏ ngoài");

    const refreshed = await db.OrderItem.findByPk(orderItem.id);
    expect(refreshed.returnStatus).toBe("requested");
  });

  test("Admin approves return on requested item -> restocks inventory and sets returnStatus to approved", async () => {
    const stockBefore = (await db.Product.findByPk(product.id)).totalStock;

    const result = await OrderItemService.processReturn(
      orderItem.id,
      "approved",
      "Duyệt đổi trả cho khách",
      adminUser
    );

    expect(result.errCode).toBe(0);
    expect(result.data.returnStatus).toBe("approved");

    // Verify stock is restored by item.quantity (2)
    const refreshedProduct = await db.Product.findByPk(product.id);
    expect(refreshedProduct.totalStock).toBe(stockBefore + orderItem.quantity);
  });

  test("Admin cannot approve already-approved return item again (Idempotent guard)", async () => {
    const stockBefore = (await db.Product.findByPk(product.id)).totalStock;

    const result = await OrderItemService.processReturn(
      orderItem.id,
      "approved",
      "Duyệt lại lần 2",
      adminUser
    );

    expect(result.errCode).toBe(2);
    expect(result.errMessage).toMatch(/chỉ có thể duyệt hoặc từ chối sản phẩm đang ở trạng thái 'requested'/i);

    // Verify stock was NOT incremented again
    const refreshedProduct = await db.Product.findByPk(product.id);
    expect(refreshedProduct.totalStock).toBe(stockBefore);
  });
});
