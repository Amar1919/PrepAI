const express = require("express");
const router = express.Router();
const { testAI } = require("./aiController");

router.get("/test", testAI);

module.exports = router;
