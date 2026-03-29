const db = require("../models");

const getAllCategories = async () => {
  try {
    const categories = await db.Category.findAll({
      attributes: ["id", "name", "slug", "description", "image", "createdAt", "parentId"],
      include: [
        { model: db.Category, as: "subcategories", attributes: ["id", "name"] },
        { model: db.Category, as: "parent", attributes: ["id", "name"] }
      ],
      order: [["id", "ASC"]],
    });

    return { errCode: 0, data: categories };
  } catch (error) {
    console.error("CategoryService getAllCategories error:", error);
    return { errCode: 1, errMessage: "Lỗi khi lấy danh sách danh mục" };
  }
};

const getCategoryById = async (id) => {
  try {
    const category = await db.Category.findByPk(id, {
      include: [{ model: db.Category, as: "subcategories", attributes: ["id", "name"] }]
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

    const newCategory = await db.Category.create({
      name,
      slug,
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
