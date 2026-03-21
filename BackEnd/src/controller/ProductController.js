const ProductService = require("../services/ProductService");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

const parseBoolean = (value) => {
  if (value === true || value === false) return value;
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  return value;
};

const uploadFilesToCloudinary = async (files = []) => {
  const results = [];
  for (const file of files) {
    const res = await uploadToCloudinary(file.buffer);
    results.push({
      imageUrl: res.secure_url,
      publicId: res.public_id,
    });
  }
  return results;
};

const handleCreateProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    // Validate required fields
    if (!data.name || String(data.name).trim() === "") {
      return res.status(400).json({ errCode: 1, errMessage: "Tên sản phẩm không được để trống" });
    }
    if (!data.price && !data.basePrice) {
      return res.status(400).json({ errCode: 2, errMessage: "Giá sản phẩm không được để trống" });
    }
    if (!data.categoryId) {
      return res.status(400).json({ errCode: 3, errMessage: "Danh mục sản phẩm là bắt buộc" });
    }
    if (data.specifications && typeof data.specifications === "string") {
      try {
        data.specifications = JSON.parse(data.specifications);
      } catch (e) {
        console.error("Error parsing specifications:", e);
      }
    }
    if (data.options && typeof data.options === "string") {
      try {
        data.options = JSON.parse(data.options);
      } catch (e) {
        console.error("Error parsing options:", e);
      }
    }
    if (data.variants && typeof data.variants === "string") {
      try {
        data.variants = JSON.parse(data.variants);
      } catch (e) {
        console.error("Error parsing variants:", e);
      }
    }

    if (data.brandId) data.brandId = parseInt(data.brandId);
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.price !== undefined) data.basePrice = data.price;
    if (data.isActive !== undefined)
      data.isActive = parseBoolean(data.isActive);

    if (data.flashSaleStart) {
      const startDate = new Date(data.flashSaleStart);
      if (isNaN(startDate))
        return res
          .status(400)
          .json({ errCode: 1, errMessage: "flashSaleStart không hợp lệ" });
      data.flashSaleStart = startDate;
    }
    if (data.flashSaleEnd) {
      const endDate = new Date(data.flashSaleEnd);
      if (isNaN(endDate))
        return res
          .status(400)
          .json({ errCode: 1, errMessage: "flashSaleEnd không hợp lệ" });
      data.flashSaleEnd = endDate;
    }
    if (data.flashSalePrice !== undefined)
      data.flashSalePrice =
        data.flashSalePrice === "" ? null : data.flashSalePrice;

    const files = req.files || {};
    const primaryFile = files.image?.[0] || files.images?.[0] || null;
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

    const extraFiles =
      primaryFile && galleryFiles.length > 0
        ? galleryFiles.slice(primaryFile === galleryFiles[0] ? 1 : 0)
        : galleryFiles;

    if (extraFiles.length > 0) {
      const uploads = await uploadFilesToCloudinary(extraFiles);
      uploads.forEach((u) =>
        imageRecords.push({
          imageUrl: u.imageUrl,
          publicId: u.publicId,
          isPrimary: false,
        }),
      );
    }

    const product = await ProductService.createProductWithVariants(data, imageRecords);
    return res.status(201).json(product);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetAllProducts = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const isFlashSale = req.query.isFlashSale === "true" || req.query.isFlashSale === "1";

    const result = await ProductService.getAllProducts(
      categoryId,
      page,
      limit,
      isFlashSale,
    );
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleGetAllProducts:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ProductService.getProductById(id);
    const status = result.errCode === 0 ? 200 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("Error in handleGetProductById:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.specifications && typeof data.specifications === "string") {
      try {
        data.specifications = JSON.parse(data.specifications);
      } catch (e) {
        console.error("Error parsing specifications:", e);
      }
    }

    if (data.brandId) data.brandId = parseInt(data.brandId);
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.price !== undefined) data.basePrice = data.price;
    if (data.isActive !== undefined)
      data.isActive = parseBoolean(data.isActive);

    if (data.flashSaleStart) {
      const startDate = new Date(data.flashSaleStart);
      if (isNaN(startDate))
        return res
          .status(400)
          .json({ errCode: 1, errMessage: "flashSaleStart không hợp lệ" });
      data.flashSaleStart = startDate;
    }
    if (data.flashSaleEnd) {
      const endDate = new Date(data.flashSaleEnd);
      if (isNaN(endDate))
        return res
          .status(400)
          .json({ errCode: 1, errMessage: "flashSaleEnd không hợp lệ" });
      data.flashSaleEnd = endDate;
    }
    if (data.flashSalePrice !== undefined)
      data.flashSalePrice =
        data.flashSalePrice === "" ? null : data.flashSalePrice;

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
      const uploads = await uploadFilesToCloudinary(galleryFiles);
      uploads.forEach((u) =>
        imageRecords.push({
          imageUrl: u.imageUrl,
          publicId: u.publicId,
          isPrimary: false,
        }),
      );
    }

    const product = await ProductService.updateProduct(id, data, imageRecords);
    return res.status(200).json(product);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
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
      minPrice,
      maxPrice,
      search,
      sort,
    } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));

    const filters = {
      brandId,
      categoryId,
      minPrice,
      maxPrice,
      search,
      sort,
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

module.exports = {
  handleCreateProduct,
  handleGetAllProducts,
  handleGetProductById,
  handleGetProductBySlug, // Export mới
  handleUpdateProduct,
  handleDeleteProduct,
  handleSearchProducts,
  handleSearchSuggestions,
  handleGetDiscountedProducts,
  handleGetFlashSaleProducts,
  handleFilterProducts,
  handleRecommendProducts,
  handleRecommendFortuneProducts,
};
