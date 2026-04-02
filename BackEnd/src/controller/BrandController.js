const BrandService = require("../services/BrandService");
const { handleError, handleResponse, handleFileUpload } = require("../utils/controllerHelper");

const handleCreateBrand = async (req, res) => {
  try {
    const data = { ...req.body };
    const imageUrl = await handleFileUpload(req, "brands");
    if (imageUrl) data.image = imageUrl;

    const result = await BrandService.createBrand(data);
    return handleResponse(res, result, 201);
  } catch (e) {
    return handleError(res, e, "handleCreateBrand");
  }
};

const handleGetAllBrands = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await BrandService.getAllBrands(page, limit, search);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleGetAllBrands");
  }
};

const handleGetBrandById = async (req, res) => {
  try {
    const result = await BrandService.getBrandById(req.params.id);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleGetBrandById");
  }
};

const handleGetBrandBySlug = async (req, res) => {
  try {
    const result = await BrandService.getBrandBySlug(req.params.slug);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleGetBrandBySlug");
  }
};

const handleUpdateBrand = async (req, res) => {
  try {
    const data = { ...req.body };
    const { id } = req.params;
    const imageUrl = await handleFileUpload(req, "brands");
    if (imageUrl) data.image = imageUrl;

    const result = await BrandService.updateBrand(id, data);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleUpdateBrand");
  }
};

const handleDeleteBrand = async (req, res) => {
  try {
    const result = await BrandService.deleteBrand(req.params.id);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleDeleteBrand");
  }
};

module.exports = {
  handleCreateBrand,
  handleGetAllBrands,
  handleGetBrandById,
  handleGetBrandBySlug,
  handleUpdateBrand,
  handleDeleteBrand,
};
