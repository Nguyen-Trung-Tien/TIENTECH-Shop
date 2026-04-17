const db = require("../../models");
const { Op } = require("sequelize");
const { getPagination, getPagingData } = require("../../utils/paginationHelper");
const {
  applyFlashSaleToProduct,
  clearProductCache,
} = require("./productHelper");

const getFlashSaleProducts = async (page = 1, limit = 10) => {
  try {
    const now = new Date();
    const { offset, limit: l } = getPagination(page, limit);
    
    const activeData = await db.Product.findAndCountAll({
      where: {
        isActive: true,
        isFlashSale: true,
        flashSaleStart: { [Op.lte]: now },
        flashSaleEnd: { [Op.gte]: now },
      },
      include: [
        { model: db.Category, as: "category" },
        { model: db.Brand, as: "brand" },
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["imageUrl", "isPrimary"],
        },
      ],
      limit: l,
      offset,
      order: [["flashSaleStart", "ASC"]],
    });

    const upcomingData = await db.Product.findAll({
      where: {
        isActive: true,
        isFlashSale: true,
        flashSaleStart: { 
          [Op.gt]: now,
          [Op.lte]: new Date(now.getTime() + 24 * 60 * 60 * 1000) 
        },
      },
      include: [
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["imageUrl", "isPrimary"],
        },
      ],
      limit: 6,
      order: [["flashSaleStart", "ASC"]],
    });

    const pagingData = getPagingData(activeData, page, l);

    const nextFlashSale = await db.Product.findOne({
      where: {
        isActive: true,
        isFlashSale: true,
        flashSaleStart: { [Op.gt]: now },
      },
      order: [["flashSaleStart", "ASC"]],
      attributes: ["flashSaleStart"],
    });

    const products = pagingData.items.map((p) => {
      const pJSON = p.toJSON();
      const primary = pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
      return applyFlashSaleToProduct({
        ...pJSON,
        image: primary?.imageUrl || null,
      });
    });

    const upcomingProducts = upcomingData.map((p) => {
      const pJSON = p.toJSON();
      const primary = pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
      return {
        ...pJSON,
        image: primary?.imageUrl || null,
      };
    });

    return {
      errCode: 0,
      products,
      upcomingProducts,
      nextFlashSaleStart: nextFlashSale ? nextFlashSale.flashSaleStart : null,
      pagination: {
        totalItems: pagingData.totalItems,
        totalPages: pagingData.totalPages,
        currentPage: pagingData.currentPage,
      },
      currentPage: pagingData.currentPage,
      totalPages: pagingData.totalPages
    };
  } catch (error) {
    console.error("Error in getFlashSaleProducts:", error);
    return { errCode: 1, errMessage: error.message };
  }
};

const getDiscountedProducts = async (page = 1, limit = 10) => {
  const { offset, limit: l } = getPagination(page, limit);
  const now = new Date();
  const data = await db.Product.findAndCountAll({
    where: {
      isActive: true,
      [Op.or]: [
        {
          isFlashSale: true,
          flashSaleStart: { [Op.lte]: now },
          flashSaleEnd: { [Op.gte]: now },
        },
      ],
    },
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["imageUrl", "isPrimary"],
      },
    ],
    limit: l,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const pagingData = getPagingData(data, page, l);
  const { items, ...paginationMetadata } = pagingData;

  return {
    errCode: 0,
    products: items.map((p) => {
      const pJSON = p.toJSON();
      const primary =
        pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
      return applyFlashSaleToProduct({
        ...pJSON,
        image: primary?.imageUrl || null,
      });
    }),
    pagination: paginationMetadata,
  };
};

const disableExpiredFlashSales = async () => {
  try {
    const now = new Date();
    const [updated] = await db.Product.update(
      { isFlashSale: false },
      {
        where: {
          isFlashSale: true,
          flashSaleEnd: { [Op.lte]: now },
        },
      },
    );

    if (updated > 0) {
      clearProductCache();
    }

    return { errCode: 0, updated };
  } catch (error) {
    console.error("Error disabling expired flash sales:", error);
    return { errCode: 1, errMessage: error.message };
  }
};

module.exports = {
  getFlashSaleProducts,
  getDiscountedProducts,
  disableExpiredFlashSales,
};
