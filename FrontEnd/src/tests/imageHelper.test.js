import { describe, it, expect, vi } from "vitest";
import {
  DEFAULT_PRODUCT_IMAGE,
  getProductImage,
  handleImageError,
} from "../utils/imageHelper";

describe("FrontEnd Utils - imageHelper.js Unit Tests", () => {
  it("should return DEFAULT_PRODUCT_IMAGE for empty or null inputs", () => {
    expect(getProductImage(null)).toBe(DEFAULT_PRODUCT_IMAGE);
    expect(getProductImage(undefined)).toBe(DEFAULT_PRODUCT_IMAGE);
    expect(getProductImage("")).toBe(DEFAULT_PRODUCT_IMAGE);
    expect(getProductImage("   ")).toBe(DEFAULT_PRODUCT_IMAGE);
  });

  it("should return string url directly when input is a string", () => {
    const url = "https://example.com/product.png";
    expect(getProductImage(url)).toBe(url);
  });

  it("should resolve image from direct image field on OrderItem or Product", () => {
    expect(getProductImage({ image: "https://example.com/order-item.png" })).toBe(
      "https://example.com/order-item.png"
    );
  });

  it("should resolve primary image or first image from images array", () => {
    const withPrimary = {
      images: [
        { imageUrl: "https://example.com/secondary.png", isPrimary: false },
        { imageUrl: "https://example.com/primary.png", isPrimary: true },
      ],
    };
    expect(getProductImage(withPrimary)).toBe("https://example.com/primary.png");

    const withoutPrimary = {
      images: [{ imageUrl: "https://example.com/first.png" }],
    };
    expect(getProductImage(withoutPrimary)).toBe("https://example.com/first.png");
  });

  it("should resolve image from nested product or variant", () => {
    const orderItem = {
      product: {
        images: [{ imageUrl: "https://example.com/nested.png", isPrimary: true }],
      },
    };
    expect(getProductImage(orderItem)).toBe("https://example.com/nested.png");
  });

  it("should replace broken image source with DEFAULT_PRODUCT_IMAGE in handleImageError", () => {
    const mockElement = { src: "broken-url.jpg", onerror: vi.fn() };
    const event = { currentTarget: mockElement };

    handleImageError(event);
    expect(mockElement.onerror).toBeNull();
    expect(mockElement.src).toBe(DEFAULT_PRODUCT_IMAGE);
  });
});
