import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiHelpCircle,
  FiFileText,
  FiCode,
  FiZap,
  FiAward,
  FiArrowRight,
  FiMic,
  FiCheckCircle,
  FiTarget,
} from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { getStats } from "../../profile/services/profileService";
import { getInterviewHistory } from "../../interviews/services/interviewService";
import StatCard from "../../../shared/components/StatCard";
import AnalyticsChart from "../../../shared/components/AnalyticsChart";
import { DashboardSkeleton } from "../../../shared/components/Skeleton";
import EmptyState from "../../../shared/components/EmptyState";
import { useAuth } from "../../../shared/context/AuthContext";

const quickActions = [
  { to: "/interviews", label: "Generate Interview", desc: "Role-based question sets", icon: FiHelpCircle },
  { to: "/mock-interview", label: "Voice Mock Interview", desc: "Practice out loud", icon: FiMic },
  { to: "/resume", label: "Analyze Resume", desc: "AI-scored feedback", icon: FiFileText },
  { to: "/dsa", label: "Solve DSA Problem", desc: "Coding practice", icon: FiCode },
];

// Encodes the actual product loop so a first-time visitor (or a recruiter
// glancing at it) immediately gets what this app does, in order.
const flowSteps = [
  { label: "Generate", desc: "Pick a role, get tailored questions", to: "/interviews" },
  { label: "Answer", desc: "Respond in writing or by voice", to: "/mock-interview" },
  { label: "Get Evaluated", desc: "AI scores each answer 0-10", to: "/interviews" },
  { label: "See Weak Areas", desc: "Lowest-scored topics surface below", to: "#focus-areas" },
  { label: "Practice Again", desc: "Close the loop, track improvement", to: "/dsa" },
];

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, interviewsRes] = await Promise.all([
          getStats(),
          getInterviewHistory(),
        ]);
        setStats(statsRes.data);
        setInterviews(interviewsRes.data.interviews || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
     
  }, []);

  // Pull out the lowest-scored answered questions across all interviews,
  // so the dashboard can point directly at what to practice next.
  const focusAreas = interviews
    .flatMap((interview) =>
      Object.entries(interview.scores || {}).map(([qIndex, score]) => ({
        interviewId: interview._id,
        role: interview.role,
        question: interview.questions?.[qIndex],
        score,
      }))
    )
    .filter((item) => item.question && item.score !== undefined)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-grid-fade">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Ready to sharpen your interview skills today?</p>
      </div>

      {/* Clear user flow strip - the #10 priority: make the loop obvious */}
      <div className="card p-5">
        <h2 className="section-title mb-4">How PrepAI Works</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          {flowSteps.map((step, i) => (
            <Link
              key={step.label}
              to={step.to}
              className="flex-1 group flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1.5 p-3 rounded-xl bg-base-800 border border-base-700 hover:border-accent-500/40 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-accent-500/15 text-accent-400 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 group-hover:text-accent-400 transition-colors">
                  {step.label}
                </p>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={FiBriefcase} label="Interviews" value={stats?.totalInterviews ?? 0} accent="text-accent-400" />
            <StatCard icon={FiHelpCircle} label="Questions Practiced" value={stats?.totalQuestions ?? 0} accent="text-violet-400" />
            <StatCard icon={FiFileText} label="Resumes Analyzed" value={stats?.resumeAnalyses ?? 0} accent="text-emerald-400" />
            <StatCard icon={FiCode} label="DSA Solved" value={stats?.dsaSolved ?? 0} accent="text-amber-400" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="card p-5 lg:col-span-2">
              <h2 className="section-title mb-4">Activity Overview</h2>
              <AnalyticsChart stats={stats} />
            </div>

            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="section-title">Progress</h2>
                <FaFire className="text-orange-400" size={18} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-base-800 border border-base-700">
                <div>
                  <p className="text-xs text-slate-500">Current Streak</p>
                  <p className="text-lg font-bold text-white">{stats?.streak?.current ?? 0} days</p>
                </div>
                <FaFire className="text-orange-400" size={22} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-base-800 border border-base-700">
                <div>
                  <p className="text-xs text-slate-500">Total XP</p>
                  <p className="text-lg font-bold text-white">{stats?.xp ?? 0}</p>
                </div>
                <FiZap className="text-accent-400" size={24} />
              </div>

              {stats?.avgAnswerScore !== null && stats?.avgAnswerScore !== undefined && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-base-800 border border-base-700">
                  <div>
                    <p className="text-xs text-slate-500">Avg Answer Score</p>
                    <p className="text-lg font-bold text-white">{stats.avgAnswerScore}/10</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                  <FiAward size={13} /> Badges ({stats?.badges?.length ?? 0})
                </p>
                {stats?.badges?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {stats.badges.map((b) => (
                      <span key={b.id} title={b.description} className="badge">
                        <span>{b.icon}</span> {b.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">Complete activities to earn your first badge.</p>
                )}
              </div>
            </div>
          </div>

          <div id="focus-areas" className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiTarget className="text-rose-400" size={16} />
              <h2 className="section-title">Focus Areas</h2>
            </div>
            {focusAreas.length ? (
              <div className="space-y-2.5">
                {focusAreas.map((item, i) => (
                  <Link
                    key={i}
                    to="/interviews"
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-base-800 border border-base-700 hover:border-rose-500/30 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 truncate">{item.question}</p>
                      <p className="text-xs text-slate-500">{item.role} · Scored {item.score}/10</p>
                    </div>
                    <span className="text-xs font-medium text-rose-400 shrink-0 flex items-center gap-1">
                      Practice <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FiCheckCircle}
                title="No weak areas yet"
                description="Answer a few interview questions and PrepAI will surface your lowest-scored topics here so you know exactly what to practice next."
              />
            )}
          </div>
        </>
      )}

      <div>
        <h2 className="section-title mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ to, label, desc, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="card p-4 group hover:border-accent-500/40 transition-colors duration-150"
            >
              <div className="w-9 h-9 rounded-lg bg-accent-500/15 text-accent-400 flex items-center justify-center mb-3">
                <Icon size={16} />
              </div>
              <p className="text-sm font-semibold text-slate-100 flex items-center gap-1">
                {label}
                <FiArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
