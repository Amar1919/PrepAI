import { useState } from "react";
import { FiHelpCircle, FiLoader, FiSend } from "react-icons/fi";
import { getErrorMessage } from "../../../shared/services/api";
import { useToast } from "../../../shared/context/ToastContext";
import { useAuth } from "../../../shared/context/AuthContext";
import { generateInterview } from "../services/interviewService";

function InterviewGenerator({ onGenerated }) {
  const toast = useToast();
  const { patchUser } = useAuth();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!role || !experience || !skills) {
      toast.error("Please fill in role, experience and skills");
      return;
    }

    setLoading(true);
    try {
      const response = await generateInterview({ role, experience, skills, company });

      toast.success("Interview questions generated!");
      if (response.data.activity) {
        patchUser({ xp: response.data.activity.xp, streak: response.data.activity.streak });
        response.data.activity.newBadges?.forEach((b) => toast.info(`New badge unlocked: ${b.icon} ${b.name}`));
      }
      onGenerated?.(response.data.interview);
      setRole("");
      setExperience("");
      setSkills("");
      setCompany("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleGenerate} className="card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <FiHelpCircle className="text-accent-400" size={18} />
        <h2 className="section-title">Generate Interview Questions</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Target Role</label>
          <input
            className="input-field"
            placeholder="e.g. Frontend Developer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Experience Level</label>
          <input
            className="input-field"
            placeholder="e.g. Fresher / 2 years"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Key Skills</label>
        <input
          className="input-field"
          placeholder="e.g. React, Node.js, MongoDB"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Target Company (optional)</label>
        <input
          className="input-field"
          placeholder="e.g. Google, Amazon"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? <FiLoader className="animate-spin" size={16} /> : <><FiSend size={15} /> Generate Questions</>}
      </button>
    </form>
  );
}

export default InterviewGenerator;
