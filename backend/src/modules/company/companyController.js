const fs = require("fs");
const path = require("path");
const asyncHandler = require("../../shared/utils/asyncHandler");
const ApiError = require("../../shared/utils/ApiError");

const companies = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./companies.data.json"), "utf-8")
);

const listCompanies = asyncHandler(async (req, res) => {
  res.json({ success: true, companies });
});

const getCompany = asyncHandler(async (req, res) => {
  const company = companies.find((c) => c.id === req.params.id);
  if (!company) throw new ApiError(404, "Company not found");
  res.json({ success: true, company });
});

module.exports = { listCompanies, getCompany };
