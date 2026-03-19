const db = require("../src/models");
const OrderService = require("../src/services/OrderService");

describe("OrderService stock reservation", () => {
  let user;
  let product;
  let orderId;

  beforeAll(async () => {
    const suffix = Date.now();
    user = await db.User.create({
      username: `orderuser_${suffix}`,
      email: `orderuser_${suffix}@example.com`,
      password: "pass123",
      role: "customer",
    });

    product = await db.Product.create({
      name: `Laptop Test ${suffix}`,
      price: 1000,
      stock: 10,
      isActive: true,
    });
  });

  afterAll(async () => {
    if (orderId) {
      await db.StockReservation.destroy({ where: { orderId } });
      await db.OrderItem.destroy({ where: { orderId } });
      await db.Order.destroy({ where: { id: orderId } });
    }
    if (product?.id) {
      await db.Product.destroy({ where: { id: product.id } });
    }
    if (user?.id) {
      await db.User.destroy({ where: { id: user.id } });
    }
  });

  it("reserves stock on order create and commits on payment", async () => {
    const createResult = await OrderService.createOrder({
      userId: user.id,
      shippingAddress: "123 Test Street",
      paymentMethod: "cod",
      note: "",
      orderItems: [{ productId: product.id, quantity: 5, cartItemId: null }],
    });

    expect(createResult.errCode).toBe(0);
    orderId = createResult.data.id;

    const reservation = await db.StockReservation.findOne({ where: { orderId } });
    expect(reservation).toBeTruthy();
    expect(reservation.status).toBe("reserved");

    const productAfterCreate = await db.Product.findByPk(product.id);
    expect(productAfterCreate.stock).toBe(10);

    const paymentUpdate = await OrderService.updatePaymentStatus(orderId, "paid");
    expect(paymentUpdate.errCode).toBe(0);

    const productAfterPaid = await db.Product.findByPk(product.id);
    expect(productAfterPaid.stock).toBe(5);

    const reservationAfterPaid = await db.StockReservation.findOne({ where: { orderId } });
    expect(reservationAfterPaid.status).toBe("committed");

    const cancelResult = await OrderService.updateOrderStatus(orderId, "cancelled");
    expect(cancelResult.errCode).toBe(0);

    const productAfterCancel = await db.Product.findByPk(product.id);
    expect(productAfterCancel.stock).toBe(10);

    const reservationFinal = await db.StockReservation.findOne({ where: { orderId } });
    expect(["released", "committed"]).toContain(reservationFinal.status);
  });
});