const express = require("express");
const router = express.Router();
const WishlistController = require("../controllers/WishlistController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const { wishlistAddSchema } = require("../utils/zodSchemas");

router.post("/add", authenticateToken, validate(wishlistAddSchema), WishlistController.handleAddToWishlist);
router.delete("/remove/:productId", authenticateToken, WishlistController.handleRemoveFromWishlist);
router.get("/get-all", authenticateToken, WishlistController.handleGetWishlist);
router.get("/check/:productId", authenticateToken, WishlistController.handleCheckIsInWishlist);

module.exports = router;
