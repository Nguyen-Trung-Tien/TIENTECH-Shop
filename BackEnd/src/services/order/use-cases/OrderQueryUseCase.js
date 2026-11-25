const db = require("../../../models");
const { getPagination, getPagingData } = require("../../../utils/paginationHelper");
const { Op } = require("sequelize");

const enrichOrderItemsWithImage = (order) => {
  if (!order) return order;
  const plain = order.toJSON ? order.toJSON() : { ...order };
  if (Array.isArray(plain.orderItems)) {
    plain.orderItems = plain.orderItems.map((item) => {
      const itemObj = item.toJSON ? item.toJSON() : { ...item };
      const productImages =
        itemObj.productInfo?.images || itemObj.product?.images || [];
      const primaryImg =
        productImages.find((img) => img.isPrimary)?.imageUrl ||
        productImages[0]?.imageUrl ||
        null;
      const resolvedImage = itemObj.image || primaryImg;
      return {
        ...itemObj,
        image: resolvedImage,
        product: itemObj.product || {
          ...(itemObj.productInfo || {}),
          image: resolvedImage,
        },
      };
    });
  }
  return plain;
};

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
      where.status = "cancel_requested";
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
          required: queryHasReturn,
          include: [
            {
              model: db.Product,
              as: "productInfo",
              attributes: ["id", "name", "slug"],
              include: [
                {
                  model: db.ProductImage,
                  as: "images",
                  attributes: ["imageUrl", "isPrimary"],
                  required: false,
                },
              ],
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
          attributes: ["id", "method", "status", "amount", "transactionId", "paymentDate"],
        },
      ],
      distinct: true,
    });

    const pagingData = getPagingData({ count, rows }, page, l);
    const enrichedItems = (pagingData.items || pagingData.rows || []).map(
      enrichOrderItemsWithImage
    );

    return {
      errCode: 0,
      errMessage: "Get all orders successfully",
      data: enrichedItems,
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

const getOrderById = async (id, currentUser = null) => {
  try {
    const includeOptions = [
      {
        model: db.OrderItem,
        as: "orderItems",
        include: [
          {
            model: db.Product,
            as: "productInfo",
            attributes: ["id", "name", "slug"],
            include: [
              {
                model: db.ProductImage,
                as: "images",
                attributes: ["imageUrl", "isPrimary"],
                required: false,
              },
            ],
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
        attributes: ["id", "method", "status", "amount", "transactionId", "paymentDate"],
      },
    ];

    const order = !isNaN(id)
      ? await db.Order.findByPk(id, { include: includeOptions })
      : await db.Order.findOne({ where: { orderCode: id }, include: includeOptions });

    if (!order) {
      return { errCode: 1, errMessage: "Order not found", statusCode: 404 };
    }

    // SECURITY: Prevent IDOR - customers can only view their own orders
    if (
      currentUser &&
      currentUser.role !== "admin" &&
      currentUser.role !== "root" &&
      String(order.userId) !== String(currentUser.id)
    ) {
      return {
        errCode: 403,
        statusCode: 403,
        status: "FORBIDDEN",
        errMessage: "Bạn không có quyền truy cập đơn hàng của người dùng khác.",
      };
    }

    return {
      errCode: 0,
      errMessage: "Get order successfully",
      data: enrichOrderItemsWithImage(order),
    };
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
              include: [
                {
                  model: db.ProductImage,
                  as: "images",
                  attributes: ["imageUrl", "isPrimary"],
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: db.Payment,
          as: "payment",
          attributes: ["id", "method", "status", "amount", "transactionId", "paymentDate"],
        },
      ],
      distinct: true,
    });

    const pagingData = getPagingData({ count, rows }, page, l);
    const enrichedItems = (pagingData.items || pagingData.rows || []).map(
      enrichOrderItemsWithImage
    );

    return {
      errCode: 0,
      errMessage: "Get orders by userId successfully",
      data: enrichedItems,
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
          attributes: ["id", "method", "status", "amount", "transactionId", "paymentDate"],
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

const normalizePhone = (value = "") => String(value).replace(/\D/g, "");

const trackOrderPublic = async (orderCode, contact) => {
  try {
    const cleanCode = String(orderCode || "").trim();
    const cleanContact = String(contact || "").trim();
    if (!cleanCode || !cleanContact) {
      return { errCode: 1, errMessage: "Vui lòng nhập đầy đủ mã đơn hàng và SĐT/Email" };
    }

    const order = await db.Order.findOne({
      where: { orderCode: cleanCode },
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Product,
              as: "productInfo",
              attributes: ["id", "name", "slug"],
              include: [
                {
                  model: db.ProductImage,
                  as: "images",
                  attributes: ["imageUrl", "isPrimary"],
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: db.User,
          as: "user",
          attributes: ["id", "email", "phone"],
        },
      ],
    });

    if (!order) {
      return { errCode: 1, errMessage: "Không tìm thấy đơn hàng hoặc thông tin đối chiếu không khớp" };
    }

    const normalizedContactPhone = normalizePhone(cleanContact);
    const normalizedContactEmail = cleanContact.toLowerCase();

    const phoneMatches =
      normalizedContactPhone.length >= 6 &&
      (normalizePhone(order.receiverPhone) === normalizedContactPhone ||
        normalizePhone(order.user?.phone) === normalizedContactPhone);

    const emailMatches =
      normalizedContactEmail.includes("@") &&
      String(order.user?.email || "").trim().toLowerCase() === normalizedContactEmail;

    if (!phoneMatches && !emailMatches) {
      return { errCode: 1, errMessage: "Không tìm thấy đơn hàng hoặc thông tin đối chiếu không khớp" };
    }

    const enriched = enrichOrderItemsWithImage(order);
    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        orderCode: enriched.orderCode,
        status: enriched.status,
        paymentStatus: enriched.paymentStatus,
        paymentMethod: enriched.paymentMethod,
        totalPrice: enriched.totalPrice,
        shippingFee: enriched.shippingFee,
        discountAmount: enriched.discountAmount,
        createdAt: enriched.createdAt,
        updatedAt: enriched.updatedAt,
        receiverName: enriched.receiverName,
        confirmationHistory: Array.isArray(enriched.confirmationHistory)
          ? enriched.confirmationHistory
          : [],
        orderItems: (enriched.orderItems || []).map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName || item.productInfo?.name || "Sản phẩm",
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          slug: item.productInfo?.slug || null,
        })),
      },
    };
  } catch (e) {
    console.error("Error in trackOrderPublic:", e);
    throw e;
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getActiveOrdersByUserId,
  getOrderByCode,
  trackOrderPublic,
};
