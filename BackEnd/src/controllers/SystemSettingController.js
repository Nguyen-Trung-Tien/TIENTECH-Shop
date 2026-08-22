const SystemSettingService = require("../services/system/SystemSettingService");
const { handleError, handleResponse } = require("../utils/controllerHelper");

class SystemSettingController {
  async handleGetPublicSettings(req, res) {
    try {
      const result = await SystemSettingService.getPublicSettings();
      return handleResponse(res, result);
    } catch (e) {
      return handleError(res, e, "handleGetPublicSettings");
    }
  }

  async handleGetAllSettings(req, res) {
    try {
      const result = await SystemSettingService.getAllSettings();
      return handleResponse(res, result);
    } catch (e) {
      return handleError(res, e, "handleGetAllSettings");
    }
  }

  async handleUpdateSetting(req, res) {
    try {
      const { key, value, description, category, isPublic } = req.body;
      if (!key || value === undefined) {
        return handleResponse(res, {
          errCode: 1,
          errMessage: "Key and value are required!",
        });
      }

      const result = await SystemSettingService.setSetting(
        key,
        value,
        description,
        category,
        isPublic
      );
      return handleResponse(res, result);
    } catch (e) {
      return handleError(res, e, "handleUpdateSetting");
    }
  }

  async handleToggleOtpSetting(req, res) {
    try {
      const { enabled } = req.body;
      if (enabled === undefined) {
        return handleResponse(res, {
          errCode: 1,
          errMessage: "Trường 'enabled' là bắt buộc (true/false)!",
        });
      }

      const isEnabled = enabled === true || enabled === "true";
      const result = await SystemSettingService.setSetting(
        "REQUIRE_OTP_VERIFICATION",
        isEnabled ? "true" : "false",
        "Yêu cầu người dùng xác thực mã OTP qua Email khi đăng ký tài khoản mới",
        "auth",
        true
      );

      return handleResponse(res, {
        errCode: 0,
        errMessage: `Đã ${isEnabled ? "BẬT" : "TẮT"} tính năng gửi mã OTP khi đăng ký!`,
        data: {
          requireOtp: isEnabled,
        },
      });
    } catch (e) {
      return handleError(res, e, "handleToggleOtpSetting");
    }
  }
}

module.exports = new SystemSettingController();
