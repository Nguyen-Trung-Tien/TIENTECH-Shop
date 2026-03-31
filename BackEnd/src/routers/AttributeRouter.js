const express = require("express");
const router = express.Router();
const AttributeController = require("../controller/AttributeController");

// Lấy toàn bộ thuộc tính và giá trị (dùng cho Admin dropdown hoặc Filter sidebar)
router.get("/get-all", AttributeController.handleGetAllAttributes);

// Lấy thuộc tính theo mã code (ví dụ: /api/v1/attribute/get-by-code/ram)
router.get("/get-by-code/:code", AttributeController.handleGetAttributeByCode);

module.exports = router;
