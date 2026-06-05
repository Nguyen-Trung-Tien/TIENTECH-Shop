const db = require("../models");
const BaseService = require("./BaseService");
const { slugify } = require("../utils/slugHelper");
const { getCache, setCache, deleteCacheByPattern } = require("../config/redis");

class BrandService extends BaseService {
  constructor() {
    super(db.Brand, "Brand");
  }

  // Override create to handle slug
  async createBrand(data) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }
    const result = await this.create(data);
    await deleteCacheByPattern("brands_page_*");
    return result;
  }

  // Specialized method for all brands with product count
  async getAllBrands(page = 1, limit = 10, searchTerm = "") {
    const cacheKey = `brands_page_${page}_limit_${limit}_search_${searchTerm || "all"}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const options = {
      searchFields: ["name"],
      include: [
        {
          model: db.Product,
          as: "products",
          attributes: ["id"],
        },
      ],
      order: [["createdAt", "DESC"]],
    };

    const result = await this.getAll(page, limit, searchTerm, options);
    
    if (result.errCode === 0) {
      result.brands = result.data.map((b) => {
        const brandJson = b.toJSON();
        return {
          ...brandJson,
          productCount: b.products ? b.products.length : 0,
          products: undefined,
        };
      });
      delete result.data;

      // Cache for 1 hour
      await setCache(cacheKey, result, 3600);
    }
    return result;
  }

  async getBrandBySlug(slug) {
    return await this.getOne({ slug }, {
      include: [
        {
          model: db.Product,
          as: "products",
          attributes: ["id", "name", ["basePrice", "price"]],
          include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
        },
      ],
    });
  }

  async getBrandById(id) {
    return await this.getById(id, {
      include: [
        {
          model: db.Product,
          as: "products",
          attributes: ["id", "name", ["basePrice", "price"]],
          include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
        },
      ],
    });
  }

  async updateBrand(id, data) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }
    const result = await this.update(id, data);
    await deleteCacheByPattern("brands_page_*");
    return result;
  }

  async deleteBrand(id) {
    try {
      const brand = await db.Brand.findByPk(id, {
        include: [{ model: db.Product, as: "products", attributes: ["id"] }],
      });

      if (!brand) {
        return { errCode: 1, errMessage: "Thương hiệu không tồn tại" };
      }

      if (brand.products && brand.products.length > 0) {
        return {
          errCode: 2,
          errMessage: "Không thể xóa thương hiệu đang có sản phẩm. Vui lòng chuyển sản phẩm sang thương hiệu khác trước.",
        };
      }

      await brand.destroy();
      await deleteCacheByPattern("brands_page_*");
      return { errCode: 0, errMessage: "Xóa thương hiệu thành công" };
    } catch (e) {
      console.error("Error in BrandService.deleteBrand:", e);
      return { errCode: -1, errMessage: e.message };
    }
  }
}

module.exports = new BrandService();
