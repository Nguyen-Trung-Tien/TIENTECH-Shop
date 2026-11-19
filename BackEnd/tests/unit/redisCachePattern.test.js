describe("Redis v5 deleteCacheByPattern & setCacheNx", () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  test("deleteCacheByPattern flattens redis v5 scanIterator string[] batches before calling del", async () => {
    const delMock = jest.fn().mockResolvedValue(2);
    const scanIteratorMock = jest.fn(async function* () {
      yield ["products_all_1", "products_all_2"];
      yield [];
      yield ["products_all_3"];
    });

    const mockClient = {
      on: jest.fn((event, cb) => {
        if (event === "ready") cb();
      }),
      connect: jest.fn().mockResolvedValue(true),
      scanIterator: scanIteratorMock,
      del: delMock,
    };

    jest.doMock("redis", () => ({
      createClient: jest.fn(() => mockClient),
    }));

    const redisConfig = require("../../src/config/redis");
    // Simulate connected state by firing ready listener manually if NODE_ENV === 'test' skipped auto-connect
    const readyCall = mockClient.on.mock.calls.find(([evt]) => evt === "ready");
    if (readyCall) readyCall[1]();

    await redisConfig.deleteCacheByPattern("products_*");

    expect(scanIteratorMock).toHaveBeenCalledWith({ MATCH: "products_*", COUNT: 100 });
    expect(delMock).toHaveBeenCalledTimes(2);
    expect(delMock).toHaveBeenNthCalledWith(1, ["products_all_1", "products_all_2"]);
    expect(delMock).toHaveBeenNthCalledWith(2, ["products_all_3"]);
  });

  test("setCacheNx returns true on OK and false when key already exists", async () => {
    const setMock = jest
      .fn()
      .mockResolvedValueOnce("OK")
      .mockResolvedValueOnce(null);

    const mockClient = {
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(true),
      set: setMock,
    };

    jest.doMock("redis", () => ({
      createClient: jest.fn(() => mockClient),
    }));

    const redisConfig = require("../../src/config/redis");
    const readyCall = mockClient.on.mock.calls.find(([evt]) => evt === "ready");
    if (readyCall) readyCall[1]();

    const first = await redisConfig.setCacheNx("idem:1", { state: "IN_PROGRESS" }, 30);
    const second = await redisConfig.setCacheNx("idem:1", { state: "IN_PROGRESS" }, 30);

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(setMock).toHaveBeenCalledWith(
      "idem:1",
      JSON.stringify({ state: "IN_PROGRESS" }),
      { NX: true, EX: 30 }
    );
  });
});
