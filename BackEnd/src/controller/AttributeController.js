const AttributeService = require("../services/AttributeService");

/**
 * Controller xử lý các yêu cầu liên quan đến Thuộc tính (Attribute)
 */
const handleGetAllAttributes = async (req, res) => {
  try {
    const result = await AttributeService.getAllAttributesForAdmin();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in handleGetAllAttributes:", error);
    return res.status(500).json({
      errCode: 1,
      errMessage: "Lỗi Server khi lấy danh sách thuộc tính",
    });
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
    const attribute = await db.Attribute.findOne({
      where: { code },
      include: [{ model: db.AttributeValue, as: "values" }]
    });
    
    if (!attribute) {
      return res.status(404).json({
        errCode: 1,
        errMessage: "Không tìm thấy thuộc tính",
      });
    }

    return res.status(200).json({
      errCode: 0,
      data: attribute,
    });
  } catch (error) {
    console.error("Error in handleGetAttributeByCode:", error);
    return res.status(500).json({
      errCode: 1,
      errMessage: "Lỗi Server",
    });
  }
};

module.exports = {
  handleGetAllAttributes,
  handleGetAttributeByCode
};
