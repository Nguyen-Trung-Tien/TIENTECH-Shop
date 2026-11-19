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

  it("prevents concurrent TOCTOU race condition and allows only one request through", async () => {
    const middleware = idempotencyGuard({ ttlSeconds: 60 });
    const key = `race-key-${Date.now()}`;
    const baseReq = {
      headers: { "x-idempotency-key": key },
      user: { id: 101 },
      method: "POST",
      baseUrl: "/api/v1/order",
      path: "/create-new-order",
    };

    const resA = createMockRes();
    const resB = createMockRes();
    const nextA = jest.fn();
    const nextB = jest.fn();

    await Promise.all([
      middleware({ ...baseReq }, resA, nextA),
      middleware({ ...baseReq }, resB, nextB),
    ]);

    expect(nextA.mock.calls.length + nextB.mock.calls.length).toBe(1);
    const conflictRes = nextA.mock.calls.length === 0 ? resA : resB;
    expect(conflictRes.statusCode).toBe(409);
    expect(conflictRes.body.code).toBe("IDEMPOTENCY_IN_PROGRESS");
  });

  it("clears IN_PROGRESS lock on finish when handler ends without res.json", async () => {
    const EventEmitter = require("events");
    const middleware = idempotencyGuard({ ttlSeconds: 60 });
    const key = `non-json-${Date.now()}`;
    const req = {
      headers: { "x-idempotency-key": key },
      user: { id: 102 },
      method: "POST",
      baseUrl: "/api/v1/order",
      path: "/create-new-order",
    };

    const res1 = Object.assign(new EventEmitter(), createMockRes());
    const next1 = jest.fn(() => {
      res1.emit("finish");
    });

    await middleware(req, res1, next1);
    expect(next1).toHaveBeenCalledTimes(1);

    // Allow microtask queue for async clearIdempotencyRecord
    await Promise.resolve();

    const res2 = createMockRes();
    const next2 = jest.fn();
    await middleware({ ...req }, res2, next2);
    expect(next2).toHaveBeenCalledTimes(1);
  });
});
