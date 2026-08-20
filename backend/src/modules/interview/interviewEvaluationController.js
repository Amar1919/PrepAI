const Interview = require("./Interview.model");
const askGemini = require("../ai/geminiService");
const asyncHandler = require("../../shared/utils/asyncHandler");
const ApiError = require("../../shared/utils/ApiError");
const { recordActivity } = require("../../shared/utils/gamification");

const evaluateAnswer = asyncHandler(async (req, res) => {
  const { question, answer, interviewId, questionIndex } = req.body;

  if (!question || !answer) {
    throw new ApiError(400, "Question and answer are required");
  }

  const prompt = `
You are a strict but encouraging technical interview coach.

Question:
${question}

Candidate Answer:
${answer}

Respond in this exact structure with these exact headings:
Score: <a number 0-10>
Strengths: <2-3 concise bullet points>
Weaknesses: <2-3 concise bullet points>
Suggestions: <2-3 concise, actionable bullet points>
`;

  let feedback;

  try {
    feedback = await askGemini(prompt);
  } catch (error) {
    feedback = "Gemini is currently busy. Please try again in a few seconds.";
  }

  const scoreMatch = feedback.match(/Score:\s*(\d+(\.\d+)?)/i);
  const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;

  if (interviewId && questionIndex !== undefined) {
    await Interview.findOneAndUpdate(
      { _id: interviewId, userId: req.user.id },
      {
        $set: {
          [`answers.${questionIndex}`]: answer,
          [`feedback.${questionIndex}`]: feedback,
          ...(score !== null ? { [`scores.${questionIndex}`]: score } : {}),
        },
      }
    );
  }

  const activity = await recordActivity(req.user.id, { xp: 8 });

  res.json({
    success: true,
    feedback,
    score,
    activity,
  });
});

module.exports = { evaluateAnswer };
