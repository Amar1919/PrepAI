import { FiBriefcase, FiTrash2, FiPlay } from "react-icons/fi";
import { getErrorMessage } from "../../../shared/services/api";
import { deleteInterview as deleteInterviewRequest } from "../services/interviewService";
import { useToast } from "../../../shared/context/ToastContext";
import EmptyState from "../../../shared/components/EmptyState";

function InterviewHistory({ interviews, onSelect, onDeleted, selectedId }) {
  const toast = useToast();

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteInterviewRequest(id);
      toast.success("Interview deleted");
      onDeleted?.(id);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (!interviews?.length) {
    return (
      <EmptyState
        icon={FiBriefcase}
        title="No interviews yet"
        description="Generate your first set of interview questions to get started."
      />
    );
  }

  return (
    <div className="space-y-2">
      {interviews.map((interview) => (
        <button
          key={interview._id}
          onClick={() => onSelect(interview)}
          className={`w-full text-left p-3.5 rounded-xl border transition-colors duration-150 flex items-center justify-between gap-3 ${
            selectedId === interview._id
              ? "bg-accent-500/10 border-accent-500/30"
              : "bg-base-800 border-base-700 hover:border-base-600"
          }`}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">
              {interview.role}
              {interview.company && <span className="text-slate-500 font-normal"> · {interview.company}</span>}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {interview.experience} · {interview.questions?.length || 0} questions
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-accent-400"><FiPlay size={14} /></span>
            <span
              onClick={(e) => handleDelete(interview._id, e)}
              className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <FiTrash2 size={14} />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default InterviewHistory;
