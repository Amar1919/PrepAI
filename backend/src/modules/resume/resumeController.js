const ResumeAnalysis = require("./ResumeAnalysis.model");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const askGemini = require("../ai/geminiService");
const asyncHandler = require("../../shared/utils/asyncHandler");
const ApiError = require("../../shared/utils/ApiError");
const { recordActivity } = require("../../shared/utils/gamification");

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 30) {
      throw new ApiError(400, "Could not extract readable text from this PDF");
    }

    const prompt = `
Analyze this resume for a tech job application.

Return in this exact structure:
Score: <a number 0-100>
Strengths: <3-4 concise bullet points>
Weaknesses: <3-4 concise bullet points>
Suggestions: <3-4 concise, actionable bullet points>
Missing Keywords: <comma separated list of relevant skills/keywords likely missing, or "None">

Resume:
${resumeText}
`;

    const analysis = await askGemini(prompt);
    const scoreMatch = analysis.match(/Score:\s*(\d+(\.\d+)?)/i);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;

    await ResumeAnalysis.create({
      userId: req.user.id,
      resumeName: req.file.originalname,
      analysis,
      score,
    });

    const activity = await recordActivity(req.user.id, {
      xp: 15,
      badgeCandidates: ["first_resume"],
    });

    res.status(200).json({
      success: true,
      analysis,
      score,
      activity,
    });
  } finally {
    // Clean up the uploaded file from disk regardless of outcome
    fs.unlink(req.file.path, () => {});
  }
});

module.exports = { uploadResume };
