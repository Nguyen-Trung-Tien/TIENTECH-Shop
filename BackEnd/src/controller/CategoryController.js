const CategoryService = require("../services/CategoryService");
const { uploadToCloudinary } = require("../config/cloudinaryConfig");

const handleGetAllCategories = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await CategoryService.getAllCategories(page, limit, search);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleGetAllCategories:", e);
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Internal server error" });
  }
};

const handleGetCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await CategoryService.getCategoryBySlug(slug);
    const status = result.errCode === 0 ? 200 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("Error in handleGetCategoryBySlug:", e);
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Internal server error" });
  }
};

const handleGetCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CategoryService.getCategoryById(id);
    const status = result.errCode === 0 ? 200 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("Error in handleGetCategoryById:", e);
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Internal server error" });
  }
};

const handleCreateCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, "categories");
      data.image = upload.secure_url;
    }
    const result = await CategoryService.createCategory(data);
    return res.status(201).json(result);
  } catch (e) {
    console.error("Error in handleCreateCategory:", e);
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Internal server error" });
  }
};

const handleUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, "categories");
      data.image = upload.secure_url;
    }
    const result = await CategoryService.updateCategory(id, data);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleUpdateCategory:", e);
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Internal server error" });
  }
};

const handleDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CategoryService.deleteCategory(id);
    const status = result.errCode === 0 ? 200 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("Error in handleDeleteCategory:", e);
    return res
      .status(500)
      .json({ errCode: -1, errMessage: "Internal server error" });
  }
};

module.exports = {
  handleGetAllCategories,
  handleGetCategoryById,
  handleGetCategoryBySlug,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
};
