const BrandService = require("../services/BrandService");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "brands" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

const handleCreateBrand = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer);
      data.image = upload.secure_url;
    }

    const result = await BrandService.createBrand(data);
    return res.status(201).json(result);
  } catch (e) {
    console.error("Error creating brand:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetAllBrands = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await BrandService.getAllBrands(page, limit, search);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in handleGetAllBrands:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetBrandById = async (req, res) => {
  try {
    const result = await BrandService.getBrandById(req.params.id);
    const status = result.errCode === 0 ? 200 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("Error in handleGetBrandById:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetBrandBySlug = async (req, res) => {
  try {
    const result = await BrandService.getBrandBySlug(req.params.slug);
    const status = result.errCode === 0 ? 200 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("Error in handleGetBrandBySlug:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleUpdateBrand = async (req, res) => {
  try {
    const data = { ...req.body };
    const { id } = req.params;

    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer);
      data.image = upload.secure_url;
    }

    const result = await BrandService.updateBrand(id, data);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error updating brand:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleDeleteBrand = async (req, res) => {
  try {
    const result = await BrandService.deleteBrand(req.params.id);
    const status = result.errCode === 0 ? 200 : 404;
    return res.status(status).json(result);
  } catch (e) {
    console.error("Error deleting brand:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
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
