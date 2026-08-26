const bcrypt = require("bcryptjs");
const Interview = require("../interview/Interview.model");
const ResumeAnalysis = require("../resume/ResumeAnalysis.model");
const DSASubmission = require("../dsa/DSASubmission.model");
const Chat = require("../chat/Chat.model");
const User = require("./User.model");
const asyncHandler = require("../../shared/utils/asyncHandler");
const ApiError = require("../../shared/utils/ApiError");
const { sanitizeUser } = require("../auth/authController");

const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [interviews, resumeCount, dsaCount, user] = await Promise.all([
    Interview.find({ userId }),
    ResumeAnalysis.countDocuments({ userId }),
    DSASubmission.countDocuments({ userId }),
    User.findById(userId),
  ]);

  const totalInterviews = interviews.length;

  let totalQuestions = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  interviews.forEach((interview) => {
    totalQuestions += interview.questions.length;
    if (interview.scores) {
      for (const val of interview.scores.values()) {
        scoreSum += val;
        scoreCount += 1;
      }
    }
  });

  const avgAnswerScore = scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : null;

  res.status(200).json({
    success: true,
    totalInterviews,
    totalQuestions,
    resumeAnalyses: resumeCount,
    dsaSolved: dsaCount,
    avgAnswerScore,
    xp: user?.xp || 0,
    streak: user?.streak || { current: 0, longest: 0 },
    badges: user?.badges || [],
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user: sanitizeUser(user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, targetRole } = req.body;
  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (targetRole !== undefined) user.targetRole = targetRole;

  await user.save();

  res.json({ success: true, user: sanitizeUser(user) });
});

// Permanently deletes the account and every piece of data tied to it.
// Requires the current password as confirmation - a destructive,
// irreversible action shouldn't be one click away from a JWT alone
// (e.g. an unattended logged-in browser tab).
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Enter your password to confirm account deletion");
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(400, "Incorrect password");
  }

  const userId = req.user.id;

  await Promise.all([
    Interview.deleteMany({ userId }),
    ResumeAnalysis.deleteMany({ userId }),
    DSASubmission.deleteMany({ userId }),
    Chat.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);

  res.json({ success: true, message: "Your account and all associated data have been deleted" });
});

module.exports = { getStats, getProfile, updateProfile, deleteAccount };