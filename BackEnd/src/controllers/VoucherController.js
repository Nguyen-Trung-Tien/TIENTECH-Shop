const VoucherService = require("../services/marketing/VoucherService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const handleGetActiveVouchers = async (req, res) => {
  try {
    const result = await VoucherService.getActiveVouchers();
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleGetActiveVouchers");
  }
};

const handleCheckVoucher = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const userId = req.user ? req.user.id : null;
    const result = await VoucherService.checkVoucher(code, orderTotal, userId);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleCheckVoucher");
  }
};

const handleGetAllVouchers = async (req, res) => {
  try {
    const result = await VoucherService.getAllVouchers();
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleGetAllVouchers");
  }
};

const handleCreateVoucher = async (req, res) => {
  try {
    const result = await VoucherService.createVoucher(req.body);
    return handleResponse(res, result, 201);
  } catch (error) {
    return handleError(res, error, "handleCreateVoucher");
  }
};

const handleUpdateVoucher = async (req, res) => {
  try {
    const result = await VoucherService.updateVoucher(req.params.id, req.body);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleUpdateVoucher");
  }
};

const handleDeleteVoucher = async (req, res) => {
  try {
    const result = await VoucherService.deleteVoucher(req.params.id);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleDeleteVoucher");
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
