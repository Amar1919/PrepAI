import { useEffect, useRef, useState } from "react";
import { FiSend, FiZap, FiLoader } from "react-icons/fi";
import { useToast } from "../../../shared/context/ToastContext";
import {
  listConversations,
  getConversation,
  deleteConversation,
  streamMessage,
} from "../services/chatService";
import ChatSessionSidebar from "../components/ChatSessionSidebar";
import ChatBubble from "../components/ChatBubble";

const SUGGESTED_PROMPTS = [
  "How should I answer 'Tell me about yourself'?",
  "What's the difference between REST and GraphQL?",
  "Review my elevator pitch for a frontend role",
  "Explain Big-O notation simply",
];

function Chat() {
  const toast = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await listConversations();
      setConversations(res.data.conversations);
    } catch {
      // Non-fatal - the sidebar just stays empty, chat still usable.
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const selectConversation = async (id) => {
    setActiveId(id);
    setLoadingConversation(true);
    try {
      const res = await getConversation(id);
      setMessages(res.data.conversation.messages);
    } catch {
      toast.error("Couldn't load that conversation");
    } finally {
      setLoadingConversation(false);
    }
  };

  const startNewConversation = () => {
    setActiveId(null);
    setMessages([]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeId === id) startNewConversation();
    } catch {
      toast.error("Couldn't delete that conversation");
    }
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setInput("");
    setSending(true);

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const newId = await streamMessage({
        conversationId: activeId,
        message: trimmed,
        signal: controller.signal,
        onChunk: (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, content: last.content + chunk };
            return next;
          });
        },
      });

      if (!activeId && newId) {
        setActiveId(newId);
        fetchConversations();
      } else if (activeId) {
        fetchConversations();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error(error.message || "Something went wrong");
      }
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-8.5rem)]">
      <div className="card p-4 lg:col-span-1 hidden lg:flex flex-col">
        <ChatSessionSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={startNewConversation}
          onDelete={handleDelete}
          loading={loadingList}
        />
      </div>

      <div className="card lg:col-span-3 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {loadingConversation ? (
            <p className="text-sm text-slate-500">Loading conversation...</p>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-full bg-accent-500/15 text-accent-400 flex items-center justify-center mb-3">
                <FiZap size={22} />
              </div>
              <h2 className="text-base font-semibold text-slate-100">PrepAI Assistant</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Ask about interview questions, resume feedback, DSA concepts, or anything else on your mind.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mt-5 w-full max-w-md">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left text-xs text-slate-400 hover:text-slate-200 bg-base-800 hover:bg-base-700 border border-base-700 rounded-xl px-3 py-2.5 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <ChatBubble
                key={i}
                role={m.role}
                content={m.content}
                streaming={sending && i === messages.length - 1 && m.role === "assistant"}
              />
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-base-700 p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the PrepAI Assistant..."
            className="input-field flex-1"
            disabled={sending}
          />
          <button type="submit" disabled={sending || !input.trim()} className="btn-primary shrink-0 px-3.5">
            {sending ? <FiLoader className="animate-spin" size={16} /> : <FiSend size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
