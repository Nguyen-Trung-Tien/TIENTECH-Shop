const db = require("../../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const { getCache, setCache } = require("../../config/redis");
const ProductService = require("../product/ProductService");

/**
 * Tính toán phần trăm thay đổi
 * @param {number} current Giá trị hiện tại
 * @param {number} previous Giá trị kỳ trước
 * @returns {number} Phần trăm thay đổi
 */
const calculateChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const getDashboardData = async (period) => {
  const cacheKey = `dashboard_${period || "all"}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfThisYear = new Date(now.getFullYear(), 0, 1);

    let startDate;
    if (period === "week") startDate = startOfThisWeek;
    else if (period === "year") startDate = startOfThisYear;
    else if (period === "month") startDate = startOfThisMonth;
    else startDate = new Date(0); // All time

    // Parallelized DB metrics execution for high performance
    const [
      totalProducts,
      productsThisMonth,
      productsLastMonth,
      todayOrders,
      yesterdayOrders,
      totalOrders,
      totalRevenueResultAllTime,
      revenueThisPeriodResult,
      totalUsersAllTime,
      newUsers,
      usersThisMonth,
      usersLastMonth,
      revenueThisMonthResult,
      revenueLastMonthResult,
    ] = await Promise.all([
      // 1. Sản phẩm: Tổng số và tăng trưởng
      db.Product.count(),
      db.Product.count({ where: { createdAt: { [Op.gte]: startOfThisMonth } } }),
      db.Product.count({
        where: { createdAt: { [Op.gte]: startOfLastMonth, [Op.lt]: startOfThisMonth } },
      }),
      // 2. Đơn hàng: Hôm nay và hôm qua
      db.Order.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
      db.Order.count({
        where: { createdAt: { [Op.gte]: startOfYesterday, [Op.lt]: startOfToday } },
      }),
      // Summary for current period
      db.Order.count({ where: { createdAt: { [Op.gte]: startDate } } }),
      // 3. Doanh thu
      db.Order.sum("totalPrice", {
        where: { [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }] },
      }),
      db.Order.sum("totalPrice", {
        where: {
          createdAt: { [Op.gte]: startDate },
          [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
        },
      }),
      // 4. Người dùng
      db.User.count({ where: { role: "customer" } }),
      db.User.count({
        where: { role: "customer", createdAt: { [Op.gte]: startDate } },
      }),
      db.User.count({
        where: { role: "customer", createdAt: { [Op.gte]: startOfThisMonth } },
      }),
      db.User.count({
        where: {
          role: "customer",
          createdAt: { [Op.gte]: startOfLastMonth, [Op.lt]: startOfThisMonth },
        },
      }),
      // Doanh thu tháng này vs tháng trước
      db.Order.sum("totalPrice", {
        where: {
          createdAt: { [Op.gte]: startOfThisMonth },
          [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
        },
      }),
      db.Order.sum("totalPrice", {
        where: {
          createdAt: { [Op.gte]: startOfLastMonth, [Op.lt]: startOfThisMonth },
          [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
        },
      }),
    ]);

    const totalRevenueAllTime = totalRevenueResultAllTime || 0;
    const totalRevenuePeriod = revenueThisPeriodResult || 0;
    const revenueThisMonth = revenueThisMonthResult || 0;
    const revenueLastMonth = revenueLastMonthResult || 0;

    const totalProfit = Math.round(totalRevenuePeriod * 0.2);

    const change = {
      products: calculateChange(productsThisMonth, productsLastMonth),
      orders: calculateChange(todayOrders, yesterdayOrders),
      revenue: calculateChange(revenueThisMonth, revenueLastMonth),
      users: calculateChange(usersThisMonth, usersLastMonth),
    };

    // 5. Thống kê doanh thu theo chu kỳ (Tuần, Tháng, Năm) bằng SQL Aggregation
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [dailyOrders, monthlyOrders] = await Promise.all([
      db.Order.findAll({
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo },
          [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
        },
        attributes: [
          [db.sequelize.fn("DATE", db.sequelize.col("createdAt")), "dateKey"],
          [db.sequelize.fn("SUM", db.sequelize.col("totalPrice")), "totalRevenue"],
        ],
        group: [db.sequelize.fn("DATE", db.sequelize.col("createdAt"))],
        raw: true,
      }),
      db.Order.findAll({
        where: {
          createdAt: { [Op.gte]: twelveMonthsAgo },
          [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
        },
        attributes: [
          [
            db.sequelize.fn("DATE_FORMAT", db.sequelize.col("createdAt"), "%Y-%m"),
            "monthKey",
          ],
          [
            db.sequelize.fn("SUM", db.sequelize.col("totalPrice")),
            "totalRevenue",
          ],
        ],
        group: [
          db.sequelize.fn("DATE_FORMAT", db.sequelize.col("createdAt"), "%Y-%m"),
        ],
        raw: true,
      }),
    ]);

    const dailyMap = new Map();
    dailyOrders.forEach((row) => {
      if (row.dateKey) {
        const d = new Date(row.dateKey);
        dailyMap.set(d.toLocaleDateString("vi-VN"), Number(row.totalRevenue) || 0);
      }
    });

    const monthlyMap = new Map();
    monthlyOrders.forEach((row) => {
      if (row.monthKey) {
        monthlyMap.set(row.monthKey, Number(row.totalRevenue) || 0);
      }
    });

    const groupByDate = (days) => {
      const result = [];
      for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateString = d.toLocaleDateString("vi-VN");
        result.push({
          date: dateString,
          revenue: dailyMap.get(dateString) || 0,
        });
      }
      return result;
    };

    const groupByMonth = () => {
      const result = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const monthKey = `${year}-${month}`;
        const label = `${d.getMonth() + 1}/${year}`;
        result.push({
          date: label,
          revenue: monthlyMap.get(monthKey) || 0,
        });
      }
      return result;
    };

    const revenueByWeek = groupByDate(6);
    const revenueByMonth = groupByDate(29);
    const revenueByYear = groupByMonth();

    // 6. Top selling products, pending requests and low stock (Parallelized)
    const [
      topProductsRaw,
      cancelRequestedCount,
      returnRequestedCount,
      lowStockCount,
      lowStockProducts,
    ] = await Promise.all([
      db.OrderItem.findAll({
        attributes: [
          "productId",
          "productName",
          [db.sequelize.fn("SUM", db.sequelize.col("quantity")), "totalSold"],
          [db.sequelize.fn("SUM", db.sequelize.col("subtotal")), "totalRevenue"],
        ],
        group: ["productId", "productName"],
        order: [[db.sequelize.fn("SUM", db.sequelize.col("quantity")), "DESC"]],
        limit: 5,
        raw: true,
      }),
      db.Order.count({
        where: { status: "cancel_requested" },
      }),
      db.Order.count({
        include: [
          {
            model: db.OrderItem,
            as: "orderItems",
            where: { returnStatus: "requested" },
            required: true,
          },
        ],
        distinct: true,
      }),
      db.Product.count({
        where: {
          isActive: true,
          totalStock: { [Op.lte]: 5 },
        },
      }),
      db.Product.findAll({
        where: {
          isActive: true,
          totalStock: { [Op.lte]: 5 },
        },
        attributes: ["id", "name", "sku", "totalStock", "basePrice"],
        limit: 5,
        raw: true,
      }),
    ]);

    const result = {
      totalProducts,
      todayOrders,
      totalRevenue: period ? totalRevenuePeriod : totalRevenueAllTime,
      totalRevenueAllTime,
      totalProfit,
      totalOrders,
      totalUsers: totalUsersAllTime,
      newUsers,
      change,
      revenueByWeek,
      revenueByMonth,
      revenueByYear,
      topProducts: topProductsRaw,
      cancelRequestedCount,
      returnRequestedCount,
      lowStockCount,
      lowStockProducts,
    };

    await setCache(cacheKey, result, 300);
    return result;
  } catch (error) {
    console.error("Error from AdminService.getDashboardData:", error);
    throw error;
  }
};

const getAdminCounters = async () => {
  const cacheKey = "admin_counters";
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const cancelRequestedCount = await db.Order.count({
      where: { status: "cancel_requested" },
    });

    const returnRequestedCount = await db.Order.count({
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          where: { returnStatus: "requested" },
          required: true,
        },
      ],
      distinct: true,
    });

    const result = {
      errCode: 0,
      data: {
        cancelRequestedCount,
        returnRequestedCount,
      },
    };

    await setCache(cacheKey, result, 15);
    return result;
  } catch (error) {
    console.error("Error from AdminService.getAdminCounters:", error);
    throw error;
  }
};

const exportRevenueExcel = async () => {
  try {
    const orders = await db.Order.findAll({
      where: {
        [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
      },
      include: [
        { model: db.User, as: "user", attributes: ["username", "email"] },
        { model: db.OrderItem, as: "orderItems" },
      ],
      order: [["createdAt", "DESC"]],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo doanh thu");

    worksheet.columns = [
      { header: "Mã đơn hàng", key: "orderCode", width: 20 },
      { header: "Ngày đặt", key: "createdAt", width: 20 },
      { header: "Khách hàng", key: "customerName", width: 25 },
      { header: "Email", key: "email", width: 25 },
      { header: "Tổng tiền", key: "totalPrice", width: 15 },
      { header: "Phương thức thanh toán", key: "paymentMethod", width: 25 },
      { header: "Trạng thái thanh toán", key: "paymentStatus", width: 20 },
      { header: "Trạng thái đơn hàng", key: "status", width: 20 },
    ];

    orders.forEach((order) => {
      worksheet.addRow({
        orderCode: order.orderCode,
        createdAt: order.createdAt.toLocaleString("vi-VN"),
        customerName: order.receiverName || order.user?.username,
        email: order.user?.email || "N/A",
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error("Error from AdminService.exportRevenueExcel:", error);
    throw error;
  }
};

const globalSearch = async (query) => {
  const q = (query || "").trim();
  if (!q) return { errCode: 0, data: { products: [], orders: [], users: [] } };

  const [products, orders, users] = await Promise.all([
    db.Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { sku: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ["id", "name", "sku", "basePrice", "totalStock", "sold"],
      include: [
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["imageUrl", "isPrimary"],
          required: false,
        },
      ],
      limit: 10,
    }),

    db.Order.findAll({
      where: {
        [Op.or]: [
          { orderCode: { [Op.like]: `%${q}%` } },
          { receiverName: { [Op.like]: `%${q}%` } },
          { receiverPhone: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["username", "email", "phone"],
          required: false
        },
      ],
      attributes: ["id", "orderCode", "totalPrice", "status", "createdAt"],
      limit: 5,
    }),

    db.User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
          { phone: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ["id", "username", "email", "phone", "role", "isActive"],
      limit: 5,
    }),
  ]);

  const formattedProducts = products.map((p) => {
    const plain = p.toJSON ? p.toJSON() : p;
    const primaryImg =
      plain.images?.find((img) => img.isPrimary)?.imageUrl ||
      plain.images?.[0]?.imageUrl ||
      null;
    return {
      ...plain,
      image: primaryImg,
    };
  });

  return {
    errCode: 0,
    data: {
      products: formattedProducts,
      orders,
      users,
    },
  };
};

const syncEmbeddings = async () => {
  try {
    const result = await ProductService.syncAllProductEmbeddings();
    return result;
  } catch (error) {
    console.error("Error from AdminService.syncEmbeddings:", error);
    throw error;
  }
};

module.exports = {
  getDashboardData,
  getAdminCounters,
  exportRevenueExcel,
  globalSearch,
  syncEmbeddings,
};
