import API from "../../../shared/services/api";

export const listConversations = () => API.get("/chat");

export const getConversation = (id) => API.get(`/chat/${id}`);

export const deleteConversation = (id) => API.delete(`/chat/${id}`);

export const ALLOWED_ATTACHMENT_TYPES = ["application/pdf", "text/plain"];
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB, matches backend limit

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function streamMessage({ conversationId, message, file, onChunk, signal }) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  if (conversationId) formData.append("conversationId", conversationId);
  if (message) formData.append("message", message);
  if (file) formData.append("document", file);

  const res = await fetch(`${API_BASE}/chat/message`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: formData,
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