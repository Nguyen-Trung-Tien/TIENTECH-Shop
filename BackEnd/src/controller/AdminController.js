const AdminService = require("../services/AdminService");
const AdminAIService = require("../services/AdminAIService");
const RevenueForecastService = require("../services/RevenueForecastService");

const getDashboard = async (req, res) => {
  try {
    const { period } = req.query;
    const data = await AdminService.getDashboardData(period);
    res.status(200).json({
      errCode: 0,
      message: "OK",
      data,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      errCode: 1,
      errMessage: "Error from server",
    });
  }
};

const getAdminCounters = async (req, res) => {
  try {
    const result = await AdminService.getAdminCounters();
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      errCode: 1,
      errMessage: "Lỗi khi lấy số liệu thống kê.",
    });
  }
};

const handleExportRevenue = async (req, res) => {
  try {
    const buffer = await AdminService.exportRevenueExcel();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "Bao-cao-doanh-thu.xlsx"
    );
    res.send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      errCode: 1,
      errMessage: "Lỗi xuất file Excel.",
    });
  }
};

const handleAIInsights = async (req, res) => {
  try {
    const result = await AdminAIService.getAIInsights();
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      errCode: 1,
      errMessage: "Lỗi AI phân tích dữ liệu.",
    });
  }
};

const handleGenerateDescription = async (req, res) => {
  try {
    const { name, keywords } = req.body;
    if (!name) {
      return res.status(400).json({ errCode: 1, errMessage: "Thiếu tên sản phẩm." });
    }
    const result = await AdminAIService.generateProductDescription(name, keywords);
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      errCode: 1,
      errMessage: "Lỗi AI sinh mô tả sản phẩm.",
    });
  }
};

const handleGlobalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const result = await AdminService.globalSearch(q);
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      errCode: 1,
      errMessage: "Lỗi tìm kiếm hệ thống.",
    });
  }
};

const handleSyncEmbeddings = async (req, res) => {
  try {
    const result = await AdminService.syncEmbeddings();
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      errCode: 1,
      errMessage: "Lỗi khi đồng bộ dữ liệu AI.",
    });
  }
};

const handleRevenueForecast = async (req, res) => {
  try {
    const result = await RevenueForecastService.getRevenueForecast();
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      errCode: 1,
      errMessage: "Lỗi AI dự báo doanh thu.",
    });
  }
};

module.exports = {
  getDashboard,
  getAdminCounters,
  handleExportRevenue,
  handleAIInsights,
  handleGenerateDescription,
  handleGlobalSearch,
  handleSyncEmbeddings,
  handleRevenueForecast,
};
