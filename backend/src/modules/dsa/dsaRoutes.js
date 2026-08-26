const express = require("express");
const router = express.Router();

const protect = require("../../shared/middleware/authMiddleware");
const { listProblems, getProblem, reviewSubmission, getSubmissions } = require("./dsaController");
const enforceAiUsageLimit = require("../../shared/middleware/aiUsageLimit");

router.use(protect);

router.get("/problems", listProblems);
router.get("/problems/:id", getProblem);
router.post("/submit", reviewSubmission);
router.get("/submissions", getSubmissions);
router.post("/submit", enforceAiUsageLimit, reviewSubmission);

module.exports = router;
