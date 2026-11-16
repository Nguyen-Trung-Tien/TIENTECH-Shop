const db = require("../../models");

const pickAddressFields = (data = {}) => {
  const fields = {};
  if (data.fullName !== undefined) fields.fullName = data.fullName;
  if (data.phone !== undefined) fields.phone = data.phone;
  if (data.province !== undefined) fields.province = data.province;
  if (data.ward !== undefined) fields.ward = data.ward;
  if (data.detailAddress !== undefined) fields.detailAddress = data.detailAddress;
  if (data.isDefault !== undefined) fields.isDefault = Boolean(data.isDefault);
  return fields;
};

const createAddress = async (userId, data) => {
  const t = await db.sequelize.transaction();
  try {
    const safeData = pickAddressFields(data);
    const count = await db.UserAddress.count({
      where: { userId },
      transaction: t,
    });
    if (count === 0) {
      safeData.isDefault = true;
    } else if (safeData.isDefault) {
      await db.UserAddress.update(
        { isDefault: false },
        { where: { userId, isDefault: true }, transaction: t }
      );
    }

    const address = await db.UserAddress.create(
      {
        ...safeData,
        userId,
      },
      { transaction: t }
    );

    await t.commit();
    return { errCode: 0, errMessage: "Thêm địa chỉ thành công", data: address };
  } catch (error) {
    await t.rollback();
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
  const t = await db.sequelize.transaction();
  try {
    const address = await db.UserAddress.findOne({
      where: { id: addressId, userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!address) {
      await t.rollback();
      return { errCode: 1, errMessage: "Không tìm thấy địa chỉ" };
    }

    const safeData = pickAddressFields(data);
    if (safeData.isDefault && !address.isDefault) {
      await db.UserAddress.update(
        { isDefault: false },
        { where: { userId, isDefault: true }, transaction: t }
      );
    }

    await address.update(safeData, { transaction: t });
    await t.commit();
    return { errCode: 0, errMessage: "Cập nhật địa chỉ thành công", data: address };
  } catch (error) {
    await t.rollback();
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
  const t = await db.sequelize.transaction();
  try {
    const address = await db.UserAddress.findOne({
      where: { id: addressId, userId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!address) {
      await t.rollback();
      return { errCode: 1, errMessage: "Không tìm thấy địa chỉ" };
    }

    await db.UserAddress.update(
      { isDefault: false },
      { where: { userId, isDefault: true }, transaction: t }
    );
    await address.update({ isDefault: true }, { transaction: t });
    await t.commit();

    return { errCode: 0, errMessage: "Đã thiết lập địa chỉ mặc định" };
  } catch (error) {
    await t.rollback();
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
