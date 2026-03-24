const db = require("../models");

const getAllOrderItems = async () => {
  try {
    const orderItems = await db.OrderItem.findAll({
      include: [
        {
          model: db.Order,
          as: "order",
          attributes: [
            "id",
            "status",
            "confirmationHistory",
            "shippingAddress",
            "orderDate",
          ],
        },
        {
          model: db.Product,
          as: "product",
          attributes: ["id", "name", "basePrice"],
          include: [
            {
              model: db.ProductImage,
              as: "images",
              attributes: ["imageUrl", "isPrimary"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = orderItems.map((item) => {
      const it = item.toJSON();
      if (it.product) {
        const primaryImage = it.product.images?.find(img => img.isPrimary) || it.product.images?.[0];
        it.product.image = primaryImage ? primaryImage.imageUrl : null;
        it.product.price = it.product.basePrice;
      }
      return it;
    });

    return { errCode: 0, errMessage: "OK", data };
  } catch (e) {
    console.error("Error getAllOrderItems:", e);
    throw e;
  }
};

const getOrderItemById = async (id) => {
  try {
    const item = await db.OrderItem.findByPk(id, {
      include: [
        {
          model: db.Order,
          as: "order",
          attributes: [
            "id",
            "status",
            "confirmationHistory",
            "shippingAddress",
            "orderDate",
          ],
        },
        {
          model: db.Product,
          as: "product",
          attributes: ["id", "name", "basePrice"],
          include: [
            {
              model: db.ProductImage,
              as: "images",
              attributes: ["imageUrl", "isPrimary"],
            },
          ],
        },
      ],
    });

    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    const it = item.toJSON();
    if (it.product) {
      const primaryImage = it.product.images?.find(img => img.isPrimary) || it.product.images?.[0];
      it.product.image = primaryImage ? primaryImage.imageUrl : null;
      it.product.price = it.product.basePrice;
    }

    return { errCode: 0, errMessage: "OK", data: it };
  } catch (e) {
    console.error("Error getOrderItemById:", e);
    throw e;
  }
};

const createOrderItem = async (data) => {
  try {
    const {
      orderId,
      productId,
      quantity,
      price,
      subtotal,
      productName,
      image,
    } = data;

    const newItem = await db.OrderItem.create({
      orderId,
      productId,
      quantity,
      price,
      subtotal,
      productName,
      image: image ? Buffer.from(image.split(",")[1], "base64") : null,
    });

    return {
      errCode: 0,
      errMessage: "OrderItem created successfully",
      data: newItem,
    };
  } catch (e) {
    console.error("Error createOrderItem:", e);
    throw e;
  }
};

const updateOrderItem = async (id, data) => {
  try {
    const item = await db.OrderItem.findByPk(id);
    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    await item.update(data);
    return {
      errCode: 0,
      errMessage: "OrderItem updated successfully",
      data: item,
    };
  } catch (e) {
    console.error("Error updateOrderItem:", e);
    throw e;
  }
};

const deleteOrderItem = async (id) => {
  try {
    const item = await db.OrderItem.findByPk(id);
    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    await item.destroy();
    return { errCode: 0, errMessage: "OrderItem deleted successfully" };
  } catch (e) {
    console.error("Error deleteOrderItem:", e);
    throw e;
  }
};

const requestReturn = async (id, reason) => {
  try {
    const item = await db.OrderItem.findByPk(id);
    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    item.returnStatus = "requested";
    item.returnReason = reason;
    item.returnRequestedAt = new Date();
    await item.save();

    return { errCode: 0, errMessage: "Return request submitted", data: item };
  } catch (e) {
    console.error("Error requestReturn:", e);
    throw e;
  }
};

const processReturn = async (id, status) => {
  try {
    const item = await db.OrderItem.findByPk(id);
    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    if (!["approved", "rejected", "completed"].includes(status)) {
      return { errCode: 2, errMessage: "Invalid return status" };
    }

    item.returnStatus = status;
    item.returnProcessedAt = new Date();
    await item.save();

    return { errCode: 0, errMessage: "Return processed", data: item };
  } catch (e) {
    console.error("Error processReturn:", e);
    throw e;
  }
};

module.exports = {
  getAllOrderItems,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  requestReturn,
  processReturn,
};
