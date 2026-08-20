const express = require("express");
const router = express.Router();

const protect = require("../../shared/middleware/authMiddleware");
const { getStats, getProfile, updateProfile } = require("./userController");

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/stats", getStats);

module.exports = router;
