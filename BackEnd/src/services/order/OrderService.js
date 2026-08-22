const db = require("../../models");
const { Op } = require("sequelize");
const { sendOrderDeliveredEmail, sendOrderConfirmedEmail } = require("../common/EmailService");
const NotificationService = require("../notification/NotificationService");
const PaymentService = require("./PaymentService");
const { getPagination, getPagingData } = require("../../utils/paginationHelper");

const getAllOrders = async (page = 1, limit = 10, searchTerm = "", status = "", isReturn = false, isCancelRequested = false) => {
  try {
    const { offset, limit: l } = getPagination(page, limit);
    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (isCancelRequested) {
      where.status = "cancel_requested";
    }

    if (searchTerm) {
      where[Op.or] = [
        { orderCode: { [Op.like]: `%${searchTerm}%` } },
        { "$user.username$": { [Op.like]: `%${searchTerm}%` } },
        { "$user.phone$": { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const include = [
      {
        model: db.User,
        as: "user",
        attributes: ["id", "username", "email", "phone"],
      },
      { 
        model: db.OrderItem, 
        as: "orderItems", 
        separate: true,
        where: isReturn ? { returnStatus: "requested" } : {}
      },
      { model: db.Payment, as: "payment" },
    ];

    if (isReturn) {
      const data = await db.Order.findAndCountAll({
        where,
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
              "id", "productId", "variantId", "quantity", "price", 
              "subtotal", "productName", "image", "returnStatus", "returnReason"
            ],
            where: { returnStatus: "requested" },
            required: true,
            include: [
              {
                model: db.Product,
                as: "product",
                attributes: ["id", "name", "slug", ["basePrice", "price"]],
                include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
              },
            ],
          },
          { model: db.Payment, as: "payment" },
        ],
        order: [["createdAt", "DESC"]],
        limit: l,
        offset,
        distinct: true,
        subQuery: false,
      });

      const pagingData = getPagingData(data, page, l);

      return {
        errCode: 0,
        errMessage: "OK",
        data: pagingData.items,
        pagination: {
          totalItems: pagingData.totalItems,
          currentPage: pagingData.currentPage,
          totalPages: pagingData.totalPages,
          limit: l,
        },
      };
    }

    const data = await db.Order.findAndCountAll({
      where,
      include,
      order: [["createdAt", "DESC"]],
      limit: l,
      offset,
      distinct: true,
      subQuery: false,
    });

    const pagingData = getPagingData(data, page, l);

    const mappedItems = pagingData.items.map(order => {
      const plainOrder = typeof order.toJSON === "function" ? order.toJSON() : order;
      if (["delivered", "completed"].includes(plainOrder.status)) {
        plainOrder.paymentStatus = "paid";
      }
      return plainOrder;
    });

    return {
      errCode: 0,
      errMessage: "OK",
      data: mappedItems,
      pagination: {
        totalItems: pagingData.totalItems,
        currentPage: pagingData.currentPage,
        totalPages: pagingData.totalPages,
        limit: l,
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
            "productId",
            "variantId",
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
              attributes: ["id", "name", "slug", "basePrice", "specifications"],
              include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
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

    const plainOrder = order.toJSON();
    if (["delivered", "completed"].includes(plainOrder.status)) {
      plainOrder.paymentStatus = "paid";
    }
    if (plainOrder.orderItems) {
      plainOrder.orderItems.forEach(item => {
        if (item.product) {
          const primaryImage = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
          item.product.image = primaryImage ? primaryImage.imageUrl : null;
          item.product.price = item.product.basePrice;
        }
      });
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

    return { errCode: 0, errMessage: "OK", data: plainOrder };

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
    const { offset, limit: l } = getPagination(page, limit);
    const where = { userId };
    if (status && status !== "all") {
      where.status = status;
    }

    const data = await db.Order.findAndCountAll({
      where,
      distinct: true,
      order: [["createdAt", "DESC"]],
      limit: l,
      offset,
      attributes: [
        "id",
        "status",
        "totalPrice",
        "paymentMethod",
        "paymentStatus",
        "orderCode",
        "cancelReason",
        "createdAt",
        "deliveredAt",
      ],
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          attributes: [
            "id",
            "productId",
            "variantId",
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
              attributes: ["id", "name", "slug", ["basePrice", "price"]],
              include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
            },
          ],
        },
        {
          model: db.Payment,
          as: "payment",
        },
      ],
    });

    const pagingData = getPagingData(data, page, l);

    const mappedOrders = pagingData.items.map(order => {
      const plainOrder = order.toJSON();
      if (["delivered", "completed"].includes(plainOrder.status)) {
        plainOrder.paymentStatus = "paid";
      }
      if (plainOrder.orderItems) {
        plainOrder.orderItems.forEach(item => {
          if (item.product) {
            const primaryImage = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
            item.product.image = primaryImage ? primaryImage.imageUrl : null;
          }
        });
      }
      return plainOrder;
    });


    return {
      errCode: 0,
      errMessage: "OK",
      data: mappedOrders,
      pagination: {
        totalItems: pagingData.totalItems,
        currentPage: pagingData.currentPage,
        totalPages: pagingData.totalPages,
        limit: l,
      },
    };
  } catch (e) {
    console.error("Error in getOrdersByUserId:", e);
    throw e;
  }
};

const getActiveOrdersByUserId = async (userId, page = 1, limit = 10) => {
  try {
    const { offset, limit: l } = getPagination(page, limit);

    const data = await db.Order.findAndCountAll({
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
              attributes: ["id", "name", ["basePrice", "price"]],
              include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
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
      limit: l,
      offset,
    });

    const pagingData = getPagingData(data, page, l);

    const mappedOrders = pagingData.items.map(order => {
      const plainOrder = order.toJSON();
      if (plainOrder.orderItems) {
        plainOrder.orderItems.forEach(item => {
          if (item.productInfo) {
            const primaryImage = item.productInfo.images?.find(img => img.isPrimary) || item.productInfo.images?.[0];
            item.productInfo.image = primaryImage ? primaryImage.imageUrl : null;
          }
        });
      }
      return plainOrder;
    });

    return {
      errCode: 0,
      errMessage: "OK",
      data: mappedOrders,
      pagination: {
        totalItems: pagingData.totalItems,
        currentPage: pagingData.currentPage,
        totalPages: pagingData.totalPages,
        limit: l,
      },
    };
  } catch (e) {
    console.error("Error in getActiveOrdersByUserId:", e);
    throw e;
  }
};

const VoucherService = require("../marketing/VoucherService");

const createOrder = async (data) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      userId,
      shippingAddress,
      receiverName,
      receiverPhone,
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
        return {
          errCode: 3,
          errMessage: `Sản phẩm ${item.productId} không tồn tại hoặc đã ngừng kinh doanh.`,
        };
      }

      let variant = null;
      if (item.variantId) {
        variant = await db.ProductVariant.findOne({
          where: { id: item.variantId, productId: product.id },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!variant || !variant.isActive) {
          await t.rollback();
          return {
            errCode: 4,
            errMessage: `Phiên bản sản phẩm ${item.variantId} không hợp lệ.`,
          };
        }
      }

      const quantity = Number(item.quantity);
      if (quantity <= 0) {
        await t.rollback();
        return { errCode: 5, errMessage: "Số lượng không hợp lệ." };
      }

      if (variant) {
        if (variant.stock < quantity) {
          await t.rollback();
          return {
            errCode: 6,
            errMessage: `Sản phẩm ${product.name} (phiên bản ${variant.sku}) không đủ tồn kho.`,
          };
        }
        await variant.decrement("stock", { by: quantity, transaction: t });
      } else {
        if (product.totalStock < quantity) {
          await t.rollback();
          return {
            errCode: 6,
            errMessage: `Sản phẩm ${product.name} không đủ tồn kho.`,
          };
        }
        await product.decrement("totalStock", { by: quantity, transaction: t });
      }

      const now = new Date();
      let unitPrice = 0;

      const isFlashSale =
        product.isFlashSale &&
        product.flashSaleStart &&
        product.flashSaleEnd &&
        now >= new Date(product.flashSaleStart) &&
        now <= new Date(product.flashSaleEnd);

      if (isFlashSale && product.flashSalePrice) {
        unitPrice = Math.round(Number(product.flashSalePrice));
      } else if (variant) {
        const originalPrice = Number(variant.price || 0);
        const discount = Number(variant.discount || 0) || Number(product.discount || 0);
        unitPrice = Math.round(discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice);
      } else {
        const basePrice = Number(product.basePrice || 0);
        const discount = Number(product.discount || 0);
        unitPrice = Math.round(discount > 0 ? basePrice * (1 - discount / 100) : basePrice);
      }

      const subtotal = Number((unitPrice * quantity).toFixed(2));
      calculatedTotal += subtotal;

      await product.increment("sold", { by: quantity, transaction: t });

      const productImages = await db.ProductImage.findAll({ 
        where: { productId: product.id },
        transaction: t
      });
      const primaryImage = productImages.find(img => img.isPrimary) || productImages[0];

      const variantImage = variant 
        ? productImages.find(img => img.variantId === variant.id) || primaryImage
        : primaryImage;

      formattedItems.push({
        productId: product.id,
        variantId: variant ? variant.id : null,
        productName: product.name,
        quantity,
        price: unitPrice,
        subtotal,
        image: variantImage?.imageUrl || null,
      });
    }

    let discountAmount = 0;

    if (voucherCode) {
      const voucherRes = await VoucherService.checkVoucher(voucherCode, calculatedTotal, userId);
      if (voucherRes.errCode === 0) {
        const appliedVoucher = await db.Voucher.findOne({ where: { code: voucherCode }, transaction: t });
        discountAmount = voucherRes.data.discountAmount;
        await appliedVoucher.increment("usedCount", { by: 1, transaction: t });
      } else {
        await t.rollback();
        return voucherRes;
      }
    }

    const shippingFee = calculatedTotal > 5000000 ? 0 : 30000;
    const finalTotal = Math.max(0, calculatedTotal + shippingFee - discountAmount);

    const order = await db.Order.create(
      {
        orderCode,
        userId,
        totalPrice: finalTotal,
        discountAmount,
        voucherCode: voucherCode || null,
        shippingAddress,
        receiverName: receiverName || null,
        receiverPhone: receiverPhone || null,
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

    await db.CartItem.destroy({
      where: {
        cartId: {
          [Op.in]: db.Sequelize.literal(`(SELECT id FROM Carts WHERE userId = ${userId})`),
        },
      },
      transaction: t,
    });

    await t.commit();

    return { errCode: 0, errMessage: "Create order successfully", data: order };
  } catch (e) {
    await t.rollback();
    console.error("Error in createOrder:", e);
    return { errCode: 2, errMessage: e.message || "Lỗi tạo đơn hàng." };
  }
};

const syncOrderCancellationSideEffects = async (order, cancelReason, adminUser = null, t_external = null) => {
  const t = t_external || await db.sequelize.transaction();
  try {
    const orderItems = await db.OrderItem.findAll({
      where: { orderId: order.id },
      transaction: t,
    });

    for (const item of orderItems) {
      const product = await db.Product.findByPk(item.productId, { transaction: t });
      if (product) {
        product.totalStock = (product.totalStock || 0) + item.quantity;
        product.sold = Math.max(0, (product.sold || 0) - item.quantity);
        await product.save({ transaction: t });
      }

      if (item.variantId) {
        const variant = await db.ProductVariant.findByPk(item.variantId, { transaction: t });
        if (variant) {
          variant.stock = (variant.stock || 0) + item.quantity;
          await variant.save({ transaction: t });
        }
      }
    }

    if (order.voucherCode) {
      const voucher = await db.Voucher.findOne({ where: { code: order.voucherCode }, transaction: t });
      if (voucher) {
        voucher.usedCount = Math.max(0, (voucher.usedCount || 0) - 1);
        await voucher.save({ transaction: t });
      }
    }

    const history = Array.isArray(order.confirmationHistory) ? order.confirmationHistory : [];
    history.push({
      status: "cancelled",
      date: new Date().toISOString(),
      actor: adminUser ? adminUser.username : "customer",
      reason: cancelReason,
    });
    order.confirmationHistory = history;
    order.cancelReason = cancelReason;
    await order.save({ transaction: t });

    if (order.paymentStatus === "paid") {
      const payment = await db.Payment.findOne({ where: { orderId: order.id }, transaction: t });
      if (payment) {
        await PaymentService.refundPayment(payment.id, `Order Cancelled: ${cancelReason}`, t);
      }
    }

    if (!t_external) await t.commit();
  } catch (error) {
    if (!t_external) await t.rollback();
    console.error("Error in syncOrderCancellationSideEffects:", error);
    throw error;
  }
};

const updateOrderStatus = async (id, status, currentUser = null, cancelReason = "") => {
  const t = await db.sequelize.transaction();
  try {
    const order = await db.Order.findByPk(id, {
      include: [{ model: db.OrderItem, as: "orderItems" }],
      transaction: t,
    });
    if (!order) {
      await t.rollback();
      return { errCode: 1, errMessage: "Order not found" };
    }

    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "shipped", "shipping", "cancelled"],
      processing: ["shipped", "shipping", "cancelled"],
      shipped: ["delivered", "cancelled"],
      shipping: ["delivered", "cancelled"],
      delivered: ["completed"],
      completed: [],
      cancelled: [],
    };

    const currentStatus = order.status;
    const isCustomer = currentUser && currentUser.role !== "admin";

    if (isCustomer) {
      if (order.userId !== currentUser.id) {
        await t.rollback();
        return { errCode: 403, errMessage: "Forbidden", status: 403 };
      }

      if (status === "cancelled") {
        if (currentStatus === "pending") {
          order.status = "cancelled";
          await syncOrderCancellationSideEffects(order, cancelReason || "Khách hàng hủy đơn.", currentUser, t);
          await t.commit();
          return { errCode: 0, errMessage: "Đã hủy đơn hàng thành công.", data: order };
        } else if (["confirmed", "processing", "shipped", "shipping"].includes(currentStatus)) {
          order.status = "cancel_requested";
          order.cancelReason = cancelReason || "Khách hàng gửi yêu cầu hủy đơn.";
          const history = Array.isArray(order.confirmationHistory) ? order.confirmationHistory : [];
          history.push({
            status: "cancel_requested",
            date: new Date().toISOString(),
            actor: currentUser.username,
            reason: cancelReason,
          });
          order.confirmationHistory = history;
          await order.save({ transaction: t });
          await t.commit();

          await NotificationService.createNotification({
            userId: order.userId,
            title: "Yêu cầu hủy đơn hàng đã gửi",
            content: `Yêu cầu hủy đơn hàng ${order.orderCode} đã được gửi đến Admin để chờ xử lý.`,
            type: "order",
          });

          return { errCode: 0, errMessage: "Đã gửi yêu cầu hủy đơn hàng đến Admin.", data: order };
        } else {
          await t.rollback();
          return { errCode: 2, errMessage: `Không thể hủy đơn hàng ở trạng thái ${currentStatus}.` };
        }
      } else if (status === "completed" && (currentStatus === "delivered" || currentStatus === "shipped" || currentStatus === "shipping")) {
        order.status = "completed";
      } else {
        await t.rollback();
        return { errCode: 2, errMessage: "Khách hàng không được chuyển trạng thái này." };
      }
    } else {
      if (!validTransitions[currentStatus]?.includes(status) && currentStatus !== "cancel_requested") {
        await t.rollback();
        return { errCode: 2, errMessage: `Invalid transition from ${currentStatus} to ${status}` };
      }

      order.status = status;
      if (status === "cancelled") {
        await syncOrderCancellationSideEffects(order, cancelReason || "Admin hủy đơn.", currentUser, t);
      }
    }

    // Khi đơn hàng giao thành công (delivered) hoặc khách xác nhận đã nhận hàng (completed)
    // Tự động chuyển trạng thái thanh toán sang 'paid' và đồng bộ bản ghi Payment
    if (["delivered", "completed"].includes(status)) {
      order.paymentStatus = "paid";
      if (!order.deliveredAt) {
        order.deliveredAt = new Date();
      }

      const existingPayment = await db.Payment.findOne({
        where: { orderId: order.id },
        transaction: t,
      });

      if (existingPayment) {
        await existingPayment.update(
          {
            status: "completed",
            paymentDate: existingPayment.paymentDate || new Date(),
          },
          { transaction: t }
        );
      } else {
        await db.Payment.create(
          {
            orderId: order.id,
            userId: order.userId,
            amount: order.totalPrice,
            method: order.paymentMethod || "cod",
            status: "completed",
            paymentDate: new Date(),
          },
          { transaction: t }
        );
      }
    }

    const history = Array.isArray(order.confirmationHistory) ? order.confirmationHistory : [];
    history.push({
      status,
      date: new Date().toISOString(),
      actor: currentUser ? currentUser.username : "system",
      reason: cancelReason || "",
    });
    order.confirmationHistory = history;

    await order.save({ transaction: t });
    await t.commit();

    if (status === "delivered" || status === "completed") {
      const user = await db.User.findByPk(order.userId);
      if (user && status === "delivered") {
        await sendOrderDeliveredEmail(user, order);
      }
    } else if (status === "confirmed") {
      const user = await db.User.findByPk(order.userId);
      if (user) {
        await sendOrderConfirmedEmail(user, order);
      }
    }

    return { errCode: 0, errMessage: "Cập nhật trạng thái đơn hàng thành công!", data: order };

  } catch (e) {
    if (t && !t.finished) await t.rollback();
    console.error("Error in updateOrderStatus:", e);
    return { errCode: 3, errMessage: e.message || "Lỗi cập nhật trạng thái đơn hàng." };
  }
};

const deleteOrder = async (id) => {
  try {
    const order = await db.Order.findByPk(id);
    if (!order) return { errCode: 1, errMessage: "Order not found" };

    await order.destroy();
    return { errCode: 0, errMessage: "Order deleted successfully" };
  } catch (e) {
    console.error("Error in deleteOrder:", e);
    throw e;
  }
};

const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const order = await db.Order.findByPk(id);
    if (!order) return { errCode: 1, errMessage: "Order not found" };

    order.paymentStatus = paymentStatus;
    await order.save();

    return { errCode: 0, errMessage: "Payment status updated", data: order };
  } catch (e) {
    console.error("Error in updatePaymentStatus:", e);
    throw e;
  }
};

const getOrderByCode = async (orderCode) => {
  try {
    const order = await db.Order.findOne({
      where: { orderCode },
      include: [
        { model: db.User, as: "user", attributes: ["id", "username", "email", "phone"] },
        { model: db.OrderItem, as: "orderItems" },
        { model: db.Payment, as: "payment" },
      ],
    });
    if (!order) return { errCode: 1, errMessage: "Order not found" };
    return { errCode: 0, data: order };
  } catch (e) {
    console.error("Error in getOrderByCode:", e);
    throw e;
  }
};

const requestReturn = async (orderId, reason, user) => {
  const t = await db.sequelize.transaction();
  try {
    const order = await db.Order.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return { errCode: 1, errMessage: "Không tìm thấy đơn hàng." };
    }

    if (order.userId !== user.id && user.role !== "admin") {
      await t.rollback();
      return { errCode: 403, errMessage: "Forbidden" };
    }

    if (order.status !== "delivered" && order.status !== "completed") {
      await t.rollback();
      return { errCode: 2, errMessage: "Chỉ đơn hàng đã giao thành công mới có thể yêu cầu trả hàng." };
    }

    order.returnStatus = "requested";
    order.returnReason = reason;
    await order.save({ transaction: t });

    await t.commit();
    return { errCode: 0, errMessage: "Yêu cầu trả hàng đã được gửi thành công." };
  } catch (error) {
    await t.rollback();
    console.error("requestReturn error:", error);
    return { errCode: -1, errMessage: error.message };
  }
};

const handleReturnAction = async (orderItemId, action, adminUser) => {
  const t = await db.sequelize.transaction();
  try {
    const orderItem = await db.OrderItem.findByPk(orderItemId, {
      include: [{ model: db.Order, as: "order" }],
      transaction: t,
    });

    if (!orderItem) {
      await t.rollback();
      return { errCode: 1, errMessage: "Không tìm thấy chi tiết sản phẩm đơn hàng." };
    }

    if (action === "approve") {
      orderItem.returnStatus = "approved";
      orderItem.returnProcessedAt = new Date();

      await NotificationService.createNotification({
        userId: orderItem.order.userId,
        title: "Yêu cầu trả hàng đã được duyệt",
        content: `Yêu cầu trả lại sản phẩm "${orderItem.productName}" đã được duyệt. Chúng tôi sẽ sớm liên hệ để thực hiện hoàn tiền/thu hồi.`,
        type: "order"
      }, t);

    } else if (action === "reject") {
      orderItem.returnStatus = "rejected";
      orderItem.returnProcessedAt = new Date();

      await NotificationService.createNotification({
        userId: orderItem.order.userId,
        title: "Yêu cầu trả hàng bị từ chối",
        content: `Yêu cầu trả lại sản phẩm "${orderItem.productName}" không được chấp nhận.`,
        type: "order"
      }, t);
    } else {
      await t.rollback();
      return { errCode: 3, errMessage: "Hành động không hợp lệ." };
    }

    await orderItem.save({ transaction: t });
    await t.commit();
    return { errCode: 0, errMessage: "Xử lý yêu cầu trả hàng thành công." };
  } catch (error) {
    await t.rollback();
    console.error("handleReturnAction error:", error);
    return { errCode: -1, errMessage: error.message };
  }
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
  syncOrderCancellationSideEffects,
  requestReturn,
  handleReturnAction,
};
