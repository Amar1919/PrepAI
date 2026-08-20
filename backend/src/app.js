const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const sanitizeBody = require("./shared/middleware/sanitize");
const { notFound, errorHandler } = require("./shared/middleware/errorHandler");

// Pure Express app - no DB connection, no app.listen(). Split out from
// server.js so tests can import and exercise this with Supertest without
// binding a real port or double-connecting to Mongo.
const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : "*",
    credentials: true,
    // The streaming chat endpoint returns the chat id in a custom header
    // since its body is reserved for the streamed text - without this,
    // the browser silently strips the header from fetch responses.
    exposedHeaders: ["X-Chat-Id"],
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(sanitizeBody);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});
app.use("/api/auth", authLimiter);

// Chat invites rapid back-to-back messages, and each one is a Gemini call -
// a tighter, dedicated limit protects API cost/quota better than the
// general 300/15min limit would.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "You're sending messages too fast. Please slow down." },
});
app.use("/api/chat", chatLimiter);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "PrepAI API is running", timestamp: new Date().toISOString() });
});

app.use("/api/auth", require("./modules/auth/authRoutes"));
app.use("/api/user", require("./modules/user/userRoutes"));
app.use("/api/resume", require("./modules/resume/resumeRoutes"));
app.use("/api/ai", require("./modules/ai/aiRoutes"));
app.use("/api/interview", require("./modules/interview/interviewRoutes"));
app.use("/api/dsa", require("./modules/dsa/dsaRoutes"));
app.use("/api/companies", require("./modules/company/companyRoutes"));
app.use("/api/chat", require("./modules/chat/chatRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
