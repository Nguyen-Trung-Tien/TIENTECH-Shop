const db = require("../models");

const createBrand = async (data) => {
  try {
    const brand = await db.Brand.create(data);
    return { errCode: 0, brand };
  } catch (e) {
    console.error("Error creating brand:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const getAllBrands = async () => {
  try {
    const brands = await db.Brand.findAll({
      attributes: ["id", "name", "slug", "description", "image", "createdAt"],
      include: [
        {
          model: db.Product,
          as: "products",
          attributes: ["id"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const result = brands.map((b) => {
      const brandJson = b.toJSON();
      return {
        ...brandJson,
        productCount: b.products ? b.products.length : 0,
      };
    });

    return { errCode: 0, brands: result };
  } catch (e) {
    console.error("Error fetching brands:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const getBrandById = async (id) => {
  try {
    const brand = await db.Brand.findByPk(id, {
      include: [
        {
          model: db.Product,
          as: "products",
          attributes: ["id", "name", ["basePrice", "price"]],
          include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
        },
      ],
    });

    if (!brand) return { errCode: 1, errMessage: "Brand not found" };

    const plainBrand = brand.get({ plain: true });
    if (plainBrand.products) {
      plainBrand.products = plainBrand.products.map(p => {
        const primary = p.images?.find(i => i.isPrimary) || p.images?.[0];
        return {
          ...p,
          image: primary ? primary.imageUrl : null
        };
      });
    }

    return { errCode: 0, brand: plainBrand };
  } catch (e) {
    console.error("Error fetching brand:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const updateBrand = async (id, data) => {
  try {
    const brand = await db.Brand.findByPk(id);
    if (!brand) return { errCode: 1, errMessage: "Brand not found" };

    const updatedBrand = await brand.update(data);
    return { errCode: 0, brand: updatedBrand };
  } catch (e) {
    console.error("Error updating brand:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const deleteBrand = async (id) => {
  try {
    const brand = await db.Brand.findByPk(id);
    if (!brand) return { errCode: 1, errMessage: "Brand not found" };

    await brand.destroy();
    return { errCode: 0, errMessage: "Brand deleted successfully" };
  } catch (e) {
    console.error("Error deleting brand:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

module.exports = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};
