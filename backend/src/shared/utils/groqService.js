const Groq = require("groq-sdk");

let cachedClient = null;

// How many prior turns to replay each request. Unbounded history sent on
// every call is the single biggest cause of "chat gets slow/weird after
// a while" - trimming keeps latency and quality stable regardless of
// conversation length.
const MAX_HISTORY_MESSAGES = 20;

function requireApiKey() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and add it to your .env file."
    );
  }
}

function getClient() {
  requireApiKey();
  if (!cachedClient) {
    cachedClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return cachedClient;
}

// Groq retires/renames models with little notice (this list has already
// gone stale once). Rather than hardcode one name and break again, try a
// short ordered list and only fall through to the next one specifically
// when Groq says the model itself is unavailable - not for other errors
// like bad auth or rate limits, where retrying with a different model
// would just mask the real problem.
function getModelCandidates() {
  const configured = process.env.GROQ_MODEL;
  const knownGood = ["openai/gpt-oss-120b", "llama-3.1-8b-instant"];
  const list = configured ? [configured, ...knownGood] : knownGood;
  return [...new Set(list)];
}

function isModelUnavailableError(error) {
  const message = error?.message || "";
  return (
    error?.status === 404 ||
    /model_not_found/i.test(message) ||
    /does not exist or you do not have access/i.test(message)
  );
}

function buildSystemPrompt(userContext = {}) {
  const { name, targetRole } = userContext;

  let prompt =
    "You are the PrepAI Assistant, embedded in PrepAI - an interview and career prep platform " +
    "for students. You help with interview questions, resume feedback, coding/DSA concepts, and " +
    "general career advice, but you can also answer general questions the student asks.\n\n" +
    "Formatting rules:\n" +
    "- Be concise. Default to a few sentences or a short bullet list, not long essays.\n" +
    "- Use markdown: **bold** for key terms, bullet points for lists, code blocks for code.\n" +
    "- Never pad answers with filler like 'Great question!' - get straight to the useful content.\n" +
    "- If you don't know something or it needs current information, say so plainly instead of guessing.";

  if (name) {
    prompt += `\n\nThe student you're talking to is named ${name}.`;
  }
  if (targetRole) {
    prompt += ` They're preparing for a ${targetRole} role - tailor examples toward that when relevant.`;
  }

  return prompt;
}

async function* streamChat(history, newMessage, userContext = {}) {
  const client = getClient();
  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const messages = [
    { role: "system", content: buildSystemPrompt(userContext) },
    ...trimmedHistory.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
    { role: "user", content: newMessage },
  ];

  const candidates = getModelCandidates();
  let lastError;

  for (const model of candidates) {
    let stream;
    try {
      stream = await client.chat.completions.create({
        model,
        messages,
        stream: true,
        temperature: 0.6,
        max_tokens: 1024,
      });
    } catch (error) {
      lastError = error;
      if (isModelUnavailableError(error) && model !== candidates[candidates.length - 1]) {
        console.log(`Groq model "${model}" unavailable, trying next candidate...`);
        continue;
      }
      throw error;
    }

    for await (const chunk of stream) {
      const text = chunk.choices?.[0]?.delta?.content;
      if (text) yield text;
    }
    return;
  }

  throw lastError;
}

module.exports = { streamChat };