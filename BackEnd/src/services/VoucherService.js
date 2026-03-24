const db = require("../models");
const { Op } = require("sequelize");

const createVoucher = async (data) => {
  try {
    const existing = await db.Voucher.findOne({ where: { code: data.code } });
    if (existing) {
      return { errCode: 1, errMessage: "Mã giảm giá đã tồn tại." };
    }

    // Clean up numeric fields that might be empty strings from frontend
    const voucherData = { ...data };
    if (voucherData.minOrderValue === "") voucherData.minOrderValue = 0;
    if (voucherData.maxDiscount === "") voucherData.maxDiscount = null;
    if (voucherData.maxUsage === "") voucherData.maxUsage = 100;
    if (voucherData.perUserUsage === "") voucherData.perUserUsage = 1;

    const voucher = await db.Voucher.create(voucherData);
    return { errCode: 0, data: voucher };
  } catch (error) {
    console.error("Error creating voucher:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const validateVoucher = async (code, orderTotal, userId = null) => {
  try {
    const voucher = await db.Voucher.findOne({
      where: {
        code,
        isActive: true,
        expiryDate: { [Op.gt]: new Date() },
      },
    });

    if (!voucher) {
      return { errCode: 1, errMessage: "Mã giảm giá không hợp lệ hoặc đã hết hạn." };
    }

    if (voucher.usedCount >= voucher.maxUsage) {
      return { errCode: 2, errMessage: "Mã giảm giá đã hết lượt sử dụng." };
    }

    if (userId) {
      const userUsageCount = await db.VoucherUsage.count({
        where: {
          voucherId: voucher.id,
          userId: userId,
          status: { [Op.ne]: "cancelled" },
        },
      });

      if (userUsageCount >= (voucher.perUserUsage || 1)) {
        return { errCode: 4, errMessage: "Bạn đã sử dụng mã này rồi." };
      }
    }

    if (orderTotal < voucher.minOrderValue) {
      return {
        errCode: 3,
        errMessage: `Đơn hàng tối thiểu ${parseFloat(voucher.minOrderValue).toLocaleString()}₫ để dùng mã này.`,
      };
    }

    let discount = 0;
    const voucherValue = Number(voucher.value);
    if (voucher.type === "percentage") {
      discount = (orderTotal * voucherValue) / 100;
      if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
        discount = Number(voucher.maxDiscount);
      }
    } else {
      discount = voucherValue;
    }

    return {
      errCode: 0,
      message: "Mã giảm giá hợp lệ.",
      data: {
        id: voucher.id,
        code: voucher.code,
        type: voucher.type,
        value: voucherValue,
        discountAmount: Number(Number(discount).toFixed(2)),
      },
    };
  } catch (error) {
    console.error("Error validating voucher:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const checkVoucher = async (code, orderTotal, userId = null) => {
  return await validateVoucher(code, orderTotal, userId);
};

const applyVoucher = async ({ code, orderTotal, userId, orderId = null }) => {
  const t = await db.sequelize.transaction();
  try {
    const validation = await validateVoucher(code, orderTotal, userId);
    if (validation.errCode !== 0) {
      await t.rollback();
      return validation;
    }

    const voucher = await db.Voucher.findByPk(validation.data.id, { transaction: t });
    
    // Create usage record
    const usage = await db.VoucherUsage.create({
      voucherId: voucher.id,
      userId: userId,
      orderId: orderId,
      discountAmount: validation.data.discountAmount,
      status: orderId ? "used" : "applied",
    }, { transaction: t });

    // Increment used count
    await voucher.increment("usedCount", { by: 1, transaction: t });

    await t.commit();
    return {
      errCode: 0,
      message: "Áp dụng mã thành công!",
      data: {
        usageId: usage.id,
        discountAmount: validation.data.discountAmount,
        code: voucher.code,
      }
    };
  } catch (error) {
    await t.rollback();
    console.error("Error applying voucher:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const getAllVouchers = async () => {
  try {
    const vouchers = await db.Voucher.findAll({
      order: [["createdAt", "DESC"]],
    });
    return { errCode: 0, data: vouchers };
  } catch (error) {
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const updateVoucher = async (id, data) => {
  try {
    const voucher = await db.Voucher.findByPk(id);
    if (!voucher) return { errCode: 1, errMessage: "Không tìm thấy mã giảm giá." };

    if (data.code && data.code !== voucher.code) {
      const existing = await db.Voucher.findOne({ where: { code: data.code } });
      if (existing) return { errCode: 2, errMessage: "Mã giảm giá đã tồn tại." };
    }

    // Clean up numeric fields
    const voucherData = { ...data };
    if (voucherData.minOrderValue === "") voucherData.minOrderValue = 0;
    if (voucherData.maxDiscount === "") voucherData.maxDiscount = null;
    if (voucherData.maxUsage === "") voucherData.maxUsage = 100;
    if (voucherData.perUserUsage === "") voucherData.perUserUsage = 1;

    await voucher.update(voucherData);
    return { errCode: 0, data: voucher };
  } catch (error) {
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const deleteVoucher = async (id) => {
  try {
    const voucher = await db.Voucher.findByPk(id);
    if (!voucher) return { errCode: 1, errMessage: "Không tìm thấy mã giảm giá." };
    await voucher.destroy();
    return { errCode: 0, message: "Xóa thành công." };
  } catch (error) {
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const getActiveVouchers = async () => {
  try {
    const vouchers = await db.Voucher.findAll({
      where: {
        isActive: true,
        expiryDate: { [Op.gt]: new Date() },
      },
      order: [["expiryDate", "ASC"]],
    });
    return { errCode: 0, data: vouchers };
  } catch (error) {
    console.error("Error fetching active vouchers:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

module.exports = {
  createVoucher,
  validateVoucher,
  checkVoucher,
  applyVoucher,
  getAllVouchers,
  getActiveVouchers,
  updateVoucher,
  deleteVoucher,
};
