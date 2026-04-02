const CategoryService = require("../services/CategoryService");
const { handleError, handleResponse, handleFileUpload } = require("../utils/controllerHelper");

const handleGetAllCategories = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await CategoryService.getAllCategories(page, limit, search);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleGetAllCategories");
  }
};

const handleGetCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await CategoryService.getCategoryBySlug(slug);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleGetCategoryBySlug");
  }
};

const handleGetCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CategoryService.getCategoryById(id);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleGetCategoryById");
  }
};

const handleCreateCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    const imageUrl = await handleFileUpload(req, "categories");
    if (imageUrl) data.image = imageUrl;

    const result = await CategoryService.createCategory(data);
    return handleResponse(res, result, 201);
  } catch (e) {
    return handleError(res, e, "handleCreateCategory");
  }
};

const handleUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    const imageUrl = await handleFileUpload(req, "categories");
    if (imageUrl) data.image = imageUrl;

    const result = await CategoryService.updateCategory(id, data);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleUpdateCategory");
  }
};

const handleDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CategoryService.deleteCategory(id);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleDeleteCategory");
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
