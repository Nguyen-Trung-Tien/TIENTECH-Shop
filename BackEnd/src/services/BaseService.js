const { getPagination, getPagingData } = require("../utils/paginationHelper");
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
      return {
        errCode: 0,
        data: pagingData.items,
        pagination: {
          totalItems: pagingData.totalItems,
          currentPage: pagingData.currentPage,
          totalPages: pagingData.totalPages,
          limit: l,
        }
      };
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.getAll:`, e);
      return { errCode: 1, errMessage: e.message };
    }
  }

  async getById(id, options = {}) {
    try {
      const item = await this.model.findByPk(id, options);
      if (!item) return { errCode: 1, errMessage: `${this.modelName} not found` };
      return { errCode: 0, data: item };
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.getById:`, e);
      return { errCode: 1, errMessage: e.message };
    }
  }

  async getOne(where, options = {}) {
    try {
      const item = await this.model.findOne({ where, ...options });
      if (!item) return { errCode: 1, errMessage: `${this.modelName} not found` };
      return { errCode: 0, data: item };
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.getOne:`, e);
      return { errCode: 1, errMessage: e.message };
    }
  }

  async create(data) {
    try {
      const item = await this.model.create(data);
      return { errCode: 0, data: item };
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.create:`, e);
      return { errCode: 1, errMessage: e.message };
    }
  }

  async update(id, data) {
    try {
      const item = await this.model.findByPk(id);
      if (!item) return { errCode: 1, errMessage: `${this.modelName} not found` };
      
      const updatedItem = await item.update(data);
      return { errCode: 0, data: updatedItem };
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.update:`, e);
      return { errCode: 1, errMessage: e.message };
    }
  }

  async delete(id) {
    try {
      const item = await this.model.findByPk(id);
      if (!item) return { errCode: 1, errMessage: `${this.modelName} not found` };

      await item.destroy();
      return { errCode: 0, errMessage: `${this.modelName} deleted successfully` };
    } catch (e) {
      console.error(`Error in ${this.modelName}Service.delete:`, e);
      return { errCode: 1, errMessage: e.message };
    }
  }
}

module.exports = BaseService;
