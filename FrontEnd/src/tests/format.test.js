import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "../utils/format";

describe("FrontEnd Utils - format.js Unit Tests", () => {
  it("should format currency correctly in VNĐ", () => {
    expect(formatCurrency(100000)).toBe("100.000 ₫");
    expect(formatCurrency(0)).toBe("0 ₫");
    expect(formatCurrency(null)).toBe("0 ₫");
    expect(formatCurrency(undefined)).toBe("0 ₫");
  });

  it("should return empty string for null or empty dates", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });
});
