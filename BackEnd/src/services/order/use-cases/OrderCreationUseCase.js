const db = require("../../../models");
const VoucherService = require("../../marketing/VoucherService");
const SystemSettingService = require("../../system/SystemSettingService");
const { sendOrderCreatedEmail } = require("../../common/EmailService");

const createOrder = async (data, actor = null) => {
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

    // SECURITY: Always enforce effectiveUserId based on caller
    let effectiveUserId = data.userId;
    if (actor && actor.role !== "admin") {
      effectiveUserId = actor.id;
    } else if (!effectiveUserId && actor) {
      effectiveUserId = actor.id;
    }

    if (!effectiveUserId || !shippingAddress || !orderItems.length) {
      await t.rollback();
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
        transaction: t,
      });
      const primaryImage = productImages.find((img) => img.isPrimary) || productImages[0];
      const variantImage = variant
        ? productImages.find((img) => img.variantId === variant.id) || primaryImage
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
      // SECURITY: Validate voucher strictly for the effective user
      const voucherRes = await VoucherService.checkVoucher(voucherCode, calculatedTotal, effectiveUserId);
      if (voucherRes.errCode === 0) {
        appliedVoucher = await db.Voucher.findOne({ where: { code: voucherCode }, transaction: t });
        discountAmount = voucherRes.data.discountAmount;
        await appliedVoucher.increment("usedCount", { by: 1, transaction: t });
      } else {
        await t.rollback();
        return voucherRes;
      }
    }

    const selectedPaymentMethod = (paymentMethod || "cod").toLowerCase();

    // Check payment method settings
    const isPaymentEnabled = await SystemSettingService.getSetting(
      `PAYMENT_${selectedPaymentMethod.toUpperCase()}_ENABLED`,
      true
    );
    if (isPaymentEnabled === false || isPaymentEnabled === "false") {
      await t.rollback();
      return {
        errCode: 1,
        errMessage: `Phương thức thanh toán ${selectedPaymentMethod.toUpperCase()} hiện đang tạm ngưng phục vụ trên hệ thống.`,
      };
    }

    const defaultShippingFee = Number(await SystemSettingService.getSetting("DEFAULT_SHIPPING_FEE", 30000)) || 30000;
    const freeshipThreshold = Number(await SystemSettingService.getSetting("FREESHIP_MIN_ORDER", 500000)) || 500000;
    const shippingFee = calculatedTotal >= freeshipThreshold ? 0 : defaultShippingFee;
    const finalTotal = Math.max(0, calculatedTotal + shippingFee - discountAmount);

    const order = await db.Order.create(
      {
        orderCode,
        userId: effectiveUserId,
        totalPrice: finalTotal,
        discountAmount,
        voucherCode: voucherCode || null,
        shippingAddress,
        receiverName: receiverName || null,
        receiverPhone: receiverPhone || null,
        paymentMethod: selectedPaymentMethod,
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

    if (voucherCode && appliedVoucher) {
      await db.VoucherUsage.create(
        {
          voucherId: appliedVoucher.id,
          userId: effectiveUserId,
          orderId: order.id,
          discountAmount,
          status: "used",
        },
        { transaction: t }
      );
    }

    // SECURITY: Delete cart belonging only to the effective user
    const cart = await db.Cart.findOne({ where: { userId: effectiveUserId }, transaction: t });
    if (cart) {
      await db.CartItem.destroy({
        where: { cartId: cart.id },
        transaction: t,
      });
    }

    await t.commit();

    // Async Email Notifications
    setImmediate(async () => {
      try {
        const user = await db.User.findByPk(effectiveUserId, {
          attributes: ["id", "username", "email", "phone", "receiveEmail"],
        });

        const notifyUser = await SystemSettingService.getSetting(
          "EMAIL_NOTIFY_USER_ORDER_CREATED",
          true
        );
        if (notifyUser && user?.email) {
          await sendOrderCreatedEmail(user, order);
        }
      } catch (mailErr) {
        console.error("Order creation email error:", mailErr.message);
      }
    });

    return { errCode: 0, errMessage: "Create order successfully", data: order };
  } catch (e) {
    await t.rollback();
    console.error("Error in createOrder:", e);
    return { errCode: 2, errMessage: e.message || "Lỗi tạo đơn hàng." };
  }
};

module.exports = {
  createOrder,
};
