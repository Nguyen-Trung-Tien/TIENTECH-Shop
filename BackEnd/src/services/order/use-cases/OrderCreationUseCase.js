const crypto = require("crypto");
const { Op } = require("sequelize");
const db = require("../../../models");
const VoucherService = require("../../marketing/VoucherService");
const SystemSettingService = require("../../system/SystemSettingService");
const {
  sendOrderCreatedEmail,
  sendAdminNewOrderEmail,
} = require("../../common/EmailService");
const {
  acquireLock,
  releaseLock,
  deleteCache,
  deleteCacheByPattern,
} = require("../../../config/redis");
const { calculateFinalPrice } = require("../../../utils/priceHelper");
const {
  POINT_VALUE_VND,
  calculateMaxUsablePoints,
} = require("../../../utils/loyaltyHelper");
const { getUserProfileKey } = require("../../user/AuthHelper");

const createOrder = async (data, actor = null) => {
  // SECURITY: Always enforce effectiveUserId based on caller
  const isElevated = actor && ["admin", "root"].includes(actor.role);
  let effectiveUserId = data.userId;
  if (actor && !isElevated) {
    effectiveUserId = actor.id;
  } else if (!effectiveUserId && actor) {
    effectiveUserId = actor.id;
  }

  if (!effectiveUserId) {
    return {
      errCode: 1,
      errMessage: "Missing required fields (userId)",
    };
  }

  const lockKey = `order_create:${effectiveUserId}`;
  const lockToken = await acquireLock(lockKey, 8);
  if (!lockToken) {
    return {
      errCode: 429,
      errMessage:
        "Hệ thống đang xử lý đơn hàng của bạn, vui lòng không nhấn đặt hàng liên tục.",
    };
  }

  const t = await db.sequelize.transaction();
  try {
    const {
      shippingAddress,
      receiverName,
      receiverPhone,
      paymentMethod,
      note,
      orderItems = [],
      voucherCode,
    } = data;

    if (!shippingAddress || !orderItems.length) {
      await t.rollback();
      return {
        errCode: 1,
        errMessage: "Missing required fields (shippingAddress, orderItems)",
      };
    }

    const orderCode = `ORD${Date.now()}${crypto.randomInt(100, 999)}`;
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

      if (product.hasVariants && !item.variantId) {
        await t.rollback();
        return {
          errCode: 4,
          errMessage: `Vui lòng chọn phiên bản cho sản phẩm ${product.name}.`,
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
        await product.decrement("totalStock", { by: quantity, transaction: t });
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

      const unitPrice = calculateFinalPrice(product, variant);

      const subtotal = Number((unitPrice * quantity).toFixed(2));
      calculatedTotal += subtotal;

      await product.increment("sold", { by: quantity, transaction: t });

      const productImages = await db.ProductImage.findAll({
        where: { productId: product.id },
        transaction: t,
      });
      const primaryImage =
        productImages.find((img) => img.isPrimary) || productImages[0];
      const variantImage = variant
        ? productImages.find((img) => img.variantId === variant.id) ||
          primaryImage
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
      // SECURITY: Validate voucher strictly for the effective user and lock row to prevent race conditions
      const voucherRes = await VoucherService.checkVoucher(
        voucherCode,
        calculatedTotal,
        effectiveUserId,
      );
      if (voucherRes.errCode === 0) {
        appliedVoucher = await db.Voucher.findOne({
          where: { code: voucherCode },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (
          !appliedVoucher ||
          !appliedVoucher.isActive ||
          (appliedVoucher.maxUsage != null &&
            appliedVoucher.usedCount >= appliedVoucher.maxUsage)
        ) {
          await t.rollback();
          return {
            errCode: 1,
            errMessage: "Voucher đã hết lượt sử dụng hoặc không còn hiệu lực.",
          };
        }
        if (appliedVoucher.perUserUsage != null) {
          const userUsedCount = await db.VoucherUsage.count({
            where: {
              voucherId: appliedVoucher.id,
              userId: effectiveUserId,
              status: { [Op.ne]: "cancelled" },
            },
            transaction: t,
          });
          if (userUsedCount >= appliedVoucher.perUserUsage) {
            await t.rollback();
            return {
              errCode: 1,
              errMessage: "Bạn đã sử dụng hết lượt cho phép của voucher này.",
            };
          }
        }
        discountAmount = Math.min(
          calculatedTotal,
          Number(voucherRes.data.discountAmount || 0),
        );
        await appliedVoucher.increment("usedCount", { by: 1, transaction: t });
      } else {
        await t.rollback();
        return voucherRes;
      }
    }

    const subtotalAfterVoucher = Math.max(0, calculatedTotal - discountAmount);
    const requestedPoints = Math.max(0, Math.floor(Number(data.pointsUsed) || 0));
    let actualPointsUsed = 0;
    let pointsDiscount = 0;

    if (requestedPoints > 0) {
      const loyaltyUser = await db.User.findByPk(effectiveUserId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!loyaltyUser) {
        await t.rollback();
        return { errCode: 1, errMessage: "Người dùng không tồn tại." };
      }

      const availablePoints = Math.max(0, Number(loyaltyUser.points || 0));
      if (requestedPoints > availablePoints) {
        await t.rollback();
        return {
          errCode: 1,
          errMessage: `Số điểm tích lũy không đủ (hiện có ${availablePoints} điểm).`,
        };
      }

      const maxUsablePoints = calculateMaxUsablePoints(subtotalAfterVoucher);
      actualPointsUsed = Math.min(requestedPoints, maxUsablePoints);
      pointsDiscount = actualPointsUsed * POINT_VALUE_VND;

      if (actualPointsUsed > 0) {
        await loyaltyUser.decrement("points", {
          by: actualPointsUsed,
          transaction: t,
        });
      }
    }

    const selectedPaymentMethod = (paymentMethod || "cod").toLowerCase();

    // Check payment method settings
    const isPaymentEnabled = await SystemSettingService.getSetting(
      `PAYMENT_${selectedPaymentMethod.toUpperCase()}_ENABLED`,
      true,
    );
    if (isPaymentEnabled === false || isPaymentEnabled === "false") {
      await t.rollback();
      return {
        errCode: 1,
        errMessage: `Phương thức thanh toán ${selectedPaymentMethod.toUpperCase()} hiện đang tạm ngưng phục vụ trên hệ thống.`,
      };
    }

    const defaultShippingFee =
      Number(
        await SystemSettingService.getSetting("DEFAULT_SHIPPING_FEE", 30000),
      ) || 30000;
    const freeshipThreshold =
      Number(
        await SystemSettingService.getSetting("FREESHIP_MIN_ORDER", 500000),
      ) || 500000;
    const shippingFee =
      calculatedTotal >= freeshipThreshold ? 0 : defaultShippingFee;
    const finalTotal = Math.max(
      0,
      subtotalAfterVoucher + shippingFee - pointsDiscount,
    );

    const isPaypalPaid =
      selectedPaymentMethod === "paypal" &&
      data.paymentStatus === "paid" &&
      Boolean(data.paypalDetails?.id) &&
      String(data.paypalDetails?.status || "").toUpperCase() === "COMPLETED";

    if (
      selectedPaymentMethod === "paypal" &&
      data.paymentStatus === "paid" &&
      !isPaypalPaid
    ) {
      await t.rollback();
      return {
        errCode: 1,
        errMessage: "Xác thực thanh toán PayPal không hợp lệ hoặc chưa hoàn tất.",
      };
    }

    const order = await db.Order.create(
      {
        orderCode,
        userId: effectiveUserId,
        totalPrice: finalTotal,
        discountAmount,
        pointsUsed: actualPointsUsed,
        pointsDiscount,
        voucherCode: voucherCode || null,
        shippingAddress,
        receiverName: receiverName || null,
        receiverPhone: receiverPhone || null,
        paymentMethod: selectedPaymentMethod,
        note: note || "",
        paymentStatus: isPaypalPaid ? "paid" : "unpaid",
        status: isPaypalPaid ? "confirmed" : "pending",
        orderItems: formattedItems,
      },
      {
        include: [{ model: db.OrderItem, as: "orderItems" }],
        transaction: t,
      },
    );

    if (isPaypalPaid && db.Payment) {
      await db.Payment.create(
        {
          orderId: order.id,
          userId: effectiveUserId,
          amount: finalTotal,
          method: "paypal",
          transactionId: String(data.paypalDetails.id),
          status: "completed",
          paymentDate: new Date(),
          note: "PayPal Checkout Capture",
        },
        { transaction: t },
      );
    }

    if (voucherCode && appliedVoucher) {
      await db.VoucherUsage.create(
        {
          voucherId: appliedVoucher.id,
          userId: effectiveUserId,
          orderId: order.id,
          discountAmount,
          status: "used",
        },
        { transaction: t },
      );
    }

    // SECURITY: Remove only purchased items from the effective user's cart
    // (skip when checkoutMode === "buy_now" so "Mua ngay" remains independent from cart)
    if (data.checkoutMode !== "buy_now") {
      const cart = await db.Cart.findOne({
        where: { userId: effectiveUserId },
        transaction: t,
      });
      if (cart) {
        const { Op } = require("sequelize");
        const itemPairs = formattedItems.map((it) => ({
          productId: it.productId,
          variantId: it.variantId || null,
        }));
        await db.CartItem.destroy({
          where: {
            cartId: cart.id,
            [Op.or]: itemPairs,
          },
          transaction: t,
        });
      }
    }

    await t.commit();

    try {
      await Promise.all([
        deleteCacheByPattern("dashboard_*"),
        deleteCacheByPattern("products_*"),
        deleteCacheByPattern("home_page_*"),
        deleteCacheByPattern("flash_sale_*"),
        ...(actualPointsUsed > 0 ? [deleteCache(getUserProfileKey(effectiveUserId))] : []),
      ]);
    } catch (cacheErr) {
      console.warn("Failed to invalidate caches after order creation:", cacheErr?.message);
    }

    // Async Email Notifications
    setImmediate(async () => {
      try {
        const user = await db.User.findByPk(effectiveUserId, {
          attributes: ["id", "username", "email", "phone", "receiveEmail"],
        });

        const [notifyUser, notifyAdmin] = await Promise.all([
          SystemSettingService.getSetting("EMAIL_NOTIFY_USER_ORDER_CREATED", true),
          SystemSettingService.getSetting("EMAIL_NOTIFY_ADMIN_NEW_ORDER", true),
        ]);

        if (notifyUser && notifyUser !== "false" && user?.email) {
          await sendOrderCreatedEmail(user, order);
        }

        if (notifyAdmin && notifyAdmin !== "false") {
          const adminEmail =
            (await SystemSettingService.getSetting("ADMIN_NOTIFICATION_EMAIL", "")) ||
            (await SystemSettingService.getSetting("STORE_EMAIL", "")) ||
            process.env.EMAIL_USER ||
            "";
          if (adminEmail) {
            await sendAdminNewOrderEmail(adminEmail, order, user);
          }
        }
      } catch (mailErr) {
        if (!String(mailErr?.message || "").includes("connection manager was closed")) {
          console.error("Order creation email error:", mailErr.message);
        }
      }
    });

    return { errCode: 0, errMessage: "Create order successfully", data: order };
  } catch (e) {
    await t.rollback();
    console.error("Error in createOrder:", e);
    return { errCode: 2, errMessage: e.message || "Lỗi tạo đơn hàng." };
  } finally {
    if (lockToken) {
      await releaseLock(lockKey, lockToken);
    }
  }
};

module.exports = {
  createOrder,
};
