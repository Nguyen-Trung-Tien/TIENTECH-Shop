import { describe, it, expect } from "vitest";
import {
  extractVoucherCode,
  extractOrderCode,
  formatRelativeTimeVi,
  groupNotificationsByTimeline,
} from "../utils/notificationHelpers";

describe("notificationHelpers", () => {
  describe("extractVoucherCode", () => {
    it("extracts voucher code with prefix mã / code / voucher", () => {
      expect(extractVoucherCode("Nhập mã TIENAI200 để giảm 200k")).toBe("TIENAI200");
      expect(extractVoucherCode("Voucher: SALE50")).toBe("SALE50");
      expect(extractVoucherCode("Sử dụng CODE TECH-PRO")).toBe("TECH-PRO");
    });

    it("returns null when no voucher code exists", () => {
      expect(extractVoucherCode("Đơn hàng của bạn đã được đóng gói")).toBeNull();
      expect(extractVoucherCode("")).toBeNull();
      expect(extractVoucherCode(null)).toBeNull();
    });
  });

  describe("extractOrderCode", () => {
    it("extracts order code with prefix đơn hàng # / order #", () => {
      expect(extractOrderCode("Đơn hàng #ORD-9876 đang được giao")).toBe("ORD-9876");
      expect(extractOrderCode("Order ORD1234 has been created")).toBe("ORD1234");
    });

    it("returns null when no order code exists", () => {
      expect(extractOrderCode("Chào mừng bạn đến với shop")).toBeNull();
    });
  });

  describe("formatRelativeTimeVi", () => {
    it("returns 'Vừa xong' for recent timestamps", () => {
      const now = new Date();
      expect(formatRelativeTimeVi(now)).toBe("Vừa xong");
    });

    it("returns minutes ago accurately", () => {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
      expect(formatRelativeTimeVi(tenMinsAgo)).toBe("10 phút trước");
    });

    it("returns hours ago accurately", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000);
      expect(formatRelativeTimeVi(twoHoursAgo)).toBe("2 giờ trước");
    });
  });

  describe("groupNotificationsByTimeline", () => {
    it("groups items into today, yesterday, and earlier", () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
      const earlier = new Date(Date.now() - 4 * 24 * 3600 * 1000);

      const items = [
        { id: 1, title: "A", createdAt: today.toISOString() },
        { id: 2, title: "B", createdAt: yesterday.toISOString() },
        { id: 3, title: "C", createdAt: earlier.toISOString() },
      ];

      const groups = groupNotificationsByTimeline(items);
      expect(groups.today).toHaveLength(1);
      expect(groups.yesterday).toHaveLength(1);
      expect(groups.earlier).toHaveLength(1);
    });
  });
});

