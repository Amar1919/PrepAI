const express = require("express");
const router = express.Router();

const protect = require("../../shared/middleware/authMiddleware");
const upload = require("../../shared/middleware/uploadMiddleware");
const { getResumeHistory } = require("./resumeHistoryController");
const { uploadResume } = require("./resumeController");
const enforceAiUsageLimit = require("../../shared/middleware/aiUsageLimit");

router.use(protect);

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/history", getResumeHistory);
router.post("/upload", upload.single("resume"), enforceAiUsageLimit, uploadResume);
module.exports = router;
