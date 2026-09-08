const request = require("supertest");
const app = require("../../src/app");

describe("Security Hardening & Middleware Integration Tests", () => {
  test("Security Headers (CSP, Permissions-Policy) are present on responses", async () => {
    const res = await request(app).get("/healthz");

    expect(res.status).toBe(200);
    expect(res.headers["content-security-policy"]).toBeDefined();
    expect(res.headers["permissions-policy"]).toBeDefined();
    expect(res.headers["permissions-policy"]).toContain("camera=()");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
  });

  test("CSRF Protection blocks cookie-authenticated mutations with mismatched Origin", async () => {
    // A mutation request containing an auth cookie but with a malicious external origin
    const res = await request(app)
      .post("/api/order/create-new-order")
      .set("Cookie", ["accessToken=fake_cookie_token"])
      .set("Origin", "https://attacker-malicious-site.com")
      .send({
        items: [],
      });

    expect(res.status).toBe(403);
    expect(res.body.errMessage).toMatch(/CSRF Origin\/Referer check failed/i);
  });

  test("CSRF Protection permits mutation requests without cookies (e.g. bearer/API clients)", async () => {
    const res = await request(app)
      .post("/api/order/create-new-order")
      .send({
        items: [],
      });

    // Should not be rejected by CSRF (it will reach auth middleware and return 401 or 400)
    expect(res.status).not.toBe(403);
  });
});
