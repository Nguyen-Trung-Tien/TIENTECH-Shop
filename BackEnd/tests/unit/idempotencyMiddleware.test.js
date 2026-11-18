const { idempotencyGuard } = require("../../src/middleware/idempotencyMiddleware");

const createMockRes = () => {
  const headers = {};
  return {
    statusCode: 200,
    headers,
    body: null,
    setHeader(k, v) {
      headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
};

describe("idempotencyGuard middleware", () => {
  it("passes through when X-Idempotency-Key header is missing", async () => {
    const middleware = idempotencyGuard();
    const req = { headers: {}, method: "POST", baseUrl: "/api/v1/order", path: "/create-new-order" };
    const res = createMockRes();
    const next = jest.fn();

    await middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("replays cached 2xx response and blocks duplicate execution", async () => {
    const middleware = idempotencyGuard({ ttlSeconds: 60 });
    const key = `test-key-${Date.now()}`;
    const req1 = {
      headers: { "x-idempotency-key": key },
      user: { id: 99 },
      method: "POST",
      baseUrl: "/api/v1/order",
      path: "/create-new-order",
    };
    const res1 = createMockRes();
    const next1 = jest.fn(() => {
      res1.status(201).json({ errCode: 0, data: { id: 123 } });
    });

    await middleware(req1, res1, next1);
    expect(next1).toHaveBeenCalledTimes(1);
    expect(res1.body).toEqual({ errCode: 0, data: { id: 123 } });

    // Second request with the same key should replay without calling next
    const req2 = { ...req1 };
    const res2 = createMockRes();
    const next2 = jest.fn();

    await middleware(req2, res2, next2);
    expect(next2).not.toHaveBeenCalled();
    expect(res2.statusCode).toBe(201);
    expect(res2.headers["X-Idempotency-Replayed"]).toBe("true");
    expect(res2.body).toEqual({ errCode: 0, data: { id: 123 } });
  });

  it("returns 409 Conflict when an identical request is currently IN_PROGRESS", async () => {
    const middleware = idempotencyGuard({ ttlSeconds: 60 });
    const key = `in-progress-${Date.now()}`;
    const req1 = {
      headers: { "x-idempotency-key": key },
      user: { id: 100 },
      method: "POST",
      baseUrl: "/api/v1/order",
      path: "/create-new-order",
    };
    const res1 = createMockRes();
    // next1 does not call res.json yet -> remains IN_PROGRESS
    const next1 = jest.fn();
    await middleware(req1, res1, next1);
    expect(next1).toHaveBeenCalledTimes(1);

    const req2 = { ...req1 };
    const res2 = createMockRes();
    const next2 = jest.fn();
    await middleware(req2, res2, next2);

    expect(next2).not.toHaveBeenCalled();
    expect(res2.statusCode).toBe(409);
    expect(res2.body.code).toBe("IDEMPOTENCY_IN_PROGRESS");
  });
});
