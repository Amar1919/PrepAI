const ResumeAnalysis = require("./ResumeAnalysis.model");
const asyncHandler = require("../../shared/utils/asyncHandler");

const getResumeHistory = asyncHandler(async (req, res) => {
  const analyses = await ResumeAnalysis.find({ userId: req.user.id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    analyses,
  });
});

module.exports = { getResumeHistory };
