/**
 * Helper để xử lý phân trang cho Sequelize
 * @param {number} page 
 * @param {number} limit 
 * @returns {object} { offset, limit }
 */
const getPagination = (page, limit) => {
  const p = page && page > 0 ? parseInt(page) : 1;
  const l = limit && limit > 0 ? parseInt(limit) : 10;
  const offset = (p - 1) * l;
  return { offset, limit: l };
};

/**
 * Helper để format dữ liệu phân trang trả về
 * @param {object} data Kết quả từ findAndCountAll của Sequelize
 * @param {number} page 
 * @param {number} limit 
 * @returns {object}
 */
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? parseInt(page) : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, items, totalPages, currentPage };
};

module.exports = {
  getPagination,
  getPagingData,
};
