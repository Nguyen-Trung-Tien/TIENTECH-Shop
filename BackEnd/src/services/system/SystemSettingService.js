const db = require("../../models");
const { getCache, setCache, deleteCache, flushAllCache, getRedisStats, isRedisConnected } = require("../../config/redis");
const os = require("os");

const DEFAULT_SETTINGS = {
  // --- AUTH & SECURITY ---
  REQUIRE_OTP_VERIFICATION: {
    value: "true",
    description: "Yêu cầu người dùng xác thực mã OTP qua Email khi đăng ký tài khoản mới",
    category: "auth",
    isPublic: true,
  },
  MAX_LOGIN_ATTEMPTS: {
    value: "5",
    description: "Số lần đăng nhập sai tối đa trước khi tạm khóa đăng nhập 15 phút",
    category: "auth",
    isPublic: false,
  },
  OTP_EXPIRES_MINUTES: {
    value: "5",
    description: "Thời gian hết hạn của mã OTP gửi qua email (phút)",
    category: "auth",
    isPublic: false,
  },

  // --- STORE BRANDING ---
  STORE_NAME: {
    value: "TIENTECH Store",
    description: "Tên thương hiệu cửa hàng hiển thị trên Header, Footer & Hóa đơn",
    category: "store",
    isPublic: true,
  },
  STORE_HOTLINE: {
    value: "1900 6868",
    description: "Hotline chăm sóc khách hàng 24/7",
    category: "store",
    isPublic: true,
  },
  STORE_EMAIL: {
    value: "support@tientech.vn",
    description: "Email liên hệ chính thức của shop",
    category: "store",
    isPublic: true,
  },
  STORE_ADDRESS: {
    value: "Tầng 5, Tòa Nhà Công Nghệ TIENTECH, Cầu Giấy, Hà Nội",
    description: "Địa chỉ văn phòng / showroom chính",
    category: "store",
    isPublic: true,
  },
  STORE_FACEBOOK: {
    value: "https://facebook.com/tientech.official",
    description: "Đường dẫn Fanpage Facebook",
    category: "store",
    isPublic: true,
  },
  STORE_ZALO: {
    value: "https://zalo.me/tientech",
    description: "Đường dẫn Zalo OA Official",
    category: "store",
    isPublic: true,
  },
  STORE_TIKTOK: {
    value: "https://tiktok.com/@tientech_shop",
    description: "Đường dẫn kênh TikTok Shop",
    category: "store",
    isPublic: true,
  },

  // --- SEO & META ---
  SEO_META_TITLE: {
    value: "TIENTECH - Thiên Đường Thiết Bị & Phụ Kiện Công Nghệ Chính Hãng",
    description: "Tiêu đề trang chủ phục vụ SEO và chia sẻ liên kết mạng xã hội",
    category: "seo",
    isPublic: true,
  },
  SEO_META_DESCRIPTION: {
    value: "Mua sắm Smartphone, Laptop, Tablet và Phụ kiện công nghệ chính hãng giá tốt nhất tại TIENTECH. Bảo hành 1 đổi 1, giao hàng hỏa tốc toàn quốc.",
    description: "Đoạn mô tả ngắn hiển thị trên kết quả tìm kiếm Google",
    category: "seo",
    isPublic: true,
  },
  SEO_META_KEYWORDS: {
    value: "công nghệ, smartphone, laptop, tai nghe, pin dự phòng, tientech shop",
    description: "Từ khóa SEO chính của website",
    category: "seo",
    isPublic: true,
  },

  // --- PAYMENT & SHIPPING ---
  PAYMENT_COD_ENABLED: {
    value: "true",
    description: "Kích hoạt phương thức Thanh toán khi nhận hàng (COD)",
    category: "payment",
    isPublic: true,
  },
  PAYMENT_VNPAY_ENABLED: {
    value: "true",
    description: "Kích hoạt cổng thanh toán trực tuyến VNPay QR / Thẻ ATM",
    category: "payment",
    isPublic: true,
  },
  PAYMENT_PAYPAL_ENABLED: {
    value: "true",
    description: "Kích hoạt cổng thanh toán quốc tế PayPal",
    category: "payment",
    isPublic: true,
  },
  PAYMENT_MOMO_ENABLED: {
    value: "false",
    description: "Kích hoạt cổng thanh toán ví MoMo",
    category: "payment",
    isPublic: true,
  },
  DEFAULT_SHIPPING_FEE: {
    value: "30000",
    description: "Phí vận chuyển giao hàng tiêu chuẩn mặc định (VNĐ)",
    category: "payment",
    isPublic: true,
  },
  FREESHIP_MIN_ORDER: {
    value: "500000",
    description: "Giá trị đơn hàng tối thiểu để được Miễn phí vận chuyển (VNĐ)",
    category: "payment",
    isPublic: true,
  },

  // --- MAINTENANCE & SYSTEM ---
  MAINTENANCE_MODE: {
    value: "false",
    description: "Chế độ bảo trì hệ thống toàn sàn (Chỉ Admin mới có thể truy cập)",
    category: "maintenance",
    isPublic: true,
  },
  MAINTENANCE_MESSAGE: {
    value: "TIENTECH đang tiến hành bảo trì & nâng cấp hệ thống định kỳ. Quý khách vui lòng quay lại sau ít phút!",
    description: "Nội dung hiển thị trên trang bảo trì",
    category: "maintenance",
    isPublic: true,
  },

  // --- ORDER EMAIL NOTIFICATIONS ---
  EMAIL_NOTIFY_USER_ORDER_CREATED: {
    value: "true",
    description: "Gửi email xác nhận cho Khách hàng khi đặt hàng thành công",
    category: "email",
    isPublic: true,
  },
  EMAIL_NOTIFY_USER_ORDER_SHIPPING: {
    value: "true",
    description: "Gửi email thông báo cho Khách hàng khi đơn hàng bắt đầu giao (Shipping)",
    category: "email",
    isPublic: true,
  },
  EMAIL_NOTIFY_USER_ORDER_DELIVERED: {
    value: "true",
    description: "Gửi email chúc mừng cho Khách hàng khi đơn hàng giao thành công",
    category: "email",
    isPublic: true,
  },
  EMAIL_NOTIFY_USER_ORDER_CANCELLED: {
    value: "true",
    description: "Gửi email thông báo cho Khách hàng khi đơn hàng bị hủy",
    category: "email",
    isPublic: true,
  },
  EMAIL_NOTIFY_ADMIN_NEW_ORDER: {
    value: "true",
    description: "Gửi email thông báo cho Quản trị viên/Chủ shop khi có đơn hàng mới",
    category: "email",
    isPublic: false,
  },
  EMAIL_NOTIFY_ADMIN_ORDER_CANCELLED: {
    value: "true",
    description: "Gửi email thông báo cho Quản trị viên khi có đơn hàng bị hủy hoặc yêu cầu hủy",
    category: "email",
    isPublic: false,
  },
  ADMIN_NOTIFICATION_EMAIL: {
    value: "",
    description: "Địa chỉ email Admin nhận thông báo đơn hàng (để trống sẽ dùng email cửa hàng)",
    category: "email",
    isPublic: false,
  },

  // --- AI ASSISTANT ---
  AI_BOT_ENABLED: {
    value: "true",
    description: "Bật trợ lý ảo thông minh AI hỗ trợ khách hàng",
    category: "ai",
    isPublic: true,
  },
  AI_MODEL_NAME: {
    value: "gemini-3.6-flash",
    description: "Mô hình AI đang vận hành tư vấn",
    category: "ai",
    isPublic: false,
  },
  AI_SYSTEM_PROMPT: {
    value: "Bạn là trợ lý AI chuyên nghiệp của TIENTECH Shop. Luôn tư vấn lịch sự, tận tâm, đề xuất sản phẩm phù hợp với nhu cầu và ngân sách của khách hàng.",
    description: "Chỉ thị hành vi (System Prompt) cho AI Chatbot",
    category: "ai",
    isPublic: false,
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

  async bulkSetSettings(settingsArray) {
    try {
      if (!Array.isArray(settingsArray) || settingsArray.length === 0) {
        return { errCode: 1, errMessage: "Danh sách cấu hình không hợp lệ" };
      }

      const results = [];
      for (const item of settingsArray) {
        const { key, value, description, category, isPublic } = item;
        if (!key) continue;
        const res = await this.setSetting(key, value, description, category, isPublic);
        if (res.errCode === 0) {
          results.push(res.data);
        }
      }

      return {
        errCode: 0,
        data: results,
        errMessage: `Đã lưu thành công ${results.length} cấu hình hệ thống!`,
      };
    } catch (error) {
      console.error("[SystemSettingService] bulkSetSettings error:", error);
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

  async flushCache() {
    try {
      const result = await flushAllCache();
      return {
        errCode: result.success ? 0 : 1,
        errMessage: result.message || "Đã dọn sạch cache hệ thống.",
        data: result,
      };
    } catch (error) {
      console.error("[SystemSettingService] flushCache error:", error);
      return { errCode: 1, errMessage: error.message };
    }
  }

  async getSystemHealth() {
    try {
      // 1. Check Database connection
      let dbStatus = "healthy";
      let dbLatency = 0;
      try {
        const start = Date.now();
        await db.sequelize.authenticate();
        dbLatency = Date.now() - start;
      } catch (dbErr) {
        dbStatus = "error: " + dbErr.message;
      }

      // 2. Check Redis connection & stats
      const redisStats = await getRedisStats();

      // 3. System Memory & CPU Info
      const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
      const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
      const usedMem = (totalMem - freeMem).toFixed(2);
      const processMem = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2);

      return {
        errCode: 0,
        data: {
          server: {
            uptime: Math.floor(process.uptime()),
            platform: os.platform(),
            nodeVersion: process.version,
            memory: {
              total: `${totalMem} GB`,
              used: `${usedMem} GB`,
              free: `${freeMem} GB`,
              processHeap: `${processMem} MB`,
            },
            cpuCores: os.cpus().length,
          },
          database: {
            status: dbStatus,
            latencyMs: dbLatency,
            dialect: db.sequelize.getDialect(),
          },
          redis: {
            connected: isRedisConnected(),
            ...redisStats,
          },
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("[SystemSettingService] getSystemHealth error:", error);
      return { errCode: 1, errMessage: error.message };
    }
  }
}

const instance = new SystemSettingService();
instance.initializeDefaultSettings();

module.exports = instance;
