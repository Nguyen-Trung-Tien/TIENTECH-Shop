const OrderItemService = require("../OrderItemService");

const requestReturn = async (orderItemId, userIdOrReason, reasonOrNull = null) => {
  // Supports both signatures: (orderItemId, reason) or (orderItemId, userId, reason)
  let user = null;
  let reason = "";

  if (typeof userIdOrReason === "object") {
    user = userIdOrReason;
    reason = reasonOrNull || "";
  } else if (typeof userIdOrReason === "number" || (typeof userIdOrReason === "string" && !isNaN(userIdOrReason))) {
    user = { id: Number(userIdOrReason), role: "customer" };
    reason = reasonOrNull || "";
  } else {
    reason = userIdOrReason;
  }

  return await OrderItemService.requestReturn(orderItemId, reason, user);
};

const handleReturnAction = async (orderItemId, action, adminUserOrId = null) => {
  let adminUser = null;
  if (typeof adminUserOrId === "object") {
    adminUser = adminUserOrId;
  } else if (adminUserOrId) {
    adminUser = { id: adminUserOrId, role: "admin", username: "Admin" };
  }

  return await OrderItemService.processReturn(orderItemId, action, adminUser);
};

module.exports = {
  requestReturn,
  handleReturnAction,
};
