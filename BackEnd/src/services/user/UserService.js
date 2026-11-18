const db = require("../../models");
const BaseService = require("../BaseService");
const UserQueryService = require("./UserQueryService");
const UserMutationService = require("./UserMutationService");
const UserStatusService = require("./UserStatusService");

/**
 * Facade for User domain services (delegates to Query, Mutation, and Status modules).
 */
class UserService extends BaseService {
  constructor() {
    super(db.User, "User");
  }

  getAllUsers(page = 1, limit = 10, search = "", filters = {}) {
    return UserQueryService.getAllUsers(page, limit, search, filters);
  }

  getUserById(userId) {
    return UserQueryService.getUserById(userId);
  }

  getMyProfile(userId) {
    return UserQueryService.getMyProfile(userId);
  }

  getUserMetrics() {
    return UserQueryService.getUserMetrics();
  }

  getUserAuditLogs(page = 1, limit = 10, targetUserId = null, action = null) {
    return UserQueryService.getUserAuditLogs(page, limit, targetUserId, action);
  }

  createNewUser(data) {
    return UserMutationService.createNewUser(data);
  }

  updateUser(userId, data, currentUserRole = "customer", currentUserId = null) {
    return UserMutationService.updateUser(userId, data, currentUserRole, currentUserId);
  }

  deleteUser(userId, currentUserId = null) {
    return UserMutationService.deleteUser(userId, currentUserId);
  }

  updateUserStatus(params) {
    return UserStatusService.updateUserStatus(params);
  }

  bulkUpdateUserStatus(params) {
    return UserStatusService.bulkUpdateUserStatus(params);
  }
}

module.exports = new UserService();
