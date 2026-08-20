// Parses the structured "Label: content" text blocks returned by Gemini
// (Score/Strengths/Weaknesses/Suggestions/etc.) into a nicer visual layout.
function parseFeedback(text) {
  if (!text) return [];
  const knownLabels = [
    "Score",
    "Strengths",
    "Weaknesses",
    "Suggestions",
    "Missing Keywords",
    "Verdict",
    "Time Complexity",
    "Space Complexity",
    "Issues",
  ];
  const pattern = new RegExp(`(${knownLabels.join("|")}):`, "g");
  const parts = text.split(pattern).filter((p) => p && p.trim() !== "");

  const sections = [];
  for (let i = 0; i < parts.length; i += 2) {
    if (knownLabels.includes(parts[i])) {
      sections.push({ label: parts[i], content: (parts[i + 1] || "").trim() });
    }
  }

  if (sections.length === 0) {
    return [{ label: "Feedback", content: text }];
  }

  return sections;
}

const labelColors = {
  Score: "text-accent-400",
  Verdict: "text-accent-400",
  Strengths: "text-emerald-400",
  Weaknesses: "text-amber-400",
  Issues: "text-amber-400",
  Suggestions: "text-sky-400",
  "Missing Keywords": "text-rose-400",
  "Time Complexity": "text-violet-400",
  "Space Complexity": "text-violet-400",
};

function FeedbackCard({ text }) {
  const sections = parseFeedback(text);

  return (
    <div className="space-y-3">
      {sections.map((s, i) => (
        <div key={i}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${labelColors[s.label] || "text-slate-400"}`}>
            {s.label}
          </p>
          <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{s.content}</p>
        </div>
      ))}
    </div>
  );
}

export default FeedbackCard;
