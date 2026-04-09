const { body } = require("express-validator");

const orderValidation = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("shippingAddress").notEmpty().withMessage("Shipping address is required"),
  body("receiverName").notEmpty().withMessage("Receiver name is required"),
  body("receiverPhone").notEmpty().withMessage("Receiver phone is required")
    .isMobilePhone("any").withMessage("Invalid phone number"),
  body("orderItems").isArray({ min: 1 }).withMessage("Order must have at least one item"),
  body("orderItems.*.productId").notEmpty().withMessage("Product ID is required for items"),
  body("orderItems.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

const registerValidation = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("username").notEmpty().withMessage("Username is required"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  orderValidation,
  registerValidation,
  loginValidation,
};
