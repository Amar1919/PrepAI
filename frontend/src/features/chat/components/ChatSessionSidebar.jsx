import { FiPlus, FiTrash2, FiMessageCircle } from "react-icons/fi";

function ChatSessionSidebar({ conversations, activeId, onSelect, onNew, onDelete, loading }) {
  return (
    <div className="flex flex-col h-full">
      <button onClick={onNew} className="btn-secondary w-full mb-3 justify-start text-sm">
        <FiPlus size={15} /> New conversation
      </button>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {loading ? (
          <p className="text-xs text-slate-600 text-center py-6">Loading...</p>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-2">
            <FiMessageCircle className="mx-auto text-slate-600 mb-2" size={20} />
            <p className="text-xs text-slate-600">No conversations yet. Ask the assistant anything.</p>
          </div>
        ) : (
          conversations.map((c) => (
            <div
              key={c._id}
              onClick={() => onSelect(c._id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${
                activeId === c._id
                  ? "bg-accent-500/10 border border-accent-500/30 text-accent-400"
                  : "border border-transparent text-slate-400 hover:bg-base-800 hover:text-slate-200"
              }`}
            >
              <span className="flex-1 truncate">{c.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c._id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-opacity shrink-0"
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatSessionSidebar;
