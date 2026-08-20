const Chat = require("./Chat.model");
const { streamChat } = require("../ai/geminiService");
const asyncHandler = require("../../shared/utils/asyncHandler");
const ApiError = require("../../shared/utils/ApiError");
const { recordActivity } = require("../../shared/utils/gamification");

const MAX_TITLE_LENGTH = 60;

const deriveTitle = (message) => {
  const trimmed = message.trim().replace(/\s+/g, " ");
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

// Streams the assistant's reply as plain text chunks over a chunked HTTP
// response (not SSE - simpler, and works with a POST body which native
// EventSource can't do). The frontend reads this with a ReadableStream
// reader for a live "typing" effect. The conversation id is returned via
// the X-Chat-Id header since the body is reserved for streamed text.
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, message } = req.body;

  if (!message || !message.trim()) {
    throw new ApiError(400, "message is required");
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
      title: deriveTitle(message),
      messages: [],
    });
  }

  const history = conversation.messages.map((m) => ({ role: m.role, content: m.content }));

  conversation.messages.push({ role: "user", content: message });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("X-Chat-Id", conversation._id.toString());
  res.flushHeaders?.();

  let fullReply = "";

  try {
    for await (const chunk of streamChat(history, message)) {
      fullReply += chunk;
      res.write(chunk);
    }
  } catch (error) {
    console.log("Chat stream error:", error.message);
    if (!fullReply) {
      fullReply = "Sorry, I ran into an error generating a response. Please try again.";
      res.write(fullReply);
    }
  }

  conversation.messages.push({ role: "assistant", content: fullReply });
  await conversation.save();

  // Fire-and-forget - don't hold up the response for XP/streak bookkeeping.
  recordActivity(req.user.id, { xp: 3 }).catch(() => {});

  res.end();
});

module.exports = { listConversations, getConversation, deleteConversation, sendMessage };
