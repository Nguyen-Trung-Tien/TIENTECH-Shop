const db = require("../models");
const { Op } = require("sequelize");

class ProductRepository {
  async findAndCountAll(options) {
    return await db.Product.findAndCountAll({
      ...options,
      distinct: true,
    });
  }

  async findByPk(id, options = {}) {
    return await db.Product.findByPk(id, options);
  }

  async findOne(options) {
    return await db.Product.findOne(options);
  }

  async create(data, options = {}) {
    return await db.Product.create(data, options);
  }

  async update(id, data, options = {}) {
    const product = await db.Product.findByPk(id, { transaction: options.transaction });
    if (!product) return null;
    return await product.update(data, options);
  }

  async destroy(id, options = {}) {
    return await db.Product.destroy({
      where: { id },
      ...options,
    });
  }

  // Optimized read methods
  async getAllOptimized({ whereCondition, offset, limit, include }) {
    return await db.Product.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id", "name", "slug", "sku", "basePrice", "discount", "totalStock", 
        "hasVariants", "isFlashSale", "flashSaleStart", "flashSaleEnd", "flashSalePrice", 
        "isActive", "categoryId", "brandId", "createdAt",
        [
          db.sequelize.literal(`(
            SELECT COALESCE(ROUND(AVG(rating), 1), 5.0)
            FROM Reviews AS r
            WHERE r.productId = Product.id
          )`),
          "avgRating",
        ],
        [
          db.sequelize.literal(`(
            SELECT COUNT(*)
            FROM Reviews AS r
            WHERE r.productId = Product.id
          )`),
          "reviewCount",
        ],
      ],
      include,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });
  }

  async getByIdOptimized(id, include) {
    return await db.Product.findByPk(id, {
      include,
    });
  }
}

module.exports = new ProductRepository();
