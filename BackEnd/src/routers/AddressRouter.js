const express = require("express");
const router = express.Router();
const AddressController = require("../controller/AddressController");
const { authenticateToken } = require("../middleware/authMiddleware");

const { validate } = require("../middleware/zodMiddleware");
const { addressSchema } = require("../utils/zodSchemas");

router.get("/get-addresses", authenticateToken, AddressController.handleGetAddresses);
router.post("/create-address", authenticateToken, validate(addressSchema), AddressController.handleCreateAddress);
router.put("/update-address/:addressId", authenticateToken, validate(addressSchema), AddressController.handleUpdateAddress);
router.delete("/delete-address/:addressId", authenticateToken, AddressController.handleDeleteAddress);
router.patch("/set-default/:addressId", authenticateToken, AddressController.handleSetDefaultAddress);

module.exports = router;
