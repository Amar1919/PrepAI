const express = require("express");
const router = express.Router();
const protect = require("../../shared/middleware/authMiddleware");

const { generateQuestions, getInterviews, deleteInterview } = require("./interviewController");
const { evaluateAnswer } = require("./interviewEvaluationController");
const enforceAiUsageLimit = require("../../shared/middleware/aiUsageLimit");

router.use(protect);

router.post("/generate", generateQuestions);
router.get("/history", getInterviews);
router.delete("/:id", deleteInterview);
router.post("/evaluate", evaluateAnswer);
router.post("/generate", enforceAiUsageLimit, generateQuestions);
router.post("/evaluate", enforceAiUsageLimit, evaluateAnswer);

module.exports = router;
