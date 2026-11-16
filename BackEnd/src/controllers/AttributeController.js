const AttributeService = require("../services/catalog/AttributeService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

/**
 * Controller xử lý các yêu cầu liên quan đến Thuộc tính (Attribute)
 */
const handleGetAllAttributes = async (req, res) => {
  try {
    const result = await AttributeService.getAllAttributesForAdmin();
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleGetAllAttributes");
  }
};

const handleGetAttributeByCode = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Thiếu tham số code",
      });
    }
    const result = await AttributeService.getAttributeByCode(code);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleGetAttributeByCode");
  }
};

module.exports = {
  handleGetAllAttributes,
  handleGetAttributeByCode
};
