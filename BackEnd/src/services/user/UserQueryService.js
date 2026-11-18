const db = require("../../models");
const BaseService = require("../BaseService");
const { getCache, setCache } = require("../../config/redis");
const { getUserProfileKey } = require("./AuthHelper");

const SAFE_USER_EXCLUDE = [
  "password",
  "refreshTokenHash",
  "resetToken",
  "verificationToken",
];

class UserQueryService extends BaseService {
  constructor() {
    super(db.User, "User");
  }

  async getAllUsers(page = 1, limit = 10, search = "", filters = {}) {
    const { Op } = require("sequelize");
    const where = {
      role: { [Op.ne]: "root" },
    };

    if (filters.status) {
      if (filters.status === "active") {
        where.isActive = true;
      } else if (filters.status === "pending") {
        where.isActive = false;
        where.verificationToken = { [Op.ne]: null };
      } else if (
        filters.status === "suspended" ||
        filters.status === "inactive"
      ) {
        where.isActive = false;
        where.verificationToken = null;
      }
    }

    if (filters.role && ["customer", "admin"].includes(filters.role)) {
      where.role = filters.role;
    }

    const searchTrimmed = String(search || "").trim();
    if (searchTrimmed) {
      const orClauses = [
        { username: { [Op.like]: `%${searchTrimmed}%` } },
        { email: { [Op.like]: `%${searchTrimmed}%` } },
        { phone: { [Op.like]: `%${searchTrimmed}%` } },
      ];
      if (!isNaN(searchTrimmed) && Number(searchTrimmed) > 0) {
        orClauses.push({ id: Number(searchTrimmed) });
      }
      where[Op.or] = orClauses;
    }

    const options = {
      where,
      searchFields: [],
      attributes: {
        include: [
          [
            db.Sequelize.literal(
              "CASE WHEN isActive = 1 THEN 'active' WHEN verificationToken IS NOT NULL THEN 'pending' ELSE 'suspended' END",
            ),
            "accountStatus",
          ],
        ],
        exclude: SAFE_USER_EXCLUDE,
      },
      order: [["createdAt", "DESC"]],
    };
    return await this.getAll(page, limit, "", options);
  }

  async getUserById(userId) {
    return await this.getById(userId, {
      attributes: { exclude: SAFE_USER_EXCLUDE },
    });
  }

  async getMyProfile(userId) {
    const cacheKey = getUserProfileKey(userId);
    const cachedProfile = await getCache(cacheKey);
    if (cachedProfile) {
      return { errCode: 0, data: cachedProfile };
    }

    const result = await this.getUserById(userId);
    if (result.errCode === 0 && result.data) {
      await setCache(cacheKey, result.data, 900);
    }
    return result;
  }

  async getUserMetrics() {
    const { Op } = require("sequelize");
    try {
      const [
        totalUsers,
        activeUsers,
        pendingUsers,
        suspendedUsers,
        adminUsers,
        customerUsers,
      ] = await Promise.all([
        this.model.count({ where: { role: { [Op.ne]: "root" } } }),
        this.model.count({
          where: { isActive: true, role: { [Op.ne]: "root" } },
        }),
        this.model.count({
          where: {
            isActive: false,
            verificationToken: { [Op.ne]: null },
            role: { [Op.ne]: "root" },
          },
        }),
        this.model.count({
          where: {
            isActive: false,
            verificationToken: null,
            role: { [Op.ne]: "root" },
          },
        }),
        this.model.count({ where: { role: "admin" } }),
        this.model.count({ where: { role: "customer" } }),
      ]);

      return {
        errCode: 0,
        data: {
          totalUsers,
          activeUsers,
          pendingUsers,
          suspendedUsers,
          adminUsers,
          customerUsers,
        },
      };
    } catch (e) {
      console.error("UserQueryService.getUserMetrics error:", e);
      return {
        errCode: 2,
        errMessage: "Lỗi tải thống kê người dùng: " + e.message,
      };
    }
  }

  async getUserAuditLogs(
    page = 1,
    limit = 10,
    targetUserId = null,
    action = null,
  ) {
    try {
      if (!db.AuditLog) {
        return {
          errCode: 0,
          data: [],
          pagination: { totalItems: 0, currentPage: 1, totalPages: 1, limit },
        };
      }

      const p = Math.max(1, +page || 1);
      const l = Math.min(100, Math.max(1, +limit || 10));
      const offset = (p - 1) * l;

      const where = {};
      if (targetUserId) where.targetUserId = Number(targetUserId);
      if (action) where.action = action;

      const { count, rows } = await db.AuditLog.findAndCountAll({
        where,
        limit: l,
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: "admin",
            attributes: ["id", "username", "email", "avatar"],
          },
          {
            model: db.User,
            as: "targetUser",
            attributes: ["id", "username", "email", "avatar"],
          },
        ],
      });

      return {
        errCode: 0,
        data: rows,
        pagination: {
          totalItems: count,
          currentPage: p,
          totalPages: Math.ceil(count / l) || 1,
          limit: l,
        },
      };
    } catch (e) {
      console.error("UserQueryService.getUserAuditLogs error:", e);
      if (e.message && e.message.includes("AuditLogs' doesn't exist")) {
        if (db.AuditLog) {
          await db.AuditLog.sync({ alter: false }).catch(() => {});
        }
        return {
          errCode: 0,
          data: [],
          pagination: {
            totalItems: 0,
            currentPage: 1,
            totalPages: 1,
            limit: +limit || 10,
          },
        };
      }
      return {
        errCode: 2,
        errMessage: "Lỗi tải nhật ký quản trị: " + e.message,
      };
    }
  }
}

module.exports = new UserQueryService();
