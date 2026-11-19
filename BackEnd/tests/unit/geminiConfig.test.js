const geminiConfig = require("../../src/config/gemini");
const SystemSettingService = require("../../src/services/system/SystemSettingService");
const ProductService = require("../../src/services/product/ProductService");
const chatController = require("../../src/controllers/chatController");

describe("Gemini @google/genai Upgrade & ChatBot Standard Contract", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("generateContentWithFallback falls back from gemini-3.8-flash (404) to gemini-3.5-flash-lite and forwards systemInstruction", async () => {
    jest.spyOn(SystemSettingService, "getSetting").mockResolvedValue(null);

    const generateSpy = jest
      .spyOn(geminiConfig.genAI.models, "generateContent")
      .mockRejectedValueOnce(Object.assign(new Error("404 model not found"), { status: 404 }))
      .mockResolvedValueOnce({ text: '{"ok":true}' });

    const res = await geminiConfig.generateContentWithFallback("Xin chào", {
      config: {
        systemInstruction: "Bạn là chuyên gia tư vấn.",
        responseMimeType: "application/json",
      },
    });

    expect(generateSpy).toHaveBeenCalledTimes(2);
    expect(generateSpy.mock.calls[0][0].model).toBe("gemini-3.8-flash");
    expect(generateSpy.mock.calls[1][0].model).toBe("gemini-3.5-flash-lite");
    expect(generateSpy.mock.calls[1][0].config).toEqual({
      systemInstruction: "Bạn là chuyên gia tư vấn.",
      responseMimeType: "application/json",
    });
    expect(res.response.text()).toBe('{"ok":true}');
  });

  test("generateContentWithFallback does NOT retry on 429 rate-limit or 401 auth errors", async () => {
    jest.spyOn(SystemSettingService, "getSetting").mockResolvedValue(null);

    const generateSpy = jest
      .spyOn(geminiConfig.genAI.models, "generateContent")
      .mockRejectedValueOnce(Object.assign(new Error("429 quota exceeded"), { status: 429 }));

    await expect(geminiConfig.generateContentWithFallback("Test")).rejects.toThrow("429");
    expect(generateSpy).toHaveBeenCalledTimes(1);

    generateSpy.mockRejectedValueOnce(Object.assign(new Error("401 unauthorized"), { status: 401 }));
    await expect(geminiConfig.generateContentWithFallback("Test")).rejects.toThrow("401");
    expect(generateSpy).toHaveBeenCalledTimes(2);
  });

  test("chatController.handleChat returns standard { errCode: 0, data: { reply, recommendedProducts } } on success and fallback, using systemInstruction", async () => {
    jest.spyOn(SystemSettingService, "getSetting").mockImplementation(async (key, def) => {
      if (key === "AI_BOT_ENABLED") return true;
      if (key === "AI_SYSTEM_PROMPT") return "Luôn xưng hô lịch sự.";
      return def;
    });

    jest.spyOn(ProductService, "filterProducts").mockResolvedValue({
      errCode: 0,
      data: [{ id: 10, name: "Laptop Pro 16", basePrice: 25000000, slug: "laptop-pro-16" }],
    });

    const generateSpy = jest
      .spyOn(geminiConfig.genAI.models, "generateContent")
      .mockResolvedValueOnce({
        text: JSON.stringify({ isOrderQuery: false, semanticQuery: "laptop" }),
      })
      .mockResolvedValueOnce({
        text: JSON.stringify({
          reply: "Mời bạn tham khảo Laptop Pro 16!",
          recommendedProductIds: [10],
        }),
      });

    const req = {
      body: {
        message: "Tư vấn giúp mình laptop",
        history: [{ role: "user", content: "Chào shop" }],
      },
      user: null,
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await chatController.handleChat(req, res);

    // Ensure systemInstruction is passed via config and NOT placed as a user turn
    const secondCallArgs = generateSpy.mock.calls[1][0];
    expect(secondCallArgs.config.systemInstruction).toContain("Luôn xưng hô lịch sự.");
    expect(secondCallArgs.contents.some((c) => c.parts?.[0]?.text?.includes("NHIỆM VỤ:"))).toBe(false);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errCode: 0,
        data: expect.objectContaining({
          reply: "Mời bạn tham khảo Laptop Pro 16!",
          recommendedProducts: [expect.objectContaining({ id: 10, slug: "laptop-pro-16" })],
        }),
      })
    );

    // Verify AI fallback branch also returns standard { errCode: 0, data: { reply, recommendedProducts } }
    generateSpy
      .mockResolvedValueOnce({ text: JSON.stringify({ semanticQuery: "laptop" }) })
      .mockRejectedValueOnce(Object.assign(new Error("429 quota"), { status: 429 }));

    const resFallback = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await chatController.handleChat(req, resFallback);

    expect(resFallback.status).toHaveBeenCalledWith(200);
    expect(resFallback.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errCode: 0,
        data: expect.objectContaining({
          reply: expect.any(String),
          recommendedProducts: [expect.objectContaining({ id: 10 })],
        }),
      })
    );
  });
});
