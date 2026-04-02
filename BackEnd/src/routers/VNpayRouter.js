const express = require("express");
const router = express.Router();
const VNpay = require("../controller/VNpay");

router.post("/create-vnpay-payment", VNpay.handleCreateVnpayPayment);
router.get("/vnpay-return", VNpay.handleVnpayReturn);
router.get("/vnpay-ipn", VNpay.handleVnpayIPN);
module.exports = router;
