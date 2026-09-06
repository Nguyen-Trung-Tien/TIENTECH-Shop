const systemSettingService = require("../../src/services/system/SystemSettingService");
const db = require("../../src/models");
const redis = require("../../src/config/redis");

jest.mock("../../src/config/redis", () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(true),
  deleteCache: jest.fn().mockResolvedValue(true),
  flushAllCache: jest.fn().mockResolvedValue(true),
  getRedisStats: jest.fn().mockResolvedValue({ totalKeys: 0 }),
  isRedisConnected: jest.fn().mockReturnValue(true),
}));

describe("SystemSettingService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getSetting returns fallback from DEFAULT_SETTINGS when DB returns null", async () => {
    jest.spyOn(db.SystemSetting, "findOne").mockResolvedValue(null);

    const result = await systemSettingService.getSetting("STORE_NAME");
    expect(result).toBe("TIENTECH Store");
  });

  test("getSetting returns value from database when record exists", async () => {
    jest.spyOn(db.SystemSetting, "findOne").mockResolvedValue({
      key: "STORE_NAME",
      value: "Custom Store Brand",
      description: "Store name",
      category: "store",
      isPublic: true,
    });

    const result = await systemSettingService.getSetting("STORE_NAME");
    expect(result).toBe("Custom Store Brand");
  });

  test("setSetting preserves category and isPublic from DEFAULT_SETTINGS when creating new record", async () => {
    jest.spyOn(db.SystemSetting, "findOne").mockResolvedValue(null);
    const createSpy = jest.spyOn(db.SystemSetting, "create").mockImplementation(async (payload) => ({
      ...payload,
    }));

    const result = await systemSettingService.setSetting("PAYMENT_COD_ENABLED", "false");
    expect(result.errCode).toBe(0);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "PAYMENT_COD_ENABLED",
        value: "false",
        category: "payment",
        isPublic: true,
      })
    );
    expect(redis.deleteCache).toHaveBeenCalledWith("system:settings:public");
  });

  test("setSetting updates existing record without overwriting category or isPublic with defaults", async () => {
    const mockRecord = {
      key: "STORE_HOTLINE",
      value: "1900 6868",
      category: "store",
      isPublic: true,
      description: "Hotline 24/7",
      update: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(db.SystemSetting, "findOne").mockResolvedValue(mockRecord);

    const result = await systemSettingService.setSetting("STORE_HOTLINE", "0988888888");
    expect(result.errCode).toBe(0);
    expect(mockRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        value: "0988888888",
        category: "store",
        isPublic: true,
      })
    );
  });

  test("getPublicSettings returns mapped key-value pairs of public settings", async () => {
    jest.spyOn(db.SystemSetting, "findAll").mockResolvedValue([
      { key: "STORE_NAME", value: "TIENTECH Store", category: "store", description: "Name" },
      { key: "PAYMENT_COD_ENABLED", value: "true", category: "payment", description: "COD" },
      { key: "MAINTENANCE_MODE", value: "false", category: "system", description: "Maintenance" },
    ]);

    const result = await systemSettingService.getPublicSettings();
    expect(result.errCode).toBe(0);
    expect(result.data.STORE_NAME).toBe("TIENTECH Store");
    expect(result.data.PAYMENT_COD_ENABLED).toBe(true);
    expect(result.data.MAINTENANCE_MODE).toBe(false);
  });

  test("bulkSetSettings processes array of settings and returns result", async () => {
    jest.spyOn(systemSettingService, "setSetting").mockResolvedValue({
      errCode: 0,
      data: { key: "STORE_NAME", value: "New Store" },
    });

    const result = await systemSettingService.bulkSetSettings([
      { key: "STORE_NAME", value: "New Store" },
    ]);
    expect(result.errCode).toBe(0);
    expect(result.data).toHaveLength(1);
  });
});
