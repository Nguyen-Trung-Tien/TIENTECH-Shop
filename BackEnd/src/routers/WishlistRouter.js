const express = require("express");
const router = express.Router();
const WishlistController = require("../controller/WishlistController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/add", authenticateToken, WishlistController.handleAddToWishlist);
router.delete("/remove/:productId", authenticateToken, WishlistController.handleRemoveFromWishlist);
router.get("/get-all", authenticateToken, WishlistController.handleGetWishlist);
router.get("/check/:productId", authenticateToken, WishlistController.handleCheckIsInWishlist);

module.exports = router;
