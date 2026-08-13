const { getPagination, getPagingData } = require("../utils/paginationHelper");
const ServiceResult = require("../utils/serviceResult");
const { Op } = require("sequelize");

class BaseService {
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName;
  }

  async getAll(page = 1, limit = 10, searchTerm = "", options = {}) {
    try {
      const { offset, limit: l } = getPagination(page, limit);
      const { searchFields = ["name"], include = [], attributes = null, order = [["createdAt", "DESC"]] } = options;

      let where = {};
      if (searchTerm && searchFields.length > 0) {
        where[Op.or] = searchFields.map(field => ({
          [field]: { [Op.like]: `%${searchTerm}%` }
        }));
      }

      const data = await this.model.findAndCountAll({
        where: { ...where, ...options.where },
        attributes,
        include,
        order,
        limit: l,
        offset,
        distinct: true,
      });

      const pagingData = getPagingData(data, page, l);
      return ServiceResult.success(pagingData.items, "Success", {
        totalItems: pagingData.totalItems,
        currentPage: pagingData.currentPage,
        totalPages: pagingData.totalPages,
        limit: l,
      });
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.getAll:`, e);
      return ServiceResult.error(e.message, 1);
    }
  }

  async getById(id, options = {}) {
    try {
      const item = await this.model.findByPk(id, options);
      if (!item) return ServiceResult.error(`${this.modelName} not found`, 1);
      return ServiceResult.success(item);
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.getById:`, e);
      return ServiceResult.error(e.message, 1);
    }
  }

  async getOne(where, options = {}) {
    try {
      const item = await this.model.findOne({ where, ...options });
      if (!item) return ServiceResult.error(`${this.modelName} not found`, 1);
      return ServiceResult.success(item);
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.getOne:`, e);
      return ServiceResult.error(e.message, 1);
    }
  }

  async create(data) {
    try {
      const item = await this.model.create(data);
      return ServiceResult.success(item);
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.create:`, e);
      return ServiceResult.error(e.message, 1);
    }
  }

  async update(id, data) {
    try {
      const item = await this.model.findByPk(id);
      if (!item) return ServiceResult.error(`${this.modelName} not found`, 1);
      
      const updatedItem = await item.update(data);
      return ServiceResult.success(updatedItem);
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.update:`, e);
      return ServiceResult.error(e.message, 1);
    }
  }

  async delete(id) {
    try {
      const item = await this.model.findByPk(id);
      if (!item) return ServiceResult.error(`${this.modelName} not found`, 1);

      await item.destroy();
      return ServiceResult.success(null, `${this.modelName} deleted successfully`);
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.delete:`, e);
      return ServiceResult.error(e.message, 1);
    }
  }
}

module.exports = BaseService;
