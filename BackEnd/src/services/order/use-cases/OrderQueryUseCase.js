const db = require("../../../models");
const { getPagination, getPagingData } = require("../../../utils/paginationHelper");
const { Op } = require("sequelize");

const getAllOrders = async (params = {}, ...legacyArgs) => {
  try {
    let opts = {};
    if (typeof params === "object" && params !== null && !Array.isArray(params)) {
      opts = params;
    } else {
      opts = {
        page: params,
        limit: legacyArgs[0],
        search: legacyArgs[1],
        status: legacyArgs[2],
        hasReturn: legacyArgs[3],
        hasCancel: legacyArgs[4],
      };
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      searchTerm = "",
      status = "",
      paymentStatus = "",
      paymentMethod = "",
      startDate = "",
      endDate = "",
      hasReturn = false,
      isReturn = false,
      hasCancel = false,
      isCancelRequested = false,
    } = opts;

    const { limit: l, offset } = getPagination(page, limit);
    const where = {};

    const querySearch = (search || searchTerm || "").trim();
    if (querySearch) {
      where[Op.or] = [
        { orderCode: { [Op.like]: `%${querySearch}%` } },
        { receiverName: { [Op.like]: `%${querySearch}%` } },
        { receiverPhone: { [Op.like]: `%${querySearch}%` } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus;
    }

    if (paymentMethod && paymentMethod !== "all") {
      where.paymentMethod = paymentMethod;
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.createdAt = { [Op.lte]: new Date(endDate) };
    }

    const orderItemWhere = {};
    const queryHasReturn = Boolean(hasReturn || isReturn);
    if (queryHasReturn) {
      orderItemWhere.returnStatus = { [Op.ne]: "none" };
    }

    const queryHasCancel = Boolean(hasCancel || isCancelRequested);
    if (queryHasCancel) {
      where.status = { [Op.in]: ["cancel_requested", "cancelled"] };
    }

    const { count, rows } = await db.Order.findAndCountAll({
      where,
      limit: l,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          where: Object.keys(orderItemWhere).length > 0 ? orderItemWhere : undefined,
          required: hasReturn,
          include: [
            {
              model: db.Product,
              as: "productInfo",
              attributes: ["id", "name", "slug"],
            },
          ],
        },
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "email", "phone"],
        },
        {
          model: db.Payment,
          as: "payment",
        },
      ],
      distinct: true,
    });

    const pagingData = getPagingData({ count, rows }, page, l);

    return {
      errCode: 0,
      errMessage: "Get all orders successfully",
      data: pagingData.items || pagingData.rows || [],
      pagination: {
        totalItems: pagingData.totalItems,
        totalPages: pagingData.totalPages,
        currentPage: pagingData.currentPage,
        limit: l,
      },
    };
  } catch (e) {
    console.error("Error in getAllOrders:", e);
    throw e;
  }
};

const getOrderById = async (id) => {
  try {
    const order = await db.Order.findByPk(id, {
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Product,
              as: "productInfo",
              attributes: ["id", "name", "slug"],
            },
          ],
        },
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "email", "phone"],
        },
        {
          model: db.Payment,
          as: "payment",
        },
      ],
    });

    if (!order) {
      return { errCode: 1, errMessage: "Order not found" };
    }

    return { errCode: 0, errMessage: "Get order successfully", data: order };
  } catch (e) {
    console.error("Error in getOrderById:", e);
    throw e;
  }
};

const getOrdersByUserId = async (userId, page = 1, limit = 10, status = "all") => {
  try {
    const { limit: l, offset } = getPagination(page, limit);
    const where = { userId };

    if (status && status !== "all") {
      where.status = status;
    }

    const { count, rows } = await db.Order.findAndCountAll({
      where,
      limit: l,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Product,
              as: "productInfo",
              attributes: ["id", "name", "slug"],
            },
          ],
        },
        {
          model: db.Payment,
          as: "payment",
        },
      ],
      distinct: true,
    });

    const pagingData = getPagingData({ count, rows }, page, l);

    return {
      errCode: 0,
      errMessage: "Get orders by userId successfully",
      data: pagingData.items || pagingData.rows || [],
      pagination: {
        totalItems: pagingData.totalItems,
        totalPages: pagingData.totalPages,
        currentPage: pagingData.currentPage,
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
    const { limit: l, offset } = getPagination(page, limit);
    const where = {
      userId,
      status: {
        [Op.in]: ["pending", "confirmed", "processing", "shipped", "shipping"],
      },
    };

    const { count, rows } = await db.Order.findAndCountAll({
      where,
      limit: l,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
        },
        {
          model: db.Payment,
          as: "payment",
        },
      ],
      distinct: true,
    });

    const pagingData = getPagingData({ count, rows }, page, l);

    return {
      errCode: 0,
      errMessage: "Get active orders successfully",
      data: pagingData.items || pagingData.rows || [],
      pagination: {
        totalItems: pagingData.totalItems,
        totalPages: pagingData.totalPages,
        currentPage: pagingData.currentPage,
        limit: l,
      },
    };
  } catch (e) {
    console.error("Error in getActiveOrdersByUserId:", e);
    throw e;
  }
};

const getOrderByCode = async (orderCode) => {
  try {
    const order = await db.Order.findOne({
      where: { orderCode },
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
        },
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "email", "phone"],
        },
      ],
    });

    if (!order) {
      return { errCode: 1, errMessage: "Order not found" };
    }

    return { errCode: 0, errMessage: "OK", data: order };
  } catch (e) {
    console.error("Error in getOrderByCode:", e);
    throw e;
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getActiveOrdersByUserId,
  getOrderByCode,
};
