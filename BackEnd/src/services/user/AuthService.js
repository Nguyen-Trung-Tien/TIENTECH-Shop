const db = require("../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwtHelper");
const { sendForgotPasswordEmail, sendVerificationEmail, sendEmailAsync } = require("../common/EmailService");
const { getCache, setCache, deleteCache, isRedisConnected } = require("../../config/redis");
const {
  hashToken,
  generateRandomToken,
  getTokenExpiryDate,
  hashUserPassword,
  validatePasswordStrength,
  performDummyBcryptCompare,
  getUserProfileKey,
  getRefreshTokenKey,
  getUserStatusKey,
  getTokenBlacklistKey,
  getLoginFailKey,
} = require("./AuthHelper");
const { resolveUserStatus } = require("../../utils/authTokenValidator");

const LOGIN_MAX_ATTEMPTS_SOFT = 5;
const LOGIN_MAX_ATTEMPTS_HARD = 10;
const LOCK_DURATION_SOFT_MS = 5 * 60 * 1000;
const LOCK_DURATION_HARD_MS = 15 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const otpFailMemoryStore = new Map();

const recordOtpFailure = async (type, email) => {
  try {
    const key = `otp:fail:${type}:${String(email).toLowerCase().trim()}`;
    const cachedCount = await getCache(key);
    let current = cachedCount;
    if (current === null || current === undefined) {
      const mem = otpFailMemoryStore.get(key);
      current = mem && mem.expiresAt > Date.now() ? mem.count : 0;
    }
    const count = Number(current || 0) + 1;
    await setCache(key, count, 15 * 60);
    if (!isRedisConnected()) {
      if (otpFailMemoryStore.size >= 1000) {
        const oldestKey = otpFailMemoryStore.keys().next().value;
        if (oldestKey !== undefined) otpFailMemoryStore.delete(oldestKey);
      }
      otpFailMemoryStore.set(key, { count, expiresAt: Date.now() + 15 * 60 * 1000 });
    }
    return count;
  } catch {
    return 0;
  }
};

const clearOtpFailure = async (type, email) => {
  try {
    const key = `otp:fail:${type}:${String(email).toLowerCase().trim()}`;
    otpFailMemoryStore.delete(key);
    await deleteCache(key);
  } catch {
    // Non-blocking
  }
};

const revokeAllUserSessions = async (userId) => {
  await db.User.increment("tokenVersion", { by: 1, where: { id: userId } });
  await db.User.update(
    { refreshTokenHash: null, refreshTokenExpiresAt: null },
    { where: { id: userId } }
  );
  await deleteCache(getUserStatusKey(userId));
  await deleteCache(getRefreshTokenKey(userId));
};

const recordFailedLoginAttempt = async (loginFailKey) => {
  try {
    const current = (await getCache(loginFailKey)) || { count: 0, lockedUntil: 0 };
    const nextCount = (current.count || 0) + 1;
    let lockedUntil = current.lockedUntil || 0;
    if (nextCount >= LOGIN_MAX_ATTEMPTS_HARD) {
      lockedUntil = Date.now() + LOCK_DURATION_HARD_MS;
    } else if (nextCount >= LOGIN_MAX_ATTEMPTS_SOFT) {
      lockedUntil = Date.now() + LOCK_DURATION_SOFT_MS;
    }
    await setCache(loginFailKey, { count: nextCount, lockedUntil }, 15 * 60);
  } catch (e) {
    // Non-blocking if Redis unavailable
  }
};

class AuthService {
  async login(email, password) {
    try {
      const loginFailKey = getLoginFailKey(email);
      const failState = await getCache(loginFailKey);
      if (failState?.lockedUntil && failState.lockedUntil > Date.now()) {
        const waitMinutes = Math.max(1, Math.ceil((failState.lockedUntil - Date.now()) / 60000));
        return {
          errCode: 429,
          statusCode: 429,
          errMessage: `Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau ${waitMinutes} phút.`,
        };
      }

      const user = await db.User.findOne({ where: { email } });
      if (!user || !user.password) {
        await performDummyBcryptCompare(password);
        await recordFailedLoginAttempt(loginFailKey);
        return { errCode: 2, errMessage: "Email hoặc mật khẩu không chính xác!", statusCode: 401 };
      }
      if (!user.isActive) {
        return { errCode: 3, errMessage: "Tài khoản chưa được kích hoạt hoặc đã bị khóa!", statusCode: 401 };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await recordFailedLoginAttempt(loginFailKey);
        return { errCode: 2, errMessage: "Email hoặc mật khẩu không chính xác!", statusCode: 401 };
      }

      await deleteCache(loginFailKey);

      const tokenVersion = typeof user.tokenVersion === "number" ? user.tokenVersion : 0;
      const payload = { id: user.id, email: user.email, role: user.role, ver: tokenVersion };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      const refreshTokenHash = hashToken(refreshToken);
      const refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);

      await user.update({
        refreshTokenHash,
        refreshTokenExpiresAt,
      });

      const {
        password: _pw,
        refreshTokenHash: _rth,
        resetToken: _rt,
        verificationToken: _vt,
        resetTokenExpiresAt: _rtea,
        verificationTokenExpiresAt: _vtea,
        refreshTokenExpiresAt: _rthea,
        ...userData
      } = user.toJSON();

      // Cache User Profile & Refresh Token State in Redis
      await setCache(getUserProfileKey(user.id), userData, 900); // 15 mins TTL
      await setCache(
        getRefreshTokenKey(user.id),
        { hash: refreshTokenHash, expiresAt: refreshTokenExpiresAt, email: user.email, role: user.role, ver: tokenVersion },
        7 * 24 * 3600
      );

      return { errCode: 0, data: { user: userData, accessToken, refreshToken } };
    } catch (error) {
      console.error("AuthService.login error:", error);
      return { errCode: -1, errMessage: error.message };
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) return { errCode: 1, errMessage: "Refresh token không hợp lệ", statusCode: 401 };

      const providedTokenHash = hashToken(refreshToken);
      const redisKey = getRefreshTokenKey(decoded.id);
      
      // Try Redis Cache First
      let cachedSession = await getCache(redisKey);
      let userRole = decoded.role;
      let userEmail = decoded.email;
      let tokenVersion = typeof decoded.ver === "number" ? decoded.ver : 0;

      if (cachedSession) {
        if (cachedSession.hash !== providedTokenHash) {
          // Reuse detection: revoke active session + bump tokenVersion immediately
          await revokeAllUserSessions(decoded.id);
          return { errCode: 3, errMessage: "Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi", statusCode: 401 };
        }
        if (cachedSession.expiresAt && new Date(cachedSession.expiresAt) < new Date()) {
          return { errCode: 4, errMessage: "Refresh token đã hết hạn", statusCode: 401 };
        }
        const { notFound, userStatus } = await resolveUserStatus(decoded.id);
        if (notFound || !userStatus?.isActive) {
          await revokeAllUserSessions(decoded.id);
          return { errCode: 2, errMessage: "Refresh token đã bị thu hồi hoặc tài khoản chưa kích hoạt", statusCode: 401 };
        }
        userRole = userStatus.role || cachedSession.role || decoded.role;
        userEmail = cachedSession.email || decoded.email;
        tokenVersion = typeof userStatus.tokenVersion === "number"
          ? userStatus.tokenVersion
          : (typeof cachedSession.ver === "number" ? cachedSession.ver : 0);
      } else {
        // Fallback to MySQL DB with Projection (only necessary attributes)
        const user = await db.User.findByPk(decoded.id, {
          attributes: ["id", "email", "role", "isActive", "refreshTokenHash", "refreshTokenExpiresAt", "tokenVersion"],
        });

        if (!user || !user.isActive || !user.refreshTokenHash) {
          return { errCode: 2, errMessage: "Refresh token đã bị thu hồi hoặc tài khoản chưa kích hoạt", statusCode: 401 };
        }
        if (user.refreshTokenHash !== providedTokenHash) {
          // Reuse detection: revoke DB refresh token, bump tokenVersion, and clear Redis caches
          await revokeAllUserSessions(decoded.id);
          return { errCode: 3, errMessage: "Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi", statusCode: 401 };
        }
        if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
          return { errCode: 4, errMessage: "Refresh token đã hết hạn", statusCode: 401 };
        }
        userRole = user.role;
        userEmail = user.email;
        tokenVersion = typeof user.tokenVersion === "number" ? user.tokenVersion : 0;
      }

      // Generate New Tokens (Rotation)
      const payload = { id: decoded.id, email: userEmail, role: userRole, ver: tokenVersion };
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      const newHash = hashToken(newRefreshToken);
      const newExpiresAt = getTokenExpiryDate(newRefreshToken);

      // Async update DB & Redis
      await db.User.update(
        { refreshTokenHash: newHash, refreshTokenExpiresAt: newExpiresAt },
        { where: { id: decoded.id } }
      );
      await setCache(
        redisKey,
        { hash: newHash, expiresAt: newExpiresAt, email: userEmail, role: userRole, ver: tokenVersion },
        7 * 24 * 3600
      );

      return { errCode: 0, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } };
    } catch (error) {
      console.error("AuthService.refreshToken error:", error);
      return { errCode: -1, errMessage: error.message };
    }
  }

  async logout(userId, currentAccessToken = null) {
    try {
      if (userId) {
        // Bump tokenVersion and clear refresh token so existing sessions cannot be reused
        await revokeAllUserSessions(userId);
        await deleteCache(getUserProfileKey(userId));
      }

      // Blacklist current access token in Redis if provided
      if (currentAccessToken) {
        const decoded = jwt.decode(currentAccessToken);
        const ttl = decoded?.exp
          ? Math.max(1, decoded.exp - Math.floor(Date.now() / 1000))
          : 900;
        await setCache(getTokenBlacklistKey(currentAccessToken), true, ttl);
      }

      return { errCode: 0 };
    } catch (error) {
      console.error("AuthService.logout error:", error);
      return { errCode: -1, errMessage: error.message };
    }
  }

  async forgotPassword(email) {
    try {
      const genericMsg = "Nếu email tồn tại trong hệ thống, mã xác nhận đã được gửi đến hộp thư của bạn!";
      const user = await db.User.findOne({ where: { email } });
      if (!user) return { errCode: 0, errMessage: genericMsg };

      const resetToken = crypto.randomUUID();
      user.resetToken = hashToken(resetToken);
      user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      sendEmailAsync(sendForgotPasswordEmail, user, resetToken);
      return { errCode: 0, errMessage: genericMsg };
    } catch (error) {
      console.error("AuthService.forgotPassword error:", error);
      return { errCode: -1, errMessage: error.message };
    }
  }

  async verifyResetToken(email, token) {
    try {
      const user = await db.User.findOne({ where: { email } });
      if (!user || !user.resetToken || user.resetToken !== hashToken(token)) {
        const failCount = await recordOtpFailure("reset", email);
        if (user && user.resetToken && failCount >= OTP_MAX_ATTEMPTS) {
          user.resetToken = null;
          user.resetTokenExpiresAt = null;
          await user.save();
          await clearOtpFailure("reset", email);
          return { errCode: 2, errMessage: "Bạn đã nhập sai quá số lần quy định. Vui lòng yêu cầu mã mới." };
        }
        return { errCode: 1, errMessage: "Token không hợp lệ" };
      }
      if (user.resetTokenExpiresAt < new Date()) return { errCode: 2, errMessage: "Token đã hết hạn" };
      await clearOtpFailure("reset", email);
      return { errCode: 0 };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async resetPassword(email, token, newPassword) {
    try {
      const passCheck = validatePasswordStrength(newPassword);
      if (!passCheck.valid) return { errCode: 4, errMessage: passCheck.message };

      const user = await db.User.findOne({ where: { email } });
      if (!user || !user.resetToken || user.resetToken !== hashToken(token)) {
        const failCount = await recordOtpFailure("reset", email);
        if (user && user.resetToken && failCount >= OTP_MAX_ATTEMPTS) {
          user.resetToken = null;
          user.resetTokenExpiresAt = null;
          await user.save();
          await clearOtpFailure("reset", email);
          return { errCode: 2, errMessage: "Bạn đã nhập sai quá số lần quy định. Vui lòng yêu cầu mã mới." };
        }
        return { errCode: 1, errMessage: "Token không hợp lệ" };
      }
      if (user.resetTokenExpiresAt && new Date(user.resetTokenExpiresAt) < new Date()) {
        return { errCode: 2, errMessage: "Token đặt lại mật khẩu đã hết hạn!" };
      }
      await clearOtpFailure("reset", email);
      
      user.password = await hashUserPassword(newPassword);
      user.resetToken = null;
      user.resetTokenExpiresAt = null;
      user.refreshTokenHash = null;
      user.refreshTokenExpiresAt = null;
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await user.save();

      await deleteCache(getUserProfileKey(user.id));
      await deleteCache(getRefreshTokenKey(user.id));
      await deleteCache(getUserStatusKey(user.id));

      return { errCode: 0, errMessage: "Đổi mật khẩu thành công!" };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async verifyEmail(email, token) {
    try {
      const user = await db.User.findOne({ where: { email } });
      if (!user) return { errCode: 1, errMessage: "Không tìm thấy người dùng!" };
      if (user.isActive) return { errCode: 0, errMessage: "Tài khoản đã kích hoạt" };

      if (!user.verificationToken || user.verificationToken !== hashToken(token)) {
        const failCount = await recordOtpFailure("verify", email);
        if (user.verificationToken && failCount >= OTP_MAX_ATTEMPTS) {
          user.verificationToken = null;
          user.verificationTokenExpiresAt = null;
          await user.save();
          await clearOtpFailure("verify", email);
          return { errCode: 3, errMessage: "Bạn đã nhập sai mã quá nhiều lần. Vui lòng yêu cầu gửi lại mã mới." };
        }
        return { errCode: 2, errMessage: "Mã xác nhận sai" };
      }
      if (user.verificationTokenExpiresAt < new Date()) return { errCode: 3, errMessage: "Mã đã hết hạn" };

      user.isActive = true;
      user.verificationToken = null;
      user.verificationTokenExpiresAt = null;
      await user.save();
      await clearOtpFailure("verify", email);
      return { errCode: 0, errMessage: "Xác nhận thành công!" };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async resendVerificationEmail(email) {
    try {
      const genericMsg = "Nếu email hợp lệ và chưa kích hoạt, mã xác nhận mới đã được gửi.";
      const user = await db.User.findOne({ where: { email } });
      if (!user || user.isActive) return { errCode: 0, errMessage: genericMsg };

      const token = generateRandomToken();
      user.verificationToken = hashToken(token);
      user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      // Non-blocking async email execution
      sendEmailAsync(sendVerificationEmail, user, token);
      return { errCode: 0, errMessage: genericMsg };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async updatePassword(userId, oldPassword, newPassword) {
    try {
      const passCheck = validatePasswordStrength(newPassword);
      if (!passCheck.valid) return { errCode: 4, errMessage: passCheck.message };

      const user = await db.User.findByPk(userId);
      if (!user) return { errCode: 1, errMessage: "User not found" };

      if (!user.password) {
        return { errCode: 2, errMessage: "Tài khoản đăng nhập bằng Google chưa có mật khẩu cũ!" };
      }

      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) return { errCode: 2, errMessage: "Mật khẩu cũ không chính xác!" };

      user.password = await hashUserPassword(newPassword);
      user.refreshTokenHash = null;
      user.refreshTokenExpiresAt = null;
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await user.save();

      await deleteCache(getUserProfileKey(userId));
      await deleteCache(getRefreshTokenKey(userId));
      await deleteCache(getUserStatusKey(userId));

      return { errCode: 0, errMessage: "Đổi mật khẩu thành công!" };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async processGoogleAuth(user, isAdmin = false) {
    try {
      if (!user) {
        return { errCode: 1, errorType: "auth_failed", errMessage: "Xác thực Google thất bại!" };
      }

      if (!user.isActive) {
        return { errCode: 2, errorType: "account_locked", errMessage: "Tài khoản của bạn đã bị khóa!" };
      }

      if (isAdmin && !["admin", "root"].includes(user.role)) {
        return { errCode: 3, errorType: "not_admin", errMessage: "Tài khoản không có quyền quản trị viên!" };
      }

      const tokenVersion = typeof user.tokenVersion === "number" ? user.tokenVersion : 0;
      const payload = { id: user.id, email: user.email, role: user.role, ver: tokenVersion };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      const refreshTokenHash = hashToken(refreshToken);
      const refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);

      if (typeof user.update === "function") {
        await user.update({
          refreshTokenHash,
          refreshTokenExpiresAt,
        });
      }

      const rawUserData = typeof user.toJSON === "function" ? user.toJSON() : { ...user };
      const {
        password: _pw,
        refreshTokenHash: _rth,
        resetToken: _rt,
        verificationToken: _vt,
        resetTokenExpiresAt: _rtea,
        verificationTokenExpiresAt: _vtea,
        refreshTokenExpiresAt: _rthea,
        ...userData
      } = rawUserData;

      await setCache(getUserProfileKey(user.id), userData, 900);
      await setCache(
        getRefreshTokenKey(user.id),
        { hash: refreshTokenHash, expiresAt: refreshTokenExpiresAt, email: user.email, role: user.role, ver: tokenVersion },
        7 * 24 * 3600
      );

      return {
        errCode: 0,
        errMessage: "Đăng nhập Google thành công!",
        data: {
          accessToken,
          refreshToken,
          user: userData,
        },
      };
    } catch (error) {
      return { errCode: -1, errorType: "server_error", errMessage: error.message };
    }
  }
}

module.exports = new AuthService();

