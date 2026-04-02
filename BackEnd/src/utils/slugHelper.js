const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "") // Xóa ký tự đặc biệt
    .replace(/(\s+)/g, "-") // Thay khoảng trắng bằng -
    .replace(/-+/g, "-") // Xóa nhiều - liên tiếp
    .replace(/^-+|-+$/g, ""); // Xóa - ở đầu và cuối
};

module.exports = { slugify };
