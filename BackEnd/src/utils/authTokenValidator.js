const { getCache, setCache } = require("../config/redis");
const { getUserStatusKey } = require("../services/user/AuthHelper");

const resolveUserStatus = async (userId) => {
  const statusKey = getUserStatusKey(userId);
  let userStatus = await getCache(statusKey);

  if (!userStatus) {
    try {
      const db = require("../models");
      const dbUser = await db.User.findByPk(userId, {
        attributes: ["id", "isActive", "role", "tokenVersion"],
      });
      if (!dbUser) {
        return { notFound: true, userStatus: null };
      }
      userStatus = {
        isActive: Boolean(dbUser.isActive),
        role: dbUser.role,
        ...(typeof dbUser.tokenVersion === "number"
          ? { tokenVersion: dbUser.tokenVersion }
          : {}),
      };
      await setCache(statusKey, userStatus, 300);
    } catch (dbErr) {
      console.error("Auth status check error:", dbErr?.message);
      return { notFound: false, userStatus: null, dbError: true };
    }
  }
  return { notFound: false, userStatus };
};

const isTokenVersionStale = (decoded, userStatus) => {
  if (typeof userStatus?.tokenVersion !== "number") {
    return false;
  }
  if (typeof decoded?.ver !== "number") {
    return true;
  }
  return decoded.ver !== userStatus.tokenVersion;
};

module.exports = {
  resolveUserStatus,
  isTokenVersionStale,
};
