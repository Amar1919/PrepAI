const express = require("express");
const router = express.Router();

const protect = require("../../shared/middleware/authMiddleware");
const { listProblems, getProblem, reviewSubmission, getSubmissions } = require("./dsaController");

router.use(protect);

router.get("/problems", listProblems);
router.get("/problems/:id", getProblem);
router.post("/submit", reviewSubmission);
router.get("/submissions", getSubmissions);

module.exports = router;
