const db = require("../../models");
const { getCache, setCache, deleteCache } = require("../../config/redis");

const DEFAULT_SETTINGS = {
  REQUIRE_OTP_VERIFICATION: {
    value: "true",
    description: "Yêu cầu người dùng xác thực mã OTP qua Email khi đăng ký tài khoản mới",
    category: "auth",
    isPublic: true,
  },
};

class SystemSettingService {
  getCacheKey(key) {
    return `system:setting:${key}`;
  }

  async initializeDefaultSettings() {
    try {
      if (!db.SystemSetting) return;
      
      // Auto sync table if not exists
      await db.SystemSetting.sync();

      for (const [key, config] of Object.entries(DEFAULT_SETTINGS)) {
        const existing = await db.SystemSetting.findOne({ where: { key } });
        if (!existing) {
          await db.SystemSetting.create({
            key,
            value: config.value,
            description: config.description,
            category: config.category,
            isPublic: config.isPublic,
          });
        }
      }
    } catch (error) {
      console.warn("[SystemSettingService] Init settings notice:", error.message);
    }
  }

  async getSetting(key, defaultValue = null) {
    try {
      const cacheKey = this.getCacheKey(key);
      const cached = await getCache(cacheKey);
      if (cached !== null && cached !== undefined) {
        return cached;
      }

      if (!db.SystemSetting) return defaultValue;

      const record = await db.SystemSetting.findOne({ where: { key } });
      if (!record) {
        if (DEFAULT_SETTINGS[key]) {
          return DEFAULT_SETTINGS[key].value === "true"
            ? true
            : DEFAULT_SETTINGS[key].value === "false"
            ? false
            : DEFAULT_SETTINGS[key].value;
        }
        return defaultValue;
      }

      let parsedValue = record.value;
      if (record.value === "true") parsedValue = true;
      else if (record.value === "false") parsedValue = false;
      else {
        try {
          parsedValue = JSON.parse(record.value);
        } catch {
          parsedValue = record.value;
        }
      }

      await setCache(cacheKey, parsedValue, 3600); // 1 hour TTL
      return parsedValue;
    } catch (error) {
      console.error(`[SystemSettingService] getSetting error for key ${key}:`, error);
      return defaultValue;
    }
  }

  async setSetting(key, value, description = null, category = "general", isPublic = false) {
    try {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);

      const [setting] = await db.SystemSetting.upsert({
        key,
        value: stringValue,
        description: description || DEFAULT_SETTINGS[key]?.description,
        category: category || DEFAULT_SETTINGS[key]?.category || "general",
        isPublic: isPublic !== undefined ? isPublic : DEFAULT_SETTINGS[key]?.isPublic || false,
      });

      const parsedValue = value === "true" || value === true ? true : value === "false" || value === false ? false : value;
      await setCache(this.getCacheKey(key), parsedValue, 3600);

      return { errCode: 0, data: setting, errMessage: "Cập nhật cấu hình thành công!" };
    } catch (error) {
      console.error(`[SystemSettingService] setSetting error for key ${key}:`, error);
      return { errCode: 1, errMessage: error.message };
    }
  }

  async getAllSettings() {
    try {
      const settings = await db.SystemSetting.findAll({
        order: [["category", "ASC"], ["createdAt", "ASC"]],
      });
      return { errCode: 0, data: settings };
    } catch (error) {
      console.error("[SystemSettingService] getAllSettings error:", error);
      return { errCode: 1, errMessage: error.message };
    }
  }

  async getPublicSettings() {
    try {
      const settings = await db.SystemSetting.findAll({
        where: { isPublic: true },
        attributes: ["key", "value", "category", "description"],
      });

      const formatted = {};
      settings.forEach((s) => {
        formatted[s.key] = s.value === "true" ? true : s.value === "false" ? false : s.value;
      });

      return { errCode: 0, data: formatted };
    } catch (error) {
      console.error("[SystemSettingService] getPublicSettings error:", error);
      return { errCode: 1, errMessage: error.message };
    }
  }
}

const instance = new SystemSettingService();
instance.initializeDefaultSettings();

module.exports = instance;
