const express = require("express");
const router = express.Router();

const protect = require("../../shared/middleware/authMiddleware");
const chatUpload = require("../../shared/middleware/chatUploadMiddleware");
const { listConversations, getConversation, deleteConversation, sendMessage } = require("./chatController");

router.use(protect);

router.get("/", listConversations);
router.get("/:id", getConversation);
router.post("/message", chatUpload.single("document"), sendMessage);
router.delete("/:id", deleteConversation);

module.exports = router;