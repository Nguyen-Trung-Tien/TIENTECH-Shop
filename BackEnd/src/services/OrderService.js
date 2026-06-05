const db = require("../models");
const { Op } = require("sequelize");
const { sendOrderDeliveredEmail, sendOrderConfirmedEmail } = require("./sendEmail");
const NotificationService = require("./NotificationService");
const PaymentService = require("./PaymentService");

const { getPagination, getPagingData } = require("../utils/paginationHelper");

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
      // Khi lọc trả hàng, ta chỉ lấy những đơn có ít nhất 1 item đang yêu cầu trả
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

    // Map to maintain compatibility
    const mappedOrders = pagingData.items.map(order => {
      const plainOrder = order.toJSON();
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

    // Map results
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

const VoucherService = require("./VoucherService");

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

    // ... (rest of processing items)
    // I need to keep the context for replace to work, so I'll read a bit more or use a smaller range.
    // Actually I'll use a better replace.


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

      // Check stock
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

      // Price logic
      const now = new Date();
      let unitPrice = 0;

      const isFlashSale =
        product.isFlashSale &&
        product.flashSaleStart &&
        product.flashSaleEnd &&
        now >= new Date(product.flashSaleStart) &&
        now <= new Date(product.flashSaleEnd);

      if (isFlashSale && product.flashSalePrice) {
        // ƯU TIÊN 1: Flash Sale (Áp dụng cho toàn bộ sản phẩm)
        unitPrice = Number(product.flashSalePrice);
      } else if (variant) {
        // ƯU TIÊN 2: Giá Variant nếu có
        const originalPrice = Number(variant.price || 0);
        const discount = Number(variant.discount || 0);
        unitPrice = Number((originalPrice * (1 - discount / 100)).toFixed(2));
      } else {
        // ƯU TIÊN 3: Giá gốc sản phẩm
        unitPrice = Number(product.basePrice || 0);
      }

      const subtotal = Number((unitPrice * quantity).toFixed(2));
      calculatedTotal += subtotal;

      await product.increment("sold", { by: quantity, transaction: t });

      // Find product primary image
      const productImages = await db.ProductImage.findAll({ 
        where: { productId: product.id },
        transaction: t
      });
      const primaryImage = productImages.find(img => img.isPrimary) || productImages[0];

      // Find variant image or product primary image
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
    let appliedVoucher = null;

    if (voucherCode) {
      const voucherRes = await VoucherService.checkVoucher(voucherCode, calculatedTotal, userId);
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

    // Ghi nhận lịch sử sử dụng voucher
    if (appliedVoucher) {
      await db.VoucherUsage.create(
        {
          voucherId: appliedVoucher.id,
          userId,
          orderId: order.id,
          discountAmount,
          status: "used",
        },
        { transaction: t }
      );
    }

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

const updateOrderStatus = async (id, status, user = null, reason = "") => {
  const t = await db.sequelize.transaction();
  try {
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "completed",
      "cancelled",
      "cancel_requested",
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

      // Customer can only request cancellation if order is pending or confirmed
      if (status === "cancel_requested") {
        if (!["pending", "confirmed"].includes(order.status)) {
          await t.rollback();
          return {
            errCode: 3,
            errMessage: "Cannot request cancellation for this order status",
            status: 400,
          };
        }
        order.cancelReason = reason;
      } else if (status === "completed" && order.status !== "delivered") {
        await t.rollback();
        return {
          errCode: 4,
          errMessage: "Bạn chỉ có thể xác nhận nhận hàng sau khi Admin đã xác nhận giao thành công",
          status: 400,
        };
      } else if (status === "completed" && order.status === "delivered") {
        // Khách xác nhận đã nhận hàng
        order.status = "completed";
      } else {
        // Customer cannot set other statuses directly (like cancelled, shipped, etc.)
        await t.rollback();
        return { errCode: 403, errMessage: "Forbidden", status: 403 };
      }
    }

    // Admin logic for cancel_requested
    if (user && user.role === "admin" && order.status === "cancel_requested") {
      // If admin sets to cancelled, it's an approval.
      // If admin sets back to pending/confirmed/etc, it's a rejection.
      if (status !== "cancelled") {
        // Notify user about rejection
        await NotificationService.createNotification({
          userId: order.userId,
          title: "Yêu cầu hủy đơn bị từ chối",
          content: `Yêu cầu hủy đơn hàng ${order.orderCode} của bạn đã bị từ chối. Đơn hàng tiếp tục trạng thái: ${status}.`,
          type: "order",
          isRead: false
        }, t);
      }
    }

    const prevStatus = order.status;

    // PREVENT DUPLICATE STOCK REFUND IF ALREADY CANCELLED
    if (status === "cancelled" && prevStatus === "cancelled") {
      await t.rollback();
      return { errCode: 0, errMessage: "Order is already cancelled", data: order };
    }

    // SYNC LOGIC FOR CANCELLATION
    if (status === "cancelled") {
      if (reason) order.cancelReason = reason;
      await syncOrderCancellationSideEffects(order, reason || order.cancelReason, user, t);
    }

    // Capture reason for cancel_requested regardless of user role
    if (status === "cancel_requested") {
      if (reason) order.cancelReason = reason;
      
      await NotificationService.createNotification({
        userId: null, // Admin
        title: "Yêu cầu hủy đơn hàng",
        content: `Khách hàng yêu cầu hủy đơn hàng ${order.orderCode}. Lý do: ${reason || order.cancelReason || "Không có lý do chi tiết"}`,
        type: "order",
        isRead: false
      }, t);
    }

    const history = Array.isArray(order.confirmationHistory)
      ? order.confirmationHistory
      : [];
    history.push({ status, date: new Date().toISOString(), actor: user?.username || "system" });

    order.status = status;
    order.confirmationHistory = history;

    if (!order.orderItems?.length) {
      console.warn("No orderItems found for order:", id);
    }

    // NOTE: Stock is already decremented at order creation (createOrder).
    // On delivery, we only need to record deliveredAt — NOT touch stock again.
    if (
      ["delivered", "completed"].includes(status) &&
      !["delivered", "completed"].includes(prevStatus)
    ) {
      order.deliveredAt = new Date();
      order.paymentStatus = "paid";

      // Cập nhật record Payment tương ứng
      await PaymentService.updatePayment(order.id, {
        paymentStatus: "paid",
        amount: order.totalPrice,
        userId: order.userId,
      });

      // Add loyalty points
      const userToUpdate = await db.User.findByPk(order.userId, { transaction: t });
      if (userToUpdate) {
        const pointsEarned = Math.floor(Number(order.totalPrice) / 10000);
        const newPoints = (userToUpdate.points || 0) + pointsEarned;
        
        let newRank = "Bronze";
        if (newPoints >= 10000) newRank = "Platinum";
        else if (newPoints >= 5000) newRank = "Gold";
        else if (newPoints >= 1000) newRank = "Silver";

        await userToUpdate.update({
          points: newPoints,
          rank: newRank
        }, { transaction: t });
      }
    }

    // When cancelling an order that was NOT yet delivered, refund stock.
    if (
      status === "cancelled" &&
      !["delivered", "completed"].includes(prevStatus)
    ) {
      for (const item of order.orderItems) {
        if (item.variantId) {
          const variant = await db.ProductVariant.findByPk(item.variantId, { transaction: t });
          if (variant) {
            await variant.increment("stock", { by: item.quantity, transaction: t });
            // Cập nhật lại totalStock của sản phẩm cha
            const product = await db.Product.findByPk(item.productId, { transaction: t });
            if (product) {
              await product.increment("totalStock", { by: item.quantity, transaction: t });
            }
          }
        } else {
          const product = await db.Product.findByPk(item.productId, { transaction: t });
          if (product) {
            await product.increment("totalStock", { by: item.quantity, transaction: t });
          }
        }
      }
    }

    // When cancelling an already-delivered order, reverse sold count + refund stock.
    if (
      status === "cancelled" &&
      ["delivered", "completed"].includes(prevStatus)
    ) {
      for (const item of order.orderItems) {
        const product = await db.Product.findByPk(item.productId, { transaction: t });
        if (product) {
          product.sold = Math.max(0, (product.sold || 0) - item.quantity);
          product.totalStock = (product.totalStock || 0) + item.quantity;
          await product.save({ transaction: t });
        }
        if (item.variantId) {
          const variant = await db.ProductVariant.findByPk(item.variantId, { transaction: t });
          if (variant) {
            await variant.increment("stock", { by: item.quantity, transaction: t });
          }
        }
      }
    }

    await order.save({ transaction: t });
    await t.commit();

    if (status === "delivered" || status === "confirmed") {
      const user = await db.User.findByPk(order.userId);
      if (status === "delivered" && prevStatus !== "delivered") {
        await sendOrderDeliveredEmail(user, order);
      } else if (status === "confirmed" && prevStatus !== "confirmed") {
        await sendOrderConfirmedEmail(user, order);
      }
    }

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

const syncOrderCancellationSideEffects = async (order, reason, user = null, t, pointsOverride = null) => {
  // 1. Refund Voucher
  const voucherUsage = await db.VoucherUsage.findOne({
    where: { orderId: order.id, status: "used" },
    transaction: t
  });
  if (voucherUsage) {
    await voucherUsage.update({ status: "cancelled" }, { transaction: t });
    const voucher = await db.Voucher.findByPk(voucherUsage.voucherId, { transaction: t });
    if (voucher) {
      await voucher.decrement("usedCount", { by: 1, transaction: t });
    }
  }

  // 2. Refund Payment
  if (order.paymentStatus === "paid") {
    const payment = await db.Payment.findOne({
      where: { orderId: order.id },
      transaction: t
    });
    if (payment) {
      await PaymentService.refundPayment(payment.id, reason || "Order cancelled", t);
    } else {
      order.paymentStatus = "refunded";
      await order.save({ transaction: t });
    }
  }

  // 3. Deduct Loyalty Points if it was delivered
  const wasDelivered = order.deliveredAt || (Array.isArray(order.confirmationHistory) && order.confirmationHistory.some(h => ["delivered", "completed"].includes(h.status)));

  if (wasDelivered && pointsOverride !== 0) {
    const userToUpdate = await db.User.findByPk(order.userId, { transaction: t });
    if (userToUpdate) {
      const pointsToDeduct = pointsOverride !== null ? pointsOverride : Math.floor(Number(order.totalPrice) / 10000);
      const newPoints = Math.max(0, (userToUpdate.points || 0) - pointsToDeduct);
      
      let newRank = "Bronze";
      if (newPoints >= 10000) newRank = "Platinum";
      else if (newPoints >= 5000) newRank = "Gold";
      else if (newPoints >= 1000) newRank = "Silver";

      await userToUpdate.update({
        points: newPoints,
        rank: newRank
      }, { transaction: t });
    }
  }

  // 4. Notification to User
  await NotificationService.createNotification({
    userId: order.userId,
    title: "Đơn hàng đã bị hủy",
    content: `Đơn hàng ${order.orderCode} của bạn đã bị hủy. Lý do: ${reason || order.cancelReason || "Không có lý do cụ thể."}`,
    type: "order",
    isRead: false
  }, t);
};

const deleteOrder = async (id) => {
  try {
    const order = await db.Order.findByPk(id);
    if (!order) return { errCode: 1, errMessage: "Order not found" };

    if (["paid", "refunded"].includes(order.paymentStatus) || ["delivered", "completed"].includes(order.status)) {
      return {
        errCode: 2,
        errMessage: "Không thể xóa đơn hàng đã thanh toán hoặc đã giao hàng. Vui lòng sử dụng chức năng hủy hoặc trả hàng.",
      };
    }

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

    let shouldSendConfirmedEmail = false;

    // CHỈ XỬ LÝ KHI unpaid → paid
    // NOTE: Stock already decremented at createOrder
    if (order.paymentStatus === "unpaid" && paymentStatus === "paid") {
      order.paymentStatus = "paid";
      
      // Đồng bộ sang bảng Payments
      await PaymentService.updatePayment(order.id, {
        paymentStatus: "paid",
        amount: order.totalPrice,
        userId: order.userId,
      });

      const prevStatus = order.status;
      // Nếu đơn hàng đang chờ xử lý, tự động chuyển sang xác nhận khi đã trả tiền
      if (order.status === "pending") {
        order.status = "confirmed";
      }
      await order.save({ transaction: t });

      if (order.status === "confirmed" && prevStatus !== "confirmed") {
        shouldSendConfirmedEmail = true;
      }
    }

    // refunded
    if (paymentStatus === "refunded") {
      order.paymentStatus = "refunded";
      // Chế độ hoàn tiền thường đi kèm hủy đơn nếu chưa giao
      if (order.status !== "delivered") {
        order.status = "cancelled";
        // Hoàn tồn kho sẽ được xử lý trong logic cancel nếu cần, 
        // nhưng thường updatePaymentStatus(refunded) gọi sau khi đơn đã cancel
      }
      await order.save({ transaction: t });
    }

    await t.commit();

    if (shouldSendConfirmedEmail) {
      const user = await db.User.findByPk(order.userId);
      await sendOrderConfirmedEmail(user, order);
    }

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

  return { errCode: 0, data: order };
};

const requestReturn = async (orderItemId, userId, reason) => {
  const t = await db.sequelize.transaction();
  try {
    const orderItem = await db.OrderItem.findByPk(orderItemId, {
      include: [{ model: db.Order, as: "order" }],
      transaction: t,
    });

    if (!orderItem) {
      await t.rollback();
      return { errCode: 1, errMessage: "Sản phẩm trong đơn hàng không tồn tại." };
    }

    if (String(orderItem.order.userId) !== String(userId)) {
      await t.rollback();
      return { errCode: 403, errMessage: "Bạn không có quyền thực hiện hành động này." };
    }

    if (!["delivered", "completed"].includes(orderItem.order.status)) {
      await t.rollback();
      return { errCode: 2, errMessage: "Chỉ có thể yêu cầu trả hàng sau khi đã nhận hàng thành công." };
    }

    if (orderItem.returnStatus !== "none") {
      await t.rollback();
      return { errCode: 3, errMessage: "Sản phẩm này đã được yêu cầu trả hàng trước đó." };
    }

    orderItem.returnStatus = "requested";
    orderItem.returnReason = reason;
    orderItem.returnRequestedAt = new Date();
    await orderItem.save({ transaction: t });

    await NotificationService.createNotification({
      userId: null, // Admin
      title: "Yêu cầu trả hàng mới",
      content: `Khách hàng yêu cầu trả lại sản phẩm "${orderItem.productName}" trong đơn #${orderItem.order.orderCode}. Lý do: ${reason}`,
      type: "order",
      link: `/admin/orders`
    }, t);

    await t.commit();
    return { errCode: 0, errMessage: "Gửi yêu cầu trả hàng thành công." };
  } catch (error) {
    await t.rollback();
    console.error("requestReturn error:", error);
    return { errCode: -1, errMessage: error.message };
  }
};

const handleReturnAction = async (orderItemId, action, adminId) => {
  const t = await db.sequelize.transaction();
  try {
    const orderItem = await db.OrderItem.findByPk(orderItemId, {
      include: [
        { model: db.Order, as: "order" },
        { model: db.Product, as: "product" }
      ],
      transaction: t,
    });

    if (!orderItem) {
      await t.rollback();
      return { errCode: 1, errMessage: "Không tìm thấy yêu cầu trả hàng." };
    }

    if (orderItem.returnStatus !== "requested") {
      await t.rollback();
      return { errCode: 2, errMessage: "Yêu cầu này không còn ở trạng thái chờ xử lý." };
    }

    if (action === "approve") {
      orderItem.returnStatus = "approved";
      orderItem.returnProcessedAt = new Date();
      
      // Hoàn tồn kho
      if (orderItem.variantId) {
        const variant = await db.ProductVariant.findByPk(orderItem.variantId, { transaction: t });
        if (variant) await variant.increment("stock", { by: orderItem.quantity, transaction: t });
      }
      if (orderItem.product) {
        await orderItem.product.increment("totalStock", { by: orderItem.quantity, transaction: t });
        orderItem.product.sold = Math.max(0, (orderItem.product.sold || 0) - orderItem.quantity);
        await orderItem.product.save({ transaction: t });
      }

      // Xử lý hoàn tiền (Trigger refund logic if paid)
      const order = orderItem.order;
      if (order.paymentStatus === "paid") {
        const payment = await db.Payment.findOne({ where: { orderId: order.id }, transaction: t });
        if (payment) {
          // Ghi nhận note hoàn tiền cho admin xử lý tiếp hoặc gọi API refund phần nhỏ
          payment.note = (payment.note || "") + `\n[Approved Return] Hoàn trả SP: ${orderItem.productName} (${orderItem.subtotal})`;
          await payment.save({ transaction: t });
        }
      }

      await NotificationService.createNotification({
        userId: orderItem.order.userId,
        title: "Yêu cầu trả hàng đã được chấp nhận",
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
