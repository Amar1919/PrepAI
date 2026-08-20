import { useState } from "react";
import { FiLoader, FiCheckCircle } from "react-icons/fi";
import { getErrorMessage } from "../../../shared/services/api";
import { useToast } from "../../../shared/context/ToastContext";
import { useAuth } from "../../../shared/context/AuthContext";
import FeedbackCard from "../../../shared/components/FeedbackCard";
import EmptyState from "../../../shared/components/EmptyState";
import { evaluateAnswer as evaluateAnswerRequest } from "../services/interviewService";
import { FiMessageSquare } from "react-icons/fi";

function InterviewPractice({ interview }) {
  const toast = useToast();
  const { patchUser } = useAuth();

  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(interview?.feedback ? Object.fromEntries(interview.feedback) : {});
  const [loadingIndex, setLoadingIndex] = useState(null);

  if (!interview) {
    return (
      <EmptyState
        icon={FiMessageSquare}
        title="Select an interview"
        description="Choose an interview from the history to start practicing your answers."
      />
    );
  }

  const evaluateAnswer = async (question, index) => {
    const answer = answers[index];
    if (!answer?.trim()) {
      toast.error("Type an answer before evaluating");
      return;
    }

    setLoadingIndex(index);
    try {
      const response = await evaluateAnswerRequest({
        question,
        answer,
        interviewId: interview._id,
        questionIndex: index,
      });

      setFeedback((prev) => ({ ...prev, [index]: response.data.feedback }));

      if (response.data.activity) {
        patchUser({ xp: response.data.activity.xp, streak: response.data.activity.streak });
        response.data.activity.newBadges?.forEach((b) => toast.info(`New badge unlocked: ${b.icon} ${b.name}`));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">
          {interview.role}
          {interview.company && <span className="text-slate-500 font-normal"> · {interview.company}</span>}
        </h3>
        <p className="text-xs text-slate-500">{interview.experience} · {interview.skills}</p>
      </div>

      <div className="space-y-3">
        {interview.questions.map((question, index) => (
          <div key={index} className="bg-base-800 border border-base-700 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-100 mb-2">
              <span className="text-accent-400">Q{index + 1}.</span> {question}
            </p>

            <textarea
              rows={3}
              className="input-field resize-none"
              placeholder="Type your answer..."
              value={answers[index] || ""}
              onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
            />

            <button
              onClick={() => evaluateAnswer(question, index)}
              disabled={loadingIndex === index}
              className="btn-secondary mt-2.5 text-xs"
            >
              {loadingIndex === index ? (
                <FiLoader className="animate-spin" size={13} />
              ) : (
                <FiCheckCircle size={13} />
              )}
              Evaluate Answer
            </button>

            {feedback[index] && (
              <div className="mt-3 pt-3 border-t border-base-700">
                <FeedbackCard text={feedback[index]} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InterviewPractice;
