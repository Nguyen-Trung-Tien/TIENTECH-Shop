const AddressService = require("../services/common/AddressService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const handleCreateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await AddressService.createAddress(userId, req.body);
    return handleResponse(res, result, 201);
  } catch (error) {
    return handleError(res, error, "handleCreateAddress");
  }
};

const handleGetAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await AddressService.getAddressesByUserId(userId);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleGetAddresses");
  }
};

const handleUpdateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const result = await AddressService.updateAddress(userId, addressId, req.body);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleUpdateAddress");
  }
};

const handleDeleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const result = await AddressService.deleteAddress(userId, addressId);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleDeleteAddress");
  }
};

const handleSetDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const result = await AddressService.setDefaultAddress(userId, addressId);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleSetDefaultAddress");
  }
};

module.exports = {
  handleCreateAddress,
  handleGetAddresses,
  handleUpdateAddress,
  handleDeleteAddress,
  handleSetDefaultAddress,
};
