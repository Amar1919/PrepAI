import API from "../../../shared/services/api";

export const listConversations = () => API.get("/chat");

export const getConversation = (id) => API.get(`/chat/${id}`);

export const deleteConversation = (id) => API.delete(`/chat/${id}`);

// Streaming needs a raw fetch (not axios) so we can read the response body
// as it arrives via ReadableStream, for the live "typing" effect.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function streamMessage({ conversationId, message, onChunk, signal }) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ conversationId, message }),
    signal,
  });

  if (!res.ok) {
    let msg = "Failed to send message";
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch {
      /* response wasn't JSON - keep default message */
    }
    throw new Error(msg);
  }

  const newConversationId = res.headers.get("X-Chat-Id");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }

  return newConversationId;
}
