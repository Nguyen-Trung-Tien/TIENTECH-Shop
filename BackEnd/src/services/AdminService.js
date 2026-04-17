const db = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
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

const { getCache, setCache } = require("../config/redis");

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

    // 1. Sản phẩm: Tổng số và tăng trưởng tháng này vs tháng trước
    const totalProducts = await db.Product.count();
    const productsThisMonth = await db.Product.count({
      where: { createdAt: { [Op.gte]: startOfThisMonth } },
    });
    const productsLastMonth = await db.Product.count({
      where: {
        createdAt: {
          [Op.gte]: startOfLastMonth,
          [Op.lt]: startOfThisMonth,
        },
      },
    });

    // 2. Đơn hàng: Hôm nay và tăng trưởng hôm nay vs hôm qua
    const todayOrders = await db.Order.count({
      where: { createdAt: { [Op.gte]: startOfToday } },
    });
    const yesterdayOrders = await db.Order.count({
      where: {
        createdAt: {
          [Op.gte]: startOfYesterday,
          [Op.lt]: startOfToday,
        },
      },
    });

    // Summary for current period
    const totalOrders = await db.Order.count({
      where: { createdAt: { [Op.gte]: startDate } },
    });

    // 3. Doanh thu: Tổng và tăng trưởng tháng này vs tháng trước (Chỉ tính đơn đã thanh toán hoặc đã giao)
    const revenueStatus = ["paid", "delivered"];
    const totalRevenueResultAllTime = await db.Order.sum("totalPrice", {
      where: {
        [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
      },
    });
    const totalRevenueAllTime = totalRevenueResultAllTime || 0;

    const revenueThisPeriodResult = await db.Order.sum("totalPrice", {
      where: {
        createdAt: { [Op.gte]: startDate },
        [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
      },
    });
    const totalRevenuePeriod = revenueThisPeriodResult || 0;

    // 4. Người dùng: Tổng và tăng trưởng người mới tháng này vs tháng trước
    const totalUsersAllTime = await db.User.count({
      where: { role: "customer" },
    });
    const newUsers = await db.User.count({
      where: {
        role: "customer",
        createdAt: { [Op.gte]: startDate },
      },
    });
    const usersThisMonth = await db.User.count({
      where: {
        role: "customer",
        createdAt: { [Op.gte]: startOfThisMonth },
      },
    });
    const usersLastMonth = await db.User.count({
      where: {
        role: "customer",
        createdAt: { [Op.gte]: startOfLastMonth, [Op.lt]: startOfThisMonth },
      },
    });

    const revenueThisMonthResult = await db.Order.sum("totalPrice", {
      where: {
        createdAt: { [Op.gte]: startOfThisMonth },
        [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
      },
    });
    const revenueThisMonth = revenueThisMonthResult || 0;

    const revenueLastMonthResult = await db.Order.sum("totalPrice", {
      where: {
        createdAt: { [Op.gte]: startOfLastMonth, [Op.lt]: startOfThisMonth },
        [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
      },
    });
    const revenueLastMonth = revenueLastMonthResult || 0;

    // Profit estimation (since no cost price, we assume 20% profit margin)
    const totalProfit = Math.round(totalRevenuePeriod * 0.2);

    const change = {
      products: calculateChange(productsThisMonth, productsLastMonth),
      orders: calculateChange(todayOrders, yesterdayOrders),
      revenue: calculateChange(revenueThisMonth, revenueLastMonth),
      users: calculateChange(usersThisMonth, usersLastMonth),
    };

    // 5. Thống kê doanh thu theo chu kỳ (Tuần, Tháng, Năm)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const recentOrders = await db.Order.findAll({
      where: {
        createdAt: { [Op.gte]: twelveMonthsAgo },
        [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
      },
      attributes: ["totalPrice", "createdAt"],
      raw: true,
    });

    const groupByDate = (orders, days) => {
      const result = [];
      for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateString = d.toLocaleDateString("vi-VN");
        const revenue = orders
          .filter(
            (o) =>
              new Date(o.createdAt).toLocaleDateString("vi-VN") === dateString,
          )
          .reduce((sum, o) => sum + Number(o.totalPrice), 0);
        result.push({ date: dateString, revenue });
      }
      return result;
    };

    const groupByMonth = (orders) => {
      const result = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthYear = `${d.getMonth() + 1}/${d.getFullYear()}`;
        const revenue = orders
          .filter((o) => {
            const oDate = new Date(o.createdAt);
            return (
              oDate.getMonth() === d.getMonth() &&
              oDate.getFullYear() === d.getFullYear()
            );
          })
          .reduce((sum, o) => sum + Number(o.totalPrice), 0);
        result.push({ date: monthYear, revenue });
      }
      return result;
    };

    const revenueByWeek = groupByDate(recentOrders, 6);
    const revenueByMonth = groupByDate(recentOrders, 29);
    const revenueByYear = groupByMonth(recentOrders);

    // 6. Top selling products
    const topProductsRaw = await db.OrderItem.findAll({
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
    });

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
    };

    await setCache(cacheKey, result, 300); // 5 minutes cache
    return result;
  } catch (error) {
    console.error("Error from AdminService.getDashboardData:", error);
    throw error;
  }
};

const exportRevenueExcel = async () => {
  // ... (giữ nguyên code cũ)
};

const globalSearch = async (query) => {
  const q = (query || "").trim();
  if (!q) return { errCode: 0, data: { products: [], orders: [], users: [] } };

  const [products, orders, users] = await Promise.all([
    // 1. Tìm sản phẩm theo tên, SKU hoặc mô tả
    db.Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { sku: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ["id", "name", "sku", "basePrice", "totalStock", "sold"],
      limit: 5,
    }),

    // 2. Tìm đơn hàng theo mã đơn, tên người nhận hoặc số điện thoại người nhận
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

    // 3. Tìm người dùng theo tên, email, số điện thoại
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

  return {
    errCode: 0,
    data: {
      products,
      orders,
      users,
    },
  };
};

const ProductService = require("./product/ProductService");

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
  exportRevenueExcel,
  globalSearch,
  syncEmbeddings,
};
