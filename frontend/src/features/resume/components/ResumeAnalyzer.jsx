import { useState, useRef } from "react";
import { FiUpload, FiLoader, FiFileText, FiX } from "react-icons/fi";
import { getErrorMessage } from "../../../shared/services/api";
import { useToast } from "../../../shared/context/ToastContext";
import { useAuth } from "../../../shared/context/AuthContext";
import FeedbackCard from "../../../shared/components/FeedbackCard";
import { uploadResume } from "../services/resumeService";

function ResumeAnalyzer({ onAnalyzed }) {
  const toast = useToast();
  const { patchUser } = useAuth();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setFile(f);
    setAnalysis("");
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please select a resume PDF");
      return;
    }

    setLoading(true);
    try {
      const response = await uploadResume(file);

      setAnalysis(response.data.analysis);
      toast.success("Resume analyzed!");

      if (response.data.activity) {
        patchUser({ xp: response.data.activity.xp, streak: response.data.activity.streak });
        response.data.activity.newBadges?.forEach((b) => toast.info(`New badge unlocked: ${b.icon} ${b.name}`));
      }

      onAnalyzed?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FiFileText className="text-accent-400" size={18} />
        <h2 className="section-title">Resume Analyzer</h2>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragActive ? "border-accent-500 bg-accent-500/5" : "border-base-600 hover:border-base-500"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-200">
            <FiFileText className="text-accent-400" size={16} />
            {file.name}
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="text-slate-500 hover:text-rose-400"
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <>
            <FiUpload className="mx-auto text-slate-500 mb-2" size={22} />
            <p className="text-sm text-slate-400">Drag & drop your resume, or click to browse</p>
            <p className="text-xs text-slate-600 mt-1">PDF only, up to 5MB</p>
          </>
        )}
      </div>

      <button onClick={handleAnalyze} disabled={loading || !file} className="btn-primary w-full sm:w-auto">
        {loading ? <FiLoader className="animate-spin" size={16} /> : "Analyze Resume"}
      </button>

      {analysis && (
        <div className="pt-3 border-t border-base-700">
          <FeedbackCard text={analysis} />
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
