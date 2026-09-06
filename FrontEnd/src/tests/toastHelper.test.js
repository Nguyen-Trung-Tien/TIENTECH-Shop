import { describe, it, expect } from "vitest";
import {
  sanitizeSuccessMessage,
  extractErrorMessage,
} from "../utils/toastHelper";

describe("FrontEnd Utils - toastHelper.jsx Unit Tests", () => {
  describe("sanitizeSuccessMessage", () => {
    it("should replace technical/raw messages like 'OK', 'success' with friendly fallback", () => {
      expect(sanitizeSuccessMessage("OK")).toBe("Thao tác thành công!");
      expect(sanitizeSuccessMessage("ok")).toBe("Thao tác thành công!");
      expect(sanitizeSuccessMessage("OK.")).toBe("Thao tác thành công!");
      expect(sanitizeSuccessMessage("success")).toBe("Thao tác thành công!");
      expect(sanitizeSuccessMessage("true")).toBe("Thao tác thành công!");
      expect(sanitizeSuccessMessage("done")).toBe("Thao tác thành công!");
    });

    it("should use custom fallback when provided for empty or raw 'OK' values", () => {
      expect(sanitizeSuccessMessage("OK", "Lưu địa chỉ thành công!")).toBe(
        "Lưu địa chỉ thành công!",
      );
      expect(sanitizeSuccessMessage(null, "Lưu địa chỉ thành công!")).toBe(
        "Lưu địa chỉ thành công!",
      );
      expect(sanitizeSuccessMessage(undefined, "Xác nhận nhận hàng thành công!")).toBe(
        "Xác nhận nhận hàng thành công!",
      );
    });

    it("should translate known backend success phrases to Vietnamese", () => {
      expect(sanitizeSuccessMessage("Product deleted successfully")).toBe(
        "Đã xóa sản phẩm thành công!",
      );
      expect(sanitizeSuccessMessage("Order deleted successfully")).toBe(
        "Đã xóa đơn hàng thành công!",
      );
      expect(sanitizeSuccessMessage("Payment completed")).toBe(
        "Thanh toán hoàn tất thành công!",
      );
    });

    it("should preserve custom meaningful Vietnamese messages", () => {
      const msg = "Đã cập nhật đơn hàng thành công!";
      expect(sanitizeSuccessMessage(msg)).toBe(msg);
    });
  });

  describe("extractErrorMessage", () => {
    it("should translate network and connection errors", () => {
      expect(extractErrorMessage("Network Error")).toBe(
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng!",
      );
      expect(
        extractErrorMessage({
          message: "timeout of 10000ms exceeded",
          code: "ECONNABORTED",
        }),
      ).toBe("Yêu cầu đã hết thời gian chờ (Timeout). Vui lòng thử lại!");
    });

    it("should not return raw 'OK' as an error message", () => {
      const fallback = "Lỗi xử lý yêu cầu";
      expect(extractErrorMessage("OK", fallback)).toBe(fallback);
      expect(
        extractErrorMessage(
          { response: { data: { errMessage: "OK" } } },
          fallback,
        ),
      ).toBe(fallback);
    });

    it("should extract and translate backend error messages", () => {
      expect(
        extractErrorMessage({
          response: { data: { errMessage: "Product not found" } },
        }),
      ).toBe("Không tìm thấy thông tin sản phẩm yêu cầu.");

      expect(
        extractErrorMessage({
          response: { data: { errMessage: "Cannot delete root user" } },
        }),
      ).toBe("Không thể xóa tài khoản Quản trị viên tối cao (Root)!");
    });

    it("should map HTTP status codes when no message is present", () => {
      expect(extractErrorMessage({ response: { status: 401 } })).toBe(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      );
      expect(extractErrorMessage({ response: { status: 403 } })).toBe(
        "Bạn không có quyền thực hiện thao tác này.",
      );
      expect(extractErrorMessage({ response: { status: 404 } })).toBe(
        "Không tìm thấy dữ liệu hoặc tài nguyên yêu cầu.",
      );
    });
  });
});
