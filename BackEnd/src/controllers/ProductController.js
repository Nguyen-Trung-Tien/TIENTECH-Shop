const ProductService = require("../services/product/ProductService");
const { uploadToCloudinary } = require("../config/cloudinaryConfig");
const { handleError, handleResponse } = require("../utils/controllerHelper");
const { sanitizeProductInput } = require("../utils/productInputParser");

const handleCreateProduct = async (req, res) => {
  try {
    const data = sanitizeProductInput(req.body);

    if (!data.name || String(data.name).trim() === "") {
      return res.status(400).json({ errCode: 1, errMessage: "Tên sản phẩm không được để trống" });
    }

    const files = req.files || {};
    const primaryFile = files.image?.[0] || null;
    const galleryFiles = files.images || [];

    const imageRecords = [];

    if (primaryFile) {
      const uploaded = await uploadToCloudinary(primaryFile.buffer, "products");
      imageRecords.push({ imageUrl: uploaded.secure_url, publicId: uploaded.public_id, isPrimary: true });
    } else if (data.image && typeof data.image === "string" && data.image.trim()) {
      imageRecords.push({ imageUrl: data.image.trim(), publicId: null, isPrimary: true });
    }

    if (galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        const uploaded = await uploadToCloudinary(file.buffer, "products/gallery");
        imageRecords.push({ imageUrl: uploaded.secure_url, publicId: uploaded.public_id, isPrimary: false });
      }
    }

    const result = await ProductService.createProduct(data, imageRecords);
    return handleResponse(res, result, 201);
  } catch (e) {
    return handleError(res, e, "handleCreateProduct");
  }
};

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const handleGetAllProducts = catchAsync(async (req, res, next) => {
  const categoryId = req.query.categoryId;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const isFlashSale =
    req.query.isFlashSale === "true" || req.query.isFlashSale === "1";
  
  const isAdmin = req.user && req.user.role === "admin";

  const result = await ProductService.getAllProducts(
    categoryId,
    page,
    limit,
    isFlashSale,
    isAdmin
  );
  
  if (result.errCode !== 0) {
    return next(new AppError(result.errMessage, 400, result.errCode));
  }

  return res.status(200).json(result);
});

const handleGetProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ProductService.getProductById(id);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleGetProductById");
  }
};

const handleUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = sanitizeProductInput(req.body);

    const files = req.files || {};
    const primaryFile = files.image?.[0] || null;
    const galleryFiles = files.images || [];

    const imageRecords = [];

    if (primaryFile) {
      const uploaded = await uploadToCloudinary(primaryFile.buffer);
      data.image = uploaded.secure_url;
      imageRecords.push({
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        isPrimary: true,
      });
    }

    if (galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        const uploaded = await uploadToCloudinary(file.buffer, "products/gallery");
        imageRecords.push({
          imageUrl: uploaded.secure_url,
          publicId: uploaded.public_id,
          isPrimary: false,
        });
      }
    }

    const result = await ProductService.updateProduct(id, data, imageRecords);
    return handleResponse(res, result);
  } catch (e) {
    return handleError(res, e, "handleUpdateProduct");
  }
};

const handleDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ProductService.deleteProduct(id);
    const status = result.errCode === 0 ? 200 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("Error in handleDeleteProduct:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleSearchProducts = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    const result = await ProductService.searchProducts(query, page, limit);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleSearchProducts:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleSearchSuggestions = async (req, res) => {
  try {
    const query = req.query.q || "";
    const limit = parseInt(req.query.limit) || 8;

    const result = await ProductService.searchSuggestions(query, limit);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleSearchSuggestions:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetDiscountedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await ProductService.getDiscountedProducts(page, limit);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleGetDiscountedProducts:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetFlashSaleProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await ProductService.getFlashSaleProducts(page, limit);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleGetFlashSaleProducts:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};
const handleFilterProducts = async (req, res) => {
  try {
    const {
      brandId,
      categoryId,
      brand,
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      ram,
      rom,
      screen,
      battery,
      os,
      refresh_rate,
      isFlashSale,
      isAdmin,
    } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));

    const filters = {
      brandId,
      categoryId,
      brand,
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      ram,
      rom,
      screen,
      battery,
      os,
      refresh_rate,
      isFlashSale,
      isAdmin,
      page: Number(page),
      limit: Number(limit),
    };

    const result = await ProductService.filterProducts(filters);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error filtering products:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleRecommendProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    const page = parseInt(req.query.page) || 1;

    const result = await ProductService.recommendProducts(id, page, limit);

    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleRecommendProducts:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleRecommendFortuneProducts = async (req, res) => {
  try {
    const { birthYear, brandId, minPrice, maxPrice, categoryId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    const result = await ProductService.recommendFortuneProducts({
      birthYear,
      brandId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      categoryId,
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleRecommendFortuneProducts:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetSmartRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    const result = await ProductService.getSmartRecommendations(id, limit);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleGetSmartRecommendations:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await ProductService.getProductBySlug(slug);
    const status = result.errCode === 0 ? 200 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("Error in handleGetProductBySlug:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleSemanticSearch = async (req, res) => {
  try {
    const { q, limit } = req.query;
    const result = await ProductService.searchSemanticProducts(
      q,
      parseInt(limit) || 5,
    );
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleSemanticSearch:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id; // Assuming authenticateToken middleware is used
    const limit = parseInt(req.query.limit) || 6;
    const result = await ProductService.getPersonalizedRecommendations(userId, limit);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleGetPersonalizedRecommendations:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetHomePageData = async (req, res) => {
  try {
    const result = await ProductService.getHomePageData();
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleGetHomePageData:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

module.exports = {
  handleCreateProduct,
  handleGetAllProducts,
  handleGetProductById,
  handleGetProductBySlug,
  handleUpdateProduct,
  handleDeleteProduct,
  handleSearchProducts,
  handleSearchSuggestions,
  handleGetDiscountedProducts,
  handleGetFlashSaleProducts,
  handleFilterProducts,
  handleRecommendProducts,
  handleRecommendFortuneProducts,
  handleGetSmartRecommendations,
  handleSemanticSearch,
  handleGetPersonalizedRecommendations,
  handleGetHomePageData,
};
