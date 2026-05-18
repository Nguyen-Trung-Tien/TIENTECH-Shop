require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);

const list = async () => {
  try {
    // There isn't a direct listModels in the SDK sometimes, 
    // but we can try to fetch a known model or use a generic model name.
    console.log("Testing with a more generic model or checking API...");
    // Let's try text-embedding-004 again but maybe the SDK version is old?
    // Actually, let's try 'models/text-embedding-004' (full path)
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent("test");
    console.log("Success!");
  } catch (error) {
    console.log("Error:", error.message);
  }
};
list();
