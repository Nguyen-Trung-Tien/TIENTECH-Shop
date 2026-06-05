const db = require("../models");
const BaseService = require("./BaseService");
const { slugify } = require("../utils/slugHelper");
const { getCache, setCache, deleteCacheByPattern } = require("../config/redis");

class CategoryService extends BaseService {
  constructor() {
    super(db.Category, "Category");
  }

  async getAllCategories(page = 1, limit = 10, searchTerm = "") {
    const cacheKey = `categories_page_${page}_limit_${limit}_search_${searchTerm || "all"}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const options = {
      searchFields: ["name"],
      include: [
        {
          model: db.Category,
          as: "subcategories",
          attributes: ["id", "name", "slug"],
        },
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
        { model: db.Product, as: "products", attributes: ["id"] },
      ],
      order: [["id", "ASC"]],
    };

    const result = await this.getAll(page, limit, searchTerm, options);

    if (result.errCode === 0) {
      result.data = result.data.map((cat) => {
        const catJson = cat.toJSON();
        return {
          ...catJson,
          productCount: cat.products ? cat.products.length : 0,
          products: undefined,
        };
      });

      // Cache for 1 hour
      await setCache(cacheKey, result, 3600);
    }
    return result;
  }

  async getCategoryBySlug(slug) {
    return await this.getOne(
      { slug },
      {
        include: [
          {
            model: db.Category,
            as: "subcategories",
            attributes: ["id", "name", "slug"],
          },
          {
            model: db.Category,
            as: "parent",
            attributes: ["id", "name", "slug"],
          },
        ],
      },
    );
  }

  async getCategoryById(id) {
    return await this.getById(id, {
      include: [
        {
          model: db.Category,
          as: "subcategories",
          attributes: ["id", "name", "slug"],
        },
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
      ],
    });
  }

  async createCategory(data) {
    if (data.name) {
      const exist = await this.model.findOne({ where: { name: data.name } });
      if (exist) return { errCode: 2, errMessage: "Tên danh mục đã tồn tại" };
      if (!data.slug) data.slug = slugify(data.name);
    }
    const result = await this.create(data);
    await deleteCacheByPattern("categories_page_*");
    return result;
  }

  async updateCategory(id, data) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }
    const result = await this.update(id, data);
    await deleteCacheByPattern("categories_page_*");
    return result;
  }

  async deleteCategory(id) {
    try {
      const category = await db.Category.findByPk(id, {
        include: [
          { model: db.Product, as: "products", attributes: ["id"] },
          { model: db.Category, as: "subcategories", attributes: ["id"] },
        ],
      });

      if (!category) {
        return { errCode: 1, errMessage: "Danh mục không tồn tại" };
      }

      if (category.products && category.products.length > 0) {
        return {
          errCode: 2,
          errMessage: "Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.",
        };
      }

      if (category.subcategories && category.subcategories.length > 0) {
        return {
          errCode: 3,
          errMessage: "Không thể xóa danh mục đang có danh mục con.",
        };
      }

      await category.destroy();
      await deleteCacheByPattern("categories_page_*");
      return { errCode: 0, errMessage: "Xóa danh mục thành công" };
    } catch (e) {
      console.error("Error in CategoryService.deleteCategory:", e);
      return { errCode: -1, errMessage: e.message };
    }
  }
}

module.exports = new CategoryService();
