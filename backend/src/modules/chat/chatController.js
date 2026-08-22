const fs = require("fs");
const pdfParse = require("pdf-parse");
const Chat = require("./Chat.model");
const User = require("../user/User.model");
const { streamChat } = require("../../shared/utils/groqService");
const asyncHandler = require("../../shared/utils/asyncHandler");
const ApiError = require("../../shared/utils/ApiError");
const { recordActivity } = require("../../shared/utils/gamification");

const MAX_TITLE_LENGTH = 60;
const MAX_EXTRACTED_CHARS = 6000;
const MAX_STORED_EXTRACTED_CHARS = 4000;

const deriveTitle = (message, fileName) => {
  const base = message.trim() || (fileName ? `About ${fileName}` : "New conversation");
  const trimmed = base.replace(/\s+/g, " ");
  return trimmed.length > MAX_TITLE_LENGTH
    ? trimmed.slice(0, MAX_TITLE_LENGTH).trimEnd() + "…"
    : trimmed;
};

const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Chat.find({ userId: req.user.id })
    .select("title createdAt updatedAt")
    .sort({ updatedAt: -1 });

  res.json({ success: true, conversations });
});

const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Chat.findOne({ _id: req.params.id, userId: req.user.id });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  res.json({ success: true, conversation });
});

const deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  res.json({ success: true, message: "Conversation deleted" });
});

async function extractFileText(file) {
  try {
    if (file.mimetype === "application/pdf") {
      const buffer = fs.readFileSync(file.path);
      const parsed = await pdfParse(buffer);
      return parsed.text || "";
    }
    return fs.readFileSync(file.path, "utf-8");
  } finally {
    fs.unlink(file.path, () => {});
  }
}

function historyContent(message) {
  if (!message.attachment?.extractedText) return message.content;
  return (
    `${message.content}\n\n[Attached document: ${message.attachment.fileName}]\n` +
    message.attachment.extractedText
  );
}

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, message } = req.body;
  const file = req.file;

  if ((!message || !message.trim()) && !file) {
    throw new ApiError(400, "message or a file is required");
  }

  const userText = (message || "").trim();

  let extractedText = "";
  if (file) {
    try {
      extractedText = (await extractFileText(file)).trim();
    } catch (error) {
      throw new ApiError(400, "Couldn't read that file - make sure it's a valid PDF or text file");
    }
  }

  let conversation;

  if (conversationId) {
    conversation = await Chat.findOne({ _id: conversationId, userId: req.user.id });
    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }
  } else {
    conversation = await Chat.create({
      userId: req.user.id,
      title: deriveTitle(userText, file?.originalname),
      messages: [],
    });
  }

  const history = conversation.messages.map((m) => ({
    role: m.role,
    content: historyContent(m),
  }));

  const user = await User.findById(req.user.id);

  const messageForModel = extractedText
    ? `${userText || `Please help with the attached document (${file.originalname}).`}\n\n` +
      `[Attached document: ${file.originalname}]\n${extractedText.slice(0, MAX_EXTRACTED_CHARS)}`
    : userText;

  const generator = streamChat(history, messageForModel, {
    name: user?.name,
    targetRole: user?.targetRole,
  });

  let firstChunk;
  try {
    firstChunk = await generator.next();
  } catch (error) {
    console.log("Chat stream failed to start:", error.message);
    throw new ApiError(502, "The AI assistant is temporarily unavailable. Please try again in a moment.");
  }

  conversation.messages.push({
    role: "user",
    content: userText || `Sent a document: ${file.originalname}`,
    ...(file && {
      attachment: {
        fileName: file.originalname,
        fileType: file.mimetype,
        extractedText: extractedText.slice(0, MAX_STORED_EXTRACTED_CHARS),
      },
    }),
  });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("X-Chat-Id", conversation._id.toString());
  res.flushHeaders?.();

  let fullReply = "";

  if (!firstChunk.done && firstChunk.value) {
    fullReply += firstChunk.value;
    res.write(firstChunk.value);
  }

  try {
    for await (const chunk of generator) {
      fullReply += chunk;
      res.write(chunk);
    }
  } catch (error) {
    console.log("Chat stream interrupted:", error.message);
    if (!fullReply) {
      fullReply = "Sorry, the response was interrupted. Please try again.";
      res.write(fullReply);
    }
  }

  conversation.messages.push({ role: "assistant", content: fullReply });
  await conversation.save();

  recordActivity(req.user.id, { xp: 3 }).catch(() => {});

  res.end();
});

module.exports = { listConversations, getConversation, deleteConversation, sendMessage };