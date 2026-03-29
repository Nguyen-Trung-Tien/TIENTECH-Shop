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

const getDashboardData = async (period) => {
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

    return {
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
  } catch (error) {
    console.error("Error from AdminService.getDashboardData:", error);
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
        {
          model: db.User,
          as: "user",
          attributes: ["username", "email", "phone"],
        },
        {
          model: db.OrderItem,
          as: "orderItems",
          attributes: ["productName", "quantity", "price"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bao-Cao-Doanh-Thu");

    // HEADER
    worksheet.columns = [
      { header: "MÃ ĐƠN HÀNG", key: "orderCode", width: 25 },
      { header: "KHÁCH HÀNG", key: "username", width: 20 },
      { header: "SẢN PHẨM", key: "items", width: 40 },
      { header: "TỔNG CỘNG (₫)", key: "totalPrice", width: 20 },
      { header: "GIẢM GIÁ (₫)", key: "discountAmount", width: 20 },
      { header: "NGÀY ĐẶT", key: "createdAt", width: 20 },
      { header: "TRẠNG THÁI", key: "status", width: 15 },
    ];

    // STYLE HEADER
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" },
    };
    worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    // DATA
    orders.forEach((order) => {
      const items = order.orderItems
        .map((i) => `${i.productName} (x${i.quantity})`)
        .join(", ");
      worksheet.addRow({
        orderCode: order.orderCode,
        username: order.user?.username || "Ẩn danh",
        items: items,
        totalPrice: Number(order.totalPrice),
        discountAmount: Number(order.discountAmount || 0),
        createdAt: new Date(order.createdAt).toLocaleDateString("vi-VN"),
        status: order.status === "delivered" ? "Hoàn tất" : "Đã thanh toán",
      });
    });

    // TOTAL ROW
    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.totalPrice),
      0,
    );
    worksheet.addRow({});
    worksheet.addRow({ orderCode: "TỔNG DOANH THU", totalPrice: totalRevenue });
    worksheet.lastRow.font = { bold: true, size: 12 };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error("Excel Export Error:", error);
    throw error;
  }
};

module.exports = {
  getDashboardData,
  exportRevenueExcel,
};
