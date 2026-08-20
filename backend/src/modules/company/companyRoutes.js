const express = require("express");
const router = express.Router();

const protect = require("../../shared/middleware/authMiddleware");
const { listCompanies, getCompany } = require("./companyController");

router.use(protect);

router.get("/", listCompanies);
router.get("/:id", getCompany);

module.exports = router;
