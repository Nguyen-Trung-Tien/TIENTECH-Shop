const request = require("supertest");
const app = require("../src/service");

describe("Product API", () => {
  it("GET /api/v1/product/get-all-product should return 200 and a list of products", async () => {
    const res = await request(app).get("/api/v1/product/get-all-product");

    expect(res.statusCode).toBe(200);
    expect(res.body.errCode).toBe(0);
    expect(Array.isArray(res.body.products || res.body.data)).toBe(true);
  });

  it("GET /api/v1/product/flash-sale should return 200 and a list of flash sale products", async () => {
    const res = await request(app).get("/api/v1/product/flash-sale");

    expect(res.statusCode).toBe(200);
    expect(res.body.errCode).toBe(0);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it("GET /api/v1/product/get-all-product?isFlashSale=true should return filtered products", async () => {
    const res = await request(app).get(
      "/api/v1/product/get-all-product?isFlashSale=true",
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.errCode).toBe(0);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it("ProductService.disableExpiredFlashSales should execute without throwing", async () => {
    const ProductService = require("../src/services/ProductService");
    const result = await ProductService.disableExpiredFlashSales();

    expect(result.errCode).toBe(0);
    expect(typeof result.updated).toBe("number");
  });
});
