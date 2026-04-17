const productCore = require("./productCore");
const productSearch = require("./productSearch");
const productRecommendation = require("./productRecommendation");
const productSale = require("./productSale");

module.exports = {
  // Core CRUD
  ...productCore,

  // Search & Filter
  ...productSearch,

  // Recommendations
  ...productRecommendation,

  // Sales & Discounts
  ...productSale,
};
