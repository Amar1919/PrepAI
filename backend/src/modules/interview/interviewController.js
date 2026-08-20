const Interview = require("./Interview.model");
const askGemini = require("../ai/geminiService");
const asyncHandler = require("../../shared/utils/asyncHandler");
const ApiError = require("../../shared/utils/ApiError");
const { recordActivity } = require("../../shared/utils/gamification");

const generateQuestions = asyncHandler(async (req, res) => {
  const { role, experience, skills, company } = req.body;

  if (!role || !experience || !skills) {
    throw new ApiError(400, "Role, experience and skills are required");
  }

  const prompt = `
Generate exactly 10 interview questions for a candidate.

Role: ${role}
Experience level: ${experience}
Skills: ${skills}
${company ? `Target company: ${company} (tailor style/culture accordingly)` : ""}

Return only the questions, one per line, no numbering, no extra commentary.
`;

  const answer = await askGemini(prompt);

  const questions = answer
    .split("\n")
    .map((q) => q.replace(/^\d+[\).\s-]*/, "").trim())
    .filter((q) => q !== "");

  const interview = await Interview.create({
    userId: req.user.id,
    role,
    experience,
    skills,
    company: company || "",
    questions,
  });

  const activity = await recordActivity(req.user.id, {
    xp: 15,
    badgeCandidates: ["first_interview"],
  });

  res.json({
    success: true,
    questions,
    interview,
    activity,
  });
});

const getInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ userId: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    interviews,
  });
});

const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  res.json({ success: true, message: "Interview deleted" });
});

module.exports = { generateQuestions, getInterviews, deleteInterview };
