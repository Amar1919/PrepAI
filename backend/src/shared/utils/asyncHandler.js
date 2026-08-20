// Wraps async route handlers so thrown errors are forwarded to Express's
// centralized error handler instead of crashing the process or requiring
// a try/catch in every controller.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
