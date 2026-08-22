const { GoogleGenerativeAI } = require("@google/generative-ai");

// Used for resume analysis, interview question generation, answer
// evaluation, and DSA code review. Chat has its own provider (Groq -
// see shared/utils/groqService.js) and no longer touches this file.

let cachedModel = null;

function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set. Add it to your .env file.");
  }

  if (!cachedModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    cachedModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    });
  }

  return cachedModel;
}

const askGemini = async (prompt) => {
  const model = getModel();
  let lastError;

  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      console.log(`Gemini retry ${i + 1} failed: ${error.message}`);
      if (i < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
      }
    }
  }

  throw lastError;
};

module.exports = askGemini;