const AddressService = require("../services/AddressService");

const handleCreateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await AddressService.createAddress(userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("handleCreateAddress error:", error);
    return res.status(500).json({ 
      errCode: -1, 
      errMessage: "Lỗi từ server: " + error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

const handleGetAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await AddressService.getAddressesByUserId(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("handleGetAddresses error:", error);
    return res.status(500).json({ 
      errCode: -1, 
      errMessage: "Lỗi từ server: " + error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

const handleUpdateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const result = await AddressService.updateAddress(userId, addressId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("handleUpdateAddress error:", error);
    return res.status(500).json({ 
      errCode: -1, 
      errMessage: "Lỗi từ server: " + error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

const handleDeleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const result = await AddressService.deleteAddress(userId, addressId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("handleDeleteAddress error:", error);
    return res.status(500).json({ 
      errCode: -1, 
      errMessage: "Lỗi từ server: " + error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

const handleSetDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const result = await AddressService.setDefaultAddress(userId, addressId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("handleSetDefaultAddress error:", error);
    return res.status(500).json({ 
      errCode: -1, 
      errMessage: "Lỗi từ server: " + error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

module.exports = {
  handleCreateAddress,
  handleGetAddresses,
  handleUpdateAddress,
  handleDeleteAddress,
  handleSetDefaultAddress,
};
