require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);

const test = async () => {
  try {
    console.log("Testing with gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent("Say hi");
    console.log("Success! Response:", result.response.text());
  } catch (error) {
    console.error("Test Failed!");
    console.error("Error Message:", error.message);
  }
};

test();
