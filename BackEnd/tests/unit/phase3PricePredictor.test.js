jest.mock("../../src/config/gemini", () => ({
  generateContentWithFallback: jest.fn(),
}));

const db = require("../../src/models");
const { generateContentWithFallback } = require("../../src/config/gemini");
const {
  getPricePrediction,
  predictPriceAdvanced,
} = require("../../src/services/ai/PricePredictorService");

describe("Phase 3: PricePredictorService Deterministic Metrics & Honesty", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    generateContentWithFallback.mockReset();
  });

  test("predictPriceAdvanced is strictly deterministic across repeated invocations (zero Math.random)", () => {
    const mathRandomSpy = jest.spyOn(Math, "random");

    const first = predictPriceAdvanced(25000000, 12, "Laptop Gaming", { sold: 45 });
    const second = predictPriceAdvanced(25000000, 12, "Laptop Gaming", { sold: 45 });
    const third = predictPriceAdvanced(25000000, 12, "Laptop Gaming", { sold: 45 });

    expect(mathRandomSpy).not.toHaveBeenCalled();
    expect(first).toEqual(second);
    expect(second).toEqual(third);
    expect(first.reliability).toBeGreaterThanOrEqual(65);
    expect(first.reliability).toBeLessThanOrEqual(90);

    const lowSignal = predictPriceAdvanced(10000000, 0, "", { sold: 0 });
    expect(lowSignal.reliability).toBeLessThanOrEqual(first.reliability);
  });

  test("getPricePrediction returns deterministic fallback metadata when Gemini fails", async () => {
    jest.spyOn(db.Product, "findByPk").mockResolvedValue({
      id: 42,
      name: "MacBook Pro 14 M4",
      basePrice: 42000000,
      discount: 10,
      sold: 25,
      category: { name: "Laptop" },
    });
    generateContentWithFallback.mockRejectedValue(new Error("Gemini rate limit"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await getPricePrediction(42);
    consoleErrorSpy.mockRestore();

    expect(res.errCode).toBe(0);
    expect(res.data.aiAnalysis.isFallback).toBe(true);
    expect(res.data.aiAnalysis.methodology).toBe("deterministic_seasonal_heuristic");
    expect(res.data.aiAnalysis.chartData).toHaveLength(4);
    expect(res.data.aiAnalysis.fairPrice).toBeGreaterThan(0);
    expect(res.data.reliability).toBeGreaterThanOrEqual(65);
    expect(res.data.reliability).toBeLessThanOrEqual(90);
  });

  test("getPricePrediction marks Gemini success with clamped reliability and methodology", async () => {
    jest.spyOn(db.Product, "findByPk").mockResolvedValue({
      id: 77,
      name: "iPhone 16 Pro",
      basePrice: 28990000,
      discount: 5,
      sold: 15,
      category: { name: "Smartphone" },
    });
    generateContentWithFallback.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            trend: "Giá ổn định",
            suggestion: "Mua ngay",
            adviceCode: "BUY_NOW",
            risk: "Thấp",
            fairPrice: 26500000,
            reliability: 99,
            chartData: [
              { name: "Hiện tại", price: 27540500 },
              { name: "30 ngày", price: 26500000 },
            ],
          }),
      },
    });

    const res = await getPricePrediction(77);
    expect(res.errCode).toBe(0);
    expect(res.data.aiAnalysis.isFallback).toBe(false);
    expect(res.data.aiAnalysis.methodology).toBe("gemini_market_analysis");
    expect(res.data.aiAnalysis.reliability).toBeLessThanOrEqual(95);
    expect(res.data.aiAnalysis.reliability).toBeGreaterThanOrEqual(50);
  });
});
