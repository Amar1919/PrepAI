import { Link } from "react-router-dom";
import { FiZap, FiMessageSquare, FiFileText, FiCode, FiMic, FiBriefcase, FiArrowRight } from "react-icons/fi";

const features = [
  { icon: FiMessageSquare, title: "AI Interview Generator", desc: "Role-specific questions tailored to your experience and target company." },
  { icon: FiMic, title: "Voice Mock Interviews", desc: "Practice out loud, get transcribed, and receive instant AI feedback." },
  { icon: FiFileText, title: "Resume Analyzer", desc: "Upload your resume, get a scored breakdown of strengths and gaps." },
  { icon: FiCode, title: "DSA Practice", desc: "Work through coding problems with AI-reviewed correctness and complexity feedback." },
  { icon: FiBriefcase, title: "Company Question Banks", desc: "Prep with questions tailored to Google, Amazon, Meta, and more." },
  { icon: FiZap, title: "Streaks & Progress", desc: "XP, streaks, and badges keep practice consistent instead of one-off." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-base-950 bg-grid-fade">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-violet-glow flex items-center justify-center">
            <FiZap className="text-white" size={16} />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">PrepAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Log In</Link>
          <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto text-center px-6 pt-16 pb-20 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          Ace your next interview with an <span className="text-accent-400">AI prep partner</span>
        </h1>
        <p className="text-slate-400 mt-5 text-lg max-w-xl mx-auto">
          Generate tailored questions, practice out loud, get your resume scored, and know exactly
          which topics to revisit before you walk into the real thing.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/signup" className="btn-primary">
            Start Practicing Free <FiArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary">
            I have an account
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5">
              <div className="w-9 h-9 rounded-lg bg-accent-500/15 text-accent-400 flex items-center justify-center mb-3">
                <Icon size={16} />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-slate-600 pb-8">
        Built with React, Express, MongoDB, and Google Gemini.
      </footer>
    </div>
  );
}

export default Landing;
