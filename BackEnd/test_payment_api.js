const db = require("./src/models");
const PaymentService = require("./src/services/PaymentService");

async function test() {
  try {
    const res = await PaymentService.getAllPayments({ page: 1, limit: 10, search: "" });
    console.log("Empty search:", res);

    const res2 = await PaymentService.getAllPayments({ page: 1, limit: 10, search: "1" });
    console.log("Search '1':", res2);
  } catch (e) {
    console.error("Test failed:", e);
  } finally {
    process.exit(0);
  }
}

test();
