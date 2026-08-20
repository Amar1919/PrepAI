import { useState } from "react";
import { FiFileText, FiChevronDown, FiChevronUp } from "react-icons/fi";
import EmptyState from "../../../shared/components/EmptyState";
import FeedbackCard from "../../../shared/components/FeedbackCard";

function ResumeHistory({ analyses }) {
  const [openId, setOpenId] = useState(null);

  if (!analyses?.length) {
    return (
      <EmptyState
        icon={FiFileText}
        title="No resumes analyzed yet"
        description="Upload a resume above to get AI-powered feedback."
      />
    );
  }

  return (
    <div className="space-y-2">
      {analyses.map((a) => {
        const open = openId === a._id;
        return (
          <div key={a._id} className="bg-base-800 border border-base-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : a._id)}
              className="w-full flex items-center justify-between p-3.5 text-left"
            >
              <div className="min-w-0 flex items-center gap-2.5">
                <FiFileText className="text-accent-400 shrink-0" size={16} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{a.resumeName}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(a.createdAt).toLocaleDateString()}
                    {a.score !== null && a.score !== undefined && ` · Score: ${a.score}/100`}
                  </p>
                </div>
              </div>
              {open ? <FiChevronUp className="text-slate-500 shrink-0" /> : <FiChevronDown className="text-slate-500 shrink-0" />}
            </button>
            {open && (
              <div className="px-4 pb-4 pt-1 border-t border-base-700">
                <FeedbackCard text={a.analysis} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ResumeHistory;
