const db = require("../models");
const BaseService = require("./BaseService");
const { slugify } = require("../utils/slugHelper");

class BrandService extends BaseService {
  constructor() {
    super(db.Brand, "Brand");
  }

  // Override create to handle slug
  async createBrand(data) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }
    return await this.create(data);
  }

  // Specialized method for all brands with product count
  async getAllBrands(page = 1, limit = 10, searchTerm = "") {
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
    return await this.update(id, data);
  }

  async deleteBrand(id) {
    return await this.delete(id);
  }
}

module.exports = new BrandService();
