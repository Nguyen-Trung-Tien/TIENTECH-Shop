const db = require("../models");
const { Op } = require("sequelize");
const { sendOrderDeliveredEmail } = require("./sendEmail");

const getAllOrders = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await db.Order.findAndCountAll({
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "email", "phone"],
        },
        { model: db.OrderItem, as: "orderItems" },
        { model: db.Payment, as: "payment" },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      errCode: 0,
      errMessage: "OK",
      data: orders,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
      },
    };
  } catch (e) {
    console.error("Error in getAllOrders:", e);
    throw e;
  }
};

const getOrderById = async (id, user) => {
  try {
    const order = await db.Order.findByPk(id, {
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "email", "phone"],
        },
        {
          model: db.OrderItem,
          as: "orderItems",
          attributes: [
            "id",
            "quantity",
            "price",
            "subtotal",
            "productName",
            "image",
            "returnStatus",
            "returnReason",
          ],
          include: [
            {
              model: db.Product,
              as: "product",
              attributes: [
                "id",
                "name",
                "image",
                "price",
                "discount",
                "color",
                "ram",
                "rom",
                "screen",
                "cpu",
                "battery",
                "weight",
                "connectivity",
                "os",
                "extra",
              ],
            },
          ],
        },
        {
          model: db.Payment,
          as: "payment",
          attributes: ["id", "orderId", "amount", "method", "status"],
        },
      ],
    });

    if (!order) {
      return { errCode: 1, errMessage: "Order not found", status: 404 };
    }

    const isAdmin = user.role === "admin";
    const isOwner = order.userId === user.id;

    if (!isAdmin && !isOwner) {
      return {
        errCode: 2,
        errMessage: "Forbidden: You do not have permission to view this order",
        status: 403,
      };
    }

    return { errCode: 0, errMessage: "OK", data: order };
  } catch (e) {
    console.error("Error in getOrderById:", e);
    throw e;
  }
};

const getOrdersByUserId = async (
  userId,
  page = 1,
  limit = 10,
  status = "all"
) => {
  try {
    const offset = (page - 1) * limit;

    const where = { userId };
    if (status !== "all") {
      where.status = status;
    }

    const { count, rows: orders } = await db.Order.findAndCountAll({
      where,
      distinct: true,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      attributes: [
        "id",
        "status",
        "totalPrice",
        "paymentMethod",
        "paymentStatus",
        "orderCode",
        "createdAt",
        "deliveredAt",
      ],
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          attributes: [
            "id",
            "quantity",
            "price",
            "subtotal",
            "productName",
            "image",
            "returnStatus",
          ],
          include: [
            {
              model: db.Product,
              as: "product",
              attributes: ["id", "name", "image", "price", "discount"],
            },
          ],
        },
        {
          model: db.Payment,
          as: "payment",
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      errCode: 0,
      errMessage: "OK",
      data: orders,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
      },
    };
  } catch (e) {
    console.error("Error in getOrdersByUserId:", e);
    throw e;
  }
};

const getActiveOrdersByUserId = async (userId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await db.Order.findAndCountAll({
      where: {
        userId,
        status: { [Op.notIn]: ["delivered", "cancelled"] },
      },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "email", "phone"],
        },
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Product,
              as: "productInfo",
              attributes: ["id", "name", "price", "image"],
            },
          ],
        },
        {
          model: db.Payment,
          as: "payment",
          attributes: ["id", "method", "status", "amount"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      errCode: 0,
      errMessage: "OK",
      data: orders,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
      },
    };
  } catch (e) {
    console.error("Error in getActiveOrdersByUserId:", e);
    throw e;
  }
};

const VoucherService = require("./VoucherService");

const createOrder = async (data) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      userId,
      shippingAddress,
      paymentMethod,
      note,
      orderItems = [],
      voucherCode,
    } = data;

    if (!userId || !shippingAddress || !orderItems.length) {
      return {
        errCode: 1,
        errMessage: "Missing required fields (userId, shippingAddress, orderItems)",
      };
    }

    const orderCode = `ORD${Date.now()}`;
    const formattedItems = [];
    let calculatedTotal = 0;

    for (const item of orderItems) {
      const product = await db.Product.findByPk(item.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!product || !product.isActive) {
        await t.rollback();
        return { errCode: 3, errMessage: `Sản phẩm ${item.productId} không tồn tại.` };
      }

      const quantity = Number(item.quantity);
      const basePrice = Number(product.price) || 0;
      const discount = Number(product.discount) || 0;
      const unitPrice = Number((basePrice * (1 - discount / 100)).toFixed(2));
      const subtotal = Number((unitPrice * quantity).toFixed(2));

      calculatedTotal += subtotal;

      formattedItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        price: unitPrice,
        subtotal,
      });
    }

    let discountAmount = 0;
    let appliedVoucher = null;

    if (voucherCode) {
      const voucherRes = await VoucherService.checkVoucher(voucherCode, calculatedTotal);
      if (voucherRes.errCode === 0) {
        appliedVoucher = await db.Voucher.findOne({ where: { code: voucherCode }, transaction: t });
        discountAmount = voucherRes.data.discountAmount;
        
        // Tăng lượt dùng voucher
        await appliedVoucher.increment("usedCount", { by: 1, transaction: t });
      } else {
        await t.rollback();
        return voucherRes; // Trả về lỗi voucher nếu không hợp lệ
      }
    }

    const finalTotal = Math.max(0, calculatedTotal - discountAmount);

    const order = await db.Order.create(
      {
        orderCode,
        userId,
        totalPrice: finalTotal,
        discountAmount,
        voucherCode: voucherCode || null,
        shippingAddress,
        paymentMethod,
        note: note || "",
        paymentStatus: "unpaid",
        status: "pending",
        orderItems: formattedItems,
      },
      {
        include: [{ model: db.OrderItem, as: "orderItems" }],
        transaction: t,
      }
    );

    const cartItemIds = orderItems.map((item) => item.cartItemId).filter(Boolean);
    if (cartItemIds.length) {
      await db.CartItem.destroy({ where: { id: cartItemIds }, transaction: t });
    }

    await t.commit();
    return {
      errCode: 0,
      errMessage: "Order created successfully",
      data: { id: order.id, orderCode: order.orderCode },
    };
  } catch (e) {
    await t.rollback();
    console.error("Error creating order:", e);
    return { errCode: -1, errMessage: e.message };
  }
};

const updateOrderStatus = async (id, status, user = null) => {
  const t = await db.sequelize.transaction();
  try {
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      await t.rollback();
      return { errCode: 2, errMessage: "Invalid status", status: 400 };
    }

    const order = await db.Order.findByPk(id, {
      include: [{ model: db.OrderItem, as: "orderItems" }],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return { errCode: 1, errMessage: "Order not found", status: 404 };
    }

    if (user && user.role !== "admin") {
      if (String(order.userId) !== String(user.id)) {
        await t.rollback();
        return { errCode: 403, errMessage: "Forbidden", status: 403 };
      }

      // Customer can only cancel pending orders or confirm delivery of shipped orders.
      if (status === "cancelled" && order.status !== "pending") {
        await t.rollback();
        return {
          errCode: 3,
          errMessage: "Cannot cancel this order",
          status: 400,
        };
      }

      if (status === "delivered" && order.status !== "shipped") {
        await t.rollback();
        return {
          errCode: 4,
          errMessage: "Cannot confirm delivery for this order",
          status: 400,
        };
      }

      if (!["cancelled", "delivered"].includes(status)) {
        await t.rollback();
        return { errCode: 403, errMessage: "Forbidden", status: 403 };
      }
    }

    const prevStatus = order.status;

    const history = Array.isArray(order.confirmationHistory)
      ? order.confirmationHistory
      : [];
    history.push({ status, date: new Date().toISOString() });

    order.status = status;
    order.confirmationHistory = history;

    if (!order.orderItems?.length) {
      console.warn("No orderItems found for order:", id);
    }

    if (
      ["delivered", "completed"].includes(status) &&
      !["delivered", "completed"].includes(prevStatus)
    ) {
      for (const item of order.orderItems) {
        const product = await db.Product.findByPk(item.productId, {
          transaction: t,
        });
        if (product) {
          product.sold = (product.sold || 0) + item.quantity;
          product.stock = Math.max(0, (product.stock || 0) - item.quantity);
          await product.save({ transaction: t });
        }
      }
    }

    if (
      status === "cancelled" &&
      ["delivered", "completed"].includes(prevStatus)
    ) {
      for (const item of order.orderItems) {
        const product = await db.Product.findByPk(item.productId, {
          transaction: t,
        });
        if (product) {
          product.sold = Math.max(0, (product.sold || 0) - item.quantity);
          product.stock += item.quantity;
          await product.save({ transaction: t });
        }
      }
    }

    if (
      status === "cancelled" &&
      !["delivered", "completed"].includes(prevStatus)
    ) {
      for (const item of order.orderItems) {
        const product = await db.Product.findByPk(item.productId, {
          transaction: t,
        });
        if (product) {
          product.stock += item.quantity;
          await product.save({ transaction: t });
        }
      }
    }

    await order.save({ transaction: t });

    if (status === "delivered") {
      const user = await db.User.findByPk(order.userId);
      await sendOrderDeliveredEmail(user, order);
    }
    await t.commit();

    return {
      errCode: 0,
      errMessage: "Order status updated successfully",
      data: order,
    };
  } catch (e) {
    await t.rollback();
    console.error("Error updating order status:", e);
    return {
      errCode: -1,
      errMessage: e.message || "Error updating order status",
    };
  }
};

const deleteOrder = async (id) => {
  try {
    const order = await db.Order.findByPk(id);
    if (!order) return { errCode: 1, errMessage: "Order not found" };

    await order.destroy();
    return { errCode: 0, errMessage: "Order deleted successfully" };
  } catch (e) {
    console.error("Error deleting order:", e);
    throw e;
  }
};

const updatePaymentStatus = async (orderId, paymentStatus) => {
  const t = await db.sequelize.transaction();
  try {
    const order = await db.Order.findByPk(orderId, {
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) {
      await t.rollback();
      return { errCode: 1, errMessage: "Order not found" };
    }

    const validStatuses = ["unpaid", "paid", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      await t.rollback();
      return { errCode: 2, errMessage: "Invalid payment status" };
    }

    // ĐÃ PAID → KHÔNG XỬ LÝ LẠI
    if (order.paymentStatus === "paid") {
      await t.commit();
      return {
        errCode: 0,
        errMessage: "Order already paid",
        data: order,
      };
    }

    // CHỈ XỬ LÝ KHI unpaid → paid
    if (order.paymentStatus === "unpaid" && paymentStatus === "paid") {
      for (const item of order.orderItems) {
        const product = await db.Product.findByPk(item.productId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!product) {
          await t.rollback();
          return {
            errCode: 3,
            errMessage: `Product ${item.productId} not found`,
          };
        }

        if (product.stock < item.quantity) {
          await t.rollback();
          return {
            errCode: 4,
            errMessage: `Sản phẩm ${product.name} không đủ tồn kho`,
          };
        }

        product.stock -= item.quantity;
        product.sold = (product.sold || 0) + item.quantity;
        await product.save({ transaction: t });
      }

      order.paymentStatus = "paid";
      order.status = "confirmed";
      await order.save({ transaction: t });
    }

    // refunded (để sau, không làm trong VNPay)
    if (paymentStatus === "refunded") {
      order.paymentStatus = "refunded";
      order.status = "cancelled";
      await order.save({ transaction: t });
    }

    await t.commit();

    return {
      errCode: 0,
      errMessage: "Payment status updated successfully",
      data: order,
    };
  } catch (e) {
    await t.rollback();
    console.error("Error updating payment status:", e);
    return {
      errCode: -1,
      errMessage: e.message || "Error updating payment status",
    };
  }
};

const getOrderByCode = async (orderCode) => {
  const order = await db.Order.findOne({
    where: { orderCode },
    include: [
      { model: db.OrderItem, as: "orderItems" },
      { model: db.Payment, as: "payment" },
    ],
  });

  if (!order) {
    return { errCode: 1, errMessage: "Order not found" };
  }

  if (order.paymentStatus === "paid") {
    return { errCode: 2, errMessage: "Order already paid", data: order };
  }

  return { errCode: 0, data: order };
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  updatePaymentStatus,
  getOrdersByUserId,
  getActiveOrdersByUserId,
  getOrderByCode,
};
