import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

const LANGUAGES = {
  javascript: { label: "JavaScript", extension: javascript({ jsx: false }) },
  python: { label: "Python", extension: python() },
  java: { label: "Java", extension: java() },
  cpp: { label: "C++", extension: cpp() },
};

// A real syntax-highlighted editor (CodeMirror) instead of a plain
// textarea - closer to what a LeetCode-style solving environment feels
// like, with language switching so the AI review prompt matches intent.
function CodeEditor({ code, onChange, language, onLanguageChange }) {
  return (
    <div className="rounded-xl overflow-hidden border border-base-600">
      <div className="flex items-center justify-between bg-base-900 px-3 py-2 border-b border-base-600">
        <span className="text-xs text-slate-500">Solution</span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-base-800 text-slate-300 text-xs rounded-lg px-2 py-1 border border-base-600 outline-none focus:border-accent-500"
        >
          {Object.entries(LANGUAGES).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <CodeMirror
        value={code}
        onChange={onChange}
        theme={vscodeDark}
        extensions={[LANGUAGES[language].extension]}
        height="360px"
        basicSetup={{ foldGutter: true, dropCursor: true, allowMultipleSelections: true }}
      />
    </div>
  );
}

export default CodeEditor;
