const ProductVariantService = require("../services/catalog/ProductVariantService");

const handleGetByProduct = async (req, res) => {
  try {
    const result = await ProductVariantService.getVariantsByProductId(
      req.params.productId
    );
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ errCode: -1, errMessage: "Server error" });
  }
};

const handleCreate = async (req, res) => {
  try {
    const result = await ProductVariantService.createVariant(req.body);
    return res.status(result.errCode === 0 ? 201 : 400).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ errCode: -1, errMessage: "Server error" });
  }
};

const handleUpdate = async (req, res) => {
  try {
    const result = await ProductVariantService.updateVariant(
      req.params.id,
      req.body
    );
    return res.status(result.errCode === 0 ? 200 : 400).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ errCode: -1, errMessage: "Server error" });
  }
};

const handleDelete = async (req, res) => {
  try {
    const result = await ProductVariantService.deleteVariant(req.params.id);
    return res.status(result.errCode === 0 ? 200 : 400).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ errCode: -1, errMessage: "Server error" });
  }
};

module.exports = {
  handleGetByProduct,
  handleCreate,
  handleUpdate,
  handleDelete,
};
