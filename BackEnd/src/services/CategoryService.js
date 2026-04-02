const db = require("../models");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const { slugify } = require("../utils/slugHelper");
const { Op } = require("sequelize");

const getAllCategories = async (page = 1, limit = 10, searchTerm = "") => {
  try {
    const { offset, limit: l } = getPagination(page, limit);
    const where = searchTerm ? { name: { [Op.like]: `%${searchTerm}%` } } : {};

    const data = await db.Category.findAndCountAll({
      where,
      attributes: ["id", "name", "slug", "description", "image", "createdAt", "parentId"],
      include: [
        { model: db.Category, as: "subcategories", attributes: ["id", "name", "slug"] },
        { model: db.Category, as: "parent", attributes: ["id", "name", "slug"] },
        { 
          model: db.Product, 
          as: "products", 
          attributes: ["id"] 
        }
      ],
      order: [["id", "ASC"]],
      limit: l,
      offset,
      distinct: true, // Quan trọng khi dùng count với include
    });

    const pagingData = getPagingData(data, page, l);

    const result = pagingData.items.map((cat) => {
      const catJson = cat.toJSON();
      return {
        ...catJson,
        productCount: cat.products ? cat.products.length : 0,
        products: undefined // Không trả về list products để giảm payload
      };
    });

    return { 
      errCode: 0, 
      data: result,
      pagination: {
        totalItems: pagingData.totalItems,
        currentPage: pagingData.currentPage,
        totalPages: pagingData.totalPages,
        limit: l,
      }
    };
  } catch (error) {
    console.error("CategoryService getAllCategories error:", error);
    return { errCode: 1, errMessage: "Lỗi khi lấy danh sách danh mục" };
  }
};

const getCategoryBySlug = async (slug) => {
  try {
    const category = await db.Category.findOne({
      where: { slug },
      include: [
        { model: db.Category, as: "subcategories", attributes: ["id", "name", "slug"] },
        { model: db.Category, as: "parent", attributes: ["id", "name", "slug"] }
      ]
    });
    if (!category)
      return { errCode: 1, errMessage: "Không tìm thấy danh mục này" };

    return { errCode: 0, data: category };
  } catch (error) {
    console.error("CategoryService getCategoryBySlug error:", error);
    return { errCode: 1, errMessage: "Lỗi khi lấy danh mục" };
  }
};

const getCategoryById = async (id) => {
  try {
    const category = await db.Category.findByPk(id, {
      include: [
        { model: db.Category, as: "subcategories", attributes: ["id", "name", "slug"] },
        { model: db.Category, as: "parent", attributes: ["id", "name", "slug"] }
      ]
    });
    if (!category)
      return { errCode: 1, errMessage: "Không tìm thấy danh mục này" };

    return { errCode: 0, data: category };
  } catch (error) {
    console.error("CategoryService getCategoryById error:", error);
    return { errCode: 1, errMessage: "Lỗi khi lấy danh mục" };
  }
};

const createCategory = async (data) => {
  try {
    const { name, slug, description, image, parentId } = data;

    const exist = await db.Category.findOne({ where: { name } });
    if (exist) return { errCode: 2, errMessage: "Tên danh mục đã tồn tại" };

    const finalSlug = slug || slugify(name);

    const newCategory = await db.Category.create({
      name,
      slug: finalSlug,
      description,
      image,
      parentId: parentId || null
    });

    return { errCode: 0, message: "Tạo danh mục thành công", data: newCategory };
  } catch (error) {
    console.error("CategoryService createCategory error:", error);
    return { errCode: 1, errMessage: "Lỗi khi tạo danh mục" };
  }
};

const updateCategory = async (id, data) => {
  try {
    const category = await db.Category.findByPk(id);
    if (!category) return { errCode: 1, errMessage: "Không tìm thấy danh mục" };

    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    await category.update(data);
    return { errCode: 0, message: "Cập nhật thành công", data: category };
  } catch (error) {
    console.error("CategoryService updateCategory error:", error);
    return { errCode: 1, errMessage: "Lỗi khi cập nhật danh mục" };
  }
};

const deleteCategory = async (id) => {
  try {
    const category = await db.Category.findByPk(id);
    if (!category) return { errCode: 1, errMessage: "Không tìm thấy danh mục" };

    await category.destroy();
    return { errCode: 0, message: "Xóa thành công" };
  } catch (error) {
    console.error("CategoryService deleteCategory error:", error);
    return { errCode: 1, errMessage: "Lỗi khi xóa danh mục" };
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
