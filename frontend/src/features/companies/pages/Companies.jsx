import { useEffect, useState } from "react";
import { FiBriefcase, FiTarget } from "react-icons/fi";
import { getErrorMessage } from "../../../shared/services/api";
import { getCompanies } from "../services/companyService";
import { ListSkeleton } from "../../../shared/components/Skeleton";
import { useToast } from "../../../shared/context/ToastContext";

const difficultyColor = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Hard: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

function Companies() {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCompanies();
        setCompanies(res.data.companies);
        setSelected(res.data.companies[0] || null);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {loading ? (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2"><ListSkeleton rows={5} /></div>
          <div className="lg:col-span-3"><ListSkeleton rows={2} /></div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="card p-4 lg:col-span-2 h-fit">
            <h2 className="section-title mb-3 flex items-center gap-2">
              <FiBriefcase className="text-accent-400" size={16} /> Companies
            </h2>
            <div className="space-y-1.5">
              {companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full flex items-center gap-3 text-left p-3 rounded-lg border transition-colors ${
                    selected?.id === c.id
                      ? "bg-accent-500/10 border-accent-500/30"
                      : "bg-base-800 border-base-700 hover:border-base-600"
                  }`}
                >
                  <span className="text-xl">{c.logo}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-100">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{c.focus.join(" · ")}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selected && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                    <span>{selected.logo}</span> {selected.name}
                  </h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${difficultyColor[selected.difficulty]}`}>
                    {selected.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                  <FiTarget size={12} /> Focus areas: {selected.focus.join(", ")}
                </p>

                <div className="space-y-2.5">
                  {selected.questions.map((q, i) => (
                    <div key={i} className="bg-base-800 border border-base-700 rounded-xl p-3.5">
                      <p className="text-sm text-slate-200">
                        <span className="text-accent-400 font-medium">Q{i + 1}.</span> {q}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Companies;
