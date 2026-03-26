const express = require("express");
const router = express.Router();
const AddressController = require("../controller/AddressController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/get-addresses", authenticateToken, AddressController.handleGetAddresses);
router.post("/create-address", authenticateToken, AddressController.handleCreateAddress);
router.put("/update-address/:addressId", authenticateToken, AddressController.handleUpdateAddress);
router.delete("/delete-address/:addressId", authenticateToken, AddressController.handleDeleteAddress);
router.patch("/set-default/:addressId", authenticateToken, AddressController.handleSetDefaultAddress);

module.exports = router;
