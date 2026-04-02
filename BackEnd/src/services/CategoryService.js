const db = require("../models");
const BaseService = require("./BaseService");
const { slugify } = require("../utils/slugHelper");

class CategoryService extends BaseService {
  constructor() {
    super(db.Category, "Category");
  }

  async getAllCategories(page = 1, limit = 10, searchTerm = "") {
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
    return await this.create(data);
  }

  async updateCategory(id, data) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }
    return await this.update(id, data);
  }

  async deleteCategory(id) {
    return await this.delete(id);
  }
}

module.exports = new CategoryService();
