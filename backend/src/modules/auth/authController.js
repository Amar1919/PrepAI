const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../user/User.model");
const ApiError = require("../../shared/utils/ApiError");
const asyncHandler = require("../../shared/utils/asyncHandler");
const { sendPasswordResetEmail } = require("../../shared/utils/emailService");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatarColor: user.avatarColor,
  xp: user.xp,
  streak: user.streak,
  badges: user.badges,
  targetRole: user.targetRole,
});

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists) {
    throw new ApiError(400, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    token,
    user: sanitizeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(400, "Invalid email or password");
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: sanitizeUser(user),
  });
});

// Always returns a generic success message regardless of whether the email
// exists - this is deliberate. Confirming/denying account existence here
// is a common way attackers enumerate valid emails to target elsewhere.
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const genericResponse = {
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  };

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.json(genericResponse);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0];
  const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (error) {
    console.log("Failed to send password reset email:", error.message);
  }

  res.json(genericResponse);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, "Token and new password are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordTokenHash +resetPasswordExpires");

  if (!user) {
    throw new ApiError(400, "This reset link is invalid or has expired");
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successfully. You can now log in." });
});

module.exports = { signup, login, forgotPassword, resetPassword, sanitizeUser };