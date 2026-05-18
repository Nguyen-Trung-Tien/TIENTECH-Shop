require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);

const test = async () => {
  try {
    console.log("Testing text-embedding-005...");
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent("Hello world");
    console.log("Success! Embedding length:", result.embedding.values.length);
  } catch (error) {
    console.error("Test Failed!");
    console.error("Error Message:", error.message);
    if (error.response) {
        console.error("Response Data:", error.response.data);
    }
  }
};

test();
