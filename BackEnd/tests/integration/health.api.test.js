const request = require("supertest");
const app = require("../../src/app");

describe("API Integration Tests - Health & Infrastructure", () => {
  test("GET /healthz should return HTTP 200 and status ok", async () => {
    const response = await request(app).get("/healthz");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("timestamp");
  });

  test("Security Headers should be set correctly", async () => {
    const response = await request(app).get("/healthz");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-xss-protection"]).toBe("1; mode=block");
  });
});
