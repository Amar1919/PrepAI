const { GoogleGenerativeAI } = require("@google/generative-ai");

let cachedModel = null;
let cachedChatModel = null;

const CHAT_SYSTEM_INSTRUCTION =
  "You are the PrepAI Assistant, a helpful AI embedded in an interview-prep platform for students. " +
  "You help with interview questions, resume feedback, coding/DSA concepts, career advice, and general " +
  "questions the student has. Keep answers clear, encouraging, and appropriately concise - use short " +
  "paragraphs or bullet points rather than long walls of text.";

function requireApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set. Add it to your .env file.");
  }
}

function getModel() {
  requireApiKey();
  if (!cachedModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    cachedModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });
  }
  return cachedModel;
}

// Separate cached model instance with its own system instruction/persona,
// kept apart from the generic one above since other features (resume
// analysis, interview generation) use plain one-off prompts instead.
function getChatModel() {
  requireApiKey();
  if (!cachedChatModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    cachedChatModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
    });
  }
  return cachedChatModel;
}

const askGemini = async (prompt) => {
  const model = getModel();
  let lastError;

  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      console.log(`Gemini retry ${i + 1} failed: ${error.message}`);
      if (i < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
      }
    }
  }

  throw lastError;
};

// Streams the assistant's reply token-by-token so the frontend can render
// a live "typing" effect instead of waiting for the full response.
// `history` is [{ role: "user" | "assistant", content }] from earlier turns;
// Gemini is stateless per-request so this gets replayed on every call.
async function* streamChat(history, newMessage) {
  const model = getChatModel();

  const chat = model.startChat({
    history: history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  });

  const result = await chat.sendMessageStream(newMessage);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

module.exports = askGemini;
module.exports.streamChat = streamChat;
