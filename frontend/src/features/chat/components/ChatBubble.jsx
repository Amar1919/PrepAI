import { FiUser, FiZap } from "react-icons/fi";

function ChatBubble({ role, content, streaming }) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-accent-500/20 text-accent-400" : "bg-base-800 text-violet-400 border border-base-700"
        }`}
      >
        {isUser ? <FiUser size={14} /> : <FiZap size={14} />}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-accent-500 text-white rounded-tr-sm"
            : "bg-base-800 border border-base-700 text-slate-200 rounded-tl-sm"
        }`}
      >
        {content}
        {streaming && (
          <span className="inline-block w-1.5 h-3.5 bg-current opacity-70 ml-0.5 align-middle animate-pulse-soft" />
        )}
      </div>
    </div>
  );
}

export default ChatBubble;
