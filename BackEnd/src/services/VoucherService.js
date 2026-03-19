const db = require("../models");
const { Op } = require("sequelize");

const createVoucher = async (data) => {
  try {
    const existing = await db.Voucher.findOne({ where: { code: data.code } });
    if (existing) {
      return { errCode: 1, errMessage: "Mã giảm giá đã tồn tại." };
    }
    const voucher = await db.Voucher.create(data);
    return { errCode: 0, data: voucher };
  } catch (error) {
    console.error("Error creating voucher:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const checkVoucher = async (code, orderTotal) => {
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

    if (orderTotal < voucher.minOrderValue) {
      return {
        errCode: 3,
        errMessage: `Đơn hàng tối thiểu ${parseFloat(voucher.minOrderValue).toLocaleString()}₫ để dùng mã này.`,
      };
    }

    let discount = 0;
    if (voucher.type === "percentage") {
      discount = (orderTotal * voucher.value) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.value;
    }

    return {
      errCode: 0,
      message: "Áp dụng mã thành công!",
      data: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        discountAmount: discount,
      },
    };
  } catch (error) {
    console.error("Error checking voucher:", error);
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

    await voucher.update(data);
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

module.exports = {
  createVoucher,
  checkVoucher,
  getAllVouchers,
  updateVoucher,
  deleteVoucher,
};
