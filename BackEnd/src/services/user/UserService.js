const db = require("../../models");
const BaseService = require("../BaseService");
const { sendVerificationEmail } = require("../sendEmail");
const { 
  hashToken, 
  generateRandomToken, 
  hashUserPassword 
} = require("./AuthHelper");

class UserService extends BaseService {
  constructor() {
    super(db.User, "User");
  }

  async getAllUsers(page = 1, limit = 10, search = "") {
    const { Op } = require("sequelize");
    const options = {
      searchFields: ["username", "email", "phone"],
      where: {
        role: { [Op.ne]: "root" }
      },
      attributes: { exclude: ["password", "refreshTokenHash", "resetToken", "verificationToken"] },
      order: [["createdAt", "DESC"]]
    };
    return await this.getAll(page, limit, search, options);
  }

  async getUserById(userId) {
    return await this.getById(userId, {
      attributes: { exclude: ["password", "refreshTokenHash", "resetToken", "verificationToken"] }
    });
  }

  async createNewUser(data) {
    try {
      const exist = await this.model.findOne({ where: { email: data.email } });
      if (exist) return { errCode: 1, errMessage: "Email đã tồn tại" };

      const hashedPassword = await hashUserPassword(data.password || "123456");
      const verificationToken = generateRandomToken();
      
      const userData = {
        ...data,
        password: hashedPassword,
        role: data.role || "customer",
        isActive: data.isActive ?? false,
        verificationToken: hashToken(verificationToken),
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const user = await this.model.create(userData);
      
      if (!data.isActive) {
        await sendVerificationEmail(user, verificationToken);
      }

      return { errCode: 0, data: user };
    } catch (e) {
      console.error("UserService.createNewUser error:", e);
      return { errCode: 2, errMessage: e.message };
    }
  }

  async updateUser(userId, data, currentUserRole = "customer") {
    try {
      const user = await this.model.findByPk(userId);
      if (!user) return { errCode: 1, errMessage: "User not found" };

      if (data.email && data.email !== user.email) {
        const exist = await this.model.findOne({ where: { email: data.email } });
        if (exist) return { errCode: 1, errMessage: "Email already exists" };
      }

      if (data.role && currentUserRole !== "admin") {
        delete data.role;
      }

      const updatedUser = await user.update(data);
      const { password, ...userData } = updatedUser.toJSON();
      return { errCode: 0, data: userData };
    } catch (e) {
      console.error("UserService.updateUser error:", e);
      return { errCode: 2, errMessage: e.message };
    }
  }
}

module.exports = new UserService();
