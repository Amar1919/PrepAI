const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Verifies the JWT and attaches { id } to req.user.
// Accepts both "Bearer <token>" and a raw token header for backwards compatibility.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    throw new ApiError(401, "No token provided");
  }

  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;

  if (!token) {
    throw new ApiError(401, "No token provided");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
});

module.exports = protect;
