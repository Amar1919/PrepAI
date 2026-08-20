const fs = require("fs");
const path = require("path");
const DSASubmission = require("./DSASubmission.model");
const askGemini = require("../ai/geminiService");
const asyncHandler = require("../../shared/utils/asyncHandler");
const ApiError = require("../../shared/utils/ApiError");
const { recordActivity } = require("../../shared/utils/gamification");

const problems = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./dsaProblems.data.json"), "utf-8")
);

// NOTE: This platform does not execute submitted code in a sandbox.
// Submissions are reviewed by Gemini for correctness, complexity, and style,
// which is safer to run in a shared backend and still gives students real feedback.

const listProblems = asyncHandler(async (req, res) => {
  res.json({ success: true, problems });
});

const getProblem = asyncHandler(async (req, res) => {
  const problem = problems.find((p) => p.id === req.params.id);
  if (!problem) throw new ApiError(404, "Problem not found");
  res.json({ success: true, problem });
});

const reviewSubmission = asyncHandler(async (req, res) => {
  const { problemId, code, language } = req.body;

  if (!problemId || !code) {
    throw new ApiError(400, "problemId and code are required");
  }

  const problem = problems.find((p) => p.id === problemId);
  if (!problem) throw new ApiError(404, "Problem not found");

  const prompt = `
You are a senior software engineer reviewing a coding interview submission.

Problem: ${problem.title}
Description: ${problem.description}

Candidate's ${language || "javascript"} solution:
\`\`\`
${code}
\`\`\`

Respond in this exact structure:
Verdict: <Likely Correct / Likely Incorrect / Partially Correct>
Time Complexity: <Big-O with brief reason>
Space Complexity: <Big-O with brief reason>
Issues: <bullet points of bugs or edge cases missed, or "None found">
Suggestions: <2-3 concise improvement tips>
`;

  const review = await askGemini(prompt);

  const submission = await DSASubmission.create({
    userId: req.user.id,
    problemId,
    problemTitle: problem.title,
    language: language || "javascript",
    code,
    review,
  });

  const dsaCount = await DSASubmission.countDocuments({ userId: req.user.id });

  const activity = await recordActivity(req.user.id, {
    xp: 20,
    badgeCandidates: dsaCount >= 5 ? ["dsa_5"] : [],
  });

  res.json({ success: true, review, submission, activity });
});

const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await DSASubmission.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, submissions });
});

module.exports = { listProblems, getProblem, reviewSubmission, getSubmissions };
