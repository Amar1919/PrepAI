const User = require("../../modules/user/User.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const DAILY_LIMIT = parseInt(process.env.DAILY_AI_LIMIT || "50", 10);

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

const enforceAiUsageLimit = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const today = todayString();

  if (user.aiUsage?.date !== today) {
    user.aiUsage = { date: today, count: 0 };
  }

  if (user.aiUsage.count >= DAILY_LIMIT) {
    throw new ApiError(
      429,
      `You've hit today's limit of ${DAILY_LIMIT} AI requests. This resets tomorrow - thanks for using PrepAI so much!`
    );
  }

  user.aiUsage.count += 1;
  await user.save();

  next();
});

module.exports = enforceAiUsageLimit;