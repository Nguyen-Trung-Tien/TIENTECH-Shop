const db = require("../../src/models");
const redisConfig = require("../../src/config/redis");
const geminiConfig = require("../../src/config/gemini");
const { normalizeProductSpecs } = require("../../src/services/compare/SpecNormalizerService");
const { computeCompareBenchmarks } = require("../../src/services/compare/PerformanceScoringEngine");
const CompareService = require("../../src/services/compare/CompareService");

const buildMockLaptop = (overrides = {}) => ({
  id: 1,
  name: "ASUS ROG Zephyrus G14 OLED",
  slug: "asus-rog-g14",
  sku: "ROG-G14",
  basePrice: 45000000,
  discount: 10,
  totalStock: 12,
  sold: 40,
  brand: { id: 1, name: "ASUS", slug: "asus" },
  category: { id: 2, name: "Laptop Gaming", slug: "laptop" },
  images: [{ imageUrl: "/g14.png", isPrimary: true }],
  attributes: [
    { value: "AMD Ryzen 9 8945HS", attribute: { id: 1, code: "cpu", name: "CPU" } },
    { value: "RTX 4070 8GB", attribute: { id: 2, code: "gpu", name: "GPU" } },
    { value: "32GB", attribute: { id: 3, code: "ram", name: "RAM" } },
    { value: "1TB SSD", attribute: { id: 4, code: "rom", name: "ROM" } },
    { value: "14 inch 3K OLED 120Hz", attribute: { id: 5, code: "screen", name: "Màn hình" } },
  ],
  specifications: {
    battery: "73Wh sạc nhanh 100W",
    weight: "1.5kg",
    os: "Windows 11",
    connectivity: "Wi-Fi 6E, USB-C",
  },
  variants: [],
  reviews: [{ id: 1, rating: 5 }, { id: 2, rating: 5 }],
  ...overrides,
});

const buildMockBudgetLaptop = (overrides = {}) => ({
  id: 2,
  name: "Acer Aspire Lite 15",
  slug: "acer-aspire-15",
  sku: "ACER-AL15",
  basePrice: 14000000,
  discount: 0,
  totalStock: 20,
  sold: 85,
  brand: { id: 2, name: "Acer", slug: "acer" },
  category: { id: 2, name: "Laptop Gaming", slug: "laptop" },
  images: [{ imageUrl: "/acer.png", isPrimary: true }],
  attributes: [
    { value: "Intel Core i5-1235U", attribute: { id: 1, code: "cpu", name: "CPU" } },
    { value: "8GB", attribute: { id: 3, code: "ram", name: "RAM" } },
    { value: "256GB SSD", attribute: { id: 4, code: "rom", name: "ROM" } },
  ],
  specifications: {
    screen: "15.6 inch FHD IPS 60Hz",
    battery: "48Wh",
    weight: "1.85kg",
  },
  variants: [],
  reviews: [{ id: 3, rating: 4 }],
  ...overrides,
});

describe("Phase 2: Compare & Performance Benchmark Engine Tests", () => {
  beforeEach(() => {
    jest.spyOn(redisConfig, "getCache").mockResolvedValue(null);
    jest.spyOn(redisConfig, "setCache").mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("SpecNormalizerService", () => {
    test("normalizes laptop & smartphone specs from attributes, specifications JSON, and product name", () => {
      const laptop = buildMockLaptop();
      const normLaptop = normalizeProductSpecs(laptop);

      expect(normLaptop.archetype).toBe("laptop");
      expect(normLaptop.fields.cpu.raw).toBe("AMD Ryzen 9 8945HS");
      expect(normLaptop.fields.gpu.raw).toBe("RTX 4070 8GB");
      expect(normLaptop.fields.ram.numericValue).toBe(32);
      expect(normLaptop.fields.storage.numericValue).toBe(1024);
      expect(normLaptop.fields.refreshRate.numericValue).toBe(120);
      expect(normLaptop.fields.battery.numericValue).toBe(73);
      expect(normLaptop.fields.battery.unit).toBe("Wh");
      expect(normLaptop.fields.fastCharge.numericValue).toBe(100);
      expect(normLaptop.fields.weight.numericValue).toBe(1500);
      expect(normLaptop.coveragePct).toBeGreaterThanOrEqual(80);

      const phone = {
        id: 3,
        name: "Samsung Galaxy S24 Ultra Snapdragon 8 Gen 3",
        category: { name: "Điện thoại", slug: "dien-thoai" },
        specifications: {
          ram: "12GB",
          rom: "512GB",
          battery: "5000mAh 45W",
          camera: "200MP OIS",
          screen: "6.8 inch LTPO AMOLED 120Hz",
        },
        variants: [],
      };
      const normPhone = normalizeProductSpecs(phone);
      expect(normPhone.archetype).toBe("smartphone");
      expect(normPhone.fields.ram.numericValue).toBe(12);
      expect(normPhone.fields.storage.numericValue).toBe(512);
      expect(normPhone.fields.camera.numericValue).toBe(200);
      expect(normPhone.fields.battery.numericValue).toBe(5000);
    });
  });

  describe("PerformanceScoringEngine", () => {
    test("deterministically scores 5 axes in [0, 100] and crowns higher-spec laptop winner on performance/display/battery", () => {
      const l1 = buildMockLaptop({ displayPrice: 40500000, avgRating: 5 });
      const l2 = buildMockBudgetLaptop({ displayPrice: 14000000, avgRating: 4 });

      const { benchmarksByProductId, winners } = computeCompareBenchmarks([
        { product: l1, normalized: normalizeProductSpecs(l1) },
        { product: l2, normalized: normalizeProductSpecs(l2) },
      ]);

      const b1 = benchmarksByProductId[1];
      const b2 = benchmarksByProductId[2];

      for (const axis of ["performance", "display", "battery", "cameraBuild", "value", "overallScore"]) {
        expect(b1[axis]).toBeGreaterThanOrEqual(0);
        expect(b1[axis]).toBeLessThanOrEqual(100);
        expect(b2[axis]).toBeGreaterThanOrEqual(0);
        expect(b2[axis]).toBeLessThanOrEqual(100);
      }

      expect(b1.performance).toBeGreaterThan(b2.performance);
      expect(b1.display).toBeGreaterThan(b2.display);
      expect(b1.battery).toBeGreaterThan(b2.battery);
      expect(winners.performance).toBe(1);
      expect(winners.display).toBe(1);
    });
  });

  describe("CompareService & AI Verdict", () => {
    test("compareProducts validates 1-4 IDs, detects differences/bestProductId, and flags category mismatch", async () => {
      const emptyRes = await CompareService.compareProducts("");
      expect(emptyRes.errCode).toBe(400);

      const tooManyRes = await CompareService.compareProducts("1,2,3,4,5");
      expect(tooManyRes.errCode).toBe(400);

      const p1 = buildMockLaptop();
      const p2 = buildMockBudgetLaptop({
        category: { id: 9, name: "Laptop Văn Phòng", slug: "laptop-van-phong" },
      });

      jest.spyOn(db.Product, "findAll").mockResolvedValue([
        { toJSON: () => p2 },
        { toJSON: () => p1 },
      ]);

      const res = await CompareService.compareProducts("1,2");
      expect(res.errCode).toBe(0);
      // Preserves requested ID order [1, 2]
      expect(res.data.products.map((p) => p.id)).toEqual([1, 2]);
      expect(res.data.categoryMismatchWarning).toContain("nhiều danh mục");

      const overviewSection = res.data.matrix.find((s) => s.id === "overview");
      const priceRow = overviewSection.rows.find((r) => r.key === "price");
      expect(priceRow.isDifferent).toBe(true);
      expect(priceRow.bestProductId).toBe(2); // Lower price wins

      const perfSection = res.data.matrix.find((s) => s.id === "performance");
      const ramRow = perfSection.rows.find((r) => r.key === "ram");
      expect(ramRow.bestProductId).toBe(1); // Higher RAM wins
    });

    test("getCompareAiVerdict returns Gemini JSON verdict and falls back deterministically on 429 error", async () => {
      const p1 = buildMockLaptop();
      const p2 = buildMockBudgetLaptop();
      jest.spyOn(db.Product, "findAll").mockResolvedValue([
        { toJSON: () => p1 },
        { toJSON: () => p2 },
      ]);

      jest.spyOn(geminiConfig.genAI.models, "generateContent").mockResolvedValueOnce({
        text: JSON.stringify({
          headline: "ROG Zephyrus G14 vượt trội cho Gaming",
          winnerId: 1,
          summary: "Với Ryzen 9 và RTX 4070, G14 chiến thắng tuyệt đối về hiệu năng đồ họa.",
          useCaseRecommendations: [
            { useCase: "Gaming & Đồ họa", recommendedProductId: 1, reason: "RTX 4070 8GB mạnh mẽ" },
          ],
          prosConsByProduct: {
            1: { pros: ["Màn OLED 120Hz", "RTX 4070"], cons: ["Giá cao"] },
            2: { pros: ["Giá dễ tiếp cận"], cons: ["RAM 8GB"] },
          },
        }),
      });

      const aiRes = await CompareService.getCompareAiVerdict([1, 2], "gaming");
      expect(aiRes.errCode).toBe(0);
      expect(aiRes.data.source).toBe("gemini_ai");
      expect(aiRes.data.winnerId).toBe(1);

      // Quota 429 error triggers deterministic fallback
      jest
        .spyOn(geminiConfig.genAI.models, "generateContent")
        .mockRejectedValueOnce(Object.assign(new Error("429 quota exceeded"), { status: 429 }));

      const fallbackRes = await CompareService.getCompareAiVerdict([1, 2], "battery");
      expect(fallbackRes.errCode).toBe(0);
      expect(fallbackRes.data.source).toBe("deterministic_engine");
      expect(fallbackRes.data.winnerId).toBe(1);
      expect(fallbackRes.data.useCaseRecommendations.length).toBeGreaterThanOrEqual(3);
      expect(fallbackRes.data.prosConsByProduct[1].pros.length).toBeGreaterThanOrEqual(1);
    });
  });
});
