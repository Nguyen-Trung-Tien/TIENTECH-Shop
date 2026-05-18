const AdminAIService = require("./src/services/AdminAIService");

const test = async () => {
  try {
    console.log("Testing AdminAIService.getAIInsights()...");
    const result = await AdminAIService.getAIInsights();
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Test Failed!", error);
  }
};

test();
