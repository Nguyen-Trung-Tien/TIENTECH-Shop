const VoucherService = require("../services/VoucherService");

const handleGetActiveVouchers = async (req, res) => {
  try {
    const result = await VoucherService.getActiveVouchers();
    return res.status(200).json(result);
  } catch (error) {
    console.error("[VoucherController] Error in handleGetActiveVouchers:", error);
    return res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleCheckVoucher = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const userId = req.user ? req.user.id : null;
    const result = await VoucherService.checkVoucher(code, orderTotal, userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[VoucherController] Error in handleCheckVoucher:", error);
    return res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleGetAllVouchers = async (req, res) => {
  try {
    const result = await VoucherService.getAllVouchers();
    return res.status(200).json(result);
  } catch (error) {
    console.error("[VoucherController] Error in handleGetAllVouchers:", error);
    return res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleCreateVoucher = async (req, res) => {
  try {
    const result = await VoucherService.createVoucher(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[VoucherController] Error in handleCreateVoucher:", error);
    return res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleUpdateVoucher = async (req, res) => {
  try {
    const result = await VoucherService.updateVoucher(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[VoucherController] Error in handleUpdateVoucher:", error);
    return res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleDeleteVoucher = async (req, res) => {
  try {
    const result = await VoucherService.deleteVoucher(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[VoucherController] Error in handleDeleteVoucher:", error);
    return res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

module.exports = {
  handleGetActiveVouchers,
  handleCheckVoucher,
  handleGetAllVouchers,
  handleCreateVoucher,
  handleUpdateVoucher,
  handleDeleteVoucher,
};
