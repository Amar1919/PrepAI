import { useEffect, useMemo, useState } from "react";
import { FiCode, FiLoader, FiPlay, FiCheckCircle, FiExternalLink, FiSearch } from "react-icons/fi";
import { getErrorMessage } from "../../../shared/services/api";
import { ListSkeleton } from "../../../shared/components/Skeleton";
import FeedbackCard from "../../../shared/components/FeedbackCard";
import { useToast } from "../../../shared/context/ToastContext";
import { useAuth } from "../../../shared/context/AuthContext";
import { getProblems, submitCode as submitCodeRequest } from "../services/dsaService";
import CodeEditor from "../components/CodeEditor";
import { genericStarters } from "../components/starterTemplates";

const difficultyColor = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Hard: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

const DIFFICULTY_FILTERS = ["All", "Easy", "Medium", "Hard"];

function DSAPractice() {
  const toast = useToast();
  const { patchUser } = useAuth();

  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const res = await getProblems();
        setProblems(res.data.problems);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesDifficulty = difficultyFilter === "All" || p.difficulty === difficultyFilter;
      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesDifficulty && matchesSearch;
    });
  }, [problems, search, difficultyFilter]);

  const selectProblem = (problem) => {
    setSelected(problem);
    setLanguage("javascript");
    setCode(problem.starterCode || genericStarters.javascript);
    setReview("");
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    // Only javascript has hand-written starter code per problem; other
    // languages fall back to a generic template so the editor isn't blank.
    if (newLang === "javascript" && selected?.starterCode) {
      setCode(selected.starterCode);
    } else {
      setCode(genericStarters[newLang]);
    }
  };

  const submitCode = async () => {
    if (!code.trim()) {
      toast.error("Write some code first");
      return;
    }
    setReviewing(true);
    try {
      const res = await submitCodeRequest({ problemId: selected.id, code, language });
      setReview(res.data.review);
      toast.success("AI review complete");
      if (res.data.activity) {
        patchUser({ xp: res.data.activity.xp, streak: res.data.activity.streak });
        res.data.activity.newBadges?.forEach((b) => toast.info(`New badge unlocked: ${b.icon} ${b.name}`));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2"><ListSkeleton rows={5} /></div>
          <div className="lg:col-span-3"><ListSkeleton rows={2} /></div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="card p-4 lg:col-span-2 h-fit lg:sticky lg:top-20">
            <h2 className="section-title mb-3 flex items-center gap-2">
              <FiCode className="text-accent-400" size={16} /> Problems ({problems.length})
            </h2>

            <div className="relative mb-2.5">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or topic..."
                className="input-field pl-8 py-2 text-xs"
              />
            </div>

            <div className="flex gap-1.5 mb-3">
              {DIFFICULTY_FILTERS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                    difficultyFilter === d
                      ? "bg-accent-500/15 border-accent-500/40 text-accent-400"
                      : "bg-base-800 border-base-700 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {filteredProblems.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProblem(p)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selected?.id === p.id
                      ? "bg-accent-500/10 border-accent-500/30"
                      : "bg-base-800 border-base-700 hover:border-base-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-100">{p.title}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${difficultyColor[p.difficulty]}`}>
                      {p.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">{p.topics.join(", ")}</p>
                </button>
              ))}
              {filteredProblems.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-6">No problems match your filters.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {!selected ? (
              <div className="card p-8 text-center text-slate-500 text-sm">
                Select a problem to start practicing.
              </div>
            ) : (
              <>
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <h3 className="text-lg font-semibold text-slate-100">{selected.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${difficultyColor[selected.difficulty]}`}>
                        {selected.difficulty}
                      </span>
                      {selected.leetcodeUrl && (
                        <a
                          href={selected.leetcodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          LeetCode <FiExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selected.topics.map((t) => (
                      <span key={t} className="badge text-[11px]">{t}</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">{selected.description}</p>
                  {selected.examples?.map((ex, i) => (
                    <div key={i} className="bg-base-800 border border-base-700 rounded-lg p-3 text-xs font-mono text-slate-300 mb-2">
                      <p><span className="text-slate-500">Input:</span> {ex.input}</p>
                      <p><span className="text-slate-500">Output:</span> {ex.output}</p>
                    </div>
                  ))}
                </div>

                <div className="card p-5">
                  <p className="text-xs text-amber-300/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2 mb-3">
                    Code isn't executed — it's reviewed by AI for correctness, complexity, and edge cases. Great for
                    practicing your reasoning before a real coding round.
                  </p>

                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    language={language}
                    onLanguageChange={handleLanguageChange}
                  />

                  <button onClick={submitCode} disabled={reviewing} className="btn-primary mt-3">
                    {reviewing ? <FiLoader className="animate-spin" size={16} /> : <><FiPlay size={15} /> Get AI Review</>}
                  </button>

                  {review && (
                    <div className="mt-5 pt-4 border-t border-base-700">
                      <div className="flex items-center gap-2 mb-2 text-emerald-400 text-sm font-medium">
                        <FiCheckCircle size={15} /> Review complete
                      </div>
                      <FeedbackCard text={review} />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DSAPractice;
