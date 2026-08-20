const askGemini = require("./geminiService");
const asyncHandler = require("../../shared/utils/asyncHandler");

const testAI = asyncHandler(async (req, res) => {
  const answer = await askGemini("Tell me 3 JavaScript interview questions");
  res.json({ success: true, answer });
});

module.exports = { testAI };
