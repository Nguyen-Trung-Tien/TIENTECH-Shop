const db = require("../models");

const createAddress = async (userId, data) => {
  try {
    // If this is the first address, make it default
    const count = await db.UserAddress.count({ where: { userId } });
    if (count === 0) {
      data.isDefault = true;
    } else if (data.isDefault) {
      // If setting this as default, unset other defaults
      await db.UserAddress.update({ isDefault: false }, { where: { userId, isDefault: true } });
    }

    const address = await db.UserAddress.create({
      userId,
      ...data,
    });

    return { errCode: 0, errMessage: "Thêm địa chỉ thành công", data: address };
  } catch (error) {
    console.error("createAddress error:", error);
    return { errCode: 1, errMessage: "Lỗi từ server" };
  }
};

const getAddressesByUserId = async (userId) => {
  try {
    const addresses = await db.UserAddress.findAll({
      where: { userId },
      order: [["isDefault", "DESC"], ["createdAt", "DESC"]],
    });
    return { errCode: 0, data: addresses };
  } catch (error) {
    console.error("getAddressesByUserId error:", error);
    return { errCode: 1, errMessage: "Lỗi từ server" };
  }
};

const updateAddress = async (userId, addressId, data) => {
  try {
    const address = await db.UserAddress.findOne({ where: { id: addressId, userId } });
    if (!address) return { errCode: 1, errMessage: "Không tìm thấy địa chỉ" };

    if (data.isDefault && !address.isDefault) {
      await db.UserAddress.update({ isDefault: false }, { where: { userId, isDefault: true } });
    }

    await address.update(data);
    return { errCode: 0, errMessage: "Cập nhật địa chỉ thành công", data: address };
  } catch (error) {
    console.error("updateAddress error:", error);
    return { errCode: 1, errMessage: "Lỗi từ server" };
  }
};

const deleteAddress = async (userId, addressId) => {
  try {
    const address = await db.UserAddress.findOne({ where: { id: addressId, userId } });
    if (!address) return { errCode: 1, errMessage: "Không tìm thấy địa chỉ" };

    if (address.isDefault) {
        return { errCode: 2, errMessage: "Không thể xóa địa chỉ mặc định" };
    }

    await address.destroy();
    return { errCode: 0, errMessage: "Xóa địa chỉ thành công" };
  } catch (error) {
    console.error("deleteAddress error:", error);
    return { errCode: 1, errMessage: "Lỗi từ server" };
  }
};

const setDefaultAddress = async (userId, addressId) => {
  try {
    const address = await db.UserAddress.findOne({ where: { id: addressId, userId } });
    if (!address) return { errCode: 1, errMessage: "Không tìm thấy địa chỉ" };

    await db.UserAddress.update({ isDefault: false }, { where: { userId, isDefault: true } });
    await address.update({ isDefault: true });

    return { errCode: 0, errMessage: "Đã thiết lập địa chỉ mặc định" };
  } catch (error) {
    console.error("setDefaultAddress error:", error);
    return { errCode: 1, errMessage: "Lỗi từ server" };
  }
};

module.exports = {
  createAddress,
  getAddressesByUserId,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
