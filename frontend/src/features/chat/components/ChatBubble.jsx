import { FiUser, FiZap, FiFileText, FiFile } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4 space-y-1 list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4 space-y-1 list-decimal">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h1 className="text-base font-bold text-slate-100 mt-3 mb-1.5 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold text-slate-100 mt-3 mb-1.5 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-100 mt-2.5 mb-1 first:mt-0">{children}</h3>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:text-accent-300 underline underline-offset-2">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-base-600 pl-3 my-2 text-slate-400 italic">{children}</blockquote>
  ),
  code: ({ inline, children, ...props }) => {
    if (inline) {
      return (
        <code className="bg-base-950/60 text-accent-300 rounded px-1.5 py-0.5 text-[0.85em] font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="block font-mono text-[0.85em] text-slate-200 whitespace-pre" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-base-950 border border-base-700 rounded-lg p-3 my-2 overflow-x-auto">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-base-700 bg-base-800 px-2 py-1 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-base-700 px-2 py-1">{children}</td>,
  hr: () => <hr className="border-base-700 my-3" />,
};

function AttachmentChip({ fileName }) {
  const isPdf = fileName?.toLowerCase().endsWith(".pdf");
  const Icon = isPdf ? FiFileText : FiFile;

  return (
    <div className="flex items-center gap-1.5 mb-1.5 text-xs bg-black/15 rounded-lg px-2.5 py-1.5 w-fit">
      <Icon size={13} />
      <span className="truncate max-w-[180px]">{fileName}</span>
    </div>
  );
}

function ChatBubble({ role, content, attachment, streaming }) {
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
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-accent-500 text-white rounded-tr-sm"
            : "bg-base-800 border border-base-700 text-slate-200 rounded-tl-sm"
        }`}
      >
        {attachment?.fileName && <AttachmentChip fileName={attachment.fileName} />}

        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {content}
            </ReactMarkdown>
            {streaming && (
              <span className="inline-block w-1.5 h-3.5 bg-current opacity-70 ml-0.5 align-middle animate-pulse-soft" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatBubble;